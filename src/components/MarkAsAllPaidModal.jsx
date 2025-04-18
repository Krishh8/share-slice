import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import React, { useState } from 'react'
import { Button, Divider, IconButton, Modal, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { settleFullBalanceOutsideGroup, updateBalanceAfterCashPayment } from '../redux/slices/balancesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { terminate } from '@react-native-firebase/firestore';
import CustomAlert from './CustomAlert';
import { showToast } from '../services/toastService';

const MarkAsAllPaidModal = ({ visible, onDismiss, amountOwed, debtor }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const [amount, setAmount] = useState(amountOwed.toString());
    const [error, setError] = useState("");
    const navigation = useNavigation();
    const { user } = useSelector(state => state.userAuth)
    const uid = user.uid
    const [alertVisible, setAlertVisible] = useState(false)

    const handleSubmit = () => {
        if (isNaN(amount) || amount <= 0 || !amount) {
            setError("Enter a valid amount.");
            return;
        }
        else if (amount > amountOwed) {
            setError("Amount received cannot be more than amount owed.");
            return;
        }
        else {
            setError(""); // Clear any previous errors
            setAlertVisible(true); // Show confirmation alert before processing
        }

    };

    const confirmSettlement = () => {
        try {
            dispatch(settleFullBalanceOutsideGroup({
                creditorId: uid,
                debtorId: debtor.uid,
                paidAmount: Number(amount),
                paymentMethod: "Cash",
                tid: null
            }))

            showToast('success', `Successfully settled ₹${amount} in cash.`);
        } catch (error) {
            showToast('error', 'Failed to settle balance.');
        }
        setAlertVisible(false); // Hide alert after confirming
        onDismiss(); // Close modal
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                theme={{
                    colors: {
                        backdrop: "rgba(0, 0, 0, 0.7)", // Adjust opacity here (0.3 for lighter effect)
                    },
                }}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
            >
                <Surface style={styles.header}>
                    <Text variant="titleLarge" style={styles.title}>Record Cash Payment</Text>
                    <IconButton icon="close" onPress={onDismiss} />
                </Surface>

                <Divider />

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                    <Text variant='titleLarge' style={{ fontWeight: 'bold', color: theme.colors.primary, marginBottom: rh(2) }}>Received from {debtor.fullName}</Text>
                    <TextInput
                        style={styles.input}
                        label="Amount"
                        mode="outlined"
                        editable={false}
                        value={amount}
                        onChangeText={(text) => setAmount(text)}
                        outlineStyle={{ borderRadius: rh(1) }}
                        activeOutlineColor={theme.colors.primary}
                        left={<TextInput.Icon icon="cash" size={rfs(3)} color={theme.colors.primary} />}
                    />
                    {error ? (
                        <Text style={{ color: theme.colors.error, marginTop: rh(1) }}>{error}</Text>
                    ) : null}
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.submitButton}
                    >
                        Settle Up
                    </Button>

                    <Text variant="titleMedium" style={[styles.title, { color: theme.colors.primary }]}>Disclaimer:</Text>
                    <Text variant="titleSmall" style={[styles.title, { color: theme.colors.secondary }]}>Recording a payment does not process an actual transaction. This feature is for tracking purposes only. Ensure the payment is made separately before marking it as paid.</Text>
                    <Text variant="titleSmall" style={[styles.title, { color: theme.colors.secondary }]}>Partial settlements of balances are only allowed within groups.Only Full settlements can be made here.</Text>
                </ScrollView>

                <CustomAlert
                    visible={alertVisible}
                    title="Confirm Settlement"
                    message="This settlement will not be reversed. Do you want to proceed?"
                    onClose={() => setAlertVisible(false)}
                    onConfirm={confirmSettlement} // Call confirm function on confirm button
                    confirmText="Confirm"
                    cancelText="Cancel"
                    showCancel={true}
                    icon="alert-circle"
                />
            </Modal>
        </Portal>
    )
}

export default MarkAsAllPaidModal

const styles = StyleSheet.create({
    modalContainer: {
        borderTopLeftRadius: rh(2),
        borderTopRightRadius: rh(2),
        position: "absolute",
        bottom: 0,
        width: "100%",
        maxHeight: "100%",
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: rw(4),
        paddingVertical: rh(1),
    },
    title: {
        fontWeight: 'bold',
    },
    scrollView: {
        padding: rw(4),
    },
    submitButton: {
        marginVertical: rh(2),
        borderRadius: rh(1),
    },
})