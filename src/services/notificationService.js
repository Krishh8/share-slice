import notifee, {
    AndroidImportance,
    AndroidStyle,
    EventType
} from '@notifee/react-native';

// Request notification permissions
export const requestPermission = async () => {
    await notifee.requestPermission();
};

// Create a notification channel
export const createChannel = async () => {
    return await notifee.createChannel({
        id: 'debt_reminders',
        name: 'Debt Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default'
    });
};

// Send a debt reminder notification
export const sendDebtReminder = async (debt) => {
    const { amount, creditorName, dueDate } = debt;

    // Ensure channel is created
    const channelId = await createChannel();

    // Display notification
    await notifee.displayNotification({
        title: '💸 Debt Reminder',
        body: `You owe ${creditorName} $${amount}`,
        android: {
            channelId,
            importance: AndroidImportance.HIGH,
            pressAction: {
                id: 'default',
            },
            style: {
                type: AndroidStyle.BIGTEXT,
                text: `Amount Due: $${amount}\nCreditor: ${creditorName}${dueDate
                    ? `\nDue Date: ${new Date(dueDate).toLocaleDateString()}`
                    : ''
                    }`
            }
        }
    });
};

// Listen to notification events
export const setupNotificationListeners = () => {
    return notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('User pressed notification');
        }
    });
};
