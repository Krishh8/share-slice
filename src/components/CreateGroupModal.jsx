import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Alert, Animated } from 'react-native';
import {
    Modal,
    Portal,
    Text,
    Button,
    TextInput,
    useTheme,
    Icon,
    PaperProvider,
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
    const { loadingGroups } = useSelector(state => state.group)
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

    // Animation values
    // const scaleAnim = useRef(new Animated.Value(0)).current
    // const opacityAnim = useRef(new Animated.Value(0)).current

    // // Handle animation when visibility changes
    // useEffect(() => {
    //     if (visible) {
    //         // Start opening animations
    //         Animated.parallel([
    //             Animated.timing(scaleAnim, {
    //                 toValue: 1,
    //                 duration: 500,
    //                 useNativeDriver: true,
    //             }),
    //             Animated.timing(opacityAnim, {
    //                 toValue: 1,
    //                 duration: 500,
    //                 useNativeDriver: true,
    //             }),
    //         ]).start()
    //     } else {
    //         // Reset animation values when modal is hidden
    //         scaleAnim.setValue(0)
    //         opacityAnim.setValue(0)
    //     }
    // }, [visible, scaleAnim, opacityAnim])

    const handleClose = () => {
        // Run closing animation
        // Animated.parallel([
        //     Animated.timing(scaleAnim, {
        //         toValue: 0,
        //         duration: 250,
        //         useNativeDriver: true,
        //     }),
        //     Animated.timing(opacityAnim, {
        //         toValue: 0,
        //         duration: 250,
        //         useNativeDriver: true,
        //     }),
        // ]).start(() => {
        // After animation completes, reset form and dismiss modal
        setGroupName("")
        setSelectedCategory(categories[0])
        setError("")
        onDismiss() // Close the modal
        // })
    }

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
                // Animated.parallel([
                //     Animated.timing(scaleAnim, {
                //         toValue: 0,
                //         duration: 250,
                //         useNativeDriver: true,
                //     }),
                //     Animated.timing(opacityAnim, {
                //         toValue: 0,
                //         duration: 250,
                //         useNativeDriver: true,
                //     }),
                // ]).start(() => {
                onDismiss()
                setGroupName("")
                setSelectedCategory(categories[0])
                setError("")
                // Navigate to the GroupDetails screen with the newly created groupId
                navigation.navigate("MainStack", { screen: "GroupDetails", params: { groupId: result.payload.groupId } })
                // })
            } else {
                console.error('Error creating group:', result.error.message);
                Alert.alert('Error', result.error.message);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }

    };

    // const animatedContainerStyle = {
    //     transform: [{ scale: scaleAnim }],
    //     opacity: opacityAnim,
    // }


    return (
        // <PaperProvider>
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
                {/* <Animated.View style={[styles.scrollContainer, animatedContainerStyle]}> */}
                <View style={[styles.scrollContainer,]}>
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
                            loading={loadingGroups}
                            disabled={loadingGroups}
                            icon={loadingGroups ? 'loading' : ""}
                            labelStyle={styles.buttonText}
                            onPress={handleSubmit}
                            style={styles.actionButton}>
                            Create
                        </Button>
                    </View>
                </View>
                {/* </Animated.View> */}
            </Modal>
        </Portal >
        // </PaperProvider>
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
