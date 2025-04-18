import React, { useState, useEffect, useMemo } from "react"
import { View, StyleSheet, FlatList, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native"
import { Text, Button, Searchbar, Surface, useTheme, Avatar, Card, IconButton, Icon, ActivityIndicator } from "react-native-paper"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import CreateGroupModal from "../components/CreateGroupModal"
import GroupComponent from "../components/GroupComponent"
import Animated, { FadeInDown } from "react-native-reanimated"

const GroupsScreen = () => {
    const theme = useTheme()
    const [modalVisible, setModalVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const dispatch = useDispatch()

    const { groups, loadingGroups, errorGroups } = useSelector((state) => state.group)
    const { user } = useSelector((state) => state.userAuth)
    const uid = user.uid
    const [displayGroups, setDisplayGroups] = useState([])
    const { balances, loading, error } = useSelector((state) => state.balance);


    // useFocusEffect(
    //     React.useCallback(() => {

    //         // if (!loading) {
    //         dispatch(listenToBalances({ uid }));
    //         // }

    //         // return () => {
    //         //     dispatch(clearBalances()); // ✅ Stop Firestore listener when leaving screen
    //         // };
    //     }, [dispatch, uid])
    // );


    const groupedBalances = balances.reduce((acc, balance) => {
        const { groupId, creditorId, debtorId, amountOwed } = balance;

        if (!acc[groupId]) {
            acc[groupId] = {
                groupId,
                totalAmount: 0,
            };
        }

        // If the user is the creditor, they are owed money (+ve amount)
        // If the user is the debtor, they owe money (-ve amount)
        if (creditorId === user?.uid) {
            acc[groupId].totalAmount += amountOwed;
        } else if (debtorId === user?.uid) {
            acc[groupId].totalAmount -= amountOwed;
        }

        return acc;
    }, {});


    const groupArray = useMemo(() => Object.values(groups), [groups]);

    useEffect(() => {
        setDisplayGroups(groupArray);
    }, [groupArray]);


    const handleSearch = (query) => {
        setSearchQuery(query)
        filterGroups(query, selectedCategory)
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        filterGroups(searchQuery, category)
    }

    const filterGroups = (query, category) => {
        let filtered = Object.values(groups); // ✅ Convert object to array

        if (category !== "All") {
            filtered = filtered.filter((group) => group.category.label === category);
        }

        if (query.trim() !== "") {
            const lowerCaseQuery = query.toLowerCase();
            filtered = filtered.filter((group) => group.groupName.toLowerCase().includes(lowerCaseQuery));
        }

        setDisplayGroups(filtered);
    };


    const categories = ["All", "Home", "Trip", "Friends", "Office", "Sports", "Others"]

    // Map category to icon
    const categoryIcons = {
        All: "view-grid",
        Home: "home",
        Trip: "airplane",
        Friends: "account-group",
        Office: "briefcase",
        Sports: "basketball",
        Others: "dots-horizontal",
    }


    // if (loading) {
    //     return <ActivityIndicator size="large" color={theme.colors.primary} />;
    // }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
            <View style={styles.container}>
                {/* Header Section */}
                <View style={[styles.headerSection, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.title, { color: theme.colors.onSecondaryContainer }]}>Groups</Text>
                        <Button
                            mode="contained"
                            onPress={() => setModalVisible(true)}
                            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                            labelStyle={{ color: theme.colors.onPrimary }}
                            icon="plus"
                        >
                            Create Group
                        </Button>
                    </View>

                    {/* Search Bar */}
                    <Searchbar
                        style={[styles.searchbar,
                            // { backgroundColor: theme.colors.surfaceVariant }
                        ]}
                        placeholder="Search groups"
                        onChangeText={handleSearch}
                        value={searchQuery}
                        iconColor={theme.colors.primary}
                    // placeholderTextColor={theme.colors.onSurfaceVariant}
                    />

                    {/* Category Filter */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                        {categories.map((category) => (
                            <Button
                                key={category}
                                mode={selectedCategory === category ? "contained" : "outlined"}
                                onPress={() => handleCategoryChange(category)}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category && { backgroundColor: theme.colors.primary },
                                ]}
                                labelStyle={[
                                    styles.categoryButtonLabel,
                                    selectedCategory === category && { color: theme.colors.onPrimary },
                                ]}
                                icon={categoryIcons[category]}
                            >
                                {category}
                            </Button>
                        ))}
                    </ScrollView>
                </View>

                {/* Groups List */}
                <View style={[styles.groupListContainer, { backgroundColor: theme.colors.background }]}>

                    <FlatList
                        data={displayGroups}
                        keyExtractor={(item) => item.groupId}
                        renderItem={({ item, index }) => (
                            <Animated.View entering={FadeInDown.delay(index * 50)}>
                                <GroupComponent group={item}
                                    totalAmount={groupedBalances[item.groupId]?.totalAmount || 0}
                                />
                            </Animated.View>
                        )}
                        // contentContainerStyle={styles.flatListContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon source="account-group" size={rfs(10)} color={theme.colors.primary} />
                                <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No Groups found</Text>
                            </View>
                        }
                        contentContainerStyle={displayGroups.length === 0 ? { flex: 1, justifyContent: 'center' } : [{ padding: rw(2) }, styles.flatListContent]}
                    />
                    {/* )} */}
                </View>

                {/* Create Group Modal */}
                <CreateGroupModal visible={modalVisible} onDismiss={() => setModalVisible(false)} />
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingTop: rh(2),
        paddingBottom: rh(1),
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: rw(4),
        marginBottom: rh(2),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: rw(4),
    },
    emptyText: {
        fontSize: rfs(2.5),
        marginTop: rh(2),
        opacity: 0.6,
    },
    title: {
        fontSize: rfs(4),
        fontWeight: "bold",
    },
    createButton: {
        borderRadius: rh(1),
    },
    searchbar: {
        marginHorizontal: rw(4),
        marginBottom: rh(2),
        borderRadius: rh(1),
        elevation: 0,
    },
    categoryContainer: {
        paddingHorizontal: rw(4),
        paddingBottom: rh(1),
    },
    categoryButton: {
        marginRight: rw(2),
        borderRadius: rh(1),
    },
    categoryButtonLabel: {
        fontSize: rfs(1.8),
    },
    groupListContainer: {
        flex: 1,
        paddingTop: rh(2),
    },
    flatListContent: {
        paddingHorizontal: rw(4),
        paddingBottom: rh(2),
    },
    groupCard: {
        marginBottom: rh(1.5),
        borderRadius: rh(1),
        elevation: 2,
    },
    groupCardContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: rh(1),
    },
    groupIconContainer: {
        marginRight: rw(3),
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: rfs(2.2),
        fontWeight: "600",
    },
    groupMembers: {
        fontSize: rfs(1.8),
        opacity: 0.7,
        marginTop: rh(0.5),
    },
})

export default GroupsScreen

