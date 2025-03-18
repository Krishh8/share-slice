import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Alert } from 'react-native';
import {
    Modal,
    Portal,
    Text,
    Button,
    TextInput,
    useTheme,
    Icon,
} from 'react-native-paper';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import categories from '../data/GroupCategory';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup } from '../redux/slices/groupSlice';
import { useNavigation } from '@react-navigation/native';

const CreateGroupModal = ({ visible, onDismiss }) => {
    const theme = useTheme();
    const [groupName, setGroupName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const [error, setError] = useState('');
    const { user } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const uid = user?.uid
    const dispatch = useDispatch();
    const navigation = useNavigation()

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleClose = () => {
        setGroupName('');
        setSelectedCategory(null);
        setError('');
        onDismiss(); // Close the modal
    };


    const handleSubmit = async () => {
        if (!uid) {
            console.log("uid not present");
            return;
        }
        if (!groupName.trim()) {
            setError("Group name can't be empty.");
            return;
        }
        if (!selectedCategory) {
            setError("Please select a category.");
            return;
        }

        try {
            const result = await dispatch(createGroup({ groupName, selectedCategory, uid }));

            if (createGroup.fulfilled.match(result)) {
                console.log('Group created successfully:', result.payload);
                onDismiss();
                setGroupName('');
                setSelectedCategory(null);
                setError('');
                // Navigate to the GroupDetails screen with the newly created groupId
                navigation.navigate('MainStack', { screen: 'GroupDetails', params: { groupId: result.payload.groupId } });
            } else {
                console.error('Error creating group:', result.error.message);
                Alert.alert('Error', result.error.message);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }

    };


    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modalContainer,
                    { backgroundColor: theme.colors.secondaryContainer },
                ]}
                theme={{
                    colors: {
                        backdrop: "rgba(0, 0, 0, 0.7)", // Adjust opacity here (0.3 for lighter effect)
                    },
                }}
            >
                <View
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}>
                    <Text
                        style={[
                            styles.modalTitle,
                            { color: theme.colors.onSecondaryContainer },
                        ]}>
                        Create a Group
                    </Text>
                    {error && <Text style={[{ color: theme.colors.error }, styles.errorText]}>{error}</Text>}
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.secondaryContainer }]}
                        value={groupName}
                        mode="outlined"
                        label="Group Name"
                        textColor={theme.colors.onSecondaryContainer}
                        onChangeText={(text) => setGroupName(text)}
                    />

                    <Text
                        style={[
                            styles.categoryLabel,
                            { color: theme.colors.onSecondaryContainer },
                        ]}>
                        Choose Category
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}>

                        {/* {categories.map((category) => (
                            <View key={category.label}>
                                <Button
                                    icon={() => (
                                        <Icon source={category.icon} size={rfs(3)} color={theme.colors.primary} />
                                    )}

                                    mode="outlined"
                                    style={[
                                        {
                                            borderWidth: selectedCategory?.label === category.label ? rw(0.6) : rw(0.3),
                                            borderColor: selectedCategory?.label === category.label ? theme.colors.primary : theme.colors.secondary,
                                            borderRadius: rw(5), // ✅ Now it will work correctly
                                        },
                                    ]}
                                    labelStyle={styles.btnText}
                                    onPress={() => handleCategoryPress(category)}>
                                    {category.label}
                                </Button>
                            </View>
                        ))} */}

                        {categories.map((category) => (
                            <Button
                                key={category.label}
                                mode={selectedCategory === category ? "contained" : "outlined"}
                                onPress={() => handleCategoryChange(category)}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category && { backgroundColor: theme.colors.primary },
                                ]}
                                labelStyle={[
                                    styles.categoryButtonLabel,
                                    selectedCategory === category && { color: theme.colors.onPrimary },
                                ]}
                                icon={category.icon}
                            >
                                {category.label}
                            </Button>
                        ))}
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            labelStyle={styles.buttonText}
                            onPress={handleClose}
                            style={styles.actionButton}>
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            labelStyle={styles.buttonText}
                            onPress={handleSubmit}
                            style={styles.actionButton}>
                            Create
                        </Button>
                    </View>
                </View>
            </Modal>
        </Portal >
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        padding: rw(5),
        borderRadius: rw(2),
        margin: rw(7),
        maxHeight: '80%',
    },
    scrollContainer: {
        width: '100%',
    },
    modalTitle: {
        fontSize: rfs(2.5),
        fontWeight: 'bold',
        marginBottom: rh(1.5),
        textAlign: 'left',
    },
    errorText: {
        fontSize: rfs(2),
        marginBottom: rh(1)
    },
    input: {
        width: '100%',
        marginBottom: rh(2),
    },
    categoryButton: {
        marginRight: rw(2),
        borderRadius: rh(1),
    },
    categoryButtonLabel: {
        fontSize: rfs(1.8),
    },
    categoriesContainer: {
        paddingVertical: rh(1),
    },
    btnText: {
        fontSize: rfs(2),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: rh(1),
    },
    actionButton: {
        width: '45%',
        borderRadius: rh(1),
    },
    buttonText: {
        fontSize: rfs(2),
    },
});

export default CreateGroupModal;
