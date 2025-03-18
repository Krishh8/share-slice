import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    useTheme,
    Avatar,
    RadioButton,
    Card,
} from 'react-native-paper';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import CategoryModal from '../../components/CategoryModal';
import PaidByModal from '../../components/PaidByModal';
import SplitModel from '../../components/SplitModel';
import { updateExpense } from '../../redux/slices/expensesSlice';
import { fetchGroupDetails } from '../../redux/slices/groupSlice';
import LoadingScreen from '../LoadingScreen';
import HeaderComponent from '../../components/HeaderComponent';



const UpdateExpenseScreen = () => {
    const theme = useTheme();
    const route = useRoute();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { expenseId } = route.params;

    const { user } = useSelector(state => state.userAuth);
    const uid = user?.uid
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const { groupDetails } = useSelector(state => state.group);
    const { expenseDetails } = useSelector(state => state.expense);

    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [paidModalVisible, setPaidModalVisible] = useState(false);
    const [splitModalVisible, setSplitModalVisible] = useState(false);

    const [groupMembers, setGroupMembers] = useState([]);
    const [load, setLoad] = useState(true);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('0');
    const [category, setCategory] = useState(null);
    const [paidBy, setPaidBy] = useState(null);
    const [splitType, setSplitType] = useState('equal');
    const [splitDetails, setSplitDetails] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [errors, setErrors] = useState({
        description: '',
        amount: '',
        category: '',
        paidBy: '',
        selectedMembers: ''
    });

    const toggleMemberSelection = (uid) => {
        if (splitType === "unequal") return; // Disable selection when split is unequal

        setSelectedMembers((prev) =>
            prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
        );
    };

    // Load initial data when expenseDetails change
    useEffect(() => {
        if (expenseDetails) {
            setDescription(expenseDetails.description || '');
            setAmount(expenseDetails.amount?.toString() || '');
            setCategory(expenseDetails.category || null);
            setSplitType(expenseDetails.splitType || 'equal');
            setPaidBy(expenseDetails.paidByType === "single"
                ? { payer: expenseDetails.paidBy[0] }
                : { payers: expenseDetails.paidBy }
            );
        }
    }, [expenseDetails]);

    // Load group members when groupDetails update
    useEffect(() => {
        if (groupDetails?.members) {
            setGroupMembers(groupDetails.members);
        }
    }, [groupDetails]);

    // Load split details
    useEffect(() => {
        if (expenseDetails && expenseDetails.splitDetails && groupMembers.length > 0) {
            const updatedSplitDetails = expenseDetails.splitDetails.map(p => {
                const member = groupMembers.find(m => m.uid === p.uid);
                return {
                    fullName: member ? member.fullName : "Unknown",
                    uid: p.uid,
                    share: p.share || 0
                };
            });
            setSplitDetails(updatedSplitDetails);
            setSelectedMembers(updatedSplitDetails.map(p => p.uid));
        }
        setLoad(false);
    }, [expenseDetails, groupMembers]);

    // Handle auto calculation of equal split
    useEffect(() => {
        if (splitType === "equal" && selectedMembers.length > 0 && amount) {
            const equalShare = Number(amount) / selectedMembers.length;
            const updatedSplitDetails = selectedMembers.map(uid => ({
                uid,
                share: equalShare
            }));
            setSplitDetails(updatedSplitDetails);
        }
    }, [selectedMembers, splitType, amount]);

    const validateForm = () => {
        let newErrors = {};

        if (!description.trim()) newErrors.description = 'Description is required.';
        if (!amount.trim()) newErrors.amount = 'Amount is required.';
        else if (isNaN(amount) || Number(amount) <= 0) newErrors.amount = 'Enter a valid amount.';
        if (!category) newErrors.category = 'Select a category.';
        if (!paidBy) newErrors.paidBy = 'Select who paid.';
        if (selectedMembers.length === 0) newErrors.selectedMembers = 'Select at least one person.';

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        console.log(splitDetails.map(user => ({
            uid: user.uid,
            share: user.share
        })))

        const updatedExpenseData = {
            description,
            category,
            amount: Number(amount),
            paidByType: paidBy.payer ? "single" : "multiple",
            paidBy: paidBy.payer
                ? [{ uid: paidBy.payer.uid, amount: Number(amount) }]
                : paidBy.payers.map(p => ({ uid: p.uid, amount: Number(p.amount) })),
            splitType,
            splitDetails: splitDetails.map(user => ({
                uid: user.uid,
                share: user.share
            }))
        };

        console.log(updatedExpenseData);

        await dispatch(updateExpense({ expenseId, updatedExpenseData }))
        navigation.replace('ExpenseDetails', { expenseId })
    };

    if (load) {
        return <LoadingScreen />;
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={[styles.expenseContainer,]}
                >
                    <HeaderComponent title="Update Expense" />
                    <View style={[styles.expenseCard, {
                        backgroundColor: theme.colors.background
                    }]}>
                        {/* Description Input */}
                        <Card.Content style={styles.expenseCardContent}>
                            <TextInput
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"

                                style={[styles.expenseInput]}

                                left={<TextInput.Icon icon="notebook-edit" />}
                                error={!!errors.description}
                            />
                            {errors.description && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.description}</Text>}

                            {/* Category Selection */}
                            <TouchableOpacity onPress={() => setCategoryModalVisible(true)}>
                                <TextInput
                                    label="Category"
                                    value={category ? category.label : ''}
                                    mode="outlined"
                                    editable={false}
                                    style={[styles.expenseInput,]}
                                    left={category ? <TextInput.Icon icon={category.icon} /> : <TextInput.Icon icon="tag" />}
                                    right={<TextInput.Icon icon="chevron-down" />}
                                    error={!!errors.category}
                                />
                            </TouchableOpacity>
                            {errors.category && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.category}</Text>}



                            {/* Price Input */}
                            <TextInput
                                label="Amount"
                                value={amount}
                                onChangeText={setAmount}
                                mode="outlined"
                                keyboardType="numeric"
                                style={[styles.expenseInput]}
                                left={<TextInput.Icon icon="currency-rupee" />}
                                error={!!errors.amount}
                            />
                            {errors.amount && <Text style={{ color: theme.colors.error }}>{errors.amount}</Text>}

                            {/* Paid By Section */}
                            <TouchableOpacity onPress={() => setPaidModalVisible(true)}>
                                <TextInput
                                    label="Paid By"
                                    value={
                                        paidBy
                                            ? paidBy.payer
                                                ? paidBy.payer.fullName
                                                : paidBy.payers.map(p => `${p.fullName} (₹${p.amount})`).join(', ')
                                            : ''
                                    }
                                    mode="outlined"
                                    editable={false}
                                    style={[styles.expenseInput,]}
                                    left={<TextInput.Icon icon="account-cash" />}
                                    right={<TextInput.Icon icon="chevron-down" />}
                                    error={!!errors.paidBy}
                                />
                            </TouchableOpacity>

                            {errors.paidBy && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.paidBy}</Text>}

                            {/* Split Options */}
                            <View style={styles.splitSection}>
                                <Text style={styles.sectionTitle}>Split Options</Text>
                                <RadioButton.Group
                                    onValueChange={value => {
                                        setSplitType(value);
                                        if (value === 'unequal') {
                                            setSplitModalVisible(true);
                                        } else {
                                            setSplitDetails([]);
                                            setSelectedMembers(groupMembers.map(member => member.uid));
                                        }
                                    }}
                                    value={splitType}
                                >
                                    <View style={styles.radioRow}>
                                        <RadioButton.Item
                                            label="Equally"
                                            value="equal"
                                            position="leading"
                                            labelStyle={{ fontSize: rfs(2) }}
                                        />
                                        <RadioButton.Item
                                            label="Unequally"
                                            value="unequal"
                                            position="leading"
                                            labelStyle={{ fontSize: rfs(2) }}
                                        />
                                    </View>
                                </RadioButton.Group>
                            </View>


                            <View style={styles.splitSection}>
                                <Text style={styles.sectionTitle}>
                                    Split Among {splitType === 'equal' && <Text style={{ fontSize: rfs(1.5) }}>(Tap to Select)</Text>}
                                </Text>

                                <View style={styles.membersGrid}>
                                    {splitType === "equal"
                                        ? groupMembers.map(member => {
                                            const isSelected = selectedMembers.includes(member.uid);
                                            const memberShare = splitDetails?.find(p => p.uid === member.uid)?.share || 0;

                                            return (
                                                <TouchableOpacity
                                                    key={member.uid}
                                                    onPress={() => toggleMemberSelection(member.uid)}
                                                    style={[
                                                        styles.memberChip,
                                                        isSelected
                                                            ? { backgroundColor: theme.colors.primaryContainer }
                                                            : { backgroundColor: theme.colors.surfaceVariant }
                                                    ]}
                                                >
                                                    <View style={styles.memberChipContent}>
                                                        <Text style={[
                                                            styles.memberChipName,
                                                            { color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant }
                                                        ]}>
                                                            {member.fullName}
                                                        </Text>
                                                        {amount && (
                                                            <Text style={styles.memberChipAmount}>
                                                                ₹{memberShare.toFixed(2)}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })
                                        : splitDetails?.map(({ uid, share }) => {
                                            const member = groupMembers.find(m => m.uid === uid);
                                            return member ? (
                                                <View
                                                    key={uid}
                                                    style={[
                                                        styles.memberChip,
                                                        { backgroundColor: theme.colors.primaryContainer }
                                                    ]}
                                                >
                                                    <View style={styles.memberChipContent}>
                                                        <Text style={[styles.memberChipName, { color: theme.colors.primary }]}>
                                                            {member.fullName}
                                                        </Text>
                                                        <Text style={styles.memberChipAmount}>
                                                            ₹{share?.toFixed(2) || 0}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : null;
                                        })}
                                </View>


                                {errors.selectedMembers && <Text style={{ color: theme.colors.error, marginBottom: rh(0) }}>{errors.selectedMembers}</Text>}
                            </View>

                            {/* Submit Button */}
                            <Button
                                mode="contained"
                                icon="pencil"
                                onPress={handleSubmit}
                                style={styles.addExpenseButton}
                                labelStyle={{ fontSize: rfs(2) }}
                            >
                                Update Expense
                            </Button>
                        </Card.Content>
                    </View>

                    <CategoryModal
                        visible={categoryModalVisible}
                        onDismiss={() => setCategoryModalVisible(false)}
                        onSelectCategory={setCategory}
                        selectedCategory={category}
                    />
                    <PaidByModal
                        visible={paidModalVisible}
                        onDismiss={() => setPaidModalVisible(false)}
                        onPaidBy={setPaidBy}
                        paidBy={paidBy}
                        totalBillAmount={amount}
                    />
                    <SplitModel
                        visible={splitModalVisible}
                        onDismiss={() => setSplitModalVisible(false)}
                        onSplit={setSplitDetails}
                        totalBillAmount={amount}
                        splitDetails={splitDetails}
                    />
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    divider: {
        marginVertical: rh(2),
    },
    expenseContainer: {
        flexGrow: 1,
        // padding: rw(4),
    },
    expenseCard: {
        padding: rw(2),
    },
    // expenseCardContent: {
    //     padding: rh(2),
    // },
    expenseInput: {
        marginBottom: rh(1),
        fontSize: rfs(2),
    },
    splitSection: {
        marginTop: rh(2),
        marginBottom: rh(1),
    },
    sectionTitle: {
        fontSize: rfs(2.2),
        fontWeight: 'bold',
        marginBottom: rh(1),
    },
    radioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    memberChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rh(1),
        borderRadius: rh(1),
        marginBottom: rh(1),
        minWidth: rw(40),
    },
    memberChipContent: {
        flex: 1,
    },
    memberChipName: {
        fontSize: rfs(2),
        fontWeight: 'bold',
        textAlign: 'center',
        borderBottomWidth: rw(0.3),
        paddingBottom: rh(0.5),
    },
    memberChipAmount: {
        fontSize: rfs(1.8),
        textAlign: 'center',
        opacity: 0.8,
        marginTop: rh(0.5),
    },
    addExpenseButton: {
        marginTop: rh(2),
        borderRadius: rh(1),
        paddingVertical: rh(0.8),
    },
});

// const styles = StyleSheet.create({
//     container: {
//         marginHorizontal: rw(2),
//         marginVertical: rh(2),
//         padding: rw(5),
//         borderRadius: rh(1),
//         flexGrow: 1,
//     },
//     header: {
//         marginBottom: rh(2),
//         fontWeight: 'bold',
//         fontSize: rfs(2.5),
//     },
//     input: {
//         marginBottom: rh(0.5),
//     },
//     switchContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: rh(2),
//     },
//     payersContainer: {
//         marginBottom: rh(2),
//     },
//     splitTitle: {
//         fontWeight: 'bold',
//         marginTop: rh(1),
//         fontSize: rfs(2),
//     },
//     submitButton: {
//         marginTop: rh(2),
//         borderRadius: rh(1),
//     },
//     membersContainer: {
//         flexDirection: 'row', // Arrange items in a row
//         flexWrap: 'wrap', // Wrap to the next line if space is insufficient
//         gap: 10, // Space between items (optional)
//         marginVertical: rh(1), // Space from top and bottom
//     },
//     memberItem: {
//         padding: rh(1),
//         borderRadius: rh(1),
//         minWidth: rw(25),
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     selected: {
//         borderWidth: rw(0.6),
//     },
//     unselected: {
//         borderWidth: rw(0.6),
//     },
//     memberName: {
//         fontSize: rfs(2),
//     },
//     buttonText: {
//         fontSize: rfs(2),
//     },
// });

export default UpdateExpenseScreen
