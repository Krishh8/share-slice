import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Appbar, useTheme } from 'react-native-paper'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';

const HeaderComponent = ({ title }) => {
    const theme = useTheme();
    const navigation = useNavigation()
    return (
        <View>
            <Appbar.Header>
                <Appbar.Action icon="chevron-left" size={rfs(3.5)} iconColor={theme.colors.primary} onPress={() => navigation.goBack()} />
                <Appbar.Content title={title} titleStyle={{ fontSize: rfs(3), fontWeight: 'bold', color: theme.colors.primary }} />
            </Appbar.Header>
        </View>
    )
}

export default HeaderComponent