// import React from 'react';
// import { Button, StyleSheet } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';
// import { clearUser } from '../redux/slices/userAuthSlice';

// const LogOutBtn = () => {
//     const navigation = useNavigation();
//     const dispatch = useDispatch();

//     const handleLogout = async () => {
//         try {
//             console.log('Logging out...');
//             await auth().signOut();  // Firebase logout
//             dispatch(clearUser());   // Reset Redux state
//             navigation.replace('AuthStack'); // Redirect to Auth screens
//         } catch (error) {
//             console.error('Logout failed:', error);
//         }
//     };

//     return <Button title="Logout" onPress={handleLogout} />;
// };

// export default LogOutBtn;

// const styles = StyleSheet.create({});

import React from 'react';
import { StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { clearUser } from '../redux/slices/userAuthSlice';
import { Button, useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';

const LogOutBtn = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const theme = useTheme();

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


    return (
        <Button
            mode="contained"
            onPress={handleLogout}
            icon="logout"
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
        >
            Logout
        </Button>
    );
};

const styles = StyleSheet.create({
    button: {
        marginHorizontal: rw(4),
        marginVertical: rh(2),
        borderRadius: rh(1),
    },
    buttonContent: {
        height: rh(6),
    },
    buttonLabel: {
        fontSize: rfs(2),
    },
});

export default LogOutBtn