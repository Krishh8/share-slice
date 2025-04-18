import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Text, Card, Title, Paragraph, Divider, useTheme, Surface, Avatar } from "react-native-paper"
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { useSelector } from 'react-redux';
import { BarChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';


const MyChart = () => {
    const route = useRoute();
    const { groupId } = route.params;
    const theme = useTheme()
    const { user } = useSelector((state) => state.userAuth)
    const uid = user.uid
    const { groupDetails } = useSelector((state) => state.group)
    // const groupId = groupDetails?.groupId
    const { groupExpenses } = useSelector((state) => state.expense)

    // Get expenses for the selected group
    const expensesList = [...(groupExpenses[groupId] || [])]

    const totalGroupSpending = useMemo(() => {
        return expensesList.reduce((sum, expense) => {
            const totalExpense = expense.paidBy?.reduce((subSum, payer) => subSum + (payer.amount || 0), 0) || 0
            return sum + totalExpense
        }, 0)
    }, [groupExpenses, groupId])

    // Group expenses by month and calculate total spending
    const monthlySpending = useMemo(() => {
        const spendingMap = {}

        expensesList.forEach((expense) => {
            const expenseDate = new Date(expense.createdAt)
            const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}` // Format: YYYY-MM

            const totalExpense = expense.paidBy?.reduce((sum, payer) => sum + (payer.amount || 0), 0) || 0

            if (totalExpense > 0) {
                spendingMap[monthKey] = (spendingMap[monthKey] || 0) + totalExpense
            }
        })

        return spendingMap
    }, [groupExpenses, groupId])

    // Convert aggregated data into Bar Chart format
    const labels = Object.keys(monthlySpending).sort() // Get sorted month labels (YYYY-MM)
    const dataValues = labels.map((month) => monthlySpending[month]) // Corresponding spending values

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Get month name from month number
    const getMonthName = (monthNum) => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return monthNames[Number.parseInt(monthNum) - 1]
    }

    // Format labels for better display
    const formattedLabels = labels.map((label) => {
        const [year, month] = label.split("-")
        return `${getMonthName(month)}\n${year.slice(2)}`
    })

    return (
        <ScrollView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            {/* Header Card */}
            <Card style={{ margin: rw(4), elevation: 4 }}>
                <Card.Content>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Title style={{ fontSize: rfs(2.2), color: theme.colors.primary, marginBottom: rh(0.5) }}>
                                Monthly Spending
                            </Title>
                            <Paragraph style={{ fontSize: rfs(1.6), color: theme.colors.onSurfaceVariant }}>
                                {groupDetails?.name || "Group"} expenses over time
                            </Paragraph>
                        </View>
                        <Avatar.Icon
                            size={rfs(6)}
                            icon="chart-bar"
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            color={theme.colors.primary}
                        />
                    </View>
                </Card.Content>
            </Card>

            {/* Total Spending Card */}
            <Card style={{ margin: rw(4), marginTop: 0, marginBottom: rh(2), elevation: 4 }}>
                <Card.Content>
                    <Paragraph style={{ fontSize: rfs(1.8), color: theme.colors.onSurfaceVariant }}>
                        Group's Total Spending
                    </Paragraph>
                    <Title style={{ fontSize: rfs(3), color: theme.colors.primary, marginTop: rh(0.5) }}>
                        {formatCurrency(totalGroupSpending)}
                    </Title>
                </Card.Content>
            </Card>

            {/* Chart Card */}
            <Card style={{ margin: rw(4), marginTop: 0, elevation: 4 }}>
                <Card.Content>
                    <Title style={{ fontSize: rfs(1.8), color: theme.colors.primary, marginBottom: rh(1) }}>Month-wise Totals</Title>

                    {labels.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ borderRadius: 8, elevation: 1, padding: rw(2), marginTop: rh(1) }}>
                            <BarChart
                                data={{
                                    labels: formattedLabels,
                                    datasets: [
                                        {
                                            data: dataValues,
                                            // color: (opacity = 1) => theme.colors.red,
                                        },
                                    ],
                                }}
                                width={rw(90)}
                                height={rh(30)}
                                yAxisLabel="₹"
                                chartConfig={{
                                    backgroundColor: theme.colors.surface, // fallback for solid bg
                                    backgroundGradientFrom: theme.colors.surface, // sets top color of gradient
                                    backgroundGradientTo: theme.colors.surface,   // sets bottom color of gradient

                                    decimalPlaces: 0,

                                    color: (opacity = 1) => theme.colors.onSurface, // bar color
                                    labelColor: (opacity = 1) => theme.colors.onSurface, // axis label color

                                    barPercentage: 1,

                                    propsForLabels: {
                                        fontSize: rfs(1.5),
                                    },

                                    propsForBackgroundLines: {
                                        stroke: theme.colors.outlineVariant, // color of grid lines
                                        strokeDasharray: '', // solid line
                                    },

                                    propsForHorizontalLabels: {
                                        fontSize: rfs(1.3),
                                        fontWeight: '500',
                                    },
                                    propsForVerticalLabels: {
                                        fontSize: rfs(1.3),
                                        fontWeight: '500',
                                    },
                                }}
                                verticalLabelRotation={0}
                                showValuesOnTopOfBars
                                fromZero
                                style={{
                                    backgroundColor: theme.colors.primaryContainer,
                                }}
                                showBarTops
                            />
                        </ScrollView>
                    ) : (
                        <View style={{ alignItems: "center", padding: rh(5) }}>
                            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: rfs(1.8) }}>
                                No spending data available
                            </Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Monthly Breakdown */}
            {labels.length > 0 && (
                <Card style={{ margin: rw(4), marginTop: rh(2), elevation: 4 }}>
                    <Card.Content>
                        <Title style={{ fontSize: rfs(1.8), color: theme.colors.primary, marginBottom: rh(1) }}>
                            Monthly Breakdown
                        </Title>

                        {labels.map((label, index) => {
                            const [year, month] = label.split("-")
                            const monthName = new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleString("default", {
                                month: "long",
                            })

                            return (
                                <React.Fragment key={label}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingVertical: rh(1.5),
                                        }}
                                    >
                                        <Text style={{ fontSize: rfs(1.6), color: theme.colors.onSurface }}>
                                            {monthName} {year}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: rfs(1.6),
                                                fontWeight: "bold",
                                                color: theme.colors.primary,
                                            }}
                                        >
                                            {formatCurrency(monthlySpending[label])}
                                        </Text>
                                    </View>
                                    {index < labels.length - 1 && <Divider />}
                                </React.Fragment>
                            )
                        })}
                    </Card.Content>
                </Card>
            )}
        </ScrollView>
    )
}

const SummaryTotalScreen = () => {
    const route = useRoute();
    const { groupId } = route.params;

    const theme = useTheme()
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <MyChart groupId={groupId} />
        </View>
    )
}

export default SummaryTotalScreen

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})