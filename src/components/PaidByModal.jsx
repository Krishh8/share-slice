import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { Modal, Portal, Button, List, TextInput, Checkbox, Text, useTheme, Divider, Surface, IconButton } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useSelector } from "react-redux";

const PaidByModal = ({ visible, onDismiss, onPaidBy, totalBillAmount, paidBy }) => {
    const theme = useTheme();
    const [isSinglePayer, setIsSinglePayer] = useState(true);
    const [selectedPayer, setSelectedPayer] = useState(null);
    const [multiPayer, setMultiPayer] = useState([]);
    const { groupDetails } = useSelector(state => state.group)
    const [friends, setFriends] = useState(groupDetails?.members)

    useEffect(() => {
        if (paidBy) {
            if (paidBy.payer) {
                setIsSinglePayer(true);
                setSelectedPayer(friends.find(friend => friend.uid === paidBy.payer.uid) || null);
            } else if (paidBy.payers && paidBy.payers.length > 0) {
                setIsSinglePayer(false);
                setMultiPayer(
                    paidBy.payers.map(p => {
                        const friend = friends.find(f => f.uid === p.uid);
                        return {
                            uid: p.uid,
                            fullName: friend ? friend.fullName : "Unknown",
                            amount: p.amount || ""
                        };
                    })
                );
            }
        } else {
            setIsSinglePayer(true);
            setSelectedPayer(null);
            setMultiPayer([]);
        }
    }, [visible, friends]);

    const handleSinglePayer = (payer) => {
        setSelectedPayer(payer);
        onPaidBy({ payer });
        onDismiss();
    };

    const toggleMultiPayer = (payer) => {
        setMultiPayer((prev) =>
            prev.some((p) => p.uid === payer.uid)
                ? prev.filter((p) => p.uid !== payer.uid)
                : [...prev, { ...payer, fullName: payer.fullName, amount: "" }]
        );
    };


    const updateAmount = (uid, amount) => {
        setMultiPayer(prev =>
            prev.map(p => (p.uid === uid ? { ...p, amount: Number(amount) || 0 } : p))
        );
    };

    const handleSubmitMultiPayer = () => {
        const totalPaid = multiPayer.reduce((sum, p) => sum + Number(p.amount), 0);

        if (totalPaid !== Number(totalBillAmount)) {
            Alert.alert("Error", `Total paid amount must be exactly ₹${totalBillAmount}`);
            return;
        }

        onPaidBy({
            payers: multiPayer.map(p => ({
                uid: p.uid,
                fullName: p.fullName,  // Ensure fullName is included
                amount: p.amount
            }))
        });
        onDismiss();
    };

    return (
        <KeyboardAvoidingView>

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
                        <Text variant="titleLarge" style={styles.title}>Who Paid?</Text>
                        <IconButton icon="close" onPress={onDismiss} />
                    </Surface>

                    <Divider />

                    <View style={styles.toggleContainer}>
                        <Button
                            mode={isSinglePayer ? "contained" : "outlined"}
                            onPress={() => setIsSinglePayer(true)}
                            style={styles.toggleButton}
                        >
                            Single Payer
                        </Button>
                        <Button
                            mode={!isSinglePayer ? "contained" : "outlined"}
                            onPress={() => setIsSinglePayer(false)}
                            style={styles.toggleButton}
                        >
                            Multi Payer
                        </Button>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        {isSinglePayer ? (
                            friends.map((friend) => (
                                <List.Item
                                    key={friend.uid}
                                    title={friend.fullName}
                                    onPress={() => handleSinglePayer(friend)}
                                    left={(props) => (
                                        <List.Icon {...props} icon={selectedPayer?.uid === friend.uid ? "check-circle" : "account"} />
                                    )}
                                    style={[
                                        styles.listItem,
                                        selectedPayer?.uid === friend.uid && { backgroundColor: theme.colors.primaryContainer }
                                    ]}
                                />
                            ))
                        ) : (
                            friends.map((friend) => (
                                <View key={friend.uid} style={styles.multiPayerRow}>
                                    <Checkbox.Android
                                        status={multiPayer.some((p) => p.uid === friend.uid) ? "checked" : "unchecked"}
                                        onPress={() => toggleMultiPayer(friend)}
                                    />
                                    <Text style={styles.payerName}>{friend.fullName}</Text>
                                    <TextInput
                                        mode="outlined"
                                        style={styles.amountInput}
                                        placeholder="Amount"
                                        keyboardType="numeric"
                                        value={multiPayer.find((p) => p.uid === friend.uid)?.amount?.toString() || ""}
                                        onChangeText={(value) => updateAmount(friend.uid, value)}
                                    />
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <Button
                        mode="contained"
                        onPress={handleSubmitMultiPayer}
                        style={styles.submitButton}
                    >
                        Submit
                    </Button>

                </Modal>

            </Portal>
        </KeyboardAvoidingView>

    );
};

const styles = StyleSheet.create({
    modalContainer: {
        borderTopLeftRadius: rh(2),
        borderTopRightRadius: rh(2),
        position: "absolute",
        bottom: 0,
        width: "100%",
        minHeight: "50%",
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
        paddingHorizontal: rw(2),
    },
    listItem: {
        borderRadius: rh(1),
        marginVertical: rh(0.5),
    },
    multiPayerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: rh(1),
    },
    payerName: {
        flex: 1,
        fontSize: rfs(2),
        marginLeft: rw(2),
    },
    amountInput: {
        width: rw(30),
        height: rh(5),
        marginLeft: rw(2),
    },
    submitButton: {
        margin: rh(2),
        borderRadius: rh(1),
    },
});

export default PaidByModal;
