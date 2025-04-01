import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import HeaderComponent from '../components/HeaderComponent'
import { ScrollView } from 'react-native-gesture-handler'
import { Icon, Text, useTheme } from 'react-native-paper';
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';

const faqData = [
    {
        question: 'How does SliceShare work?',
        answer: 'SliceShare allows you to split expenses with friends, track balances, and settle payments easily using UPI or Razorpay.'
    },
    {
        question: 'How do I add a new group?',
        answer: 'Go to the Groups section, tap on "Create Group", enter a name, add members, and start splitting expenses!'
    },
    {
        question: 'How do I add an expense?',
        answer: 'Open a group, tap on "Add Expense", enter the amount, select payers, and save the bill.'
    },
    {
        question: 'How does UPI payment integration work?',
        answer: 'You can settle balances directly through UPI by clicking on the "Settle Now" button and choosing a UPI payment option like Google Pay or PhonePe.'
    },
    {
        question: 'What is Razorpay integration used for?',
        answer: 'Razorpay is used for tracking and processing payments automatically within SliceShare, ensuring secure and seamless transactions.'
    },
    {
        question: 'What happens when I mark a payment as settled?',
        answer: 'When you settle an amount via UPI or manually mark it as paid, SliceShare updates balances and notifies all involved users in real-time.'
    },
    {
        question: 'How does debt simplification work?',
        answer: 'Debt Simplification reduces the number of transactions by optimizing payments, so fewer people need to transfer money to settle debts efficiently.'
    },
    {
        question: 'How do notifications work?',
        answer: 'You receive notifications for new expenses, payments, and balance updates. You can also mark all notifications as read in the Notifications screen.'
    }
];

const FAQScreen = () => {
    const theme = useTheme()
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <HeaderComponent title="FAQ" />
            <ScrollView>
                {faqData.map((item, index) => (
                    <View key={index} >
                        <TouchableOpacity onPress={() => toggleExpand(index)} >
                            <Text >{item.question}</Text>
                            <Icon source={expandedIndex === index ? "unfold-less-horizontal" : "unfold-more-horizontal"} size={20} color="black" />
                        </TouchableOpacity>
                        {expandedIndex === index && (
                            <Text >{item.answer}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

export default FAQScreen

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerText: {
        fontSize: rfs(2),
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: rh(2),
    },
})