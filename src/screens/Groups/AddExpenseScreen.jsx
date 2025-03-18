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
    Appbar,
} from 'react-native-paper';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CategoryModal from '../../components/CategoryModal';
import PaidByModal from '../../components/PaidByModal';
import SplitModel from '../../components/SplitModel';
import { createExpense } from '../../redux/slices/expensesSlice';
import HeaderComponent from '../../components/HeaderComponent';

// const AddExpenseScreen = () => {
//     const theme = useTheme();
//     const dispatch = useDispatch()
//     const navigation = useNavigation()

//     const { uid } = useSelector(state => state.userAuth);
//     const { groupDetails } = useSelector(state => state.group)
//     const groupId = groupDetails?.groupId
//     const [groupMembers, setGroupMembers] = useState(groupDetails.members)

//     const [categoryModalVisible, setCategoryModalVisible] = useState(false);
//     const [paidModalVisible, setPaidModalVisible] = useState(false);
//     const [splitModalVisible, setSplitModalVisible] = useState(false);

//     const [description, setDescription] = useState('');
//     const [amount, setAmount] = useState('');
//     const [category, setCategory] = useState(null);
//     const [paidBy, setPaidBy] = useState(null);
//     const [splitType, setSplitType] = useState('equal');
//     const [splitData, setSplitData] = useState(null);

//     // const [selectedMembers, setSelectedMembers] = useState(groupMembers.map(member => member.uid));
//     const [selectedMembers, setSelectedMembers] = useState([]);

//     const [errors, setErrors] = useState({
//         description: '',
//         amount: '',
//         category: '',
//         paidBy: '',
//         selectedMembers: ''
//     });

//     useEffect(() => {
//         if (splitType === "unequal" && splitData) {
//             // Set selected members based on splitData
//             setSelectedMembers(splitData.data.map((p) => p.uid));
//         } else {
//             // Allow manual selection for equal split
//             setSelectedMembers([]);
//         }
//     }, [splitType, splitData]);

//     // const toggleMemberSelection = (memberId) => {
//     //     setSelectedMembers(
//     //         prevSelected =>
//     //             prevSelected.includes(memberId)
//     //                 ? prevSelected.filter(id => id !== memberId) // Remove if already selected
//     //                 : [...prevSelected, memberId], // Add if not selected
//     //     );
//     // };

//     const toggleMemberSelection = (uid) => {
//         if (splitType === "unequal") return; // Disable selection when split is unequal

//         setSelectedMembers((prev) =>
//             prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
//         );
//     };

//     // **Form Validation**
//     const validateForm = () => {
//         let newErrors = {};

//         if (!description.trim()) newErrors.description = 'Description is required.';
//         if (!amount.trim()) newErrors.amount = 'Amount is required.';
//         else if (isNaN(amount) || Number(amount) <= 0) newErrors.amount = 'Enter a valid amount.';
//         if (!category) newErrors.category = 'Select a category.';
//         if (!paidBy) newErrors.paidBy = 'Select who paid.';
//         if (selectedMembers.length === 0) newErrors.selectedMembers = 'Select at least one person.';

//         setErrors(newErrors);

//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async () => {
//         if (!validateForm()) {
//             return;
//         }
//         console.log('call')


//         const expenseData = {
//             description,
//             categoryLabel: category.label,
//             categoryIcon: category.icon,
//             amount: Number(amount),
//             paidByType: paidBy.payer ? "single" : "multiple",
//             // paidBy: paidBy.payer
//             //     ? [{ uid: paidBy.payer.uid, amount: Number(amount) }]
//             //     : paidBy.payers.map(p => ({ uid: p.uid, amount: p.amount })),
//             paidBy: paidBy.payer
//                 ? [{ uid: paidBy.payer.uid, amount: Number(amount) }] // Use `paidBy.payer`
//                 : paidBy.payers.map(p => ({
//                     uid: p.uid,
//                     amount: Number(p.amount),
//                 })),
//             splitType,
//             splitMethod: splitData?.method || "amount",
//             splitDetails: splitData?.data
//                 ? splitData.data.map(p => ({
//                     uid: p.uid,
//                     ...(splitData.method === "amount" ? { amount: p.value } : { share: p.value }),
//                 }))
//                 : [],

