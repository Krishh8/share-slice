import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Button, TextInput, Text, useTheme, Card, Surface, IconButton } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP } from '../../redux/slices/userAuthSlice';
import { OtpInput } from "react-native-otp-entry";

const VerifyOtpScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const route = useRoute();
    const { phoneNumber } = route.params;

    const { user, otpSent, loading, error } = useSelector(state => state.userAuth)

    // const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otp, setOtp] = useState("");
    const inputRefs = useRef([]);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [confirmation, setConfirmation] = useState(null)
    const countdownRef = useRef(null);


    const handleSendOTP = async () => {
        try {
            const result = await dispatch(sendOTP(phoneNumber)).unwrap();
            setConfirmation(result.confirmation); // Store confirmation object in state
            console.log("OTP sent successfully", result.confirmation);
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    };

    useEffect(() => {
        console.log('in otp screen')
        handleSendOTP()
        setCountdown(30);
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

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== "") {
            // Move to next input if a digit is entered
            if (index < 5) {
                inputRefs.current[index + 1]?.focus()
            }
        }

        if (newOtp.every((digit) => digit !== "")) {
            handleSubmit(newOtp.join(""))
        }
    };

    const handleKeyPress = (event, index) => {
        if (event.nativeEvent.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                // Move to previous input on backspace if current input is empty
                const newOtp = [...otp]
                newOtp[index - 1] = ""
                setOtp(newOtp)
                inputRefs.current[index - 1]?.focus()
            } else {
                // Clear current input on backspace
                const newOtp = [...otp]
                newOtp[index] = ""
                setOtp(newOtp)
            }
        }
    }

    const handleSubmit = async (enteredOtp) => {
        if (enteredOtp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP.');
            return;
        }

        if (!confirmation) {
            Alert.alert('Error', 'OTP confirmation not initialized. Please resend OTP.');
            return;
        }

        try {
            const result = await dispatch(verifyOTP({ confirmation, otp: enteredOtp })).unwrap();
            console.log("OTP Verified Result:", result);

            if (!result.isProfileComplete) {
                navigation.replace('AuthStack', { screen: 'Profile' });
            }
            else if (!result.isEmailVerified) {
                navigation.replace('AuthStack', { screen: 'VerifyEmail' });
            }
            else {
                navigation.replace('MainStack');
            }
        } catch (error) {
            Alert.alert("Error", error);
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
                    <View style={styles.textContainer}>
                        <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            Verify your mobile number
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.secondary, marginTop: rh(1) }}>
                            OTP has been sent to {phoneNumber} via SMS
                        </Text>
                    </View>

                    <Text variant="titleLarge" style={{ color: theme.colors.primary, marginTop: rh(4), fontWeight: '500' }}>
                        Enter OTP
                    </Text>

                    <View style={styles.otpContainer}>
                        {/* {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={[
                                    styles.otpInput,
                                    {
                                        borderColor: digit ? theme.colors.primary : theme.colors.outline,
                                        backgroundColor: digit ? theme.colors.primaryContainer : theme.colors.surface
                                    }
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={(event) => handleKeyPress(event, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                textAlign="center"
                                textColor={theme.colors.onSurface}
                                mode="outlined"
                            />
                        ))} */}
                        <OtpInput
                            numberOfDigits={6}
                            focusColor={theme.colors.primary}
                            autoFocus={true}
                            hideStick={true}
                            placeholder="******"
                            blurOnFilled={true}
                            disabled={false}
                            type="numeric"
                            secureTextEntry={false}
                            focusStickBlinkingDuration={500}
                            onFocus={() => console.log("Focused")}
                            onBlur={() => console.log("Blurred")}
                            onTextChange={(text) => console.log(text)}
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
                                focusStickStyle: { color: theme.colors.primary },
                                focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                                placeholderTextStyle: styles.placeholderText,
                                filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                                disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
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
            </View>
        </TouchableWithoutFeedback>
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
