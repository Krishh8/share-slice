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
import { useDispatch, useSelector } from 'react-redux';
import avatars from '../data/Avatar';
import HeaderComponent from '../components/HeaderComponent';
import { clearUser } from '../redux/slices/userAuthSlice';
import auth from '@react-native-firebase/auth';

const AccountScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const { user, loading, error } = useSelector(state => state.userAuth);
    if (!user) {
        return null; // Don't render anything if user is null
    }
    const { phoneNumber, fullName, email, avatar, upiId } = user;

    const handleLogout = async () => {
        try {
            console.log('Logging out...');
            await auth().signOut();  // Firebase logout
            dispatch(clearUser());   // Reset Redux state

            // Wait a moment for Firebase state to update
            // setTimeout(() => {
            navigation.replace('AuthStack'); // Redirect to Auth screens
            // }, 500);

        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <HeaderComponent title="Account" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.accountContainer, {
                    backgroundColor: theme.colors.background
                }]}>
                <Card style={styles.profileCard}>
                    <IconButton
                        icon="pencil"
                        size={rfs(3)}
                        style={styles.editIcon}
                        onPress={() => navigation.navigate("EditAccount")}
                        mode="contained"
                    // containerColor={theme.colors.backdrop}
                    />
                    <Card.Content style={styles.profileCardContent}>
                        <View style={styles.avatarContainer}>
                            <Avatar.Image
                                size={rfs(20)}
                                source={avatars.find(a => a.id === (user?.avatar || 0))?.uri}
                                style={styles.avatar}
                            />
                        </View>
                        <Text variant="headlineMedium" style={styles.profileName}>{fullName}</Text>
                        <Divider bold style={styles.divider} />

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
                        <TouchableOpacity onPress={() => navigation.navigate("FAQ")} style={styles.optionButton}>
                            <Icon source="frequently-asked-questions" size={rfs(3)} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={styles.optionText}>FAQ</Text>
                            <Icon source="chevron-right" size={rfs(3)} color={theme.colors.outline} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>

                        <Divider style={styles.optionDivider} />

                        <TouchableOpacity onPress={() => navigation.navigate("AboutUs")} style={styles.optionButton}>
                            <Icon source="information" size={rfs(3)} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={styles.optionText}>About Us</Text>
                            <Icon source="chevron-right" size={rfs(3)} color={theme.colors.outline} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>

                        <Divider style={styles.optionDivider} />

                        <TouchableOpacity onPress={() => navigation.navigate("EditAccount")} style={styles.optionButton}>
                            <Icon source="account-settings" size={rfs(3)} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={styles.optionText}>Account Settings</Text>
                            <Icon source="chevron-right" size={rfs(3)} color={theme.colors.outline} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>

                        <Divider style={styles.optionDivider} />


                        <TouchableOpacity onPress={handleLogout} style={styles.optionButton}>
                            <Icon source="logout" size={rfs(3)} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={styles.optionText}>Log out</Text>
                        </TouchableOpacity>

                    </Card.Content>
                </Card>
                {/* <View style={{ height: rh(4) }}></View> */}
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    divider: {
        marginVertical: rh(1),
    },
    accountContainer: {
        flex: 1,
    },
    profileCard: {
        position: 'relative',
        borderRadius: rh(2),
        marginHorizontal: rw(4),
        marginVertical: rh(1)
    },
    profileCardContent: {
        alignItems: 'center',
        padding: rh(3),
    },
    avatarContainer: {
    },
    editIcon: {
        position: 'absolute',
        top: 0,
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
        margin: rw(4),
        marginVertical: rh(1)
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