//             participants: selectedMembers,
//             createdBy: uid
//         };

//         console.log("Expense Data:", JSON.stringify(expenseData, null, 2));


//         try {
//             await dispatch(createExpense({ groupId, expenseData })).unwrap();
//             setDescription('');
//             setAmount('');
//             setCategory(null);
//             setPaidBy(null);
//             setSplitType('equal');
//             setSplitData(null);
//             setSelectedMembers(groupMembers.map(member => member.uid));
//             setErrors({});

//             navigation.navigate('GroupDetails', { groupId: groupId })

//         } catch (error) {
//             console.error("Failed to create expense:", error);
//         }
//     };


//     return (
//         <KeyboardAvoidingView
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             style={{ flex: 1 }}
//         >
//             <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//                 <ScrollView
//                     contentContainerStyle={[
//                         styles.container,
//                         { backgroundColor: theme.colors.secondaryContainer },
//                     ]}>
//                     {/* <Text style={[styles.header, { color: theme.colors.onSecondaryContainer }]}>
//                 Add Expense
//             </Text> */}

//                     {/* Description Input */}
//                     <TextInput
//                         label="Description"
//                         value={description}
//                         onChangeText={setDescription}
//                         mode="outlined"
//                         style={[
//                             styles.input,
//                             { backgroundColor: theme.colors.secondaryContainer },
//                         ]}
//                         textColor={theme.colors.onSecondaryContainer}
//                         left={<TextInput.Icon icon="notebook-edit" />}
//                     />
//                     {errors.description && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.description}</Text>}

//                     {/* Category Selection */}
//                     <TouchableOpacity onPress={() => setCategoryModalVisible(true)}>
//                         <TextInput
//                             label="Category"
//                             value={category ? category.label : ''}
//                             mode="outlined"
//                             editable={false}
//                             style={[
//                                 styles.input,
//                                 { backgroundColor: theme.colors.secondaryContainer },
//                             ]}
//                             textColor={theme.colors.onSecondaryContainer}
//                             left={category ? <TextInput.Icon icon={category.icon} /> : null}
//                             right={<TextInput.Icon icon="chevron-down-circle-outline" />}
//                         />
//                     </TouchableOpacity>
//                     {errors.category && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.category}</Text>}

//                     <CategoryModal
//                         visible={categoryModalVisible}
//                         onDismiss={() => setCategoryModalVisible(false)}
//                         onSelectCategory={setCategory}
//                     />

//                     {/* Price Input */}
//                     <TextInput
//                         label="Amount"
//                         value={amount}
//                         onChangeText={setAmount}
//                         mode="outlined"
//                         keyboardType="numeric"
//                         style={[
//                             styles.input,
//                             { backgroundColor: theme.colors.secondaryContainer },
//                         ]}
//                         textColor={theme.colors.onSecondaryContainer}
//                         left={<TextInput.Icon icon="currency-rupee" />}
//                     />
//                     {errors.amount && <Text style={{ color: theme.colors.error }}>{errors.amount}</Text>}

//                     {/* Paid By Section */}
//                     <TouchableOpacity onPress={() => setPaidModalVisible(true)}>
//                         <TextInput
//                             label="Paid By"
//                             value={
//                                 paidBy
//                                     ? paidBy.payer
//                                         ? paidBy.payer.fullName
//                                         : paidBy.payers.map(p => `${p.fullName} (${p.amount})`).join(', ')
//                                     : ''
//                             }
//                             mode="outlined"
//                             editable={false}
//                             textColor={theme.colors.onSecondaryContainer}
//                             style={[
//                                 styles.input,
//                                 { backgroundColor: theme.colors.secondaryContainer },
//                             ]}
//                             right={<TextInput.Icon icon="chevron-down-circle-outline" />}
//                             left={<TextInput.Icon icon="account" />}

