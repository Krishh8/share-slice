import RazorpayCheckout from 'react-native-razorpay';
import { store } from '../redux/store';
import { RAZORPAY_KEY_ID } from '@env';
import { settleFullBalanceOutsideGroup, updateBalanceAfterPayment } from '../redux/slices/balancesSlice';
import { showToast } from './toastService';

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
                name: debtor.fullName,// Fetch from user profile
            },
            theme: { color: '#ffba4b' }
        };

        RazorpayCheckout.open(options).then((data) => {
            store.dispatch(updateBalanceAfterPayment({
                creditorId: creditor.uid,
                debtorId: debtor.uid,
                groupId: groupId,
                paidAmount: parseFloat((amountOwed).toFixed(2)),
                paymentMethod: "Online",
                tid: data.razorpay_payment_id,
            }))

            showToast('success', "Your payment was successful!");


        }).catch((error) => {
            if (error.code === 0 || error.description === "BAD_REQUEST_ERROR") {
                showToast('info', "You cancelled the payment")
                return; // ❌ Don't show an alert for cancellation
            }
            showToast('error', "Payment failed. Please try again.");
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
                // vpa: creditor.upiId,
                name: debtor.fullName,// Fetch from user profile
            },
            theme: { color: '#ffba4b' }
        };

        RazorpayCheckout.open(options).then((data) => {
            store.dispatch(settleFullBalanceOutsideGroup({
                creditorId: creditor.uid,
                debtorId: debtor.uid,
                paidAmount: parseFloat((amountOwed).toFixed(2)),
                paymentMethod: "Online",
                tid: data.razorpay_payment_id,
            }));
            showToast('success', "Your payment was successful!");
        }).catch((error) => {
            if (error.code === 0 || error.description === "BAD_REQUEST_ERROR") {
                showToast('info', "You cancelled the payment")
                return; // ❌ Don't show an alert for cancellation
            }
            showToast('error', "Payment failed. Please try again.");
        });
    } catch (error) {
        console.error('Payment Failed:', error);
        alert('Payment Failed');
    }
};