// import { StyleSheet, Text, View } from 'react-native'
// import React, { useState } from 'react'
// import { FAB, PaperProvider, Portal, useTheme } from 'react-native-paper'
// import { useIsFocused, useNavigation } from '@react-navigation/native';
// import AddMemberModal from './AddMemberModal';

// const AddExpensesGroupButtonComponent = ({ open, onStateChange }) => {
//     const theme = useTheme();
//     const navigation = useNavigation();
//     const isFocused = useIsFocused(); 
//     const [modalVisible, setModalVisible] = useState(false);

//     const handleAddMember = () => {
//         onStateChange({ open: false });
//         setModalVisible(true);
//     };

//     if (!isFocused) return null;

//     return (
//         <>
//             <AddMemberModal visible={modalVisible} onDismiss={() => setModalVisible(false)} />

//             <Portal>
//                 <FAB.Group
//                     open={open}
//                     visible
//                     icon={open ? 'close' : 'plus'}
//                     actions={[
//                         {
//                             icon: 'account-plus',
//                             label: 'Add a member',
//                             labelTextColor: theme.colors.onPrimaryContainer,
//                             onPress: handleAddMember,
//                         },
//                         {
//                             icon: 'notebook-plus',
//                             label: 'Add an expense',
//                             labelTextColor: theme.colors.onPrimaryContainer,
//                             onPress: () => {
//                                 onStateChange({ open: false }); // Close FAB
//                                 navigation.navigate('AddExpense');
//                             },
//                         },
//                     ]}
//                     onStateChange={onStateChange}
//                     onPress={() => onStateChange({ open: !open })}
//                 />
//             </Portal>
//         </>
//     )
// }

// export default AddExpensesGroupButtonComponent

// const styles = StyleSheet.create({})

import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { FAB, Portal, useTheme } from 'react-native-paper';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AddMemberModal from './AddMemberModal';
import { responsiveFontSize as rfs } from 'react-native-responsive-dimensions';

const AddExpensesGroupButtonComponent = ({ open, onStateChange }) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [modalVisible, setModalVisible] = useState(false);

    const handleAddMember = () => {
        onStateChange({ open: false });
        setModalVisible(true);
    };

    if (!isFocused) return null;

    return (
        <>
            <AddMemberModal visible={modalVisible} onDismiss={() => setModalVisible(false)} />

            <Portal>
                <FAB.Group
                    open={open}
                    visible
                    icon={open ? 'close' : 'plus'}
                    color={theme.colors.onPrimary}
                    theme={{
                        colors: {
                            backdrop: "rgba(0, 0, 0, 0.7)", // Adjust opacity here (0.3 for lighter effect)
                        },
                    }}
                    fabStyle={{ backgroundColor: theme.colors.primary }}
                    actions={[
                        {
                            icon: 'account-plus',
                            label: 'Add a member',
                            labelTextColor: theme.colors.onSurface,
                            color: theme.colors.primary,
                            onPress: handleAddMember,
                        },
                        {
                            icon: 'notebook-plus',
                            label: 'Add an expense',
                            labelTextColor: theme.colors.onSurface,
                            color: theme.colors.primary,
                            onPress: () => {
                                onStateChange({ open: false }); // Close FAB
                                navigation.navigate('AddExpense');
                            },
                        },
                    ]}
                    onStateChange={onStateChange}
                    onPress={() => onStateChange({ open: !open })}
                />
            </Portal>
        </>
    );
};

export default AddExpensesGroupButtonComponent;