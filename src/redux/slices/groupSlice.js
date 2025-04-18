import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

// Create group
export const createGroup = createAsyncThunk(
    'group/createGroup',
    async ({ groupName, selectedCategory, uid }, thunkAPI) => {
        try {
            if (!groupName || !selectedCategory || !uid) {
                return thunkAPI.rejectWithValue('Missing required fields.');
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
                updatedAt: firestore.Timestamp.now(), // Firestore timestamp
            };

            await groupRef.set(newGroup);

            await firestore()
                .collection('users')
                .doc(uid)
                .update({
                    groups: firestore.FieldValue.arrayUnion(groupRef.id),
                });

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


            let groupObject = snapshot.docs.reduce((acc, doc) => {
                const data = doc.data();
                acc[doc.id] = {
                    ...data,
                    groupId: doc.id,
                    updatedAt: data.updatedAt?.toDate() || null, // ✅ Convert Firestore Timestamp
                };
                return acc;
            }, {});

            // Uncomment if sorting is required
            const sortedGroups = Object.values(groupObject).sort((a, b) => b.updatedAt - a.updatedAt);

            groupObject = sortedGroups.reduce((acc, group) => {
                acc[group.groupId] = group;
                return acc;
            }, {});


            return groupObject;
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
                return thunkAPI.rejectWithValue('Missing required fields.');
            }

            const groupRef = firestore().collection('groups').doc(groupId);

            await groupRef.update({ groupName, category: groupCategory, updatedAt: firestore.Timestamp.now() });

            return { groupId, groupName, category: groupCategory };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    },
);

const removeGroupData = async (groupId) => {
    const batch = firestore().batch();

    const usersCol = firestore().collection("users");
    const expensesCol = firestore().collection("expenses");
    const transactionsCol = firestore().collection("transactions");
    const groupsCol = firestore().collection("groups");

    // 🔹 Step 1: Remove groupId from each user's 'groups' array
    const usersSnapshot = await usersCol.where("groups", "array-contains", groupId).get();
    usersSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
            groups: firestore.FieldValue.arrayRemove(groupId),
        });
    });

    // 🔹 Step 2: Delete all expenses in the group
    const expensesSnapshot = await expensesCol.where("groupId", "==", groupId).get();
    expensesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // 🔹 Step 3: Handle transactions containing the groupId
    const transactionsSnapshot = await transactionsCol.where("groupIds", "array-contains", groupId).get();
    transactionsSnapshot.forEach((doc) => {
        const { groupIds = [] } = doc.data();
        if (groupIds.length === 1) {
            batch.delete(doc.ref);
        } else {
            batch.update(doc.ref, {
                groupIds: firestore.FieldValue.arrayRemove(groupId),
            });
        }
    });

    // 🔹 Step 4: Delete the group document itself
    const groupRef = groupsCol.doc(groupId);
    batch.delete(groupRef);

    // 🔹 Step 5: Commit the batch
    const totalOps = usersSnapshot.size + expensesSnapshot.size + transactionsSnapshot.size + 1; // +1 for group doc
    if (totalOps > 500) {
        console.warn("⚠️ Exceeded Firestore batch limit. Consider chunking operations.");
        throw new Error("Too many operations in one batch. Try deleting a group with fewer associated records.");
    }

    await batch.commit();
    console.log("✅ Group data removed from users, expenses, transactions, and group document.");
};

