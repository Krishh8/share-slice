import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

// Create group
export const createGroup = createAsyncThunk(
    'group/createGroup',
    async ({ groupName, selectedCategory, uid }, thunkAPI) => {
        try {
            if (!groupName || !selectedCategory || !uid) {
                throw new Error('Missing required fields.');
            }

            const groupRef = firestore().collection('groups').doc(); // Auto-generate ID
            const newGroup = {
                groupName: groupName,
                category: selectedCategory,// Storing category icon
                members: [uid],
                createdBy: uid, // Firebase Auth user ID
                expenses: [],
                admins: [uid],
                createdAt: firestore.Timestamp.now(), // Firestore timestamp
            };

            await groupRef.set(newGroup);

            await firestore()
                .collection('users')
                .doc(uid)
                .update({
                    groups: firestore.FieldValue.arrayUnion(groupRef.id),
                });

            console.log('Group created in groupSlice');
            return {
                groupId: groupRef.id,
                groupName: newGroup.groupName,
                category: newGroup.category,
                createdBy: newGroup.createdBy,
                members: newGroup.members,
                expenses: newGroup.expenses,
                admins: newGroup.admins
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    },
);

// Fetch Groups
export const fetchGroups = createAsyncThunk(
    'group/fetchGroups',
    async (uid, thunkAPI) => {
        try {
            const userDoc = await firestore().collection('users').doc(uid).get();
            if (!userDoc.exists) {
                console.error('User not found');
                return [];
            }

            const userData = userDoc.data();
            const userGroups = userData.groups || [];

            if (userGroups.length === 0) return [];

            const snapshot = await firestore()
                .collection('groups')
                .where(firestore.FieldPath.documentId(), 'in', userGroups)
                .get();

            let groups = snapshot.docs.map(doc => {
                const data = doc.data();

                return {
                    ...data,
                    groupId: doc.id,
                    createdAt: data.createdAt?.toDate() || null, // ✅ Convert Firestore Timestamp to string
                };
            });

            groups.sort((a, b) => b.createdAt - a.createdAt)
            return groups;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    },
);

// Update Group
export const updateGroup = createAsyncThunk(
    'group/updateGroup',
    async ({ groupId, groupName, groupCategory }, thunkAPI) => {
        try {
            if (!groupName || !groupId || !groupCategory) {
                throw new Error('Missing required fields.');
            }

            const groupRef = firestore().collection('groups').doc(groupId);

            await groupRef.update({ groupName, category: groupCategory });

            console.log('Group updated successfully');
            return { groupId, groupName, category: groupCategory };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    },
);

const removeGroupData = async (groupId) => {
    const batch = firestore().batch();

    // 🔹 Step 1: Get all users in the group
    const usersRef = firestore().collection("users").where("groups", "array-contains", groupId);
    const usersSnapshot = await usersRef.get();

    usersSnapshot.forEach((doc) => {
        const userRef = firestore().collection("users").doc(doc.id);
        batch.update(userRef, {
            groups: firestore.FieldValue.arrayRemove(groupId) // 🔹 Remove group from array
        });
    });

    // 🔹 Step 2: Delete all expenses in the group
    const expensesRef = firestore().collection("expenses").where("groupId", "==", groupId);
    const expensesSnapshot = await expensesRef.get();

    expensesSnapshot.forEach((doc) => {
        batch.delete(doc.ref); // 🔹 Delete each expense
    });

    // 🔹 Step 3: Delete the group document
    const groupRef = firestore().collection("groups").doc(groupId);
    batch.delete(groupRef);

    // 🔹 Step 4: Commit batch deletion
    await batch.commit();
};

// delete Group
export const deleteGroup = createAsyncThunk(
    'group/deleteGroup',
    async (groupId, thunkAPI) => {
        try {
            if (!groupId) {
                throw new Error('Missing required fields.');
            }

            const balancesRef = firestore().collection("balances").where("groupId", "==", groupId);
            const balancesSnapshot = await balancesRef.get();

            if (!balancesSnapshot.empty) {
                return thunkAPI.rejectWithValue("This group has unpaid balances. Settle all debts before deleting.");
            }

            await removeGroupData(groupId);

            console.log('Group  deleted successfully');
            return groupId;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    },
);

// Fetch Group Details
export const fetchGroupDetails = createAsyncThunk(
    'group/fetchGroupDetails',
    async (groupId, thunkAPI) => {
        try {
            const documentSnapshot = await firestore()
                .collection('groups')
                .doc(groupId)
                .get();

            if (!documentSnapshot.exists) {
                return thunkAPI.rejectWithValue('Group not found');
            }

            const data = documentSnapshot.data();

            const members = await Promise.all(
                data.members.map(async uid => {
                    const userDoc = await firestore().collection('users').doc(uid).get();

                    return userDoc.exists
                        ? {
                            phoneNumber: userDoc.data().phoneNumber,
                            avatar: userDoc.data().avatar,
                            email: userDoc.data().email,
                            fullName: userDoc.data().fullName,
                            phoneNumber: userDoc.data().phoneNumber,
                            uid: userDoc.data().uid,
                        }
                        : null;
                }),
            );

            return {
                ...data,
                groupId: documentSnapshot.id,
                members: members.filter(Boolean),
                createdAt: data.createdAt
                    ? data.createdAt.toDate().toISOString()
                    : null, // ✅ Convert Firestore Timestamp
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    },
);

export const makeAdmin = createAsyncThunk(
    'group/makeAdmin',
    async ({ groupId, userId }, { rejectWithValue }) => {
        try {
            await firestore()
                .collection('groups')
                .doc(groupId)
                .update({
                    admins: firestore.FieldValue.arrayUnion(userId)
                });

            return { userId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeAdmin = createAsyncThunk(
    'group/removeAdmin',
    async ({ groupId, userId }, { rejectWithValue }) => {
        try {
            await firestore()
                .collection('groups')
                .doc(groupId)
                .update({
                    admins: firestore.FieldValue.arrayRemove(userId)
                });

            return { userId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeMember = createAsyncThunk(
    'group/removeMember',
    async ({ groupId, userId }, { rejectWithValue }) => {
        const batch = firestore().batch();

        try {
            // 🔹 Step 1: Check if user has any outstanding balances
            const balancesSnapshot = await firestore()
                .collection("balances")
                .where("groupId", "==", groupId)
                .where("amountOwed", ">", 0)
                .where("debtorId", "==", userId)
                .get();

            const balancesSnapshot2 = await firestore()
                .collection("balances")
                .where("groupId", "==", groupId)
                .where("amountOwed", ">", 0)
                .where("creditorId", "==", userId)
                .get();

            if (!balancesSnapshot.empty || !balancesSnapshot2.empty) {
                throw new Error("Cannot remove member: They have outstanding balances.");
            }

            // 🔹 Step 2: Remove member from the group's `members` array
            const groupRef = firestore().collection("groups").doc(groupId);
            batch.update(groupRef, {
                members: firestore.FieldValue.arrayRemove(userId),
            });

            // 🔹 Step 3: Remove group from user's `groups` array
            const userRef = firestore().collection("users").doc(userId);
            batch.update(userRef, {
                groups: firestore.FieldValue.arrayRemove(groupId),
            });

            // 🔹 Step 4: Commit batch update
            await batch.commit();
            console.log("Member removed successfully.");
        } catch (error) {
            console.error("Error removing member:", error.message);
        }
    }
);


const groupSlice = createSlice({
    name: 'group',
    initialState: {
        groups: [], // List of all groups
        loadingGroups: false, // Loading for fetching all groups
        errorGroups: null, // Error for fetching all groups
        groupDetails: null, // Selected group details
        loadingGroupDetails: false, // Loading for fetching a single group's details
        errorGroupDetails: null,
    },
    reducers: {
        setGroupDetails: (state, action) => {
            state.groupDetails = { ...state.groupDetails, ...action.payload }
        },
        setGroups: (state, action) => {
            state.groups = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(createGroup.pending, state => {
                state.loadingGroups = true;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.loadingGroups = false;
                state.groups = [action.payload, ...state.groups];
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.loadingGroups = false;
                state.errorGroups = action.payload;
            })

            .addCase(fetchGroups.pending, state => {
                state.loadingGroups = true;
                state.errorGroups = null;
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.loadingGroups = false;
                state.groups = action.payload;
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.loadingGroups = false;
                state.errorGroups = action.payload;
            })

            .addCase(updateGroup.pending, state => {
                state.loadingGroups = true;
            })
            .addCase(updateGroup.fulfilled, (state, action) => {
                state.loadingGroups = false;
                const { groupId, groupName, category } = action.payload;
                if (state.groups) {
                    const groupIndex = state.groups.findIndex(
                        group => group.groupId === groupId,
                    );
                    if (groupIndex !== -1) {
                        state.groups[groupIndex].groupName = groupName;
                        state.groups[groupIndex].category = category;
                    }
                }
                state.groupDetails = {
                    ...state.groupDetails,
                    groupName,
                    category
                };
            })
            .addCase(updateGroup.rejected, (state, action) => {
                state.loadingGroups = false;
                state.errorGroups = action.payload;
            })

            .addCase(deleteGroup.pending, state => {
                state.loadingGroups = true;
            })
            .addCase(deleteGroup.fulfilled, (state, action) => {
                state.loadingGroups = false;

                console.log("Delete action payload:", action.payload); // Debugging

                const groupId = action.payload; // Since payload is just a string

                if (state.groups && Array.isArray(state.groups)) {
                    state.groups = state.groups.filter(group => group.groupId !== groupId);
                }
            })

            .addCase(deleteGroup.rejected, (state, action) => {
                state.loadingGroups = false;
                state.errorGroups = action.payload;
            })

            .addCase(fetchGroupDetails.pending, state => {
                state.loadingGroupDetails = true;
                state.errorGroupDetails = null;
            })
            .addCase(fetchGroupDetails.fulfilled, (state, action) => {
                state.loadingGroupDetails = false;
                state.groupDetails = action.payload;
            })
            .addCase(fetchGroupDetails.rejected, (state, action) => {
                state.loadingGroupDetails = false;
                state.errorGroupDetails = action.payload;
            })

            .addCase(makeAdmin.fulfilled, (state, action) => {
                if (state.groupDetails) {
                    state.groupDetails.admins.push(action.payload.userId);
                }
            })
            .addCase(removeAdmin.fulfilled, (state, action) => {
                if (state.groupDetails) {
                    state.groupDetails.admins = state.groupDetails.admins.filter(id => id !== action.payload.userId);
                }
            })
            .addCase(removeMember.fulfilled, (state, action) => {
                if (state.groupDetails) {
                    state.groupDetails.members = state.groupDetails.members.filter(id => id !== action.payload.userId);
                    state.groupDetails.admins = state.groupDetails.admins.filter(id => id !== action.payload.userId);
                }
            });

    },
});

export const { setGroups, setGroupDetails } = groupSlice.actions;
export default groupSlice.reducer;
