import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Linking } from 'react-native';
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
        Keep track of your activities with NFC tags.{"\n"}
        Simply tap your NFC tag near the phone to automatically log an activity.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to log activities?</Text>
        <Text style={styles.sectionDescription}>
          No need to press any button! Just bring your registered NFC tag near your phone.{"\n"}
          The activity will be logged automatically, and a notification will confirm the success.
        </Text>
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
  const navigationRef = useRef();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url || event;
      if (!url) return;
      try {
        const match = url.match(/keepche:\/\/log\?tagId=(.+)/);
        if (match && match[1] && navigationRef.current) {
          const tagId = decodeURIComponent(match[1]);
          navigationRef.current.navigate('Log Activity', { tagId });
        }
      } catch (error) {
        console.error("Failed to process deep link:", error);
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerTitle: 'Keepche' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Activity History" component={HistoryScreen} />
        <Stack.Screen name="Register Tag" component={RegisterTagScreen} />
        <Stack.Screen name="Tags List" component={RegisteredTagsScreen} />
        <Stack.Screen name="Log Activity" component={NfcScreen} options={{ title: "Logging Activity..." }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'flex-start' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 25, lineHeight: 22 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  sectionDescription: { fontSize: 14, color: 'black', marginBottom: 10, lineHeight: 20 },
  button: { width: '100%' },
});

export default App;
