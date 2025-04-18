import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React from 'react';
import { Button, Text, TextInput, useTheme, HelperText, Avatar, Card } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import LoadingScreen from './LoadingScreen';
import { updateProfile } from '../redux/slices/userAuthSlice';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'
import avatars from '../data/Avatar';
import HeaderComponent from '../components/HeaderComponent';
import { showToast } from '../services/toastService';

const validationSchema = Yup.object().shape({
    fullName: Yup.string()
        .min(2, 'fullName must be at least 2 characters')
        .max(50, 'Too Long!')
        .required('fullName is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    avatar: Yup.string().required('Please select an avatar'),
    upiId: Yup.string()
        .matches(/^[\w.-]+@[a-zA-Z]{2,}$/, 'Invalid UPI ID format')
        .required('UPI ID is required'),
});

const EditAccountScreen = () => {
    const theme = useTheme();
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const { user, loading, error, } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const { fullName, email, avatar, uid, upiId } = user || ''


    const handleSubmit = async (values) => {
        const user = auth().currentUser;
        if (!user) {
            Alert.alert("Error", "No user is currently logged in.");
            return;
        }

        try {
            // Update other profile details
            await dispatch(updateProfile({
                uid,
                fullName: values.fullName,
                email: values.email,
                avatar: values.avatar || '0',
                upiId: values.upiId
            })).unwrap()

            navigation.goBack()
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };


    // if (loading) {
    //     return <LoadingScreen />
    // }

    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
                <HeaderComponent title="Edit Profile" />

                <View style={styles.card}>
                    <Card.Content>
                        <View style={styles.textContainer}>
                            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>Hey there!</Text>
                            <Text variant="bodyLarge" style={{ color: theme.colors.secondary, marginTop: rh(1) }}>Let’s give your profile a quick refresh!</Text>
                        </View>

                        <Formik
                            initialValues={{
                                fullName: fullName || '',
                                email: email || '',
                                avatar: avatar || 0,
                                upiId: upiId || ''
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                                <View>
                                    {/* Avatar Selection */}
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

                                    {/* fullName Input */}
                                    <TextInput
                                        style={styles.input}
                                        label="Enter Full Name"
                                        mode="outlined"
                                        textColor={theme.colors.secondary}
                                        outlineColor={theme.colors.primary}
                                        onChangeText={handleChange('fullName')}
                                        onBlur={handleBlur('fullName')}
                                        value={values.fullName}
                                        left={<TextInput.Icon icon="account" />}
                                        error={touched.fullName && errors.fullName}
                                    />
                                    {touched.fullName && errors.fullName && (
                                        <Text style={[styles.error, { color: theme.colors.error }]}>{errors.fullName}</Text>
                                    )}

                                    {/* Email Input */}
                                    <TextInput
                                        style={styles.input}
                                        label="Email"
                                        mode="outlined"
                                        textColor={theme.colors.secondary}
                                        outlineColor={theme.colors.primary}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
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

                                    {/* Submit Button */}
                                    <Button
                                        mode="contained"
                                        onPress={handleSubmit}
                                        style={styles.submitBtn}
                                        labelStyle={styles.buttonText}
                                        loading={loading}
                                        disabled={loading}
                                        icon={loading ? 'loading' : ""}
                                    >
                                        Update
                                    </Button>
                                </View>
                            )}
                        </Formik>
                    </Card.Content>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};


export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    card: {
        flex: 1,
        borderRadius: rh(2),
        padding: rh(2),
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
    },
    buttonText: {
        fontSize: rfs(2)
    },
});

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: rh(5),
//         justifyContent: 'center',
//         alignContent: 'center',
//     },
//     textContainer: { },
//     text1: {
//         fontSize: rfs(5),
//     },
//     text3: {
//         fontSize: rfs(2.5),
//         fontWeight: '500',
//         marginBottom: rh(3),
//     },
//     label: {
//         fontSize: rfs(2.5),
//         fontWeight: 700,
//         marginBottom: rh(1),
//     },
//     avatarList: {
//         flexDirection: 'row',
//         paddingBottom: rh(1),
//     },
//     avatarContainer: {
//         marginRight: rw(3),
//         padding: 5,
//         borderRadius: rh(5),
//         borderWidth: 2,
//         borderColor: 'transparent',
//     },
//     selectedAvatar: {
//         borderColor: '#6200ee', // Highlight selected avatar
//     },
//     input: {
//         fontSize: rfs(2),
//         marginTop: rh(1.5),
//         marginBottom: rh(0.5),
//     },
//     submitBtn: {
//         marginTop: rh(2),
//         borderRadius: rh(1),
//     },
//     submitBtnText: {
//         fontSize: rfs(2),
//     },
// });

export default EditAccountScreen;
