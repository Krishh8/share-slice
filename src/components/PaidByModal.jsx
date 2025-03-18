// import React, { useEffect, useState } from "react";
// import { Alert, ScrollView, StyleSheet, View } from "react-native";
// import { Modal, Portal, Button, List, TextInput, Checkbox, Text, useTheme } from "react-native-paper";
// import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
// import { useSelector } from "react-redux";

// const PaidByModal = ({ visible, onDismiss, onPaidBy, totalBillAmount, paidBy }) => {
//     const theme = useTheme();
//     const [isSinglePayer, setIsSinglePayer] = useState(true);
//     const [selectedPayer, setSelectedPayer] = useState(null); // Single Payer
//     const [multiPayer, setMultiPayer] = useState([]); // Multi-Payer List
//     const { groupDetails } = useSelector(state => state.group)
//     const [friends, setFriends] = useState(groupDetails?.members)

//     useEffect(() => {
//         console.log(`paidBy: ${JSON.stringify(paidBy)}`);

//         if (paidBy) {
//             if (paidBy.payer) {
//                 setIsSinglePayer(true);
//                 setSelectedPayer(friends.find(friend => friend.uid === paidBy.payer.uid) || null);
//             } else if (paidBy.payers && paidBy.payers.length > 0) {
//                 setIsSinglePayer(false);
//                 setMultiPayer(
//                     paidBy.payers.map(p => ({
//                         uid: p.uid,
//                         amount: p.amount || ""
//                     }))
//                 );
//             }
//         } else {
//             setIsSinglePayer(true);
//             setSelectedPayer(null);
//             setMultiPayer([]);
//         }
//     }, [visible, friends]);

//     // Handle selecting a single payer
//     const handleSinglePayer = (payer) => {
//         setSelectedPayer(payer);
//         onPaidBy({ payer });
//         console.log({ payer })
//         onDismiss();
//     };


//     // Handle selecting multiple payers
//     const toggleMultiPayer = (payer) => {
//         setMultiPayer((prev) =>
//             prev.some((p) => p.uid === payer.uid)
//                 ? prev.filter((p) => p.uid !== payer.uid) // Deselect if already selected
//                 : [...prev, { ...payer, amount: "" }] // Add payer with an empty amount
//         );
//     };

//     // Handle setting share for each payer
//     const updateAmount = (uid, amount) => {
//         setMultiPayer(prev =>
//             prev.map(p => (p.uid === uid ? { ...p, amount: Number(amount) || 0 } : p))
//         );
//     };

//     // Submit Multi-Payer Selection
//     const handleSubmitMultiPayer = () => {
//         const totalPaid = multiPayer.reduce((sum, p) => sum + Number(p.amount), 0);

//         if (totalPaid !== Number(totalBillAmount)) {
//             Alert.alert("Error", `Total paid amount must be exactly ₹${totalBillAmount}`);
//             return;
//         }

//         onPaidBy({ payers: multiPayer });
//         console.log({ payers: multiPayer });
//         onDismiss();
//     };


//     return (
//         <Portal>
//             <Modal
//                 visible={visible}
//                 onDismiss={onDismiss}
//                 contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.primaryContainer }]}
//             >
//                 {/* Toggle Between Single & Multi Payer */}
//                 <View style={styles.btnContainer}>
//                     <Button mode={isSinglePayer ? "contained" : "outlined"} onPress={() => setIsSinglePayer(true)}>
//                         Single Payer
//                     </Button>
//                     <Button mode={!isSinglePayer ? "contained" : "outlined"} onPress={() => setIsSinglePayer(false)}>
//                         Multi Payer
//                     </Button>
//                 </View>

//                 <Text style={[styles.label, { color: theme.colors.onPrimaryContainer }]}>Payer's Name</Text>

//                 {isSinglePayer ? (
//                     // Single Payer Selection
//                     <ScrollView>
//                         {friends.map((friend) => (
//                             <List.Item
//                                 key={friend.uid}
//                                 title={friend.fullName}
//                                 onPress={() => handleSinglePayer(friend)}
//                                 left={(props) => (
//                                     <List.Icon {...props} icon={selectedPayer?.uid === friend.uid ? "check-circle" : "account"} />
//                                 )}
//                             />

//                         ))}
//                     </ScrollView>
//                 ) : (
//                     // Multi-Payer Selection with Amount
//                     <ScrollView>
//                         {friends.map((friend) => (
//                             <View key={friend.uid} style={styles.multiPayerRow}>
//                                 <Checkbox.Android
//                                     status={multiPayer.some((p) => p.uid === friend.uid) ? "checked" : "unchecked"}

//                                     onPress={() => toggleMultiPayer(friend)}
//                                 />
//                                 <Text style={styles.payerName}>{friend.fullName}</Text>
//                                 <TextInput
//                                     mode="outlined"
//                                     style={[styles.amountInput, { backgroundColor: theme.colors.primaryContainer }]}
//                                     placeholder="Amount"
//                                     keyboardType="numeric"
//                                     value={multiPayer.find((p) => p.uid === friend.uid)?.amount?.toString() || ""}
//                                     onChangeText={(value) => updateAmount(friend.uid, value)}
//                                 />
//                             </View>
//                         ))}


//                     </ScrollView>
//                 )}
//                 <Button mode="contained" labelStyle={styles.btnText} onPress={handleSubmitMultiPayer} style={styles.submitButton}>
//                     Submit
//                 </Button>
//             </Modal>
//         </Portal>
//     );
// };

// const styles = StyleSheet.create({
//     modalContainer: {
//         padding: rh(2),
//         borderTopLeftRadius: rh(3),
//         borderTopRightRadius: rh(3),
//         position: "absolute",
//         bottom: 0,
//         width: "100%",
//         height: "55%",
//     },
//     btnContainer: {
//         flexDirection: "row",
//         justifyContent: "space-evenly",
//         marginBottom: rh(1),
//     },
//     multiPayerRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingVertical: rh(1),
//     },
//     payerName: {
//         flex: 1,
//         fontSize: rfs(2),
//     },
//     amountInput: {
//         width: rw(30),
//         textAlign: 'center',
//         height: rh(5),
//     },
//     submitButton: {
//         marginTop: rh(2),
//         borderRadius: rh(1),
//     },
//     btnText: {
//         fontSize: rfs(2)
//     },
//     label: {
//         fontSize: rfs(2),
//         fontWeight: 'bold',
//         marginVertical: rh(1)
//     }
// });

import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
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

                <ScrollView style={styles.scrollView}>
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