/*
const commitBatchChunks = async (operations, chunkSize = 450) => {
    // Firestore's max batch size is 500 — stay below for safety
    const chunks = [];
    for (let i = 0; i < operations.length; i += chunkSize) {
        chunks.push(operations.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
        const batch = firestore().batch();
        chunk.forEach(op => {
            const { ref, type, data } = op;
            if (type === 'update') batch.update(ref, data);
            else if (type === 'delete') batch.delete(ref);
        });
        await batch.commit();
    }
};

const removeGroupData = async (groupId) => {
    const usersCol = firestore().collection("users");
    const expensesCol = firestore().collection("expenses");
    const transactionsCol = firestore().collection("transactions");
    const groupsCol = firestore().collection("groups");

    const batchOps = [];

    // 🔹 Step 1: Remove groupId from users
    const usersSnapshot = await usersCol.where("groups", "array-contains", groupId).get();
    usersSnapshot.forEach((doc) => {
        batchOps.push({
            ref: doc.ref,
            type: 'update',
            data: { groups: firestore.FieldValue.arrayRemove(groupId) }
        });
    });

    // 🔹 Step 2: Delete all expenses in the group
    const expensesSnapshot = await expensesCol.where("groupId", "==", groupId).get();
    expensesSnapshot.forEach((doc) => {
        batchOps.push({
            ref: doc.ref,
            type: 'delete'
        });
    });

    // 🔹 Step 3: Transactions - delete or update groupIds
    const transactionsSnapshot = await transactionsCol.where("groupIds", "array-contains", groupId).get();
    transactionsSnapshot.forEach((doc) => {
        const data = doc.data();
        const groupIds = data.groupIds || [];

        if (groupIds.length === 1) {
            batchOps.push({ ref: doc.ref, type: 'delete' });
        } else {
            batchOps.push({
                ref: doc.ref,
                type: 'update',
                data: { groupIds: firestore.FieldValue.arrayRemove(groupId) }
            });
        }
    });

    // 🔹 Step 4: Delete the group document
    const groupRef = groupsCol.doc(groupId);
    batchOps.push({ ref: groupRef, type: 'delete' });

    // 🔹 Step 5: Commit in chunks
    await commitBatchChunks(batchOps);

    console.log("✅ Group and related data removed successfully.");
};
*/

