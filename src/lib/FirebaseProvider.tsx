import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc,
  Timestamp,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  isOnline: boolean;
  hasVehicleRegistered: boolean;
  currentEarnings: number;
  totalDeliveries: number;
  dailyGoal: number;
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: any;
  };
}

interface Delivery {
  id: string;
  userId: string;
  address: string;
  status: 'PENDENTE' | 'ENTREGUE' | 'PROBLEMA';
  createdAt: any;
  updatedAt: any;
  priority?: string;
  notes?: string;
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  deliveries: Delivery[];
  loading: boolean;
  isLocating: boolean;
  locationError: string | null;
  coords: { lat: number, lng: number } | null;
  lastVerified: number;
  toggleOnline: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [lastVerified, setLastVerified] = useState<number>(Date.now());

  useEffect(() => {
    let watchId: number;

    if (profile?.isOnline && navigator.geolocation) {
      setIsLocating(true);
      setLocationError(null);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setIsLocating(false);
          setLocationError(null);
          setLastVerified(Date.now());
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoords(newCoords);

          // Update Firestore every minute or significant change to save quota but keep it real-time enough
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, {
              lastLocation: {
                ...newCoords,
                timestamp: serverTimestamp()
              }
            }, { merge: true }).catch(console.error);
          }
        },
        (error) => {
          setIsLocating(false);
          let message = "Erro ao obter localização.";
          if (error.code === error.PERMISSION_DENIED) {
            message = "Ative a localização para usar rotas em tempo real.";
          }
          setLocationError(message);
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [profile?.isOnline, user]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userDocRef = doc(db, 'users', user.uid);
        
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Initialize profile
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'Piloto',
              email: user.email || '',
              avatar: user.photoURL || '',
              rating: 5.0,
              isOnline: true,
              hasVehicleRegistered: false,
              currentEarnings: 0,
              totalDeliveries: 0,
              dailyGoal: 200,
            };
            setDoc(userDocRef, newProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, 'users'));
          }
        }, (e) => handleFirestoreError(e, OperationType.GET, 'users'));

        // Fetch deliveries
        const deliveriesQuery = query(
          collection(db, 'deliveries'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        onSnapshot(deliveriesQuery, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Delivery));
          setDeliveries(docs);
          setLoading(false);
        }, (e) => handleFirestoreError(e, OperationType.GET, 'deliveries'));

      } else {
        setProfile(null);
        setDeliveries([]);
        setLoading(false);
      }
    });
  }, []);

  const toggleOnline = async () => {
    if (!user || !profile) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { ...profile, isOnline: !profile.isOnline }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, profile, deliveries, loading, isLocating, locationError, coords, lastVerified, toggleOnline }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
