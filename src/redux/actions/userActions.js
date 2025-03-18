import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { setUser, clearUser } from '../slices/userAuthSlice';

// 🔥 Listen to authentication state changes
export const listenToAuthState = () => dispatch => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
        if (!user) {
            console.log("User logged out.");
            dispatch(clearUser()); // User is logged out
        } else {
            try {
                const userRef = firestore().collection("users").doc(user.uid);
                const userDoc = await userRef.get();
                if (!userDoc.exists) {
                    console.log("No user document found.");
                    dispatch(clearUser());
                } else {
                    console.log("Firestore Data:", userDoc.data())
                    dispatch(setUser({
                        uid: user.uid,
                        phoneNumber: user.phoneNumber || '',
                        fullName: userDoc.data().fullName || '',
                        email: userDoc.data().email || '',
                        avatar: userDoc.data().avatar || '',
                        isEmailVerified: user.emailVerified || false,
                        isProfileComplete: userDoc.data().isProfileComplete || false,
                        isAuthenticated: true,
                    }));
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                dispatch(clearUser());
            }
        }
    });

    return unsubscribe; // Return unsubscribe function for cleanup
};
