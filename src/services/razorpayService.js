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


// import { Alert, Linking } from "react-native";
// import { store } from "../redux/store";
// import RNUpiPayment from "react-native-upi-payment";
// import { settleFullBalanceOutsideGroup, updateBalanceAfterPayment } from "../redux/slices/balancesSlice";

// 🔥 Common function to open UPI payment URL
// const openUPI = (creditor, amount, onSuccess) => {
//     if (!creditor.upiId) {
//         Alert.alert("Error", "No UPI ID available");
//         return;
//     }

//     const upiUri = `upi://pay?pa=${creditor.upiId}&pn=${encodeURIComponent(creditor.fullName)}&am=${amount}&cu=INR`;

//     Linking.openURL(upiUri)
//         .then(() => {
//             Linking.addEventListener("url", (event) => handleUPIResponse(event, onSuccess));
//         })
//         .catch(() => {
//             Alert.alert("No UPI app found!");
//         });
// };

// 🔥 Common function to handle UPI response
// const handleUPIResponse = (event, onSuccess) => {
//     const url = event.url;
//     const params = new URLSearchParams(url.split('?')[1]);

//     const txnStatus = params.get("Status");
//     const txnId = params.get("txnId");

//     if (txnStatus === "SUCCESS") {
//         onSuccess();
//     } else {
//         Alert.alert("Payment Failed", "The UPI payment was not completed.");
//     }

//     Linking.removeAllListeners("url");
// };


// const openUPI = (creditor, amount, onSuccess) => {
//     if (!creditor.upiId) {
//         Alert.alert("Error", "No UPI ID available");
//         return;
//     }

//     RNUpiPayment.initializePayment(
//         {
//             vpa: creditor.upiId, // Example: 'john@ybl' or 'mobileNo@upi'
//             payeeName: creditor.fullName,
//             amount: amount,
//             transactionRef: `${creditor.uid}${Date.now()}`, // Corrected
//             transactionNote: 'Payment via SliceShare'
//         },
//         successCallback,
//         failureCallback
//     );


//     // const upiUri = `upi://pay?pa=${encodeURIComponent(creditor.upiId)}&pn=${encodeURIComponent(creditor.fullName)}&am=${amount}&cu=INR`;
//     // const upiUri = `upi://pay?pa=khenikrish08@okaxis&pn=KrishKheni&cu=INR`;

//     // console.log(upiUri)

//     // ✅ Ensure the listener is set before opening UPI
//     const handleUPIResponse = (event) => {
//         const url = event.url;
//         const params = new URLSearchParams(url.split('?')[1]);

//         const txnStatus = params.get("Status"); // ✅ Case-sensitive key
//         const tid = params.get("txnId") || params.get("tid") || 'TIID';

//         if (txnStatus === "SUCCESS") {
//             onSuccess(tid);
//             console.log(onSuccess)
//         } else {
//             Alert.alert("Payment Failed", "The UPI payment was not completed.");
//         }

//         // ✅ Remove only the specific listener instead of all
//         Linking.removeEventListener("url", handleUPIResponse);
//     };

//     Linking.addEventListener("url", handleUPIResponse);

//     // ✅ Open UPI App
//     Linking.openURL(upiUri).catch(() => {
//         Alert.alert("Error", "No UPI app found!");
//     });
// };

// const openUPI = (creditor, amount, onSuccess, onFailure) => {
//     if (!creditor?.upiId) {
//         Alert.alert("Error", "No UPI ID available");
//         return;
//     }

//     const transactionRef = `${creditor.id}${Date.now()}`;

//     RNUpiPayment.initializePayment(
//         {
//             vpa: creditor.upiId, // Example: 'john@ybl' or 'mobileNo@upi'
//             payeeName: creditor.fullName,
//             amount: amount, // Ensure proper decimal formatting
//             transactionRef: transactionRef,
//             transactionNote: "Payment via SliceShare",
//         },
//         (data) => successCallback(data, onSuccess),
//         (data) => failureCallback(data, onFailure)
//     );
// };

// // ✅ Success Callback
// const successCallback = (data, onSuccess) => {
//     if (data.Status === "SUCCESS") {
//         onSuccess(data.txnId);
//     } else {
//         Alert.alert("Payment Failed", "Transaction was not successful.");
//     }
// };

// // ✅ Failure Callback
// const failureCallback = (data, onFailure) => {
//     const errorMessage = data.message || "UPI Payment Failed";
//     Alert.alert("Payment Failed", errorMessage);
//     onFailure && onFailure(errorMessage);
// };