//                         />
//                     </TouchableOpacity>
//                     {errors.paidBy && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.paidBy}</Text>}

//                     <PaidByModal
//                         visible={paidModalVisible}
//                         onDismiss={() => setPaidModalVisible(false)}
//                         onPaidBy={setPaidBy}
//                     />

//                     {/* Split Options */}
//                     <Text
//                         style={[styles.splitTitle, { color: theme.colors.onSecondaryContainer }]}>
//                         Split Options
//                     </Text>
//                     <RadioButton.Group
//                         onValueChange={value => {
//                             setSplitType(value);
//                             if (value === 'unequal') setSplitModalVisible(true);
//                         }}
//                         value={splitType}>
//                         <RadioButton.Item
//                             label="Equally"
//                             color={theme.colors.onSecondaryContainer}
//                             labelStyle={{ color: theme.colors.onSecondaryContainer }}
//                             value="equal"
//                         />
//                         <RadioButton.Item
//                             label="Unequally"
//                             color={theme.colors.onSecondaryContainer}
//                             labelStyle={{ color: theme.colors.onSecondaryContainer }}
//                             value="unequal"
//                         />
//                     </RadioButton.Group>

//                     <SplitModel
//                         visible={splitModalVisible}
//                         onDismiss={() => setSplitModalVisible(false)}
//                         onSplit={setSplitData}
//                     />

//                     <TouchableOpacity onPress={() => splitType === "unequal" && setSplitModalVisible(true)}>
//                         <TextInput
//                             label="Split By"
//                             value={
//                                 splitData
//                                     ? splitData.method === "amount"
//                                         ? splitData.data.map((p) => `${p.fullName}: ₹${p.value}`).join(", ")
//                                         : splitData.data.map((p) => `${p.fullName}: ${p.value}%`).join(", ")
//                                     : splitType === "equal"
//                                         ? selectedMembers.map((id) => {
//                                             const member = groupMembers.find(m => m.uid === id);
//                                             return member ? member.fullName : "";
//                                         }).join(", ")
//                                         : ""
//                             }
//                             mode="outlined"
//                             editable={false}
//                             textColor={theme.colors.onSecondaryContainer}
//                             style={[styles.input, { backgroundColor: theme.colors.secondaryContainer }]}
//                         />
//                     </TouchableOpacity>

//                     {/* Split among */}
//                     <Text
//                         style={[styles.splitTitle, { color: theme.colors.onSecondaryContainer }]}>
//                         Split Among {splitType === 'equal' && <Text>(Tap to Select)</Text>}
//                     </Text>
//                     <View style={styles.membersContainer}>
//                         {groupMembers?.map(member => {
//                             const isSelected = selectedMembers.includes(member.uid);

//                             return (
//                                 <TouchableOpacity
//                                     key={member.uid}
//                                     onPress={() => toggleMemberSelection(member.uid)}
//                                     disabled={splitType === "unequal"} // Disable for unequal
//                                     style={[
//                                         styles.memberItem,
//                                         isSelected
//                                             ? [styles.selected, { borderColor: theme.colors.primary }]
//                                             : [styles.unselected, { borderColor: theme.colors.onSecondaryContainer }]
//                                     ]}
//                                 >
//                                     <Text style={[
//                                         styles.memberName,
//                                         isSelected ? { color: theme.colors.primary } : { color: theme.colors.onSecondaryContainer }
//                                     ]}>
//                                         {member.fullName}
//                                     </Text>
//                                 </TouchableOpacity>
//                             );
//                         })}
//                     </View>

//                     {errors.selectedMembers && <Text style={{ color: theme.colors.error, marginBottom: rh(0) }}>{errors.selectedMembers}</Text>}
//                     {/* Submit Button */}
//                     <Button
//                         mode="contained"
//                         labelStyle={styles.buttonText}
//                         onPress={handleSubmit}
//                         style={styles.submitButton}>
//                         Add Expense
//                     </Button>

//                 </ScrollView>
//             </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>
//     );
// }

