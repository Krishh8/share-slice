import { Alert, FlatList, Keyboard, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button, TextInput, useTheme, Text, Avatar, Card, Surface } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import LogOutBtn from '../../components/LogOutBtn';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/userAuthSlice';
import LoadingScreen from '../LoadingScreen';
import avatars from '../../data/Avatar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const validationSchema = Yup.object().shape({
    fullName: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Too Long!')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    avatar: Yup.string().required('Please select an avatar'),
    upiId: Yup.string()
        .matches(/^[\w.-]+@[a-zA-Z]{2,}$/, 'Invalid UPI ID format')
        .required('UPI ID is required'),
});

const ProfileScreen = () => {
    const route = useRoute();
    const theme = useTheme();
    const navigation = useNavigation()
    const dispatch = useDispatch();

    const { loading, user, error } = useSelector(state => state.userAuth)
    const { fullName, email, phoneNumber, avatar, uid, isEmailVerified, upiId } = user

    const initialValues = {
        avatar: avatar || 0,
        fullName: fullName || '',
        email: email || '',
        phoneNumber: phoneNumber || '',
        upiId: upiId || ''
    };

    const linkPhoneWithEmail = async (email) => {
        const user = auth().currentUser;
        if (!user) {
            Alert.alert('Error', 'No user is currently logged in.');
            return false;
        }

        try {
            const signInMethods = await auth().fetchSignInMethodsForEmail(email);
            if (signInMethods.includes(auth.EmailAuthProvider.PROVIDER_ID)) {
                console.log("Email already linked.");
                return true;
            }

            const tempPassword = 'temporarypassword123';
            const credential = auth.EmailAuthProvider.credential(email, tempPassword);
            await user.linkWithCredential(credential);

            console.log('Phone authentication linked with email successfully!');
            return true;

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already linked to another account.');
            } else {
                console.error('Error linking phone with email:', error);
                Alert.alert('Error', 'Could not link phone and email. Please try again.');
            }
            return false;
        }
    };

    const handleProfileSubmit = async (values) => {
        const currentUser = auth().currentUser;

        if (!currentUser) {
            Alert.alert("Error", "No user is currently logged in.");
            return;
        }
        try {
            const userDocRef = firestore().collection('users').doc(currentUser.uid);
            const userDoc = await userDocRef.get();
            const userData = userDoc.data();

            if (!userData) {
                Alert.alert("Error", "User data not found.");
                return;
            }

            if (!userData.isEmailLinked) {
                const emailLinked = await linkPhoneWithEmail(values.email);

                if (emailLinked) {
                    await userDocRef.update({
                        isEmailLinked: true,
                        updatedAt: Timestamp.now(),
                    });
                    Alert.alert("Success", "Email successfully linked to your phone.");
                } else {
                    Alert.alert("Error", "Failed to link email.");
                    return;
                }
            } else {
                console.log("Email already linked.");
            }

            const storedGroupId = await AsyncStorage.getItem('pendingGroupId');

            if (storedGroupId) {
                console.log("User was invited to group:", storedGroupId);

                // ✅ Dispatch action to update profile & add user to group
                await dispatch(updateProfileAndJoinGroup({
                    uid: currentUser.uid,
                    fullName: values.fullName,
                    email: values.email,
                    avatar: values.avatar,
                    upiId: values.upiId,
                    groupId: storedGroupId
                }));

                // ✅ Remove stored groupId after adding user to group
                await AsyncStorage.removeItem('pendingGroupId');
            } else {
                // ✅ Normal profile update if no group invite exists
                await dispatch(updateProfile({
                    uid: currentUser.uid,
                    fullName: values.fullName,
                    email: values.email,
                    avatar: values.avatar,
                    upiId: values.upiId
                }));
            }

            // await dispatch(updateProfile({ uid, fullName: values.fullName, email: values.email, avatar: values.avatar, upiId: values.upiId }))

            await currentUser.reload();
            if (!currentUser.emailVerified) {
                await currentUser.sendEmailVerification();
                Alert.alert(
                    "Verify Your Email",
                    "A verification email has been sent. Please verify before proceeding."
                );
            }

            navigation.replace('VerifyEmail');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', error.message);
        }
    };

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.card}>
                    <View>
                        <View style={styles.textContainer}>
                            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>Complete Your Profile!</Text>
                            <Text variant="bodyLarge" style={{ color: theme.colors.secondary, marginTop: rh(1) }}>Let's set up your account quickly</Text>
                        </View>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleProfileSubmit}
                            enableReinitialize
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                                <View>
                                    <Text style={[styles.label, { color: theme.colors.secondary }]}>Choose Avatar</Text>
                                    <FlatList
                                        data={avatars}
                                        keyExtractor={(item) => item.id}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.avatarList}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity
                                                onPress={() => setFieldValue('avatar', item.id)}
                                                style={[
                                                    styles.avatarContainer,
                                                    values.avatar === item.id && { borderColor: theme.colors.primary },
                                                ]}
                                            >
                                                <Avatar.Image
                                                    size={rfs(7)}
                                                    source={avatars[index].uri}
                                                />

                                            </TouchableOpacity>
                                        )}
                                    />
                                    {touched.avatar && errors.avatar && (
                                        <Text style={[styles.error, { color: theme.colors.error }]}>{errors.avatar}</Text>
                                    )}

                                    <TextInput
                                        style={styles.input}
                                        label="Enter Full Name"
                                        mode="outlined"
                                        onChangeText={handleChange('fullName')}
                                        onBlur={handleBlur('fullName')}
                                        value={values.fullName}
                                        left={<TextInput.Icon icon="account" />}
                                        error={touched.fullName && errors.fullName}
                                    />
                                    {touched.fullName && errors.fullName && (
                                        <Text style={[styles.error, { color: theme.colors.error }]}>{errors.fullName}</Text>
                                    )}

                                    <TextInput
                                        style={styles.input}
                                        label="Email"
                                        mode="outlined"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        left={<TextInput.Icon icon="email" />}
                                        error={touched.email && errors.email}
                                    />
                                    {touched.email && errors.email && (
                                        <Text style={[styles.error, { color: theme.colors.error }]}>{errors.email}</Text>
                                    )}

                                    <TextInput
                                        style={styles.input}
                                        label="UPI ID"
                                        mode="outlined"
                                        textColor={theme.colors.secondary}
                                        outlineColor={theme.colors.primary}
                                        autoCapitalize="none"
                                        onChangeText={handleChange('upiId')}
                                        onBlur={handleBlur('upiId')}
                                        value={values.upiId}
                                        left={<TextInput.Icon icon="bank" />}
                                        error={touched.upiId && errors.upiId}
                                    />
                                    {touched.upiId && errors.upiId && (
                                        <Text style={[styles.error, { color: theme.colors.error }]}>{errors.upiId}</Text>
                                    )}

                                    <TextInput
                                        style={styles.input}
                                        label="Mobile Number"
                                        mode="outlined"
                                        keyboardType="numeric"
                                        autoCapitalize="none"
                                        value={values.phoneNumber}
                                        editable={false}
                                        left={<TextInput.Icon icon="phone" />}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={handleSubmit}
                                        style={styles.submitBtn}
                                        labelStyle={styles.buttonText}
                                    >
                                        Submit
                                    </Button>
                                </View>
                            )}
                        </Formik>
                    </View>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: rh(2),
    },
    card: {
        flex: 1,
        justifyContent: 'center',
        borderRadius: rh(2),
    },
    textContainer: {
        marginBottom: rh(3),
    },
    label: {
        fontSize: rfs(2.5),
        fontWeight: '700',
        marginBottom: rh(1),
        marginTop: rh(2),
    },
    avatarList: {
        flexDirection: 'row',
        paddingBottom: rh(1),
    },
    avatarContainer: {
        marginRight: rw(3),
        padding: 5,
        borderRadius: rh(5),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    input: {
        fontSize: rfs(2),
        marginTop: rh(1.5),
        marginBottom: rh(0.5),
    },
    submitBtn: {
        marginTop: rh(3),
        borderRadius: rh(1),
        paddingVertical: rh(0.5),
    },
    buttonText: {
        fontSize: rfs(2)
    },
});

export default ProfileScreen;