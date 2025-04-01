import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Icon, IconButton, Modal, Portal, Text, useTheme } from "react-native-paper";
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';

const CustomAlert = ({
    visible,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "OK",
    cancelText = "Cancel",
    showCancel = true,
    icon
}) => {
    const theme = useTheme();

    return (
        <Portal>
            <Modal
                visible={visible}
                // onDismiss={onClose}
                theme={{
                    colors: {
                        backdrop: "rgba(0, 0, 0, 0.8)", // Adjust opacity here (0.3 for lighter effect)
                    },
                }}
                contentContainerStyle={[
                    styles.modalContainer,
                    { backgroundColor: theme.colors.surfaceVariant },
                ]}
            >
                <IconButton mode="outlined" icon={icon} size={rfs(6)} iconColor={theme.colors.surfaceVariant} style={[styles.icon, { backgroundColor: theme.colors.primary, borderColor: theme.colors.surfaceVariant }]} />
                <View style={[styles.alertBox]}>
                    {title && <Text style={[styles.title, { color: theme.colors.primary }]}>{title}</Text>}
                    <Text style={[styles.message, { color: theme.colors.secondary }]}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {showCancel && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.colors.surfaceDisabled }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.cancelText, { color: theme.colors.onSurface }]}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.primary }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.confirmText, { color: theme.colors.onPrimary }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Portal>
    );
};

export default CustomAlert;

const styles = StyleSheet.create({
    modalContainer: {
        width: '80%',
        alignSelf: 'center',
        alignItems: 'center',
        borderRadius: rfs(1.5),
        paddingVertical: rh(2.5),
        paddingHorizontal: rw(5),
        position: 'relative'
    },
    icon: {
        position: 'absolute',
        top: rh(-5),
        borderWidth: rw(1),
    },
    alertBox: {
        alignItems: "center",
    },
    title: {
        marginTop: rh(2),
        fontSize: rfs(3),
        fontWeight: "bold",
        marginBottom: rh(1.5),
    },
    message: {
        fontSize: rfs(2),
        marginBottom: rh(2),
        textAlign: 'center'
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        flex: 1,
        paddingVertical: rh(1.5),
        alignItems: "center",
        borderRadius: rfs(1),
        marginHorizontal: rw(2),
    },
    cancelText: {
        fontWeight: "bold",
    },
    confirmText: {
        fontWeight: "bold",
    },
});
