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
      <Text style={styles.title}>Manage Activities</Text>
      <Text style={styles.description}>
        Keep track of your activities with NFC tags.
        Scan tags to log activities, view history, and manage your tags.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add a new activity</Text>
        <Text style={styles.sectionDescription}>
          Tap an NFC tag to log a new activity in your history.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Add Activity')} style={styles.button}>
          Add Activity
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>View activity history</Text>
        <Text style={styles.sectionDescription}>
          Check your logged activities and manage past records.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Activity History')} style={styles.button}>
          Activity History
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage your NFC tags</Text>
        <Text style={styles.sectionDescription}>
          View your registered NFC tags or add a new tag to the system.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Tags List')} style={styles.button}>
          Tags List & New Tag
        </Button>
      </View>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitle: 'Keepche' }}>
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
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'flex-start' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 25 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  sectionDescription: { fontSize: 14, color: 'black', marginBottom: 10, lineHeight: 20 },
  button: { width: '100%' },
});

export default App;
