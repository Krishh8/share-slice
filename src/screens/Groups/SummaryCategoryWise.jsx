import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import {
    Text,
    Card,
    Title,
    Paragraph,
    Chip,
    Divider,
    List,
    Surface,
    useTheme,
    Button,
    Portal,
    Modal,
    RadioButton,
    Avatar,
} from "react-native-paper"
import {
    responsiveFontSize as rfs,
    responsiveHeight as rh,
    responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import { PieChart } from "react-native-chart-kit";
import { useSelector } from "react-redux";
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';

const MyChart = () => {
    const route = useRoute();
    const { groupId } = route.params;
    const theme = useTheme()
    const { user } = useSelector((state) => state.userAuth)
    const uid = user.uid

    const { groupExpenses } = useSelector((state) => state.expense)
    let expensesList = [...(groupExpenses[groupId] || [])]

    // Filter expenses where the logged-in user is involved
    expensesList = expensesList.filter((expense) => expense.splitDetails.some((item) => item.uid === uid))

    const [filterType, setFilterType] = useState("allTime")
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [monthPickerVisible, setMonthPickerVisible] = useState(false)
    const [yearPickerVisible, setYearPickerVisible] = useState(false)

    // Function to filter expenses based on time range
    const filterExpensesByTime = (expenses, filterType, selectedMonth, selectedYear) => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        return expenses.filter((expense) => {
            const expenseDate = new Date(expense.createdAt)
            const expenseMonth = expenseDate.getMonth()
            const expenseYear = expenseDate.getFullYear()

            switch (filterType) {
                case "allTime":
                    return true
                case "thisMonth":
                    return expenseMonth === currentMonth && expenseYear === currentYear
                case "previousMonth":
                    return (
                        expenseMonth === (currentMonth - 1 + 12) % 12 &&
                        (currentMonth === 0 ? expenseYear === currentYear - 1 : expenseYear === currentYear)
                    )
                case "thisYear":
                    return expenseYear === currentYear
                case "specificMonth":
                    return (
                        selectedMonth !== null &&
                        selectedYear !== null &&
                        expenseMonth === selectedMonth &&
                        expenseYear === selectedYear
                    )
                default:
                    return true
            }
        })
    }

    // Apply time filtering
    const filteredExpenses = useMemo(
        () => filterExpensesByTime(expensesList, filterType, selectedMonth, selectedYear),
        [filterType, selectedMonth, selectedYear],
    )

    // To display in UI
    const groupedExpenses = (expenses) => {
        return expenses.reduce((acc, expense) => {
            if (!acc[expense.category.label]) {
                acc[expense.category.label] = [];
            }
            acc[expense.category.label].push(expense);
            return acc;
        }, {});
    };

    const expensesByCategory = groupedExpenses(filteredExpenses);
    const categories = Object.keys(expensesByCategory);

    // Aggregate spending per category
    const categorySpending = useMemo(() => {
        return filteredExpenses.reduce((acc, expense) => {
            const categoryLabel = expense.category.label
            const totalShare = expense.splitDetails
                .filter((item) => item.uid === uid)
                .reduce((sum, item) => sum + item.share, 0)

            if (totalShare > 0) {
                acc[categoryLabel] = (acc[categoryLabel] || 0) + totalShare
            }
            return acc
        }, {})
    }, [filteredExpenses, uid])

    // Convert aggregated data into Pie Chart format
    const pieChartData = Object.entries(categorySpending).map(([label, value], index) => ({
        name: label,
        value,
        color: [
            theme.colors.primary,
            theme.colors.secondary,
            theme.colors.error,
            theme.colors.tertiary,
            theme.colors.surfaceVariant,
        ][index % 5],
        legendFontColor: theme.colors.onSurface,
        legendFontSize: rfs(1.4),
    }))

    // Month names for display
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    // Filter options
    const filterOptions = [
        { label: "All Time", value: "allTime" },
        { label: "This Month", value: "thisMonth" },
        { label: "Last Month", value: "previousMonth" },
        { label: "This Year", value: "thisYear" },
        { label: "Specific Month", value: "specificMonth" },
    ]

    return (
        <ScrollView style={{ backgroundColor: theme.colors.background }}>
            <Card style={{ margin: rw(4), elevation: 4 }}>
                <Card.Content>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ width: "80%" }}>
                            <Title style={{ fontSize: rfs(2.2), color: theme.colors.primary, marginBottom: rh(0.5) }}>
                                Your Category Wise Summary
                            </Title>
                            <Paragraph style={{ fontSize: rfs(1.6), color: theme.colors.onSurfaceVariant }}>
                                View your individual category-wise spending in the group
                            </Paragraph>
                        </View>
                        <Avatar.Icon
                            size={rfs(6)}
                            icon="chart-pie"
                            style={{ backgroundColor: theme.colors.primaryContainer, }}
                            color={theme.colors.primary}
                        />
                    </View>
                </Card.Content>
            </Card>

            <Card style={{ margin: rw(4), elevation: 4 }}>
                <Card.Content>
                    {/* Filter Selection */}
                    <Text style={{ fontSize: rfs(1.7), fontWeight: "bold", marginBottom: rh(1), color: theme.colors.primary }}>
                        Time Period
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: rh(1.5) }}
                    >
                        {filterOptions.map((option) => (
                            <Chip
                                key={option.value}
                                selected={filterType === option.value}
                                onPress={() => setFilterType(option.value)}
                                style={{
                                    marginRight: rw(2),
                                    backgroundColor:
                                        filterType === option.value ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                                }}
                                textStyle={{
                                    color: filterType === option.value ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                                    fontSize: rfs(1.5),
                                }}
                            >
                                {option.label}
                            </Chip>
                        ))}
                    </ScrollView>

                    {/* Month and Year Pickers for Specific Month */}
                    {filterType === "specificMonth" && (
                        <Surface style={{ padding: rw(4), marginTop: rh(1.5), borderRadius: 8, elevation: 1 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: rh(1) }}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setMonthPickerVisible(true)}
                                    style={{ flex: 1, marginRight: rw(2) }}
                                >
                                    {monthNames[selectedMonth]}
                                </Button>
                                <Button mode="outlined" onPress={() => setYearPickerVisible(true)} style={{ flex: 1 }}>
                                    {selectedYear}
                                </Button>
                            </View>
                        </Surface>
                    )}

                    {/* Month Picker Modal */}
                    <Portal>
                        <Modal
                            visible={monthPickerVisible}
                            onDismiss={() => setMonthPickerVisible(false)}
                            contentContainerStyle={{
                                backgroundColor: theme.colors.surface,
                                padding: rh(3),
                                margin: rh(3),
                                borderRadius: rw(1),
                            }}
                        >
                            <Title style={{ marginBottom: rh(2) }}>Select Month</Title>
                            <RadioButton.Group
                                onValueChange={(value) => {
                                    setSelectedMonth(Number.parseInt(value))
                                    setMonthPickerVisible(false)
                                }}
                                value={selectedMonth.toString()}
                            >
                                {monthNames.map((month, index) => (
                                    <RadioButton.Item key={index} label={month} value={index.toString()} color={theme.colors.primary} />
                                ))}
                            </RadioButton.Group>
                        </Modal>
                    </Portal>

                    {/* Year Picker Modal */}
                    <Portal>
                        <Modal
                            visible={yearPickerVisible}
                            onDismiss={() => setYearPickerVisible(false)}
                            contentContainerStyle={{
                                backgroundColor: theme.colors.surface,
                                padding: rh(3),
                                margin: rh(3),
                                borderRadius: rw(1),
                            }}
                        >
                            <Title style={{ marginBottom: rh(2) }}>Select Year</Title>
                            <RadioButton.Group
                                onValueChange={(value) => {
                                    setSelectedYear(Number.parseInt(value))
                                    setYearPickerVisible(false)
                                }}
                                value={selectedYear.toString()}
                            >
                                {Array.from({ length: 5 }).map((_, index) => {
                                    const year = new Date().getFullYear() - index
                                    return (
                                        <RadioButton.Item
                                            key={year}
                                            label={year.toString()}
                                            value={year.toString()}
                                            color={theme.colors.primary}
                                        />
                                    )
                                })}
                            </RadioButton.Group>
                        </Modal>
                    </Portal>

                    {/* Pie Chart */}
                    <View style={{ marginTop: rh(2), alignItems: "center" }}>
                        {pieChartData.length > 0 ? (
                            <PieChart
                                data={pieChartData}
                                width={rw(80)}
                                height={rh(25)}
                                chartConfig={{
                                    backgroundColor: theme.colors.surface,
                                    backgroundGradientFrom: theme.colors.surface,
                                    backgroundGradientTo: theme.colors.surface,
                                    color: (opacity = 1) => `rgba(${theme.colors.onSurface}, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(${theme.colors.onSurface}, ${opacity})`,
                                }}
                                accessor="value"
                                backgroundColor="transparent"
                                center={[10, 0]}
                                absolute
                            />
                        ) : (
                            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: rfs(1.8), marginVertical: rh(5) }}>
                                No expenses found for this period
                            </Text>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {/* Expense Details */}
            <Card style={{ margin: rw(4), marginTop: 0 }}>
                <Card.Content>
                    <Title style={{ fontSize: rfs(2), fontWeight: 'bold', color: theme.colors.primary, marginBottom: rh(1) }}>
                        Expense Details
                    </Title>

                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <List.Section key={category}>
                                <List.Subheader style={{ fontWeight: "bold", borderBottomWidth: rw(0.3), borderStyle: 'dashed', borderColor: theme.colors.secondary, fontSize: rfs(2), color: theme.colors.primary }}>
                                    {category}
                                </List.Subheader>

                                {expensesByCategory[category].map((item, index) => {
                                    const userShare = item.splitDetails.find((detail) => detail.uid === uid)?.share || 0;

                                    return (
                                        <React.Fragment key={item.createdAt + index}>
                                            <List.Item
                                                title={item.description}
                                                description={new Date(item.createdAt).toLocaleDateString()}
                                                right={() => (
                                                    <Text style={{ alignSelf: "center", fontWeight: "bold", color: theme.colors.primary }}>
                                                        ₹{userShare.toFixed(2)}
                                                    </Text>
                                                )}
                                                left={(props) => <List.Icon {...props} icon="star-three-points" color={theme.colors.primary} />}
                                            />
                                            {index < expensesByCategory[category].length - 1 && <Divider bold />}
                                        </React.Fragment>
                                    );
                                })}
                            </List.Section>
                        ))
                    ) : (
                        <Paragraph style={{ textAlign: "center", marginVertical: rh(2), color: theme.colors.onSurfaceVariant }}>
                            No expenses found for the selected period
                        </Paragraph>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    )
}
const SummaryCategoryWiseScreen = () => {
    const theme = useTheme()
    const route = useRoute();
    const { groupId } = route.params;
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <MyChart groupId={groupId} />
        </View>
    )
}

export default SummaryCategoryWiseScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})