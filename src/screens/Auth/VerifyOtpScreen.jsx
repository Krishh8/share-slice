import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Text, useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP } from '../../redux/slices/userAuthSlice';
import { OtpInput } from "react-native-otp-entry";
import { showToast } from '../../services/toastService';
import CustomAlert from '../../components/CustomAlert';
import LinearGradient from 'react-native-linear-gradient';

const VerifyOtpScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const route = useRoute();
    const { phoneNumber } = route.params;
    const { loading, error } = useSelector(state => state.userAuth)
    const [otp, setOtp] = useState("");
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const countdownRef = useRef(null);
    // const [alertVisible, setAlertVisible] = useState(false)
    const [confirmation, setConfirmation] = useState(null)


    const handleSendOTP = async () => {
        try {
            const result = await dispatch(sendOTP(phoneNumber)).unwrap();
            setConfirmation(result.confirmation); // Store confirmation object in state
            showToast('success', 'OTP sent successfully.')
        } catch (error) {
            showToast('error', 'Unable to send OTP!')
        }
    };

    useEffect(() => {
        handleSendOTP()
        setCountdown(30);
        return () => clearTimeout(countdownRef.current); // Cleanup on unmount
    }, [phoneNumber]);

    useEffect(() => {
        if (countdown > 0) {
            countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
            setResendDisabled(true);
        } else {
            setResendDisabled(false);
        }
        return () => clearTimeout(countdownRef.current);
    }, [countdown]);

    const handleSubmit = async (otp) => {
        try {
            const result = await dispatch(verifyOTP({ confirmation, otp })).unwrap();
            // showToast('success', 'OTP verified successfully.')
            if (!result.isProfileComplete) {
                navigation.navigate('AuthStack', { screen: 'Profile' });
            }
            else if (!result.isEmailVerified) {
                navigation.navigate('AuthStack', { screen: 'VerifyEmail' });
            }
            else {
                navigation.replace('MainStack');
            }
        } catch (error) {
            setOtp("")
            // setAlertVisible(true);
        }
    };

    const handleResend = async () => {
        setOtp(""); // Clear previous OTP input
        await handleSendOTP(); // Resend OTP
        setCountdown(30); // Reset countdown timer
    };

    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

                <View style={[styles.card]}>
                    <View style={[styles.textContainer,]}>
                        <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center' }}>
                            Verify Your
                        </Text>
                        <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center' }}>
                            Mobile Number
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.secondary, marginTop: rh(1), textAlign: 'center' }}>
                            OTP has been sent to {phoneNumber} via SMS.
                        </Text>
                    </View>

                    <Text variant="titleLarge" style={{ color: theme.colors.primary, marginTop: rh(4), fontWeight: '500' }}>
                        Enter OTP
                    </Text>


                    <View style={styles.otpContainer}>
                        <OtpInput
                            numberOfDigits={6}
                            focusColor={theme.colors.primary}
                            autoFocus={true}
                            hideStick={true}
                            blurOnFilled={true}
                            disabled={false}
                            type="numeric"
                            secureTextEntry={false}
                            focusStickBlinkingDuration={500}
                            onFocus={() => console.log("Focused")}
                            onBlur={() => console.log("Blurred")}
                            onFilled={handleSubmit}
                            textInputProps={{
                                accessibilityLabel: "One-Time Password",
                            }}
                            textProps={{
                                accessibilityRole: "text",
                                accessibilityLabel: "OTP digit",
                                allowFontScaling: false,
                            }}
                            theme={{
                                // containerStyle: styles.container,
                                pinCodeContainerStyle: { backgroundColor: theme.colors.background, borderColor: theme.colors.outline },
                                pinCodeTextStyle: { color: theme.colors.primary },
                                focusStickStyle: { color: theme.colors.red, width: rw(1) },
                                focusedPinCodeContainerStyle: { backgroundColor: theme.colors.surface, },
                                // placeholderTextStyle: styles.placeholderText,
                                filledPinCodeContainerStyle: { backgroundColor: theme.colors.background, borderColor: theme.colors.primaryContainer },
                                // disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
                            }}
                        />
                    </View>

                    {error && (
                        <Text style={{ color: theme.colors.error, marginTop: rh(1), }}>
                            {error}
                        </Text>
                    )}

                    <Button
                        style={styles.submitBtn}
                        labelStyle={styles.buttonText}
                        mode="contained"
                        onPress={() => handleSubmit(otp)}
                        loading={loading}
                        disabled={loading || otp.length !== 6}
                        icon="check-circle"
                    >
                        Verify OTP
                    </Button>

                    <View style={styles.bottom}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                            Didn't receive the OTP?
                        </Text>
                        <Button
                            labelStyle={styles.buttonText}
                            onPress={handleResend}
                            disabled={resendDisabled}
                            mode="text"
                            textColor={theme.colors.primary}
                        >
                            {resendDisabled ? `Resend in ${countdown}s` : "Click to resend"}
                        </Button>
                    </View>
                </View>

                {/* <CustomAlert
                    visible={alertVisible}
                    title="Invalid OTP"
                    message={'Please check and enter the correct OTP again.'}
                    onClose={() => setAlertVisible(false)}
                    onConfirm={() => setAlertVisible(false)}
                    confirmText="Okay"
                    showCancel={false}
                    icon="information-variant" /> */}
            </View>
        </TouchableWithoutFeedback >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: rh(2),
    },
    card: {
        marginHorizontal: rw(4),
    },
    textContainer: {
        marginBottom: rh(2),
    },
    otpContainer: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        marginVertical: rh(1),
    },
    otpInput: {
        width: rw(10),
        height: rw(11),
        fontSize: rfs(2.5),
    },
    submitBtn: {
        marginTop: rh(3),
        borderRadius: rh(1),
        paddingVertical: rh(0.5),
    },
    buttonText: {
        fontSize: rfs(2)
    },
    bottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: rh(3),
    }
});

export default VerifyOtpScreen
