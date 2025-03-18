import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
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


// const SignUpScreen = () => {
//     const theme = useTheme();
//     const [phoneNumber, setPhoneNumber] = useState("");
//     const [error, setError] = useState("");
//     const navigation = useNavigation();

//     const handleSubmit = () => {
//         if (!/^\d{10}$/.test(phoneNumber)) {
//             setError("Enter a valid 10-digit mobile number.");
//         } else {
//             setError("");
//             console.log("Submitted Mobile Number:", phoneNumber);
//             setPhoneNumber(""); // Reset after submission
//             navigation.navigate('VerifyOTP', { phoneNumber: `+91${phoneNumber}` });
//         }
//     };
//     return (
//         // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//         <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

//             <View>
//                 <Text style={[styles.text1, { color: theme.colors.secondary }]}>Get Started With</Text>
//                 <Text style={[styles.text2, { color: theme.colors.primary }]}>ShareSlice!</Text>
//                 <Text style={[styles.text3, { color: theme.colors.secondary }]}>Simplify shared expenses</Text>
//             </View>

//             <View style={styles.inputBox}>
//                 <TextInput
//                     style={styles.input}
//                     label="Mobile No."
//                     mode="outlined"
//                     value={phoneNumber}
//                     keyboardType='number-pad'
//                     onChangeText={(text) => setPhoneNumber(text)}
//                     outlineStyle={{
//                         outlineWidth: 0.3,
//                     }}

//                     left={<TextInput.Icon icon="phone" size={rfs(3)} color={theme.colors.secondary} />}
//                 />
//                 {error ? <Text style={{ color: theme.colors.error, marginTop: rh(1) }}>{error}</Text> : null}
//             </View>

//             <Button style={styles.submitBtn} labelStyle={styles.buttonText} mode="contained" onPress={handleSubmit}>
//                 Request OTP
//             </Button>

//         </View>
//         // </TouchableWithoutFeedback>
//     )
// }

const SignUpScreen = () => {
    const theme = useTheme();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();

    const handleSubmit = () => {
        if (!/^\d{10}$/.test(phoneNumber)) {
            setError("Enter a valid 10-digit mobile number.");
        } else {
            setError("");
            console.log("Submitted Mobile Number:", phoneNumber);
            setPhoneNumber(""); // Reset after submission
            navigation.navigate('VerifyOTP', { phoneNumber: `+91${phoneNumber}` });
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
            <LinearGradient
                // colors={[theme.colors.primary, theme.colors.primaryContainer, theme.colors.secondary]}

                // colors={[theme.colors.primary, theme.colors.inversePrimary, theme.colors.secondaryContainer]}

                // colors={[theme.colors.primary, theme.colors.inversePrimary, theme.colors.background]}

                colors={[theme.colors.primary, theme.colors.primaryContainer, theme.colors.secondaryContainer, theme.colors.primaryContainer, theme.colors.primary]}

                // useAngle={true}
                // angle={30}

                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.signupContainer, { backgroundColor: theme.colors.background }]}>


                {/* <View style={[styles.signupContainer, { backgroundColor: theme.colors.background }]} > */}
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
                        keyboardType="number-pad"
                        onChangeText={(text) => setPhoneNumber(text)}
                        outlineStyle={{ borderRadius: rh(1) }}
                        activeOutlineColor={theme.colors.primary}
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
                    >
                        Request OTP
                    </Button>
                </View>
                {/* </View> */}
            </LinearGradient>
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
