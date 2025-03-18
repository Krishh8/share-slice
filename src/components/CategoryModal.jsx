// import React from "react";
// import { ScrollView, StyleSheet } from "react-native";
// import { Modal, Portal, List, useTheme } from "react-native-paper";
// import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';

// const categories = [
//     { label: "Food", icon: "food" },
//     { label: "Stays", icon: "bed" },
//     { label: "Shopping", icon: "shopping" },
//     { label: "Transport", icon: "bus" },
//     { label: "Bills", icon: "receipt" },
//     { label: "Subscription", icon: "credit-card-multiple" },
//     { label: "Gifts", icon: "gift" },
//     { label: "Drinks", icon: "glass-wine" },
//     { label: "Fuel", icon: "gas-station" },
//     { label: "Health", icon: "heart-pulse" },
//     { label: "Entertainment", icon: "movie" },
//     { label: "Others", icon: "dots-horizontal" }
// ];


// const CategoryModal = ({ visible, onDismiss, onSelectCategory, selectedCategory }) => {
//     const theme = useTheme();
//     console.log(selectedCategory)

//     return (

//         <Portal>
//             <Modal
//                 visible={visible}
//                 onDismiss={onDismiss}
//                 contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.primaryContainer }]}
//             >
//                 <List.Section>
//                     <List.Subheader style={styles.label}>Select a Category</List.Subheader>
//                     <ScrollView>
//                         {categories.map((cat, index) => (
//                             <List.Item
//                                 key={index}
//                                 style={[styles.item,
//                                 selectedCategory?.label === cat.label ? { borderWidth: rh(0.1) } : {}
//                                 ]}
//                                 title={cat.label}
//                                 onPress={() => {
//                                     onSelectCategory(cat); // Pass selected category back
//                                     onDismiss(); // Close modal
//                                 }}
//                                 left={() => <List.Icon icon={cat.icon} />}
//                             />
//                         ))}
//                     </ScrollView>

//                 </List.Section>
//             </Modal>
//         </Portal>
//     );
// };

// const styles = StyleSheet.create({
//     modalContainer: {
//         padding: rh(2),
//         borderTopLeftRadius: rh(3),
//         borderTopRightRadius: rh(3),
//         position: "absolute",
//         bottom: 0,
//         width: "100%",
//         height: "55%",
//     },
//     item: {
//         paddingHorizontal: rh(1),
//         borderRadius: rh(1)
//     },
//     label: {
//         fontSize: rfs(2),
//         fontWeight: 'bold'
//     }
// });

// export default CategoryModal;

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Modal, Portal, List, useTheme, Text, Divider, Surface, IconButton } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';

const categories = [
    { label: "Food", icon: "food" },
    { label: "Stays", icon: "bed" },
    { label: "Shopping", icon: "shopping" },
    { label: "Transport", icon: "bus" },
    { label: "Bills", icon: "receipt" },
    { label: "Subscription", icon: "credit-card-multiple" },
    { label: "Gifts", icon: "gift" },
    { label: "Drinks", icon: "glass-wine" },
    { label: "Fuel", icon: "gas-station" },
    { label: "Health", icon: "heart-pulse" },
    { label: "Entertainment", icon: "movie" },
    { label: "Others", icon: "dots-horizontal" }
];

const CategoryModal = ({ visible, onDismiss, onSelectCategory, selectedCategory }) => {
    const theme = useTheme();

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                theme={{
                    colors: {
                        backdrop: "rgba(0, 0, 0, 0.5)", // Adjust opacity here (0.3 for lighter effect)
                    },
                }}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
            >
                <Surface style={[styles.header,{backgroundColor:theme.colors.surface}]}>
                    <Text variant="titleLarge" style={styles.title}>Select a Category</Text>
                    <IconButton icon="close" onPress={onDismiss} />
                </Surface>

                <Divider />

                <ScrollView style={styles.scrollView}>
                    {categories.map((cat, index) => (
                        <List.Item
                            key={index}
                            style={[
                                styles.item,
                                selectedCategory?.label === cat.label && {
                                    backgroundColor: theme.colors.primaryContainer,
                                    borderRadius: rh(1)
                                }
                            ]}
                            title={cat.label}
                            titleStyle={[
                                styles.itemTitle,
                                selectedCategory?.label === cat.label && {
                                    color: theme.colors.primary,
                                    fontWeight: 'bold'
                                }
                            ]}
                            onPress={() => {
                                onSelectCategory(cat);
                                onDismiss();
                            }}
                            left={props => (
                                <List.Icon
                                    {...props}
                                    icon={cat.icon}
                                    color={selectedCategory?.label === cat.label ?
                                        theme.colors.primary : theme.colors.onSurface}
                                />
                            )}
                            right={props =>
                                selectedCategory?.label === cat.label ?
                                    <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null
                            }
                        />
                    ))}
                </ScrollView>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        borderTopLeftRadius: rh(2),
        borderTopRightRadius: rh(2),
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "55%",
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: rw(4),
        paddingVertical: rh(1),
    },
    title: {
        fontWeight: 'bold',
    },
    scrollView: {
        paddingHorizontal: rw(2),
    },
    item: {
        marginVertical: rh(0.5),
        paddingHorizontal: rw(2),
    },
    itemTitle: {
        fontSize: rfs(2),
    }
});

export default CategoryModal