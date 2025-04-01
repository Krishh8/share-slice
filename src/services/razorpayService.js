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
            key: RAZORPAY_KEY_ID, // Replace with Razorpay Key
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
            if (error.code === 0 || error.description === "BAD_REQUEST_ERROR") {
                console.log("User cancelled the payment");
                return; // ❌ Don't show an alert for cancellation
            }
            // handle failure
            alert(`Error: ${error.code} | ${error.description}`);
        });
    } catch (error) {
        console.error('Payment Failed:', error);
        alert('Payment Failed');
    }
};