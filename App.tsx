import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import NfcScreen from './src/screens/NfcScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RegisterTagScreen from './src/screens/RegisterTagScreen';
import RegisteredTagsScreen from './src/screens/RegisteredTagsScreen';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Keepche</Text>
      <Text style={styles.description}>
        Scan NFC tags, track activities, and manage your registered NFC tags with ease.
      </Text>
      <Button mode="contained" onPress={() => navigation.navigate('Scan NFC')} style={styles.button}>
        Scan NFC
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('History')} style={styles.button}>
        View NFC History
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Registered Tags')} style={styles.button}>
        View Registered Tags
      </Button>
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
        <Stack.Screen name="Register Tag" component={RegisterTagScreen} />
        <Stack.Screen name="Registered Tags" component={RegisteredTagsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 20 },
  button: { marginTop: 10, width: '90%' },
});

export default App;
