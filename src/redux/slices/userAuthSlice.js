// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import { useDispatch } from 'react-redux';

// // Send Otp while Signup/login
// export const sendOTP = createAsyncThunk(
//     'user/sendOTP',
//     async (phoneNumber, thunkAPI) => {
//         try {
//             const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
//             console.log("OTP sent")
//             return { verificationId: confirmation.verificationId, phoneNumber };
//         } catch (error) {
//             console.log(error.message)
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// // Verify OTP
// export const verifyOTP = createAsyncThunk(
//     'user/verifyOTP',
//     async ({ verificationId, otp }, { dispatch, rejectWithValue }) => {
//         try {
//             const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
//             const userCredential = await auth().signInWithCredential(credential);
//             const { uid, phoneNumber } = userCredential.user;
//             // Fetch user data
//             const userRef = firestore().collection("users").doc(uid);
//             let userDoc = await userRef.get();
//             console.log('userData', userDoc.data())

//             if (!userDoc.exists) {
//                 // New user - create document
//                 await userRef.set({
//                     uid,
//                     phoneNumber,
//                     isOtpVerified: true,
//                     isProfileComplete: false,
//                     fullName: "",
//                     email: "",
//                     avatar: "",
//                     isEmailVerified: false,
//                     groups: [],
//                     createdAt: firestore.Timestamp.now(),
//                 });
//             }
//             else {
//                 await userRef.update({
//                     isOtpVerified: true,
//                     createdAt: firestore.Timestamp.now(),
//                 });
//             }

//             userDoc = await userRef.get();
//             const userData = userDoc.data();

//             dispatch(setUser({
//                 uid: userData.uid,
//                 phoneNumber: userData.phoneNumber,
//                 isOtpVerified: true,
//                 fullName: userData.fullName || '',
//                 email: userData.email || '',
//                 avatar: userData.avatar || '',
//                 isProfileComplete: userData.isProfileComplete || false,
//                 isEmailVerified: userData.isEmailVerified || false,

//             }));

//             return {
//                 uid: userData.uid,
//                 phoneNumber: userData.phoneNumber,
//                 isOtpVerified: true,
//                 fullName: userData.fullName || '',
//                 email: userData.email || '',
//                 avatar: userData.avatar || '',
//                 isProfileComplete: userData.isProfileComplete || false,
//                 isEmailVerified: userData.isEmailVerified || false,
//             };

//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// // Fetch user data
// export const fetchUserData = createAsyncThunk(
//     'user/fetchUserData',
//     async (userId, thunkAPI) => {
//         try {
//             const userDoc = await firestore().collection("users").doc(userId).get();

//             if (!userDoc.exists) throw new Error("User data not found");

//             return {
//                 ...userDoc.data(),
//                 uid: user.uid,
//                 isEmailVerified: userDoc.data().isEmailVerified,
//                 fullName: userDoc.data().fullName || '',
//                 email: userDoc.data().email || '',
//             };
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// // Add name,email,avatar
// export const updateProfile = createAsyncThunk(
//     'user/updateProfile',
//     async ({ uid, fullName, email, avatar }, thunkAPI) => {
//         try {
//             console.log(fullName, email, avatar)


//             const userRef = firestore().collection("users").doc(uid);
//             const userDoc = await userRef.get();

//             if (!userDoc.exists) {
//                 return thunkAPI.rejectWithValue("User document not found in Firestore.");
//             }

//             const isEmailVerified = userDoc.data()?.email === email;
//             // **Update Firestore**
//             await userRef.update({
//                 fullName,
//                 email,
//                 avatar,
//                 updatedAt: firestore.Timestamp.now(),
//                 isProfileComplete: true,
//                 isEmailVerified: isEmailVerified, // Mark as unverified
//             });

//             await auth().currentUser.reload();// Refresh Firebase user state

