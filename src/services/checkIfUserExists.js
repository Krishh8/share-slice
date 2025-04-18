import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkUserExists } from './userService';

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const cachedCheckUserExists = async (phoneNumber) => {
    const cacheKey = `userCheck:${phoneNumber}`;

    try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            const { exists, uid, timestamp } = JSON.parse(cached);
            const isFresh = Date.now() - timestamp < CACHE_DURATION;

            if (isFresh) {
                // ✅ Return cached value
                return { exists, uid };
            }
        }

        // 🔄 Cache expired or not present — call actual function
        const result = await checkUserExists(phoneNumber);

        await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({
                exists: result?.exists,
                uid: result?.uid,
                timestamp: Date.now(),
            })
        );

        return result;
    } catch (error) {
        console.error('Cache layer failed:', error);
        return checkUserExists(phoneNumber); // Fallback
    }
};

export const clearUserExistenceCache = async (phoneNumber) => {
    const cacheKey = `userCheck:${phoneNumber}`;
    await AsyncStorage.removeItem(cacheKey);
    cachedCheckUserExists(phoneNumber)
};


export const handleRefreshUserStatus = async (phoneNumber) => {
    try {
        await clearUserExistenceCache(phoneNumber);
        console.log(`Cache cleared for ${phoneNumber}`);

        // Now re-check with fresh data from Firestore
        const freshResult = await cachedCheckUserExists(phoneNumber, checkUserExists);
        console.log('Fresh user check result:', freshResult);

        // Do something with freshResult...
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};