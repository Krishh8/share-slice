import { View, StyleSheet } from 'react-native';
import React from 'react';
import { ActivityIndicator, useTheme, Text, Surface } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh } from 'react-native-responsive-dimensions';

const LoadingScreen = ({ message = "Loading..." }) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.text, { color: theme.colors.secondary }]}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: rh(2),
        fontSize: rfs(2),
    }
});

export default LoadingScreen