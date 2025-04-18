import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { updateTransactions } from "../slices/transactionsSlice";

export const listenToTransactions = () => dispatch => {
    const userId = auth().currentUser?.uid;
    if (!userId) return () => { };

    const unsubscribe = firestore()
        .collection('transactions')
        .where('participants', 'array-contains', userId)
        .orderBy('timestamp', "desc")
        .onSnapshot(async (snapshot) => {
            let transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (transactions.length === 0) {
                return {};
            }

            // Fetch user details in one batch
            const userIds = new Set();
            transactions.forEach(({ creditorId, debtorId }) => {
                userIds.add(creditorId);
                userIds.add(debtorId);
            });

            const userDocs = await firestore()
                .collection('users')
                .where(firestore.FieldPath.documentId(), 'in', Array.from(userIds))
                .get();

            const userMap = userDocs.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data().fullName;
                return acc;
            }, {});

            // Attach user names to transactions
            transactions = transactions.map(transaction => ({
                ...transaction,
                creditorName: userMap[transaction.creditorId] || 'Unknown',
                debtorName: userMap[transaction.debtorId] || 'Unknown',
            }));

            // Group transactions by `groupId`
            const groupedTransactions = transactions.reduce((acc, transaction) => {
                const { groupIds } = transaction;
                if (Array.isArray(groupIds)) {
                    groupIds.forEach(groupId => {
                        if (!acc[groupId]) acc[groupId] = [];
                        acc[groupId].push(transaction);
                    });
                }
                return acc;
            }, {});

            dispatch(updateTransactions(groupedTransactions));
        });

    return unsubscribe; // Return to allow cleanup
};
