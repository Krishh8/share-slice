import Toast from "react-native-toast-message";

export const showToast = (type, message, message2 = "", visibilityTime = 5000) => {
    Toast.show({
        type,
        text1: message,
        text2: message2,
        visibilityTime,
        text2Style: { flexWrap: 'wrap' },
    });

};