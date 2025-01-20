import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NfcScreen from './src/screens/NfcScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// ایجاد استک ناویگیشن برای هدایت بین صفحات
const Stack = createStackNavigator();

// صفحه اصلی با دکمه‌هایی برای دسترسی سریع
const HomeScreen = ({ navigation }) => {
    return (
      <View style={styles.container}>
          <Text style={styles.title}>Welcome to Keepche</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Scan NFC')}>
              <Text style={styles.buttonText}>Go to NFC Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('History')}>
              <Text style={styles.buttonText}>View NFC History</Text>
          </TouchableOpacity>
      </View>
    );
};

const App = () => {
    return (
      <NavigationContainer>
          <Stack.Navigator>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Scan NFC" component={NfcScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Navigator>
      </NavigationContainer>
    );
};

// استایل‌ها
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#f5f5f5" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    button: { backgroundColor: "#007bff", padding: 12, borderRadius: 5, marginVertical: 10 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default App;
