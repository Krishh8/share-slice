import { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text, ActivityIndicator, Card, Surface, useTheme, Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { checkEmailVerification, checkSession, resendVerificationEmail } from "../../redux/slices/userAuthSlice";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import CustomAlert from "../../components/CustomAlert";

const VerifyEmailScreen = () => {
    const [disabled, setDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const { user, loading } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const { isEmailVerified } = user
    const [alertVisible, setAlertVisible] = useState(false)

    useEffect(() => {
        if (isEmailVerified) {
            navigation.replace('MainStack', { screen: 'BottomTab' });
        }
    }, [isEmailVerified, navigation]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            setDisabled(true);
        } else {
            setDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResendEmail = async () => {
        try {
            await dispatch(resendVerificationEmail()).unwrap();
            setAlertVisible(true)
            setCountdown(60); // Disable for 60 seconds
        } catch (error) {
            Alert.alert("Error", error);
        }
    };

    const handleCheckEmailVerification = async () => {
        try {
            await dispatch(checkEmailVerification()).unwrap();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer, }]}>
                        <Icon source="email-check" size={rfs(10)} color={theme.colors.primary} />
                    </View>

                    <Text variant="headlineMedium" style={styles.title}>Verify Your Email</Text>

                    <Text variant="bodyLarge" style={styles.message}>
                        We have sent a verification email to <Text style={{ color: theme.colors.primary }}>{auth().currentUser?.email}.</Text>
                        Please verify your email before continuing.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={handleResendEmail}
                            disabled={disabled || loading}
                            style={styles.button}
                            icon="email-send"
                        >
                            {disabled ? `Resend in ${countdown}s` : 'Resend Verification Email'}
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={handleCheckEmailVerification}
                            disabled={loading}
                            loading={loading}
                            style={styles.button}
                            icon={loading ? 'loading' : 'refresh'}
                        >
                            {loading ? 'Checking...' : 'Check Verification Status'}
                        </Button>
                    </View>

                </View>
                <CustomAlert
                    visible={alertVisible}
                    title="Verification Email Sent"
                    message="Please check your email again."
                    onClose={() => setAlertVisible(false)}
                    onConfirm={() => setAlertVisible(false)}
                    confirmText="Okay"
                    showCancel={false}
                    icon="information-variant"
                />
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: rh(2),
    },
    card: {
        width: '90%',
        borderRadius: rh(2),
    },
    cardContent: {
        alignItems: 'center',
        padding: rh(3),
    },
    iconContainer: {
        marginBottom: rh(3),
        padding: rh(2),
        borderRadius: rh(5),
    },
    title: {
        fontWeight: "bold",
        marginBottom: rh(2),
        textAlign: 'center',
    },
    message: {
        textAlign: "center",
        marginBottom: rh(3),
        lineHeight: rh(3),
    },
    buttonContainer: {
        width: "100%",
    },
    button: {
        marginVertical: rh(1),
        borderRadius: rh(1),
        paddingVertical: rh(0.5),
    },
    loader: {
        marginTop: rh(2),
    },
});

export default VerifyEmailScreen