// const AddExpenseScreen = () => {
//     const theme = useTheme();
//     const dispatch = useDispatch()
//     const navigation = useNavigation()

//     const { uid } = useSelector(state => state.userAuth);
//     const { groupDetails } = useSelector(state => state.group)
//     const groupId = groupDetails?.groupId
//     const [groupMembers, setGroupMembers] = useState(groupDetails.members)

//     const [categoryModalVisible, setCategoryModalVisible] = useState(false);
//     const [paidModalVisible, setPaidModalVisible] = useState(false);
//     const [splitModalVisible, setSplitModalVisible] = useState(false);

//     const [description, setDescription] = useState('');
//     const [amount, setAmount] = useState('');
//     const [category, setCategory] = useState(null);
//     const [paidBy, setPaidBy] = useState(null);
//     const [splitType, setSplitType] = useState('equal');
//     const [splitDetails, setSplitDetails] = useState([]);

//     const [selectedMembers, setSelectedMembers] = useState(groupMembers.map(member => member.uid));


//     const [errors, setErrors] = useState({
//         description: '',
//         amount: '',
//         category: '',
//         paidBy: '',
//         selectedMembers: ''
//     });

//     const toggleMemberSelection = (uid) => {
//         if (splitType === "unequal") return; // Disable selection when split is unequal

//         setSelectedMembers((prev) =>
//             prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
//         );
//     };

//     // **Form Validation**
//     const validateForm = () => {
//         let newErrors = {};

//         if (!description.trim()) newErrors.description = 'Description is required.';
//         if (!amount.trim()) newErrors.amount = 'Amount is required.';
//         else if (isNaN(amount) || Number(amount) <= 0) newErrors.amount = 'Enter a valid amount.';
//         if (!category) newErrors.category = 'Select a category.';
//         if (!paidBy) newErrors.paidBy = 'Select who paid.';
//         if (selectedMembers.length === 0) newErrors.selectedMembers = 'Select at least one person.';

//         setErrors(newErrors);

//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async () => {
//         if (!validateForm()) {
//             return;
//         }
//         console.log('call')


//         const expenseData = {
//             description,
//             category: category,
//             amount: Number(amount),
//             paidByType: paidBy.payer ? "single" : "multiple",
//             paidBy: paidBy.payer
//                 ? [{ uid: paidBy.payer.uid, amount: Number(amount) }] // Use `paidBy.payer`
//                 : paidBy.payers.map(p => ({
//                     uid: p.uid,
//                     amount: Number(p.amount),
//                 })),
//             splitType,
//             splitDetails: splitDetails.length > 0
//                 ? splitDetails.map(p => ({
//                     uid: p.uid,
//                     share: p.share // Always store the final calculated amount
//                 }))
//                 : [],
//             createdBy: uid
//         };

//         console.log("Expense Data:", JSON.stringify(expenseData, null, 2));


//         try {
//             await dispatch(createExpense({ groupId, expenseData })).unwrap();
//             setDescription('');
//             setAmount('');
//             setCategory(null);
//             setPaidBy(null);
//             setSplitType('equal');
//             setSplitDetails(null);
//             setSelectedMembers(groupMembers.map(member => member.uid));
//             setErrors({});

//             navigation.navigate('GroupDetails', { groupId: groupId })

//         } catch (error) {
//             console.error("Failed to create expense:", error);
//         }
//     };


//     return (
//         <KeyboardAvoidingView
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             style={{ flex: 1 }}
//         >
//             <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//                 <ScrollView
//                     contentContainerStyle={[
//                         styles.container,
//                         { backgroundColor: theme.colors.secondaryContainer },
//                     ]}>

//                     {/* Description Input */}
//                     <TextInput
//                         label="Description"
//                         value={description}
//                         onChangeText={setDescription}
//                         mode="outlined"
//                         style={[
//                             styles.input,
//                             { backgroundColor: theme.colors.secondaryContainer },
//                         ]}
//                         textColor={theme.colors.onSecondaryContainer}
//                         left={<TextInput.Icon icon="notebook-edit" />}
//                     />
//                     {errors.description && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.description}</Text>}

