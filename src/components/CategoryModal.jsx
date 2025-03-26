import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Modal, Portal, List, useTheme, Text, Divider, Surface, IconButton } from "react-native-paper";
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeInRight } from "react-native-reanimated";


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
                <Surface style={[styles.header]}>
                    <Text variant="titleLarge" style={styles.title}>Select a Category</Text>
                    <IconButton icon="close" onPress={onDismiss} />
                </Surface>

                <Divider />

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                    {categories.map((cat, index) => (
                        <Animated.View key={index} entering={FadeInRight.duration(index * 100)}>
                            <List.Item

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
                        </Animated.View>
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

// --------------------------

// import React, { useEffect } from "react";
// import { ScrollView, StyleSheet, Dimensions } from "react-native";
// import { Modal, Portal, List, useTheme, Text, Divider, Surface, IconButton } from "react-native-paper";
// import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
// import Animated, {
//     useSharedValue,
//     useAnimatedStyle,
//     withTiming,
//     withSpring,
//     withDelay,
//     interpolate,
//     withSequence
// } from "react-native-reanimated";

// const { height: SCREEN_HEIGHT } = Dimensions.get('screen');
// const SPRING_CONFIG = { damping: 15, stiffness: 90 };

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

// const AnimatedListItem = ({ item, index, onPress, isSelected, delay, theme }) => {
//     const opacity = useSharedValue(0);
//     const scale = useSharedValue(0.8);
//     const translateX = useSharedValue(50);

//     useEffect(() => {
//         opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
//         scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
//         translateX.value = withDelay(delay, withTiming(0, { duration: 300 }));
//     }, []);

//     const animatedStyle = useAnimatedStyle(() => ({
//         opacity: opacity.value,
//         transform: [
//             { scale: scale.value },
//             { translateX: translateX.value }
//         ]
//     }));

//     const pulseAnimation = () => {
//         scale.value = withSequence(
//             withTiming(1.05, { duration: 100 }),
//             withTiming(1, { duration: 100 })
//         );
//     };

//     return (
//         <Animated.View style={animatedStyle}>
//             <List.Item
//                 style={[
//                     styles.item,
//                     isSelected && {
//                         backgroundColor: theme.colors.primaryContainer,
//                         borderRadius: rh(1)
//                     }
//                 ]}
//                 title={item.label}
//                 titleStyle={[
//                     styles.itemTitle,
//                     isSelected && {
//                         color: theme.colors.primary,
//                         fontWeight: 'bold'
//                     }
//                 ]}
//                 onPress={() => {
//                     pulseAnimation();
//                     setTimeout(() => onPress(item), 150);
//                 }}
//                 left={props => (
//                     <List.Icon
//                         {...props}
//                         icon={item.icon}
//                         color={isSelected ? theme.colors.primary : theme.colors.onSurface}
//                     />
//                 )}
//                 right={props =>
//                     isSelected ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null
//                 }
//             />
//         </Animated.View>
//     );
// };

// const CategoryModal = ({ visible, onDismiss, onSelectCategory, selectedCategory }) => {
//     const theme = useTheme();
//     const translateY = useSharedValue(SCREEN_HEIGHT);
//     const modalOpacity = useSharedValue(0);
//     const headerScale = useSharedValue(0.9);
//     const dragY = useSharedValue(0);
//     const context = useSharedValue({ y: 0 });

//     useEffect(() => {
//         if (visible) {
//             translateY.value = withSpring(0, SPRING_CONFIG);
//             modalOpacity.value = withTiming(1, { duration: 300 });
//             headerScale.value = withSpring(1, SPRING_CONFIG);
//             dragY.value = 0;
//         } else {
//             translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
//             modalOpacity.value = withTiming(0, { duration: 300 });
//         }
//     }, [visible]);

//     const animatedStyle = useAnimatedStyle(() => ({
//         transform: [
//             { translateY: translateY.value + dragY.value }
//         ],
//         opacity: modalOpacity.value
//     }));

//     const headerAnimatedStyle = useAnimatedStyle(() => ({
//         transform: [
//             { scale: headerScale.value },
//             {
//                 translateY: interpolate(
//                     dragY.value,
//                     [0, 100],
//                     [0, 10],
//                     // Extrapolate.CLAMP
//                 )
//             }
//         ]
//     }));

//     const dragIndicatorStyle = useAnimatedStyle(() => ({
//         transform: [
//             {
//                 scaleX: interpolate(
//                     dragY.value,
//                     [0, 100],
//                     [1, 1.5],
//                     // Extrapolate.CLAMP
//                 )
//             }
//         ],
//         opacity: interpolate(
//             dragY.value,
//             [0, 100],
//             [0.6, 1],
//             // Extrapolate.CLAMP
//         )
//     }));

//     return (
//         <Portal>
//             <Modal
//                 visible={visible}
//                 onDismiss={onDismiss}
//                 theme={{
//                     colors: {
//                         backdrop: "rgba(0, 0, 0, 0.5)",
//                     },
//                 }}
//                 contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
//             >
//                 {/* <PanGestureHandler onGestureEvent={gestureHandler}> */}
//                 <Animated.View style={[styles.modalContainer, animatedStyle, { backgroundColor: theme.colors.surface }]}>
//                     <Animated.View style={[styles.dragIndicator, dragIndicatorStyle]} />

//                     <Animated.View style={[styles.header, headerAnimatedStyle]}>
//                         <Text variant="titleLarge" style={styles.title}>Select a Category</Text>
//                         <IconButton icon="close" onPress={onDismiss} />
//                     </Animated.View>

//                     <Divider />

//                     <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
//                         {categories.map((cat, index) => (
//                             <AnimatedListItem
//                                 key={index}
//                                 item={cat}
//                                 index={index}
//                                 delay={50 + index * 40}
//                                 onPress={(item) => {
//                                     onSelectCategory(item);
//                                     onDismiss();
//                                 }}
//                                 isSelected={selectedCategory?.label === cat.label}
//                                 theme={theme}
//                             />
//                         ))}
//                     </ScrollView>
//                 </Animated.View>
//                 {/* </PanGestureHandler> */}
//             </Modal>
//         </Portal>
//     );
// };

// const styles = StyleSheet.create({
//     modalContainer: {
//         borderTopLeftRadius: rh(2),
//         borderTopRightRadius: rh(2),
//         position: "absolute",
//         bottom: 0,
//         width: "100%",
//         height: "55%",
//         overflow: 'hidden',
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: rw(4),
//         paddingVertical: rh(1),
//     },
//     title: {
//         fontWeight: 'bold',
//     },
//     scrollView: {
//         paddingHorizontal: rw(2),
//     },
//     item: {
//         marginVertical: rh(0.5),
//         paddingHorizontal: rw(2),
//     },
//     itemTitle: {
//         fontSize: rfs(2),
//     },
//     dragIndicator: {
//         width: rw(10),
//         height: rh(0.5),
//         backgroundColor: '#ccc',
//         alignSelf: 'center',
//         marginTop: rh(1),
//         borderRadius: rh(0.25),
//     }
// });

// export default CategoryModal;