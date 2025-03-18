import firestore from '@react-native-firebase/firestore';

export const checkUserExists = async (phoneNumber) => {
    try {
        const querySnapshot = await firestore()
            .collection('users')
            .where('phoneNumber', '==', phoneNumber)
            .get();

        return !querySnapshot.empty; // Returns true if user exists, false otherwise
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
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
        console.error('Error fetching user name:', error);
        return null; // Return null on error
    }
};
