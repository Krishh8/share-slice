import firestore from "@react-native-firebase/firestore";
import { setBalances, setError, setLoading, setUnsubscribe } from "../slices/balancesSlice";


export const listenToBalances = ({ uid, groupId = null }) => async (dispatch) => {
    dispatch(setLoading(true));

    try {
        let balancesRef = firestore().collection("balances").where("amountOwed", ">", 0);

        if (groupId) {
            balancesRef = balancesRef.where("groupId", "==", groupId); // ✅ Filter by group
        }

        const unsubscribe = balancesRef.onSnapshot(async (snapshot) => {
            let userBalances = [];
            let userIds = new Set();

            snapshot.forEach((doc) => {
                const balance = { balanceId: doc.id, ...doc.data() };
                if (balance.creditorId === uid || balance.debtorId === uid) {
                    userBalances.push(balance);
                    userIds.add(balance.creditorId);
                    userIds.add(balance.debtorId);
                }
            });

            if (userBalances.length === 0) {
                dispatch(setBalances([]));
                return;
            }

            // 🔹 Fetch user details for involved users
            const usersRef = firestore()
                .collection("users")
                .where(firestore.FieldPath.documentId(), "in", Array.from(userIds));

            const usersSnapshot = await usersRef.get();
            let userMap = {};

            usersSnapshot.forEach((doc) => {
                userMap[doc.id] = doc.data();
            });

            const balancesWithUserDetails = userBalances.map((balance) => ({
                ...balance,
                updatedAt: balance.updatedAt.toDate().toISOString(),
                creditor: {
                    uid: userMap[balance.creditorId]?.uid || "",
                    fullName: userMap[balance.creditorId]?.fullName || "Unknown",
                    avatar: userMap[balance.creditorId]?.avatar || "",
                    upiId: userMap[balance.creditorId]?.upiId || "",
                    phoneNumber: userMap[balance.creditorId]?.phoneNumber || "",
                    email: userMap[balance.creditorId]?.email || "",
                },
                debtor: {
                    uid: userMap[balance.debtorId]?.uid || "",
                    fullName: userMap[balance.debtorId]?.fullName || "Unknown",
                    avatar: userMap[balance.debtorId]?.avatar || "",
                    upiId: userMap[balance.debtorId]?.upiId || "",
                    phoneNumber: userMap[balance.debtorId]?.phoneNumber || "",
                    email: userMap[balance.debtorId]?.email || "",
                },
            }));

            console.log("Updated Balances:", balancesWithUserDetails);
            dispatch(setBalances(balancesWithUserDetails));

        });

        dispatch(setUnsubscribe(unsubscribe)); // 🔹 Store unsubscribe function
    } catch (error) {
        dispatch(setError(error.message));
    }
};


// ----------------------------------------------------------------------------------------

// import { setBalances, setError, setLoading, setUnsubscribe } from "../slices/balancesSlice";
// import firestore from "@react-native-firebase/firestore";

// export const listenToBalances = ({ uid, groupId = null }) => async (dispatch, getState) => {
//     dispatch(setLoading(true));

//     try {
//         let balancesRef = firestore().collection("balances").where("amountOwed", ">", 0);

//         if (groupId) {
//             balancesRef = balancesRef.where("groupId", "==", groupId);
//             console.log('ref ', balancesRef)
//         }

//         // 🛑 Stop the previous listener before setting a new one
//         const previousUnsubscribe = getState().balance.unsubscribe;
//         if (previousUnsubscribe) {
//             previousUnsubscribe(); // ✅ Unsubscribe the old listener
//         }

//         const unsubscribe = balancesRef.onSnapshot(async (snapshot) => {
//             let userBalances = [];
//             let userIds = new Set();

//             snapshot.forEach((doc) => {
//                 const balance = { balanceId: doc.id, ...doc.data() };
//                 if (balance.creditorId === uid || balance.debtorId === uid) {
//                     userBalances.push(balance);
//                     userIds.add(balance.creditorId);
//                     userIds.add(balance.debtorId);
//                 }
//             });

//             console.log('userbalance array: ', userBalances)

//             if (userBalances.length === 0) {
//                 dispatch(setBalances([]));
//                 return;
//             }

//             const usersSnapshot = await firestore()
//                 .collection("users")
//                 .where(firestore.FieldPath.documentId(), "in", Array.from(userIds))
//                 .get();

//             let userMap = {};
//             usersSnapshot.forEach((doc) => {
//                 userMap[doc.id] = doc.data();
//             });

//             const balancesWithUserDetails = userBalances.map((balance) => ({
//                 ...balance,
//                 updatedAt: balance.updatedAt.toDate().toISOString(),
//                 creditor: {
//                     uid: userMap[balance.creditorId]?.uid || "",
//                     fullName: userMap[balance.creditorId]?.fullName || "Unknown",
//                     avatar: userMap[balance.creditorId]?.avatar || "",
//                     upiId: userMap[balance.creditorId]?.upiId || "",
//                     phoneNumber: userMap[balance.creditorId]?.phoneNumber || "",
//                     email: userMap[balance.creditorId]?.email || "",
//                 },
//                 debtor: {
//                     uid: userMap[balance.debtorId]?.uid || "",
//                     fullName: userMap[balance.debtorId]?.fullName || "Unknown",
//                     avatar: userMap[balance.debtorId]?.avatar || "",
//                     upiId: userMap[balance.debtorId]?.upiId || "",
//                     phoneNumber: userMap[balance.debtorId]?.phoneNumber || "",
//                     email: userMap[balance.debtorId]?.email || "",
//                 },
//             }));

//             dispatch(setBalances(balancesWithUserDetails));
//         });

//         dispatch(setUnsubscribe(unsubscribe)); // ✅ Save unsubscribe function in Redux

//     } catch (error) {
//         dispatch(setError(error.message));
//     }
// };

// // 🛑 Stop Listening
// export const stopListeningToBalances = () => (dispatch, getState) => {
//     const unsubscribe = getState().balance.unsubscribe;
//     if (unsubscribe) {
//         unsubscribe();
//         dispatch(setUnsubscribe(null));
//     }
// };

// export const stopListeningToBalances = () => {
//     if (balanceUnsubscribe) {
//         balanceUnsubscribe();
//         balanceUnsubscribe = null;
//     }
// };
