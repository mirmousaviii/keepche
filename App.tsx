import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Linking } from 'react-native';
import { Button, Text, Snackbar, ActivityIndicator } from 'react-native-paper';
import notifee, { AndroidImportance } from '@notifee/react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db } from './src/firebase/config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import HistoryScreen from './src/screens/HistoryScreen';
import RegisterTagScreen from './src/screens/RegisterTagScreen';
import RegisteredTagsScreen from './src/screens/RegisteredTagsScreen';

NfcManager.start();

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false); // new state to manage scanning status

  // useEffect(() => {
  //   scanTag(); // Automatic NFC scan on page load
  // }, []);


  //  Log NFC activity on page load
  const navigationRef = useRef(null);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url || event;
      if (!url) return;
      try {
        const match = url.match(/keepche:\/\/log\?tagId=(.+)/);
        if (match && match[1] && navigationRef.current) {
          const tagId = decodeURIComponent(match[1]);
          // navigationRef.current.navigate('Log Activity', { tagId });

          // Log activity
          logActivity(tagId);
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

  // Function to scan NFC tag (automatic & manual)
  const scanTag = async () => {
    if (isScanning) {
      cancelScan();
      return;
    }

    try {
      setIsScanning(true);
      setScanning(true);
      setError(null);
      await NfcManager.requestTechnology(NfcTech.NfcA);
      const tag = await NfcManager.getTag();
      if (tag && tag.id) {
        logActivity(tag.id);
      }
    } catch (e: any) {
      if (isScanning) {
        setError("Failed to scan NFC tag. Please try again.");
      }
    } finally {
      setScanning(false);
      setIsScanning(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  const cancelScan = () => {
    NfcManager.cancelTechnologyRequest().then(() => {
      setIsScanning(false);
      setScanning(false);
      setMessage("Scanning cancelled.");
    }).catch(error => {
      console.warn("cancel scan error", error);
    });
  };

  // Function to log NFC activity
  const logActivity = async (tagId: string) => {
    try {
      const tagData = await getRegisteredTagInfo(tagId);
      if (!tagData) {
        setError("This tag needs to be registered first.");
        return;
      }

      const savedTimestamp = await saveScanToFirestore(tagId, tagData.tagName);
      setMessage("Activity added successfully.");

      // Show a notification
      showNotification(tagData.tagName, savedTimestamp);
    } catch {
      setError("Error processing the NFC tag.");
    }
  };

  // Fetch registered tag details from Firestore
  const getRegisteredTagInfo = async (tagId: string) => {
    const q = query(collection(db, "registeredTags"), where("tagId", "==", tagId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data();
  };

  // Save activity to Firestore
  const saveScanToFirestore = async (tagId: string, tagName: string) => {
    try {
      const timestamp = Timestamp.now();
      await addDoc(collection(db, "logs"), {
        tagId,
        tagName,
        activityType: "General Activity",
        timestamp,
      });
      return new Date(timestamp.toDate()).toLocaleString();
    } catch {
      setError("Failed to send data to server.");
      return null;
    }
  };

  // Show notification using notifee
  const showNotification = async (tagName, timestamp) => {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'activity_logs',
      name: 'Activity Logs',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: 'Activity Logged',
      body: `"${tagName}" was logged at ${timestamp}.`,
      android: {
        channelId,
        pressAction: {
          id: 'open_app',
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Activities</Text>
      <Text style={styles.description}>
        Keep track of your activities with NFC tags.{"\n"}
        Simply tap your NFC tag near the phone to automatically log an activity.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log activities</Text>
        <Text style={styles.sectionDescription}>
          No need to press any button! Just bring your registered NFC tag near your phone.{"\n"}
          The activity will be logged automatically, and a notification will confirm the success.
        </Text>
        <Button
          mode="contained"
          onPress={scanTag}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {scanning ? <ActivityIndicator animating={true} size="small" color="white"/> : "Scan Tag Manually"}
        </Button>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>View activity history</Text>
        <Text style={styles.sectionDescription}>
          Check your logged activities and manage past records.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Activity History')} style={styles.button} contentStyle={styles.buttonContent}>
          Activity History
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage your tags</Text>
        <Text style={styles.sectionDescription}>
          View your registered NFC tags or add a new tag to the system.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Tags List')} style={styles.button} contentStyle={styles.buttonContent}>
          Tags List & New Tag
        </Button>
      </View>

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage(null)}
        duration={2000}
      >
        {message}
      </Snackbar>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitle: 'Keepche' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
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
  description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 25, lineHeight: 22 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  sectionDescription: { fontSize: 14, color: 'black', marginBottom: 10, lineHeight: 20 },
  button: {marginBottom: 3 },
  buttonContent: { width: '100%', height: 60},
  errorText: { color: 'red', fontSize: 14, marginTop: 5, textAlign: 'center' },
});

export default App;
