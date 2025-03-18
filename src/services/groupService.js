import firestore from '@react-native-firebase/firestore';

export const getGroupByGroupId = async (groupId) => {
    try {
        const groupDoc = await firestore().collection('groups').doc(groupId).get(); // Get document snapshot

        if (groupDoc.exists) {
            return groupDoc.data().groupName; // Access the data properly
        } else {
            console.log('Group not found');
            return null; // Return null if the group doesn't exist
        }
    } catch (error) {
        console.error('Error fetching group name:', error);
        return null; // Return null on error
    }
};