//                     {/* Category Selection */}
//                     <TouchableOpacity onPress={() => setCategoryModalVisible(true)}>
//                         <TextInput
//                             label="Category"
//                             value={category ? category.label : ''}
//                             mode="outlined"
//                             editable={false}
//                             style={[
//                                 styles.input,
//                                 { backgroundColor: theme.colors.secondaryContainer },
//                             ]}
//                             textColor={theme.colors.onSecondaryContainer}
//                             left={category ? <TextInput.Icon icon={category.icon} /> : null}
//                             right={<TextInput.Icon icon="chevron-down-circle-outline" />}
//                         />
//                     </TouchableOpacity>
//                     {errors.category && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.category}</Text>}

//                     <CategoryModal
//                         visible={categoryModalVisible}
//                         onDismiss={() => setCategoryModalVisible(false)}
//                         onSelectCategory={setCategory}
//                     />

//                     {/* Price Input */}
//                     <TextInput
//                         label="Amount"
//                         value={amount}
//                         onChangeText={setAmount}
//                         mode="outlined"
//                         keyboardType="numeric"
//                         style={[
//                             styles.input,
//                             { backgroundColor: theme.colors.secondaryContainer },
//                         ]}
//                         textColor={theme.colors.onSecondaryContainer}
//                         left={<TextInput.Icon icon="currency-rupee" />}
//                     />
//                     {errors.amount && <Text style={{ color: theme.colors.error }}>{errors.amount}</Text>}

//                     {/* Paid By Section */}
//                     <TouchableOpacity onPress={() => setPaidModalVisible(true)}>
//                         <TextInput
//                             label="Paid By"
//                             value={
//                                 paidBy
//                                     ? paidBy.payer
//                                         ? paidBy.payer.fullName
//                                         : paidBy.payers.map(p => `${p.fullName} (${p.amount})`).join(', ')
//                                     : ''
//                             }
//                             mode="outlined"
//                             editable={false}
//                             textColor={theme.colors.onSecondaryContainer}
//                             style={[
//                                 styles.input,
//                                 { backgroundColor: theme.colors.secondaryContainer },
//                             ]}
//                             right={<TextInput.Icon icon="chevron-down-circle-outline" />}
//                             left={<TextInput.Icon icon="account" />}

//                         />
//                     </TouchableOpacity>
//                     {errors.paidBy && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.paidBy}</Text>}

//                     <PaidByModal
//                         visible={paidModalVisible}
//                         onDismiss={() => setPaidModalVisible(false)}
//                         onPaidBy={setPaidBy}
//                         totalBillAmount={amount}
//                     />

//                     {/* Split Options */}
//                     <Text
//                         style={[styles.splitTitle, { color: theme.colors.onSecondaryContainer }]}>
//                         Split Options
//                     </Text>
//                     <RadioButton.Group
//                         onValueChange={value => {
//                             setSplitType(value);
//                             if (value === 'unequal') {
//                                 setSplitModalVisible(true);
//                             } else {
//                                 setSplitDetails([]);
//                                 setSelectedMembers([]); // Reset selection for equal split
//                             }
//                         }}
//                         value={splitType}
//                     >
//                         <RadioButton.Item
//                             label="Equally"
//                             color={theme.colors.onSecondaryContainer}
//                             labelStyle={{ color: theme.colors.onSecondaryContainer }}
//                             value="equal"
//                         />
//                         <RadioButton.Item
//                             label="Unequally"
//                             color={theme.colors.onSecondaryContainer}
//                             labelStyle={{ color: theme.colors.onSecondaryContainer }}
//                             value="unequal"
//                         />
//                     </RadioButton.Group>

//                     {/* Split among */}
//                     <Text
//                         style={[styles.splitTitle, { color: theme.colors.onSecondaryContainer }]}>
//                         Split Among {splitType === 'equal' && <Text>(Tap to Select)</Text>}
//                     </Text>

