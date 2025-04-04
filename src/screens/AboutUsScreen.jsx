import React from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { responsiveFontSize as rfs, responsiveHeight as rh, responsiveWidth as rw } from 'react-native-responsive-dimensions';
import HeaderComponent from '../components/HeaderComponent';

const AboutUsScreen = () => {
    const theme = useTheme();

    return (
        <>
            <HeaderComponent title="About Us" />
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    {/* <Image source={require('@/assets/logo.png')} style={styles.logo} /> */}
                    <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>Split bills easily & track payments effortlessly!</Text>
                </View>

                {/* Key Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Key Features</Text>
                    <Text style={styles.featureItem}>✅ Total Balance Overview</Text>
                    <Text style={styles.featureItem}>✅ Smart Expense Splitting</Text>
                    <Text style={styles.featureItem}>✅ Razorpay Payments</Text>
                    <Text style={styles.featureItem}>✅ Real-Time Balance Updates</Text>
                    <Text style={styles.featureItem}>✅ Reminders For Payments</Text>
                    <Text style={styles.featureItem}>✅ GroupWise Analytics</Text>
                </View>

                {/* Why Choose ShareSlice */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Why Choose ShareSlice?</Text>
                    <Text style={styles.featureItem}>✔ Fast and seamless online payment integration.</Text>
                    <Text style={styles.featureItem}>✔ No more messy calculations – auto-split expenses with ease.</Text>
                    <Text style={styles.featureItem}>✔ Simple, user-friendly interface for effortless tracking.</Text>
                    <Text style={styles.featureItem}>✔ Reliable and secure with real-time updates.</Text>
                </View>

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>How It Works</Text>
                    <Text style={styles.featureItem}>1️⃣ Create a group and add friends.</Text>
                    <Text style={styles.featureItem}>2️⃣ Add expenses and let ShareSlice split them.</Text>
                    <Text style={styles.featureItem}>3️⃣ Settle payments via UPI or manually.</Text>
                </View>

                {/* Contact & Support */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Contact & Support</Text>
                    <View style={styles.contactItem}>
                        {/* <Mail size={20} color={theme.colors.primary} /> */}
                        <Text style={styles.featureItem}>support@shareslice.com</Text>
                    </View>
                    <View style={styles.contactItem}>
                        {/* <Globe size={20} color={theme.colors.primary} /> */}
                        <Text style={styles.featureItem}>www.shareslice.com</Text>
                    </View>
                    <View style={styles.contactItem}>
                        {/* <Instagram size={20} color={theme.colors.primary} /> */}
                        <Text style={styles.featureItem}>@shareslice_app</Text>
                    </View>
                </View>

                {/* Version & Credits */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Version & Credits</Text>
                    <Text style={styles.featureItem}>App Version: v1.0.0</Text>
                    <Text style={styles.featureItem}>Developed by: Krish & Dhruv</Text>
                    <Text style={styles.featureItem}>Powered by: Firebase, Razorpay, etc.</Text>
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: rw(5),
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: rh(3),
    },
    logo: {
        width: rw(20),
        height: rw(20),
        marginBottom: rh(1.5),
    },
    title: {
        fontSize: rfs(3),
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: rfs(2),
        textAlign: 'center',
        marginTop: rh(1),
    },
    section: {
        marginBottom: rh(3),
    },
    sectionTitle: {
        fontSize: rfs(2.5),
        fontWeight: 'bold',
        marginBottom: rh(1),
    },
    featureItem: {
        fontSize: rfs(2),
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: rh(1),
    },
});

export default AboutUsScreen;