// // ✅ Group-Based UPI Payment Settlement
// export const openUPIAppForGroupSettlement = (creditor, amount, debtorId, groupId) => {
//     openUPI(
//         creditor,
//         amount,
//         (tid) => {
//             store.dispatch(
//                 updateBalanceAfterPayment({
//                     creditorId: creditor.id,
//                     debtorId,
//                     groupId,
//                     paidAmount: amount,
//                     paymentMethod: "UPI",
//                     tid: tid,
//                 })
//             );
//             Alert.alert("Payment Successful", `Transaction ID: ${tid}`);
//         },
//         (error) => console.log("Group UPI Payment Failed:", error)
//     );
// };

// // ✅ Full Settlement (Outside Any Group)
// export const openUPIAppForFullSettlement = (creditor, amount, debtorId) => {
//     openUPI(
//         creditor,
//         amount,
//         (tid) => {
//             store.dispatch(
//                 settleFullBalanceOutsideGroup({
//                     creditorId: creditor.id,
//                     debtorId,
//                     paidAmount: amount,
//                     paymentMethod: "UPI",
//                     tid: tid,
//                 })
//             );
//             Alert.alert("Payment Successful", `Transaction ID: ${tid}`);
//         },
//         (error) => console.log("Full UPI Payment Failed:", error)
//     );
// };

import RazorpayCheckout from 'react-native-razorpay';
import { store } from '../redux/store';
import { RAZORPAY_KEY_ID } from '@env';
import { settleFullBalanceOutsideGroup, updateBalanceAfterPayment } from '../redux/slices/balancesSlice';

export const payGroupViaRazorpay = async (creditor, amountOwed, debtor, groupId) => {
    try {
        const amount = parseFloat((amountOwed).toFixed(2)) * 100; // Convert to paisa

        const options = {
            description: 'Payment via ShareSlice',
            image: 'https://unsplash.com/s/photos/image', // Your app logo
            currency: 'INR',
            key: RAZORPAY_KEY_ID, // Replace with Razorpay Key
            amount: amount, // Amount in paisa
            name: 'ShareSlice',
            order_id: '',
            prefill: {
                email: debtor.email, // Fetch from user profile
                contact: debtor.phoneNumber, // Fetch from user profile
                // vpa: creditor.upiId,
                name: creditor.fullName,// Fetch from user profile
            },
            theme: { color: '#ffba4b' }
        };

        RazorpayCheckout.open(options).then((data) => {
            // handle success
            alert(`Success: ${data.razorpay_payment_id}`);
            store.dispatch(updateBalanceAfterPayment({
                creditorId: creditor.uid,
                debtorId: debtor.uid,
                groupId: groupId,
                paidAmount: parseFloat((amountOwed).toFixed(2)),
                paymentMethod: "UPI",
                tid: data.razorpay_payment_id,
            }))

        }).catch((error) => {
            if (error.code === 0 || error.description === "BAD_REQUEST_ERROR") {
                console.log("User cancelled the payment");
                return; // ❌ Don't show an alert for cancellation
            }
            // ✅ Show alert only for actual errors
            alert(`Error: ${error.code} | ${error.description}`);
        });


    } catch (error) {
        console.error('Payment Failed:', error);
        alert('Payment Failed');
    }
};

export const payViaRazorpay = async (creditor, amountOwed, debtor) => {
    try {
        const amount = parseFloat((amountOwed).toFixed(2)) * 100; // Convert to paisa

        const options = {
            description: 'Payment via ShareSlice',
            image: 'https://unsplash.com/s/photos/image', // Your app logo
            currency: 'INR',
            key: 'YOUR_RAZORPAY_KEY_ID', // Replace with Razorpay Key
            amount: amount, // Amount in paisa
            name: 'ShareSlice',
            order_id: '',
            prefill: {
                email: debtor.email, // Fetch from user profile
                contact: debtor.phoneNumber, // Fetch from user profile
                vpa: creditor.upiId,
                name: creditor.fullName,// Fetch from user profile
            },
            theme: { color: '#F37254' }
        };

        RazorpayCheckout.open(options).then((data) => {
            // handle success
            alert(`Success: ${data.razorpay_payment_id}`);

            store.dispatch(settleFullBalanceOutsideGroup({
                creditorId: creditor.uid,
                debtorId: debtor.uid,
                paidAmount: parseFloat((balance.amountOwed).toFixed(2)),
                paymentMethod: "UPI",
                tid: data.razorpay_payment_id,
            }));

        }).catch((error) => {
            // handle failure
            alert(`Error: ${error.code} | ${error.description}`);
        });


    } catch (error) {
        console.error('Payment Failed:', error);
        alert('Payment Failed');
    }
};