//                     <View style={styles.membersContainer}>
//                         {splitType === "equal"
//                             ? groupMembers.map(member => {
//                                 const isSelected = selectedMembers.includes(member.uid);
//                                 const memberShare = splitDetails?.find(p => p.uid === member.uid)?.share || 0;

//                                 return (
//                                     <TouchableOpacity
//                                         key={member.uid}
//                                         onPress={() => toggleMemberSelection(member.uid)}
//                                         style={[
//                                             styles.memberItem,
//                                             isSelected
//                                                 ? [styles.selected, { borderColor: theme.colors.primary }]
//                                                 : [styles.unselected, { borderColor: theme.colors.onSecondaryContainer }]
//                                         ]}
//                                     >
//                                         <Text style={[styles.memberName, isSelected ? { color: theme.colors.primary } : { color: theme.colors.onSecondaryContainer }]}>
//                                             {member.fullName}
//                                         </Text>

//                                         {isSelected && (
//                                             <Text style={[styles.memberShare, { color: theme.colors.onSecondaryContainer }]}>
//                                                 ₹{memberShare.toFixed(2)}
//                                             </Text>
//                                         )}
//                                     </TouchableOpacity>
//                                 );
//                             })
//                             : splitDetails?.map(({ uid, share }) => {
//                                 const member = groupMembers.find(m => m.uid === uid);
//                                 return member ? (
//                                     <View key={uid} style={[
//                                         styles.memberItem, styles.selected,
//                                         { borderColor: theme.colors.primary }
//                                     ]}>
//                                         <Text style={[styles.memberName, { color: theme.colors.onSecondaryContainer }]}>
//                                             {member.fullName}
//                                         </Text>
//                                         <Text style={[styles.memberShare, { color: theme.colors.onSecondaryContainer }]}>
//                                             ₹{share?.toFixed(2) || 0}
//                                         </Text>
//                                     </View>
//                                 ) : null;
//                             })}
//                     </View>

//                     {/* Auto-calculate Equal Split Amount */}
//                     {useEffect(() => {
//                         if (splitType === "equal" && selectedMembers.length > 0) {
//                             const equalShare = amount / selectedMembers.length;
//                             const updatedSplitDetails = selectedMembers.map(uid => ({
//                                 uid,
//                                 share: equalShare
//                             }));
//                             setSplitDetails(updatedSplitDetails);
//                         }
//                     }, [selectedMembers, splitType, amount])}

//                     <SplitModel
//                         visible={splitModalVisible}
//                         onDismiss={() => setSplitModalVisible(false)}
//                         onSplit={setSplitDetails}
//                         totalBillAmount={amount}
//                     />


//                     {errors.selectedMembers && <Text style={{ color: theme.colors.error, marginBottom: rh(0) }}>{errors.selectedMembers}</Text>}
//                     {/* Submit Button */}
//                     <Button
//                         mode="contained"
//                         labelStyle={styles.buttonText}
//                         onPress={handleSubmit}
//                         style={styles.submitButton}>
//                         Add Expense
//                     </Button>

//                 </ScrollView>
//             </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>
//     );
// }