export const deleteGroup = createAsyncThunk(
    'group/deleteGroup',
    async (groupId, thunkAPI) => {
        try {
            if (!groupId) {
                return thunkAPI.rejectWithValue('Missing required fields.');
            }

            const balancesSnapshot = await firestore()
                .collection("balances")
                .where("groupId", "==", groupId)
                .get();

            if (!balancesSnapshot.empty) {
                return thunkAPI.rejectWithValue("This group has unpaid balances. Settle all debts before deleting.");
            }

            await removeGroupData(groupId);

            console.log('✅ Group deleted successfully');
            return groupId;
        } catch (error) {
            console.error('❌ Error deleting group:', error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
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

// Add Member
export const addMember = createAsyncThunk(
    "group/addMember",
    async ({ groupId, uid }, { rejectWithValue }) => {
        try {
            const groupRef = firestore().collection("groups").doc(groupId);
            const userRef = firestore().collection("users").doc(uid);

            // 🔹 Step 1: Check if the group exists
            const groupDoc = await groupRef.get();
            if (!groupDoc.exists) {
                return rejectWithValue("Group does not exist.");
            }

            // 🔹 Step 2: Fetch new member details
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                return rejectWithValue("User does not exist.");
            }

            const newMember = {
                uid: userDoc.id,
                fullName: userDoc.data().fullName,
                phoneNumber: userDoc.data().phoneNumber,
                email: userDoc.data().email,
                avatar: userDoc.data().avatar,
            };

            const batch = firestore().batch();

            // 🔹 Step 3: Add member to the group's `members` array
            batch.update(groupRef, {
                members: firestore.FieldValue.arrayUnion(uid),
            });

            // 🔹 Step 4: Add group to user's `groups` array
            batch.update(userRef, {
                groups: firestore.FieldValue.arrayUnion(groupId),
            });

            // 🔹 Step 5: Commit batch update
            await batch.commit();
            return { groupId, newMember }; // ✅ Returning full member data
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const makeAdmin = createAsyncThunk(
    'group/makeAdmin',
    async ({ groupId, uid }, { rejectWithValue }) => {
        try {
            await firestore()
                .collection('groups')
                .doc(groupId)
                .update({
                    admins: firestore.FieldValue.arrayUnion(uid)
                });

            return { uid, groupId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeAdmin = createAsyncThunk(
    'group/removeAdmin',
    async ({ groupId, uid }, { rejectWithValue }) => {
        try {
            await firestore()
                .collection('groups')
                .doc(groupId)
                .update({
                    admins: firestore.FieldValue.arrayRemove(uid)
                });

            return { uid, groupId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeMember = createAsyncThunk(
    'group/removeMember',
    async ({ groupId, uid }, { rejectWithValue }) => {
        const batch = firestore().batch();

        try {
            const groupRef = firestore().collection("groups").doc(groupId);

            // 🔹 Step 1: Fetch the group document
            const groupDoc = await groupRef.get();
            if (!groupDoc.exists) {
                return rejectWithValue("Group does not exist.");
            }
            // 🔹 Step 1: Check if user has any outstanding balances
            const balancesSnapshot = await firestore()
                .collection("balances")
                .where("groupId", "==", groupId)
                .where("amountOwed", ">", 0)
                .where("debtorId", "==", uid)
                .get();

            const balancesSnapshot2 = await firestore()
                .collection("balances")
                .where("groupId", "==", groupId)
                .where("amountOwed", ">", 0)
                .where("creditorId", "==", uid)
                .get();

            if (!balancesSnapshot.empty || !balancesSnapshot2.empty) {
                return rejectWithValue("Cannot remove member: Member has outstanding balances.");
            }

            const groupData = groupDoc.data();
            const isAdmin = groupData.admins.includes(uid);

            batch.update(groupRef, {
                members: firestore.FieldValue.arrayRemove(uid),
            });

            if (isAdmin) {
                batch.update(groupRef, {
                    admins: firestore.FieldValue.arrayRemove(uid),
                });
            }

            // 🔹 Step 3: Remove group from user's `groups` array
            const userRef = firestore().collection("users").doc(uid);
            batch.update(userRef, {
                groups: firestore.FieldValue.arrayRemove(groupId),
            });

            // 🔹 Step 4: Commit batch update
            await batch.commit();
            console.log("Member removed successfully.");
            return { uid, groupId };
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
);

export const leaveGroup = createAsyncThunk(
    'group/leaveGroup',
    async ({ groupId, uid }, { rejectWithValue }) => {
        const batch = firestore().batch();

        try {
            const groupRef = firestore().collection("groups").doc(groupId);

            // 🔹 Step 1: Fetch the group document
            const groupDoc = await groupRef.get();
            if (!groupDoc.exists) {
                return rejectWithValue("Group does not exist.");
            }
            // 🔹 Step 1: Check if user has any outstanding balances
            const balancesSnapshot = await firestore()
                .collection("balances")
                .where("groupId", "==", groupId)
                .where("amountOwed", ">", 0)
                .where("debtorId", "==", uid)
                .get();

            const balancesSnapshot2 = await firestore()
                .collection("balances")
                .where("groupId", "==", groupId)
                .where("amountOwed", ">", 0)
                .where("creditorId", "==", uid)
                .get();

            if (!balancesSnapshot.empty || !balancesSnapshot2.empty) {
                return rejectWithValue("Cannot leave group: you have outstanding balances.");
            }

            const groupData = groupDoc.data();
            const isAdmin = groupData.admins.includes(uid);

            batch.update(groupRef, {
                members: firestore.FieldValue.arrayRemove(uid),
            });

            if (isAdmin) {
                batch.update(groupRef, {
                    admins: firestore.FieldValue.arrayRemove(uid),
                });
            }

            // 🔹 Step 3: Remove group from user's `groups` array
            const userRef = firestore().collection("users").doc(uid);
            batch.update(userRef, {
                groups: firestore.FieldValue.arrayRemove(groupId),
            });

            // 🔹 Step 4: Commit batch update
            await batch.commit();
            console.log("Member removed successfully.");
            return { uid, groupId };
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
);

const groupSlice = createSlice({
    name: 'group',
    initialState: {
        groups: {}, // List of all groups
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
                state.errorGroups = null;
                state.loadingGroups = true;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.loadingGroups = false;
                const newGroup = action.payload;

                // ✅ Reconstruct the object with the new group first
                state.groups = {
                    [newGroup.groupId]: newGroup, // New group added first
                    ...state.groups // Spread existing groups after it
                };
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
                state.groups[action.payload.groupId] = {
                    ...state.groups[action.payload.groupId],
                    ...action.payload
                };
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
                const groupId = action.payload; // Since payload is just a string
                if (groupId in state.groups) {
                    delete state.groups[groupId];
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

            .addCase(addMember.pending, (state) => {
                state.loadingGroupDetails = true;
                state.errorGroupDetails = null; // Clear any previous error
            })
            .addCase(addMember.fulfilled, (state, action) => {
                state.loadingGroupDetails = false;
                const { groupId, newMember } = action.payload
                if (state.groupDetails.groupId === groupId) {
                    const isAlreadyMember = state.groupDetails.members.some(member => member.uid === newMember.uid);
                    if (!isAlreadyMember) {
                        state.groupDetails.members.push(newMember);
                    }
                }
            })
            .addCase(addMember.rejected, (state, action) => {
                state.loadingGroupDetails = false;
                state.errorGroupDetails = action.payload; // Clear any previous error
            })

            .addCase(makeAdmin.fulfilled, (state, action) => {
                const { groupId, uid } = action.payload
                if (state.groupDetails.groupId === groupId) {
                    state.groupDetails.admins.push(uid);
                }
            })
            .addCase(removeAdmin.fulfilled, (state, action) => {
                const { groupId, uid } = action.payload
                if (state.groupDetails.groupId === groupId) {
                    state.groupDetails.admins = state.groupDetails.admins.filter(id => id !== uid);
                }
            })

            .addCase(leaveGroup.pending, (state) => {
                state.errorGroupDetails = null; // Clear any previous error
            })
            .addCase(leaveGroup.fulfilled, (state, action) => {
                const { groupId, uid } = action.payload;
                if (state.groupDetails.groupId === groupId) {
                    // ✅ Remove the member by filtering `uid` inside objects
                    state.groupDetails.members = state.groupDetails.members.filter(member => member.uid !== uid);
                    // ✅ Remove from admins list if they were an admin
                    state.groupDetails.admins = state.groupDetails.admins.filter(adminUid => adminUid !== uid);
                }

                if (state.groups?.[groupId]) {
                    delete state.groups[groupId];
                }

            })
            .addCase(leaveGroup.rejected, (state, action) => {
                state.errorGroupDetails = action.payload; // Store error message from rejected action
            })

            .addCase(removeMember.pending, (state) => {
                state.loadingGroupDetails = true;
                state.errorGroupDetails = null; // Clear any previous error
            })
            .addCase(removeMember.fulfilled, (state, action) => {
                state.loadingGroupDetails = false;
                const { groupId, uid } = action.payload;
                if (state.groupDetails.groupId === groupId) {
                    // ✅ Remove the member by filtering `uid` inside objects
                    state.groupDetails.members = state.groupDetails.members.filter(member => member.uid !== uid);

                    // ✅ Remove from admins list if they were an admin
                    state.groupDetails.admins = state.groupDetails.admins.filter(adminUid => adminUid !== uid);
                }

            })
            .addCase(removeMember.rejected, (state, action) => {
                state.loadingGroupDetails = false;
                state.errorGroupDetails = action.payload; // Store error message from rejected action
            });



    },
});

export const { setGroups, setGroupDetails } = groupSlice.actions;
export default groupSlice.reducer;
