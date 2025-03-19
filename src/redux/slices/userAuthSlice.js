import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Send Otp while Signup/login
export const sendOTP = createAsyncThunk(
    'user/sendOTP',
    async (phoneNumber, thunkAPI) => {
        try {
            const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
            console.log("OTP sent")
            // return { verificationId: confirmation.verificationId, phoneNumber };
            return { confirmation: confirmation.verificationId, phoneNumber }
        } catch (error) {
            console.log(error.message)
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
    'user/verifyOTP',
    async ({ confirmation, otp }, { dispatch, rejectWithValue }) => {
        try {
            // Verify OTP
            const credential = auth.PhoneAuthProvider.credential(confirmation, otp);
            const userCredential = await auth().signInWithCredential(credential);
            const { uid, phoneNumber } = userCredential.user;
            console.log("OTP verified:", credential);

            // Reference to user document
            const userRef = firestore().collection("users").doc(uid);
            let userDoc = await userRef.get();
            let userData = {};

            if (!userDoc.exists) {
                // New user - create document
                userData = {
                    uid,
                    phoneNumber,
                    // isOtpVerified: true,
                    isProfileComplete: false,
                    fullName: "",
                    email: "",
                    avatar: "",
                    upiId: "",
                    isEmailVerified: false,
                    groups: [],
                    createdAt: firestore.Timestamp.now(),
                    updatedAt: firestore.Timestamp.now(),
                };

                await userRef.set(userData);
            } else {
                // Existing user - update OTP verification status
                await userRef.update({
                    // isOtpVerified: true,
                    updatedAt: firestore.Timestamp.now(),
                });

                userDoc = await userRef.get();
                userData = userDoc.data();
            }

            userData = {
                ...userData,
                createdAt: userData.createdAt.toDate().toISOString(),
                updatedAt: userData.updatedAt.toDate().toISOString(),
            }
            // Dispatch user data to Redux state
            dispatch(setUser(userData));

            return userData;
        } catch (error) {
            console.error("OTP verification failed:", error);
            return rejectWithValue(error.message);
        }
    }
);


// Fetch user data
export const fetchUserData = createAsyncThunk(
    'user/fetchUserData',
    async (userId, thunkAPI) => {
        try {
            const userDoc = await firestore().collection("users").doc(userId).get();

            if (!userDoc.exists) throw new Error("User data not found");

            return {
                ...userDoc.data(),
                uid: user.uid,
                isEmailVerified: userDoc.data().isEmailVerified,
                fullName: userDoc.data().fullName || '',
                email: userDoc.data().email || '',

            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Add name,email,avatar
export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async ({ uid, fullName, email, avatar, upiId }, thunkAPI) => {
        try {
            console.log("Updating profile:", fullName, email, avatar, upiId);

            const userRef = firestore().collection("users").doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return thunkAPI.rejectWithValue("User document not found in Firestore.");
            }

            const isEmailVerified = userDoc.data()?.email === email;

            // 🔹 Update Firestore User Data
            await userRef.update({
                fullName,
                email,
                avatar,
                upiId,
                updatedAt: firestore.Timestamp.now(),
                isProfileComplete: true,
                isEmailVerified,
            });

            // 🔹 Refresh Firebase Auth User
            await auth().currentUser.reload();

            return {
                uid,
                fullName,
                email,
                avatar,
                upiId,
                isProfileComplete: true,
                isEmailVerified,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

//Resend email
export const resendVerificationEmail = createAsyncThunk(
    'user/resendVerificationEmail',
    async (_, thunkAPI) => {
        try {
            await auth().currentUser.sendEmailVerification();
            return "Verification Email Sent";
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Check email verification
export const checkEmailVerification = createAsyncThunk(
    'user/checkEmailVerification',
    async (_, thunkAPI) => {
        try {
            const user = auth().currentUser;
            if (!user) {
                console.error("No authenticated user found.");
                return thunkAPI.rejectWithValue("User is not authenticated.");
            }

            await user.reload();
            const userRef = firestore().collection("users").doc(user.uid);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                throw new Error("User document does not exist");
            }

            await userRef.update({
                isEmailVerified: user.emailVerified, // Mark as unverified
            });

            return { isEmailVerified: user.emailVerified };
        } catch (error) {
            console.error("Error in checkEmailVerification:", error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    user: null,
    otpSent: false,
    loading: false,
    error: null,
}

const userAuthSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = {
                ...state.user,  // Preserve existing user data
                ...action.payload // Merge new user data
            };
        }
        ,
        clearUser: (state) => {
            state.user = null;
            state.otpSent = false;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            // Send Otp while Signup/login
            .addCase(sendOTP.pending, (state) => {
                state.loading = true;
                state.error = null; // Clear previous errors
            })
            .addCase(sendOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.otpSent = true;
            })
            .addCase(sendOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store error message if failed
            })

            // Verify OTP
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // Store user data
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch user data
            .addCase(fetchUserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add name,email,avatar
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = {
                    ...state.user,  // Keep existing user data
                    ...action.payload // Update only the changed fields
                };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store error message
            })

            // **Resend Verification Email**
            .addCase(resendVerificationEmail.pending, (state) => {
                state.loading = true;
            })
            .addCase(resendVerificationEmail.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(resendVerificationEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // **Check Email Verification**
            .addCase(checkEmailVerification.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkEmailVerification.fulfilled, (state, action) => {
                state.loading = false;
                if (state.user) {
                    state.user.isEmailVerified = action.payload.isEmailVerified;
                }
            })
            .addCase(checkEmailVerification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setUser, clearUser } = userAuthSlice.actions;
export default userAuthSlice.reducer;
