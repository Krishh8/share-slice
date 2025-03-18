import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FAB, useTheme, Text, Icon, Surface, Card, Avatar, Appbar, Chip } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import TotalBalanceComponent from '../components/TotalBalanceComponent';
import RecentGroupsComponent from '../components/RecentGroupsComponent';
import CreateGroupModal from '../components/CreateGroupModal';
import avatars from '../data/Avatar';
import RecentBillComponent from '../components/RecentBillComponent';

const HomeScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const { user } = useSelector(state => state.userAuth);

    if (!user) {
        return null; // Don't render anything if user is null
    }

    return (
        <View style={styles.screen}>
            {/* Header Section */}
            <Appbar.Header style={{ backgroundColor: theme.colors.primary, elevation: 0 }}>
                <Avatar.Image
                    size={rfs(5)}
                    source={avatars.find(a => a.id === (user?.avatar || 0))?.uri}
                    style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer, }]}
                    onTouchEnd={() => navigation.navigate('Account')}
                />

                <Appbar.Content
                    title={`Hi, ${user?.fullName?.split(' ')[0] || 'User'}`}
                    titleStyle={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}
                />
                <Appbar.Action icon="bell" color={theme.colors.onPrimary} onPress={() => console.log('Pressed')} />
            </Appbar.Header>

            <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
                <TotalBalanceComponent />
            </View>

            {/* Main Content - Takes up Remaining Height */}
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                showsVerticalScrollIndicator={false}
            >
                <Text variant="titleLarge" style={styles.sectionTitle1}>Recent Groups</Text>

                <RecentGroupsComponent />

                <View style={styles.recentBillContainer}>
                    <Text variant="titleLarge" style={styles.sectionTitle2}>Recent Bills</Text>
                    <View style={[styles.comingSoonCard]}>
                        <RecentBillComponent />
                    </View>
                </View>

            </ScrollView >

            <CreateGroupModal visible={modalVisible} onDismiss={() => setModalVisible(false)} />
        </View >
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    avatar: {
        marginHorizontal: rw(2)
    },
    container: {
        flex: 1,
        borderTopLeftRadius: rh(3),
        borderTopRightRadius: rh(3),
        marginTop: rh(-3),
    },
    headerContainer: {
        paddingBottom: rh(5),
    },
    sectionTitle1: {
        marginTop: rh(2),
        fontWeight: 'bold',
        marginHorizontal: rw(4),
    },
    sectionTitle2: {
        fontWeight: 'bold',
        marginBottom: rh(1),
        marginHorizontal: rw(4),
    },
    recentBillContainer: {
        marginTop: rh(2),
    },
    comingSoonCard: {
        marginHorizontal: rw(2),
    },
});

export default HomeScreen