const AddExpenseScreen = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const { user } = useSelector(state => state.userAuth);
    const uid = user?.uid
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const { groupDetails } = useSelector(state => state.group);
    const groupId = groupDetails?.groupId;
    const [groupMembers, setGroupMembers] = useState(groupDetails.members);

    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [paidModalVisible, setPaidModalVisible] = useState(false);
    const [splitModalVisible, setSplitModalVisible] = useState(false);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('0');
    const [category, setCategory] = useState(null);
    const [paidBy, setPaidBy] = useState(null);
    const [splitType, setSplitType] = useState('equal');
    const [splitDetails, setSplitDetails] = useState([]);

    const [selectedMembers, setSelectedMembers] = useState(groupMembers.map(member => member.uid));

    const [errors, setErrors] = useState({
        description: '',
        amount: '',
        category: '',
        paidBy: '',
        selectedMembers: ''
    });

    const toggleMemberSelection = (uid) => {
        if (splitType === "unequal") return;

        setSelectedMembers((prev) =>
            prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
        );
    };

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
        if (!validateForm()) {
            return;
        }

        const expenseData = {
            description,
            category: category,
            amount: Number(amount),
            paidByType: paidBy.payer ? "single" : "multiple",
            paidBy: paidBy.payer
                ? [{ uid: paidBy.payer.uid, amount: Number(amount) }]
                : paidBy.payers.map(p => ({
                    uid: p.uid,
                    amount: Number(p.amount),
                })),
            splitType,
            splitDetails: splitDetails.length > 0
                ? splitDetails.map(p => ({
                    uid: p.uid,
                    share: p.share
                }))
                : [],
            createdBy: uid
        };

        try {
            await dispatch(createExpense({ groupId, expenseData })).unwrap();
            setDescription('');
            setAmount('');
            setCategory(null);
            setPaidBy(null);
            setSplitType('equal');
            setSplitDetails([]);
            setSelectedMembers(groupMembers.map(member => member.uid));
            setErrors({});

            navigation.navigate('GroupDetails', { groupId: groupId });
        } catch (error) {
            console.error("Failed to create expense:", error);
        }
    };

    // Calculate equal split when needed
    useEffect(() => {
        if (splitType === "equal" && selectedMembers.length > 0 && amount) {
            const equalShare = parseFloat((Number(amount) / selectedMembers.length).toFixed(2));
            const updatedSplitDetails = selectedMembers.map(uid => ({
                uid,
                share: equalShare
            }));
            setSplitDetails(updatedSplitDetails);
        }
    }, [selectedMembers, splitType, amount]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.expenseContainer}
                >
                    <HeaderComponent title="Add Expense" />
                    <View style={[styles.expenseCard, { backgroundColor: theme.colors.background }]}>
                        <Card.Content style={styles.expenseCardContent}>
                            <TextInput
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                style={[styles.expenseInput]}
                                left={< TextInput.Icon icon="notebook-edit" />}
                                error={!!errors.description}
                            />
                            {errors.description && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.description}</Text>}

                            <TouchableOpacity onPress={() => setCategoryModalVisible(true)}>
                                <TextInput
                                    label="Category"
                                    value={category ? category.label : ''}
                                    mode="outlined"
                                    editable={false}
                                    style={[styles.expenseInput]}
                                    left={category ? <TextInput.Icon icon={category.icon} /> : <TextInput.Icon icon="tag" />}
                                    right={<TextInput.Icon icon="chevron-down" />}
                                    error={!!errors.category}
                                />
                            </TouchableOpacity>
                            {errors.category && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.category}</Text>}

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
                                    style={[styles.expenseInput]}
                                    left={<TextInput.Icon icon="account-cash" />}
                                    right={<TextInput.Icon icon="chevron-down" />}
                                    error={!!errors.paidBy}
                                />
                            </TouchableOpacity>

                            {errors.paidBy && <Text style={{ color: theme.colors.error, marginBottom: rh(1) }}>{errors.paidBy}</Text>}

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
                                            labelStyle={{ fontSize: rfs(2), }}
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

                            <Button
                                mode="contained"
                                icon="plus"
                                onPress={handleSubmit}
                                style={styles.addExpenseButton}
                                labelStyle={{ fontSize: rfs(2) }}
                            >
                                Add Expense
                            </Button>
                        </Card.Content>
                    </View>

                    <CategoryModal
                        visible={categoryModalVisible}
                        onDismiss={() => setCategoryModalVisible(false)}
                        onSelectCategory={setCategory}
                    />

                    <PaidByModal
                        visible={paidModalVisible}
                        onDismiss={() => setPaidModalVisible(false)}
                        onPaidBy={setPaidBy}
                        totalBillAmount={amount}
                    />

                    <SplitModel
                        visible={splitModalVisible}
                        onDismiss={() => setSplitModalVisible(false)}
                        onSplit={setSplitDetails}
                        totalBillAmount={amount}
                    />
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    divider: {
        marginVertical: rh(2),
    },
    expenseContainer: {
        flexGrow: 1,
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

export default AddExpenseScreen
