import firestore from '@react-native-firebase/firestore';


export const checkUserExists = async (phoneNumber) => {
    try {
        const querySnapshot = await firestore()
            .collection('users')
            .where('phoneNumber', '==', phoneNumber)
            .get();

        if (!querySnapshot.empty) {
            // ✅ User exists, return the UID
            const userDoc = querySnapshot.docs[0]; // Get the first matched document
            return { exists: true, uid: userDoc.id };
        } else {
            // ❌ User does not exist
            return { exists: false, uid: null };
        }
    } catch (error) {
        return { exists: false, uid: null, error: error.message };
    }
};


export const getUserByUserId = async (uid) => {
    try {
        const userDoc = await firestore().collection('users').doc(uid).get(); // Get document snapshot

        if (userDoc.exists) {
            return userDoc.data().fullName; // Access the data properly
        } else {
            console.log('User not found');
            return null; // Return null if the group doesn't exist
        }
    } catch (error) {
        return null; // Return null on error
    }
};