//             return {
//                 fullName,
//                 email,
//                 avatar,
//                 isProfileComplete: true,
//                 isEmailVerified: isEmailVerified,
//             };
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// // export const checkSession = createAsyncThunk(
// //     'user/checkSession',
// //     async (_, thunkAPI) => {
// //         try {
// //             console.log('Checking user session...');

// //             return new Promise((resolve, reject) => {
// //                 const unsubscribe = auth().onAuthStateChanged(async (user) => {
// //                     try {
// //                         if (!user) {
// //                             console.log('No user session found');
// //                             resolve(null);
// //                         } else {
// //                             console.log(`User found: ${user.uid}`);

// //                             const userRef = firestore().collection('users').doc(user.uid);
// //                             const userDoc = await userRef.get();

// //                             if (!userDoc.exists) {
// //                                 console.log('User data not found in Firestore');
// //                                 resolve(null);
// //                             } else {
// //                                 resolve({
// //                                     uid: user.uid,
// //                                     phoneNumber: user.phoneNumber || '',
// //                                     fullName: userDoc.data().fullName || '',
// //                                     email: userDoc.data().email || '',
// //                                     avatar: userDoc.data().avatar || '',
// //                                     isEmailVerified: userDoc.data().isEmailVerified || false,
// //                                     isProfileComplete: userDoc.data().isProfileComplete || false,
// //                                 });
// //                             }
// //                         }
// //                     } catch (error) {
// //                         console.error('Error fetching user data:', error);
// //                         reject(thunkAPI.rejectWithValue(error.message));
// //                     } finally {
// //                         unsubscribe(); // Cleanup auth listener
// //                     }
// //                 });
// //             });
// //         } catch (error) {
// //             console.error('Session check failed:', error);
// //             return thunkAPI.rejectWithValue(error.message);
// //         }
// //     }
// // );

// // Check session

// // export const checkSession = createAsyncThunk(
// //     'user/checkSession',
// //     async (_, thunkAPI) => {
// //         try {
// //             console.log('Checking user session...');
// //             const user = auth().currentUser; // Get current user instead of using onAuthStateChanged
// //             if (!user) {
// //                 console.log('No user session found');
// //                 return;
// //                 // return thunkAPI.rejectWithValue("No user session found");
// //             }

// //             console.log(`User found: ${user.uid}`);

// //             const userRef = firestore().collection('users').doc(user.uid);
// //             const userDoc = await userRef.get();

// //             if (!userDoc.exists) {
// //                 console.log('User data not found in Firestore');
// //                 return thunkAPI.rejectWithValue("User data not found");
// //             }

// //             // Extract user data from Firestore
// //             const userData = userDoc.data();
// //             return {
// //                 uid: user.uid,
// //                 phoneNumber: user.phoneNumber || '',
// //                 fullName: userData.fullName || '',
// //                 email: userData.email || '',
// //                 avatar: userData.avatar || '',
// //                 isEmailVerified: userData.isEmailVerified || false,
// //                 isProfileComplete: userData.isProfileComplete || false,
// //             };
// //         } catch (error) {
// //             console.error('Session check failed:', error);
// //             return thunkAPI.rejectWithValue(error.message);
// //         }
// //     }
// // );

// //Resend email

// export const resendVerificationEmail = createAsyncThunk(
//     'user/resendVerificationEmail',
//     async (_, thunkAPI) => {
//         try {
//             await auth().currentUser.sendEmailVerification();
//             return "Verification Email Sent";
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// // Check email verification
// export const checkEmailVerification = createAsyncThunk(
//     'user/checkEmailVerification',
//     async (_, thunkAPI) => {
//         try {
//             const user = auth().currentUser;
//             if (!user) {
//                 console.error("No authenticated user found.");
//                 return thunkAPI.rejectWithValue("User is not authenticated.");
//             }

//             await user.reload();
//             const userRef = firestore().collection("users").doc(user.uid);
//             const userDoc = await userRef.get();
//             if (!userDoc.exists) {
//                 throw new Error("User document does not exist");
//             }

