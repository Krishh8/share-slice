// import { Linking } from 'react-native';
// import { store } from '../redux/store'; // Import Redux store
// import { settleFullBalanceOutsideGroup, updateBalanceAfterPayment } from '../redux/slices/balancesSlice';

// export const openUPIApp = (creditor, amount, debtorId, groupId) => {
//     if (!creditor.upiId) {
//         Alert.alert("Error", "No UPI ID available");
//         return;
//     }

//     const upiUri = `upi://pay?pa=${creditor.upiId}&pn=${encodeURIComponent(creditor.fullName)}&am=${amount}&cu=INR`;

//     Linking.openURL(upiUri)
//         .then(() => {
//             Linking.addEventListener("url", (event) => handleUPIResponse(event, creditor.id, debtorId, groupId, amount));
//         })
//         .catch(() => {
//             Alert.alert("No UPI app found!");
//         });
// };



// const handleUPIResponse = (event, creditorId, debtorId, groupId, amount) => {
//     const url = event.url;
//     const params = new URLSearchParams(url.split('?')[1]);

//     const txnStatus = params.get("Status");
//     const txnId = params.get("txnId");

//     if (txnStatus === "SUCCESS") {
//         store.dispatch(updateBalanceAfterPayment({ creditorId, debtorId, groupId, paidAmount: amount, paymentMethod: "UPI" }));
//     } else {
//         Alert.alert("Payment Failed", "The UPI payment was not completed.");
//     }

//     Linking.removeAllListeners("url");
// };


// export const openUPIAppForAllSettlement = (creditor, amount, debtorId) => {
//     if (!creditor.upiId) {
//         Alert.alert("Error", "No UPI ID available");
//         return;
//     }

//     const upiUri = `upi://pay?pa=${creditor.upiId}&pn=${encodeURIComponent(creditor.fullName)}&am=${amount}&cu=INR`;

//     Linking.openURL(upiUri)
//         .then(() => {
//             Linking.addEventListener("url", (event) => handleUPIResponseForAllSettlement(event, creditor.id, debtorId, amount));
//         })
//         .catch(() => {
//             Alert.alert("No UPI app found!");
//         });
// };


// const handleUPIResponseForAllSettlement = (event, creditorId, debtorId, amount) => {
//     const url = event.url;
//     const params = new URLSearchParams(url.split('?')[1]);

//     const txnStatus = params.get("Status");
//     const txnId = params.get("txnId");

//     if (txnStatus === "SUCCESS") {
//         store.dispatch(settleFullBalanceOutsideGroup({ creditorId, debtorId, paidAmount: amount, paymentMethod: "UPI" }));
//     } else {
//         Alert.alert("Payment Failed", "The UPI payment was not completed.");
//     }

//     Linking.removeAllListeners("url");
// };


import { Alert, Linking } from "react-native";
import { store } from "../redux/store";
import { settleFullBalanceOutsideGroup, updateBalanceAfterCashPayment } from "../redux/slices/balancesSlice";

// 🔥 Common function to open UPI payment URL
const openUPI = (creditor, amount, onSuccess) => {
    if (!creditor.upiId) {
        Alert.alert("Error", "No UPI ID available");
        return;
    }

    const upiUri = `upi://pay?pa=${creditor.upiId}&pn=${encodeURIComponent(creditor.fullName)}&am=${amount}&cu=INR`;

    Linking.openURL(upiUri)
        .then(() => {
            Linking.addEventListener("url", (event) => handleUPIResponse(event, onSuccess));
        })
        .catch(() => {
            Alert.alert("No UPI app found!");
        });
};

// 🔥 Common function to handle UPI response
const handleUPIResponse = (event, onSuccess) => {
    const url = event.url;
    const params = new URLSearchParams(url.split('?')[1]);

    const txnStatus = params.get("Status");
    const txnId = params.get("txnId");

    if (txnStatus === "SUCCESS") {
        onSuccess();
    } else {
        Alert.alert("Payment Failed", "The UPI payment was not completed.");
    }

    Linking.removeAllListeners("url");
};

// ✅ Inside Group Settlement
export const openUPIAppForGroupSettlement = (creditor, amount, debtorId, groupId) => {
    openUPI(creditor, amount, () => {
        store.dispatch(updateBalanceAfterCashPayment({
            creditorId: creditor.id,
            debtorId,
            groupId,
            paidAmount: amount,
            paymentMethod: "UPI"
        }));
    });
};

// ✅ Outside Group Full Settlement
export const openUPIAppForFullSettlement = (creditor, amount, debtorId) => {
    openUPI(creditor, amount, () => {
        store.dispatch(settleFullBalanceOutsideGroup({
            creditorId: creditor.id,
            debtorId,
            paidAmount: amount,
            paymentMethod: "UPI"
        }));
    });
};
