import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Modal, Portal, Button, TextInput, Checkbox, Text, useTheme, Divider, Surface, IconButton } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useSelector } from "react-redux";

const SplitModel = ({ visible, onDismiss, onSplit, totalBillAmount, splitDetails }) => {
    const theme = useTheme();
    const [splitMethod, setSplitMethod] = useState("amount");
    const [splitData, setSplitData] = useState([]);
    const { groupDetails } = useSelector(state => state.group);
    const friends = groupDetails?.members || [];

    useEffect(() => {
        if (splitDetails && splitDetails.length > 0) {
            setSplitData(splitDetails.map(({ uid, share }) => ({ uid, value: share })));
        } else {
            setSplitData([]);
        }
    }, [splitDetails, visible]);

    const toggleFriendSelection = (friend) => {
        setSplitData((prev) =>
            prev.some((p) => p.uid === friend.uid)
                ? prev.filter((p) => p.uid !== friend.uid)
                : [...prev, { ...friend, value: 0 }]
        );
    };

    const updateValue = (uid, value) => {
        setSplitData((prev) =>
            prev.map((p) => (p.uid === uid ? { ...p, value: Number(value) || 0 } : p))
        );
    };

    const getTotalPercentage = () =>
        splitData.reduce((total, p) => total + Number(p.value || 0), 0);

    const handleSubmit = () => {
        let updatedSplitData = [];

        if (splitMethod === "percentage") {
            const totalPercentage = getTotalPercentage();
            if (totalPercentage !== 100) {
                Alert.alert("Error", "Total percentage must be exactly 100%");
                return;
            }

            updatedSplitData = splitData.map(({ uid, value }) => ({
                uid,
                share: parseFloat(((Number(value) / 100) * Number(totalBillAmount)).toFixed(2)),
            }));
        } else {
            updatedSplitData = splitData.map(({ uid, value }) => ({
                uid,
                share: Number(value),
            }));
        }

        const totalCalculatedAmount = updatedSplitData.reduce((sum, p) => sum + p.share, 0);

        if (Math.abs(totalCalculatedAmount - Number(totalBillAmount)) > 0.01) {
            Alert.alert("Error", `Total split amount must be exactly ₹${totalBillAmount}`);
            return;
        }

        onSplit(updatedSplitData);
        onDismiss();
    };

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
                    <Text variant="titleLarge" style={styles.title}>Split Expense</Text>
                    <IconButton icon="close" onPress={onDismiss} />
                </Surface>

                <Divider />

                <View style={styles.toggleContainer}>
                    <Button
                        mode={splitMethod === "amount" ? "contained" : "outlined"}
                        onPress={() => setSplitMethod("amount")}
                        style={styles.toggleButton}
                    >
                        Split by Amount
                    </Button>
                    <Button
                        mode={splitMethod === "percentage" ? "contained" : "outlined"}
                        onPress={() => setSplitMethod("percentage")}
                        style={styles.toggleButton}
                    >
                        Split by Percentage
                    </Button>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                    {friends.map((friend) => (
                        <View key={friend.uid} style={styles.friendRow}>
                            <Checkbox.Android
                                status={splitData.some((p) => p.uid === friend.uid) ? "checked" : "unchecked"}
                                onPress={() => toggleFriendSelection(friend)}
                            />
                            <Text style={styles.friendName}>{friend.fullName}</Text>
                            <TextInput
                                mode="outlined"
                                style={styles.valueInput}
                                placeholder={splitMethod === "amount" ? "₹ Amount" : "% Share"}
                                keyboardType="numeric"
                                value={splitData.find((p) => p.uid === friend.uid)?.value?.toString() || ""}
                                onChangeText={(value) => updateValue(friend.uid, value)}
                            />
                        </View>
                    ))}
                </ScrollView>

                {splitMethod === "percentage" && (
                    <Text style={styles.totalPercentage}>
                        Total: {getTotalPercentage()}%
                    </Text>
                )}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                >
                    Confirm Split
                </Button>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        borderTopLeftRadius: rh(2),
        borderTopRightRadius: rh(2),
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "55%",
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
    friendRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: rh(1),
    },
    friendName: {
        flex: 1,
        fontSize: rfs(2),
        marginLeft: rw(2),
    },
    valueInput: {
        width: rw(30),
        height: rh(5),
        marginLeft: rw(2),
    },
    totalPercentage: {
        fontSize: rfs(2.5),
        fontWeight: "bold",
        marginVertical: rh(1),
        textAlign: "center",
    },
    submitButton: {
        margin: rh(2),
        borderRadius: rh(1),
    },
});

export default SplitModel;
