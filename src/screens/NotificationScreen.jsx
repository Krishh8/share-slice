import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const NotificationScreen = () => {
    const dispatch = useDispatch();
    const { debts, loading } = useSelector((state) => state.debt);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('debts')
            .where('creditorId', '==', 'CURRENT_USER_ID') // Replace dynamically
            .where('status', '==', 'pending')
            .onSnapshot((snapshot) => {
                const debtList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                dispatch(setDebts(debtList));
            });

        return () => unsubscribe();
    }, [dispatch]);

    const handleSendReminder = async (debt) => {
        dispatch(sendDebtorReminder(debt));
    };

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <View>
            {debts.length > 0 ? (
                debts.map((debt) => (
                    <TouchableOpacity key={debt.id} onPress={() => handleSendReminder(debt)}>
                        <Text>Remind {debt.debtorId} about ${debt.amount}</Text>
                    </TouchableOpacity>
                ))
            ) : (
                <Text>No pending debts</Text>
            )}
        </View>
    );
};
export default NotificationScreen

const styles = StyleSheet.create({})