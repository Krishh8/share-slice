import firestore from '@react-native-firebase/firestore';
import { setGroups } from '../slices/groupSlice';

// 🔥 Real-time listener for groups
// export const listenToGroups = () => dispatch => {
//     const unsubscribe = firestore()
//         .collection('groups')
//         .orderBy('createdAt', 'desc') // Optional: Sort by creation time
//         .onSnapshot(snapshot => {
//             const groups = snapshot.docs.map(doc => ({
//                 groupId: doc.id,
//                 ...doc.data(),
//                 createdAt: doc.data().createdAt?.toDate().toISOString() || null,
//             }));

//             dispatch(setGroups(groups)); // 🔄 Update Redux state in real time
//         });

//     return unsubscribe; // Return unsubscribe function for cleanup
// };
