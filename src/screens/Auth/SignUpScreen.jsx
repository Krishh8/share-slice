import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    useTheme,
    Card,
    Icon,
} from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Image } from 'react-native-svg';

const SignUpScreen = () => {
    const theme = useTheme();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)

    const handleSubmit = () => {
        setLoading(true)
        if (!/^\d{10}$/.test(phoneNumber)) {
            setError("Enter a valid 10-digit mobile number.");
            setLoading(false)
        } else {
            setLoading(false)
            setError("");
            setPhoneNumber(""); // Reset after submission
            navigation.navigate('VerifyOTP', { phoneNumber: `+91${phoneNumber}` });
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
            <View style={[styles.signupContainer, { backgroundColor: theme.colors.background }]} >
                <View style={styles.signupCardContent}>
                    <View style={styles.logoContainer}>
                        <Icon source="wallet" size={rfs(10)} color={theme.colors.primary} />
                    </View>

                    <Text style={styles.welcomeText}>Get Started With</Text>
                    <Text style={[styles.appNameText, { color: theme.colors.primary }]}>ShareSlice!</Text>
                    <Text style={styles.taglineText}>Simplify shared expenses</Text>

                    <TextInput
                        style={styles.phoneInput}
                        label="Mobile Number"
                        mode="outlined"
                        value={phoneNumber}
                        textColor={theme.colors.secondary}
                        outlineColor={theme.colors.primary}
                        keyboardType="number-pad"
                        onChangeText={(text) => setPhoneNumber(text)}
                        outlineStyle={{ borderRadius: rh(1) }}
                        activeOutlineColor={theme.colors.primary}
                        error={error}
                        left={<TextInput.Icon icon="phone" size={rfs(3)} color={theme.colors.primary} />}
                    />

                    {error ? (
                        <Text style={{ color: theme.colors.error, marginTop: rh(1) }}>{error}</Text>
                    ) : null}

                    <Button
                        style={styles.otpButton}
                        labelStyle={styles.buttonText}
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        icon={loading ? 'loading' : ""}
                    >
                        Request OTP
                    </Button>
                </View>
            </View>
        </TouchableWithoutFeedback >

    );
};


const styles = StyleSheet.create({
    signupContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: rw(4),
    },
    signupCardContent: {
        padding: rh(3),
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: rh(3),
    },
    welcomeText: {
        fontSize: rfs(4),
        textAlign: 'center'
    },
    appNameText: {
        fontSize: rfs(6),
        fontWeight: 'bold',
        marginBottom: rh(1),
        textAlign: 'center'
    },
    taglineText: {
        fontSize: rfs(2.5),
        opacity: 0.7,
        marginBottom: rh(4),
        textAlign: 'center'
    },
    phoneInput: {
        fontSize: rfs(2.2),
    },
    otpButton: {
        marginTop: rh(3),
        borderRadius: rh(1),
        paddingVertical: rh(0.5),
    },
    buttonText: {
        fontSize: rfs(2),
    },
})

export default SignUpScreen
