import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import React, { useState } from 'react'
import { Button, Divider, IconButton, Modal, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { updateBalanceAfterCashPayment } from '../redux/slices/balancesSlice';
import { useDispatch } from 'react-redux';

const MarkAsPaidModal = ({ visible, onDismiss, balance }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const { creditor, debtor, amountOwed, creditorId, groupId, debtorId } = balance
    console.log(amountOwed)
    const [amount, setAmount] = useState(amountOwed.toString());
    const [error, setError] = useState("");
    const navigation = useNavigation();

    const handleSubmit = () => {
        if (isNaN(amount) || amount <= 0 || !amount) {
            setError("Enter a valid amount.");
            return;
        }
        else if (amount > amountOwed) {
            setError("Error", "Amount received cannot be more than amount owed.");
            return;
        } else {
            setError("");
            console.log("Submitted Amount:", amount);
            dispatch(updateBalanceAfterCashPayment({ creditorId, debtorId, groupId, receivedAmount: Number(amount) }));
            Alert.alert("Success", `Updated balance after receiving ₹${amount} in cash.`);
            onDismiss()
        }
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                theme={{
                    colors: {
                        backdrop: "rgba(0, 0, 0, 0.5)", // Adjust opacity here (0.3 for lighter effect)
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
                        value={amount}
                        keyboardType="numeric"
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
                </ScrollView>


            </Modal>
        </Portal>
    )
}

export default MarkAsPaidModal

const styles = StyleSheet.create({
    modalContainer: {
        borderTopLeftRadius: rh(2),
        borderTopRightRadius: rh(2),
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "50%",
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
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: rh(2),
    },
    toggleButton: {
        width: '45%',
    },
    scrollView: {
        padding: rw(4),
    },
    submitButton: {
        marginVertical: rh(2),
        borderRadius: rh(1),
    },
})