//             await userRef.update({
//                 isEmailVerified: user.emailVerified, // Mark as unverified
//             });

//             return { isEmailVerified: user.emailVerified };
//         } catch (error) {
//             console.error("Error in checkEmailVerification:", error);
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// const initialState = {
//     uid: null,
//     phoneNumber: '',
//     verificationId: '',
//     fullName: '',
//     email: '',
//     avatar: '',
//     otpSent: false,
//     isOtpVerified: false,
//     isProfileComplete: false,
//     isEmailVerified: false,
//     loading: false,
//     error: null,
// }

// const userAuthSlice = createSlice({
//     name: 'userAuth',
//     initialState,
//     reducers: {
//         setUser: (state, action) => {
//             return { ...state, ...action.payload };
//         },
//         clearUser: (state) => {
//             return {
//                 ...initialState,
//             };
//         },
//     },
//     extraReducers: builder => {
//         builder
//             // Send Otp while Signup/login
//             .addCase(sendOTP.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(sendOTP.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.otpSent = true;
//                 state.phoneNumber = action.payload.phoneNumber;
//                 state.verificationId = action.payload.verificationId;
//             })
//             .addCase(sendOTP.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // Verify OTP
//             .addCase(verifyOTP.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(verifyOTP.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.uid = action.payload.uid;
//                 state.phoneNumber = action.payload.phoneNumber;
//                 state.fullName = action.payload.fullName;
//                 state.email = action.payload.email;
//                 state.avatar = action.payload.avatar;
//                 state.isOtpVerified = action.payload.isOtpVerified;
//                 state.isProfileComplete = action.payload.isProfileComplete;
//                 state.isEmailVerified = action.payload.isEmailVerified;
//                 console.log(action.payload)
//             })
//             .addCase(verifyOTP.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // Fetch user data
//             .addCase(fetchUserData.pending, (state) => {
//                 state.loading = true; // Start loading when the request is pending
//                 state.error = null; // Clear any previous error
//             })
//             .addCase(fetchUserData.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.uid = action.payload.uid;
//                 state.isProfileComplete = action.payload.isProfileComplete;
//                 state.isEmailVerified = action.payload.isEmailVerified;
//                 state.error = null;
//             })
//             .addCase(fetchUserData.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // Add name,email,avatar
//             .addCase(updateProfile.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(updateProfile.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.fullName = action.payload.fullName;
//                 state.email = action.payload.email;
//                 state.avatar = action.payload.avatar;
//                 state.isProfileComplete = true;
//                 state.isEmailVerified = action.payload.isEmailVerified;
//             })
//             .addCase(updateProfile.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // Check sessions
//             // .addCase(checkSession.pending, (state) => {
//             //     state.loading = true;
//             //     state.error = null;
//             // })
//             // .addCase(checkSession.fulfilled, (state, action) => {
//             //     console.log('action , payload', state.user, action.payload)
//             //     return {
//             //         ...state,
//             //         ...action.payload,
//             //         loading: false,
//             //         error: null,
//             //     };
//             // })
//             // .addCase(checkSession.rejected, (state, action) => {
//             //     state.loading = false;
//             //     state.uid = null;
//             //     state.error = action.payload;
//             // })

//             // Resend email
//             .addCase(resendVerificationEmail.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(resendVerificationEmail.fulfilled, (state) => {
//                 state.loading = false;
//             })
//             .addCase(resendVerificationEmail.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//             // Check email verification
//             .addCase(checkEmailVerification.pending, (state) => {
//                 state.loading = true;
//                 // state.isEmailVerified = action.payload.isEmailVerified;
//             })
//             .addCase(checkEmailVerification.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.isEmailVerified = action.payload.isEmailVerified;
//                 if (action.payload.isEmailVerified) {
//                     state.isAuthenticated = true;
//                 }
//             })
//             .addCase(checkEmailVerification.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     },
// });

// export const { setUser, clearUser, logout } = userAuthSlice.actions;
// export default userAuthSlice.reducer;


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
