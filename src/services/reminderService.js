import notifee, { AndroidImportance } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const checkReminders = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const remindersSnapshot = await firestore()
        .collection('reminders')
        .where('receiverId', '==', userId)
        .where('seen', '==', false)
        .get();

    for (const doc of remindersSnapshot.docs) {
        const { creditorId, amount } = doc.data();

        // Fetch creditor's name (optional)
        const creditorSnapshot = await firestore().collection('users').doc(senderId).get();
        const creditorName = creditorSnapshot.exists ? creditorSnapshot.data().fullName : "Someone";

        // Show Notifee notification
        await notifee.requestPermission();
        await notifee.createChannel({
            id: 'reminders',
            name: 'Payment Reminders',
            importance: AndroidImportance.HIGH,
        });

        await notifee.displayNotification({
            title: 'Payment Reminder',
            body: `${creditorName} is reminding you to pay ₹${amount}.`,
            android: {
                channelId: 'reminders',
                importance: AndroidImportance.HIGH,
            },
        });

        // Mark reminder as seen
        await firestore().collection('reminders').doc(doc.id).update({ seen: true });
    }
};
