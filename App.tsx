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
        Quickly add activities, track history, and manage your NFC tags.
      </Text>
      <Button mode="contained" onPress={() => navigation.navigate('Add Activity')} style={styles.button}>
        Add Activity
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Activity History')} style={styles.button}>
        Activity History
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Tags List')} style={styles.button}>
        Tags List
      </Button>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add Activity" component={NfcScreen} />
        <Stack.Screen name="Activity History" component={HistoryScreen} />
        <Stack.Screen name="Register Tag" component={RegisterTagScreen} />
        <Stack.Screen name="Tags List" component={RegisteredTagsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  description: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 20 },
  button: { marginTop: 10, width: '90%' },
});

export default App;
