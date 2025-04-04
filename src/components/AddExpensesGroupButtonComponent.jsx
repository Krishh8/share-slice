import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { FAB, Portal, useTheme } from 'react-native-paper';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AddMemberModal from './AddMemberModal';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';

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
                    style
                    fabStyle={{ backgroundColor: theme.colors.primary, position: 'absolute', bottom: rh(4), right: rh(2) }}
                    actions={[
                        {
                            icon: 'account-plus',
                            label: 'Add a member',
                            labelTextColor: theme.colors.secondary,
                            color: theme.colors.primary,
                            onPress: handleAddMember,
                            style: { position: 'absolute', bottom: rh(15), right: rh(2) },
                            labelStyle: { position: 'absolute', bottom: rh(15), right: rh(5) },
                        },
                        {
                            icon: 'notebook-plus',
                            label: 'Add an expense',
                            labelTextColor: theme.colors.secondary,
                            color: theme.colors.primary,
                            onPress: () => {
                                onStateChange({ open: false }); // Close FAB
                                navigation.navigate('AddExpense');
                            },
                            style: { position: 'absolute', bottom: rh(13), right: rh(2) },
                            labelStyle: { position: 'absolute', bottom: rh(13), right: rh(5) },
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