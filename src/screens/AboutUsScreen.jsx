import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import HeaderComponent from '../components/HeaderComponent';

const AboutUsScreen = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState("Features")


    const tabs = ['Features', 'Why Choose Us', 'How It Works']

    const features = [
        {
            icon: 'chart-bar',
            title: "Total Balance Overview",
            description: "Get a clear picture of who owes what at a glance",
        },
        {
            icon: 'calculator',
            title: "Smart Expense Splitting",
            description: "Automatically calculate each person's share",
        },
        {
            icon: 'credit-card-outline',
            title: "Razorpay Payments",
            description: "Settle debts instantly with integrated payments",
        },
        {
            icon: 'clock-outline',
            title: "Real-Time Updates",
            description: "See balance changes as they happen",
        },
        {
            icon: 'bell-outline',
            title: "Payment Reminders",
            description: "Never forget to collect what you're owed",
        },
        {
            icon: 'chart-arc',
            title: "GroupWise Analytics",
            description: "Understand spending patterns within groups",
        },
    ]

    const whyUs = [
        { icon: 'speedometer', text: "Fast and seamless online payment integration." },
        {
            icon: 'calculator',
            text: "No more messy calculations – auto-split expenses with ease.",
        },
        {
            icon: 'emoticon-happy-outline',
            text: "Simple, user-friendly interface for effortless tracking.",
        },
        { icon: 'check-circle-outline', text: "Reliable and secure with real-time updates." },
    ]

    const howWorks = [
        {
            number: "1",
            icon: 'account-multiple-outline',
            title: "Create a group and add friends",
            description: "Start by creating a group for your trip, dinner, or shared expenses",
        },
        {
            number: "2",
            icon: 'calculator',
            title: "Add expenses and let ShareSlice split them",
            description: "Enter what you paid for and who was involved - we'll do the math",
        },
        {
            number: "3",
            icon: 'credit-card-outline',
            title: "Settle payments via UPI or manually",
            description: "Pay or receive money directly through the app or mark as settled manually",
        },
    ]

    return (
        <>
            <HeaderComponent title="About Us" />
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.header, { backgroundColor: theme.colors.inverseOnSurface }]}>
                    <Image source={require('../assets/icon.png')} style={{ width: rh(9), height: rh(9), borderRadius: rh(9) }} />
                    <Text style={[styles.subText1, { color: theme.colors.primary }]}>ShareSlice</Text>
                    <Text style={[styles.subText2, { color: theme.colors.secondary }]}>Split bills easily & track payments effortlessly!</Text>
                </View>

                <View style={[styles.tabs, { backgroundColor: theme.colors.inverseOnSurface }]}>
                    <ScrollView horizontal contentContainerStyle={[styles.tabContainer]}>
                        {tabs.map((tab, index) => (
                            <Chip
                                key={index}
                                onPress={() => setActiveTab(tab)}
                                style={{
                                    backgroundColor:
                                        activeTab === tab ? theme.colors.primary : theme.colors.surfaceVariant,
                                }}
                                textStyle={{
                                    color: activeTab === tab ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                                    fontSize: rfs(1.5),
                                }}
                            >
                                {tab}
                            </Chip>
                        ))}
                    </ScrollView>

                    <View style={[styles.tabContent]}>
                        <Text style={[styles.heading, { color: theme.colors.primary }]}>{activeTab === "Features" ? "Key Features" : (activeTab === "Why Choose Us" ? "Why Choose ShareSlice?" : "How It Works")}</Text>

                        {activeTab === 'Features' &&
                            features.map((feature, index) => (
                                <Card key={index} style={[styles.feature, { borderLeftColor: theme.colors.primary }]}>
                                    <Card.Content>
                                        {/* <View style={{ backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center' }}> */}
                                        <Avatar.Icon icon={feature.icon} size={rfs(4)} style={{ marginBottom: rh(1) }} />
                                        {/* </View> */}
                                        <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>{feature.title}</Text>
                                        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>{feature.description}</Text>
                                    </Card.Content>
                                </Card>

                            ))
                        }

                        {activeTab === 'Why Choose Us' &&
                            whyUs.map((item, index) => (

                                <Card key={index} style={[styles.feature, { borderLeftColor: theme.colors.primary }]}>
                                    <Card.Content style={[styles.why, { flexDirection: 'row', alignItems: 'center', gap: rh(1) }]}>
                                        <Avatar.Icon icon={item.icon} size={rfs(4)} />
                                        <Text variant="bodyLarge" style={{ flexShrink: 1, color: theme.colors.secondary }}>{item.text}</Text>
                                    </Card.Content>
                                </Card>

                            ))
                        }

                        {activeTab === 'How It Works' &&
                            howWorks.map((item, index) => (

                                <Card key={index} style={[styles.feature, { borderLeftColor: theme.colors.primary }]}>
                                    <Card.Content>
                                        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: rh(1) }]}>
                                            <Avatar.Icon icon={item.icon} size={rfs(4)} />
                                            <Text variant="bodyLarge" style={{ flexShrink: 1, color: theme.colors.primary }}>{item.title}</Text>
                                        </View>
                                        <Text variant="bodyMedium" style={{ flexShrink: 1, color: theme.colors.secondary }}>{item.description}</Text>
                                    </Card.Content>
                                </Card>

                            ))
                        }
                    </View>
                </View>

                <View style={[styles.contacts, { backgroundColor: theme.colors.inverseOnSurface }]}>
                    <Text style={[styles.heading, { color: theme.colors.primary }]}>Contact & Support</Text>
                    <View style={{ marginLeft: rh(2) }}>
                        <View style={{ flexDirection: 'row', gap: rh(1), marginBottom: rh(1), alignItems: 'center' }}>
                            <Avatar.Icon icon="email-outline" size={rfs(4)} />
                            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>support@shareslice.com</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: rh(1), marginBottom: rh(1), alignItems: 'center' }}>
                            <Avatar.Icon icon="web" size={rfs(4)} />
                            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>www.shareslice.com</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: rh(1), marginBottom: rh(1), alignItems: 'center' }}>
                            <Avatar.Icon icon="instagram" size={rfs(4)} />
                            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>shareslice_app</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.version, { backgroundColor: theme.colors.inverseOnSurface }]}>
                    <Text style={[styles.heading, { color: theme.colors.primary }]}>Version & Credits</Text>
                    <View style={{ marginBottom: rh(1), marginLeft: rh(2) }}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>App Version : v1.0.0</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>Developed By : Krish & Dhruv</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>Powered by: Firebase, Razorpay, etc.</Text>
                    </View>
                </View>



            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    header: {
        alignItems: 'center',
        padding: rh(2),
    },
    subText1: {
        fontWeight: 'bold',
        fontSize: rfs(3)
    },
    subText2: {
        fontSize: rfs(2)
    },
    tabs: {
        margin: rw(5),
        borderRadius: rh(1),
        padding: rh(1)
    },
    tabContainer: {
        margin: 'auto',
        gap: rh(1),
        justifyContent: 'center',
        paddingTop: rh(1),
    },
    tabContent: {
        paddingHorizontal: rh(1),
    },
    heading: {
        fontWeight: 'bold',
        fontSize: rfs(2.5),
        paddingVertical: rh(1.5),
        marginLeft: rh(1)
    },
    feature: {
        marginBottom: rh(1),
        borderLeftWidth: rw(1),
    },
    contacts: {
        marginHorizontal: rw(5),
        marginVertical: rw(2),
        borderRadius: rh(1),
        padding: rh(1)
    },
    version: {
        marginHorizontal: rw(5),
        marginVertical: rw(5),
        borderRadius: rh(1),
        padding: rh(1)
    }
});

export default AboutUsScreen;