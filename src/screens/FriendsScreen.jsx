import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet, View, FlatList, RefreshControl, TouchableWithoutFeedback, Keyboard } from "react-native"
import { Searchbar, List, Avatar, Surface, useTheme } from "react-native-paper"
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import TotalBalanceComponent from "../components/TotalBalanceComponent";
import { useDispatch, useSelector } from "react-redux";
import { listenToBalances, stopListeningToBalances } from "../redux/listeners/balanceListener";
import { clearBalances } from "../redux/slices/balancesSlice";
import avatars from "../data/Avatar";
import FriendComponent from "../components/FriendComponent";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { BounceInRight, BounceOutLeft, FadeInRight, FlipInEasyX, SlideInRight } from "react-native-reanimated";
import Toast from "react-native-toast-message";

const FriendsScreen = () => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useSelector(state => state.userAuth);
    const uid = user?.uid;
    const { balances, loading } = useSelector((state) => state.balance);
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const [groupedBalancesArray, setGroupedBalancesArray] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]); // 🔹 Separate state for search

    useFocusEffect(
        React.useCallback(() => {
            dispatch(listenToBalances({ uid }));

            return () => {
                dispatch(clearBalances()); // ✅ Stop Firestore listener when leaving screen
            };
        }, [dispatch, uid])
    );


    const groupedBalances = balances.reduce((acc, balance) => {
        const otherUserId = balance.creditorId === uid ? balance.debtorId : balance.creditorId;
        const otherUser = balance.creditorId === uid ? balance.debtor : balance.creditor;
        const amount = balance.creditorId === uid ? balance.amountOwed : -balance.amountOwed;

        if (!acc[otherUserId]) {
            acc[otherUserId] = {
                otherUser: otherUser,
                totalAmount: 0,
            };
        }
        acc[otherUserId].totalAmount += amount;

        return acc;
    }, {});

    // 🔹 Convert object to array for FlatList
    useEffect(() => {
        const balancesArray = Object.values(groupedBalances);
        setGroupedBalancesArray(balancesArray);
        setFilteredFriends(balancesArray); // 🔹 Reset filtered list when balances update
    }, [balances]);

    // 🔹 Search Function
    const onChangeSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredFriends(groupedBalancesArray); // Reset if empty
        } else {
            const filtered = groupedBalancesArray.filter(friend =>
                friend.user.fullName.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        dispatch(listenToBalances({ uid })).finally(() => {
            setRefreshing(false);
        });
    }, [dispatch, uid]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
            <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
                {/* <Toast /> */}
                <TotalBalanceComponent />
                <View style={styles.surface}>
                    <Searchbar
                        placeholder="Search Friends"
                        onChangeText={onChangeSearch}
                        value={searchQuery}
                        style={styles.searchbar}
                        iconColor={theme.colors.primary}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={filteredFriends} // 🔹 Use filtered list
                        renderItem={({ item, index }) =>
                            <Animated.View>
                                <FriendComponent friend={item} />
                            </Animated.View>
                        }
                        keyExtractor={(item) => item.user?.uid || Math.random().toString()} // 🔹 Handle missing UIDs
                        style={styles.list}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    surface: {
        flex: 1,
        paddingVertical: rh(2),
        marginTop: rh(2),
        paddingHorizontal: rw(1),
    },
    searchbar: {
        marginHorizontal: rw(2),
        marginBottom: rh(2),
        borderRadius: rh(1),
        elevation: 0,
    },
    list: {
        flex: 1,
    },
})

export default FriendsScreen


