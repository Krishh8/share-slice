
import auth from '@react-native-firebase/auth';
import { clearUser } from '../redux/slices/userAuthSlice';
import { showToast } from './toastService';

export const handleLogout = async (dispatch, navigation) => {
    try {
        await auth().signOut(); // Sign out from Firebase
        dispatch(clearUser()); // Clear user from Redux
        navigation.reset({
            index: 0,
            routes: [{ name: 'AuthStack' }], // Navigate to login flow
        });
        showToast(
            'success',
            'Logged out successfully'
        );
    } catch (error) {
        console.error('Logout error:', error);
    }
};
