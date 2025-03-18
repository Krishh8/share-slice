import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {
    Text,
    useTheme,
    Avatar,
    IconButton,
    Divider,
    Card,
    Icon,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import LogOutBtn from '../components/LogOutBtn';
import LoadingScreen from './LoadingScreen';
import { useSelector } from 'react-redux';
import avatars from '../data/Avatar';
import HeaderComponent from '../components/HeaderComponent';

const AccountScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { user, loading, error } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const { phoneNumber, fullName, email, avatar, upiId } = user;



    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <ScrollView style={[styles.accountContainer, {
            backgroundColor: theme.colors.background
        }]}>
            {error && (
                <Text style={{ color: theme.colors.error, textAlign: "center", marginVertical: rh(1) }}>
                    {error}
                </Text>
            )}
            <HeaderComponent title="Account" />

            <Card style={styles.profileCard}>
                <Card.Content style={styles.profileCardContent}>
                    <View style={styles.avatarContainer}>
                        <Avatar.Image
                            size={rfs(20)}
                            source={avatars.find(a => a.id === (user?.avatar || 0))?.uri}
                            style={styles.avatar}
                        />
                        <IconButton
                            icon="pencil"
                            size={rfs(3)}
                            style={styles.editIcon}
                            onPress={() => navigation.navigate("EditAccount")}
                            mode="contained"
                            containerColor={theme.colors.primary}
                            iconColor={theme.colors.onPrimary}
                        />
                    </View>

                    <Text variant="headlineMedium" style={styles.profileName}>{fullName}</Text>
                    <Divider style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Icon source="phone" size={rfs(3)} color={theme.colors.primary} />
                        <Text variant="bodyLarge" style={styles.infoText}>{phoneNumber}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon source="email" size={rfs(3)} color={theme.colors.primary} />
                        <Text variant="bodyLarge" style={styles.infoText}>{email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon source="bank" size={rfs(3)} color={theme.colors.primary} />
                        <Text variant="bodyLarge" style={styles.infoText}>{upiId}</Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.optionsCard}>
                <Card.Content>
                    <TouchableOpacity style={styles.optionButton}>
                        <Icon source="frequently-asked-questions" size={rfs(3)} color={theme.colors.primary} />
                        <Text variant="titleMedium" style={styles.optionText}>FAQ</Text>
                        <Icon source="chevron-right" size={rfs(3)} color={theme.colors.outline} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>

                    <Divider style={styles.optionDivider} />

                    <TouchableOpacity style={styles.optionButton}>
                        <Icon source="information" size={rfs(3)} color={theme.colors.primary} />
                        <Text variant="titleMedium" style={styles.optionText}>About Us</Text>
                        <Icon source="chevron-right" size={rfs(3)} color={theme.colors.outline} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>

                    <Divider style={styles.optionDivider} />

                    <TouchableOpacity style={styles.optionButton}>
                        <Icon source="account-settings" size={rfs(3)} color={theme.colors.primary} />
                        <Text variant="titleMedium" style={styles.optionText}>Account Settings</Text>
                        <Icon source="chevron-right" size={rfs(3)} color={theme.colors.outline} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>

                    <Divider style={styles.optionDivider} />

                    <LogOutBtn style={styles.logoutButton} />
                </Card.Content>
            </Card>
            <View style={{ height: rh(4) }}></View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Common styles
    container: {
        flex: 1,
    },
    errorText: {
        color: 'red',
        fontSize: rfs(1.8),
        marginBottom: rh(1),
    },
    divider: {
        marginVertical: rh(2),
    },
    accountContainer: {
        flex: 1,
    },
    profileCard: {
        borderRadius: rh(2),
        margin: rw(4),
    },
    profileCardContent: {
        alignItems: 'center',
        padding: rh(3),
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: rh(2),
    },
    avatar: {
        borderWidth: rh(0),
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    profileName: {
        marginTop: rh(1),
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: rh(1),
    },
    infoText: {
        marginLeft: rw(3),
    },
    optionsCard: {
        borderRadius: rh(2),
        elevation: 4,
        margin: rw(4)
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rh(1.5),
    },
    optionText: {
        marginLeft: rw(3),
    },
    optionDivider: {
        marginVertical: rh(1),
    },
    logoutButton: {
        marginTop: rh(2),
    },
});

export default AccountScreen;
