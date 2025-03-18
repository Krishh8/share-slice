import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Text, Searchbar, useTheme } from 'react-native-paper'
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import FriendContainer from '../../components/FriendContainer';

const AddFriendsScreen = () => {
    const members = [{
        name: 'jay',
    }, {
        name: 'jay',
    }, {
        name: 'jay',
    }, {
        name: 'jay',
    }, {
        name: 'jay',
    }, {
        name: 'jay',
    }, {
        name: 'jay',
    },]
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme()

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FriendContainer members={members} disableAddButton />

            <View style={[styles.friends]}>
                <Searchbar
                    style={[styles.searchBar]}
                    placeholder="Search"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    loading={false}
                />

                <Text variant='titleMedium'>Friends</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: rh(1),
    },
    searchBar: {
        marginTop: rw(5),
        marginBottom: rw(2)
    },
    friends: {
        marginHorizontal: rw(3),
    }
})

export default AddFriendsScreen
