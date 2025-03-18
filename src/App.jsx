import { StatusBar, Text, View, ScrollView, StyleSheet, PermissionsAndroid, Alert } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

import React, { useEffect } from 'react';
import { useTheme, Card, Title, Button } from "react-native-paper"
import LinearGradient from 'react-native-linear-gradient';
import { Linking } from 'react-native';


const GradientShowcase = () => {
  const theme = useTheme()

  // Collection of linear gradients
  const linearGradients = [
    {
      name: "Amber",
      colors: [theme.colors.primary, theme.colors.primaryContainer, theme.colors.secondaryContainer, theme.colors.primaryContainer, theme.colors.primary],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    {
      name: "Amber Sunset",
      colors: [theme.colors.primary, theme.colors.primaryContainer, theme.colors.secondary],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    {
      name: "Golden Hour",
      colors: [theme.colors.primary, theme.colors.secondary, theme.colors.tertiary],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
    {
      name: "Forest Depths",
      colors: [theme.colors.tertiary, theme.colors.tertiaryContainer, theme.colors.primary],
      start: { x: 0, y: 1 },
      end: { x: 0, y: 0 },
    },
    {
      name: "Warm Blend",
      colors: [theme.colors.primaryContainer, theme.colors.primary, theme.colors.secondaryContainer],
      start: { x: 0, y: 0.5 },
      end: { x: 1, y: 0.5 },
    },
    {
      name: "Earthy Tones",
      colors: [theme.colors.secondary, theme.colors.primary, theme.colors.secondaryContainer],
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 },
    },
    {
      name: "Amber Glow",
      colors: [
        `${theme.colors.primary}CC`, // Adding transparency
        `${theme.colors.secondary}99`,
        `${theme.colors.tertiary}66`,
      ],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  ]

  // Simulated circular gradients
  const circularGradients = [
    {
      name: "Radial Amber",
      outerColors: [theme.colors.primary, "transparent"],
      innerColors: [theme.colors.primaryContainer, theme.colors.primary],
    },
    {
      name: "Golden Circle",
      outerColors: [theme.colors.secondary, "transparent"],
      innerColors: [theme.colors.secondaryContainer, theme.colors.secondary],
    },
    {
      name: "Forest Orb",
      outerColors: [theme.colors.tertiary, "transparent"],
      innerColors: [theme.colors.tertiaryContainer, theme.colors.tertiary],
    },
    {
      name: "Warm Radiance",
      outerColors: [`${theme.colors.primary}99`, "transparent"],
      innerColors: [theme.colors.primaryContainer, `${theme.colors.primary}CC`],
    },
  ]

  const angularGradients = [
    {
      name: "Amber Swirl",
      colors: [theme.colors.primary, theme.colors.secondary, theme.colors.tertiary, theme.colors.primary],
    },
    {
      name: "Golden Spiral",
      colors: [theme.colors.primary, theme.colors.primaryContainer, theme.colors.secondary, theme.colors.tertiary],
    },
    {
      name: "Forest Cyclone",
      colors: [theme.colors.tertiary, theme.colors.secondary, theme.colors.primary, theme.colors.tertiaryContainer],
    },
    {
      name: "Warm Vortex",
      colors: [theme.colors.primaryContainer, theme.colors.primary, theme.colors.secondaryContainer, theme.colors.tertiary],
    },
  ];


  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Linear Gradients</Title>
      <View style={styles.gradientGrid}>
        {linearGradients.map((gradient, index) => (
          <Card key={index} style={styles.card}>
            <LinearGradient
              colors={gradient.colors}
              start={gradient.start}
              end={gradient.end}
              style={styles.gradient}
            />
            <Card.Content style={styles.cardContent}>
              <Text style={styles.gradientName}>{gradient.name}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Title style={styles.title}>Angular Gradients</Title>
      <View style={styles.gradientGrid}>
        {angularGradients.map((gradient, index) => (
          <Card key={index} style={styles.card}>
            <LinearGradient
              colors={gradient.colors}
              start={gradient.start}
              end={gradient.end}
              style={styles.gradient}
              useAngle={true} angle={90} angleCenter={{ x: 0.5, y: 0.5 }}
            />
            <Card.Content style={styles.cardContent}>
              <Text style={styles.gradientName}>{gradient.name}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Title style={styles.title}>Circular Gradients</Title>
      <View style={styles.gradientGrid}>
        {circularGradients.map((gradient, index) => (
          <Card key={index} style={styles.card}>
            <View style={styles.circularGradientContainer}>
              <LinearGradient
                colors={gradient.outerColors}
                style={styles.outerCircle}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
              />
              <LinearGradient
                colors={gradient.innerColors}
                style={styles.innerCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.gradientName}>{gradient.name}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Title style={styles.title}>Multi-Layer Gradients</Title>
      <View style={styles.gradientGrid}>
        <Card style={styles.card}>
          <View style={styles.multiLayerContainer}>
            <LinearGradient
              colors={[theme.colors.primary, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.multiLayer, { transform: [{ rotate: "0deg" }] }]}
            />
            <LinearGradient
              colors={[theme.colors.secondary, "transparent"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.multiLayer, { transform: [{ rotate: "90deg" }] }]}
            />
            <LinearGradient
              colors={[theme.colors.tertiary, "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.multiLayer, { transform: [{ rotate: "45deg" }] }]}
            />
          </View>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.gradientName}>Amber Prism</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <View style={styles.multiLayerContainer}>
            <LinearGradient
              colors={[theme.colors.primaryContainer, "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.multiLayer, { borderRadius: 100 }]}
            />
            <LinearGradient
              colors={[theme.colors.secondaryContainer, "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.multiLayer, { borderRadius: 100 }]}
            />
          </View>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.gradientName}>Golden Orb</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  gradientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 16,
    overflow: "hidden",
  },
  gradient: {
    height: 150,
    width: "100%",
  },
  cardContent: {
    padding: 8,
  },
  gradientName: {
    textAlign: "center",
    fontWeight: "bold",
  },
  circularGradientContainer: {
    height: 150,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  outerCircle: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  innerCircle: {
    width: "70%",
    height: "70%",
    borderRadius: 75,
  },
  multiLayerContainer: {
    height: 150,
    width: "100%",
    position: "relative",
  },
  multiLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
})


const initiateUPIPayment = async () => {
  const upiId = 'khenikrish08@okaxis'; // Replace with creditor's UPI ID
  const amount = 111.11; // Replace with actual amount
  const transactionId = `TXN_${Date.now()}`;
  // const url = `upi://pay?pa=${upiId}&pn=Creditor Name&mc=&tid=${transactionId}&tr=${transactionId}&tn=SliceShare Payment&am=${amount}&cu=INR`;
  // const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent("Creditor Name")}&tr=${transactionId}&tn=${encodeURIComponent("SliceShare Payment")}&am=${parseFloat(amount).toFixed(2)}&cu=INR`;
  // const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent("Creditor Name")}&tr=${transactionId}&tn=${encodeURIComponent("SliceShare Payment")}&am=${parseFloat(amount).toFixed(2)}&cu=INR`;
  const url = `upi://pay?pa=khenikrish08@okaxis&pn=John%20Doe&tr=TXN12345&tn=SliceShare%20Payment&am=100.00&cu=INR`


  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url).catch(err => console.error("UPI Intent Error:", err));
    } else {
      Alert.alert("No UPI App Found", "Please install a UPI app like GPay or PhonePe.");
    }
  } catch (error) {
    console.error("Error opening UPI URL:", error);
    Alert.alert("Error", "Something went wrong while opening UPI.");
  }
};


const App = () => {
  return (
    <>
      <StatusBar />
      {/* <Button onPress={initiateUPIPayment} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>PAY</Button> */}
      <AppNavigator />
      {/* <GradientShowcase /> */}
    </>
  );
};

export default App;
