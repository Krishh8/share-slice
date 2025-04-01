import Toast from "react-native-toast-message";

export const showToast = (type, message, message2 = "") => {
    Toast.show({
        type,
        text1: message,
        text2: message2
    });
};