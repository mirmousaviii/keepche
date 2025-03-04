import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';

const HistoryScreen = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "logs"), orderBy("timestamp", "desc")); // مرتب‌سازی بر اساس زمان
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(data);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteActivity = (activityId: string, tagName: string) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the activity for "${tagName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteActivity(activityId) }
      ]
    );
  };

  const deleteActivity = async (activityId: string) => {
    try {
      await deleteDoc(doc(db, "logs", activityId));
      setSuccessMessage("Activity deleted successfully.");
      setSnackbarVisible(true);
      fetchActivities();
    } catch {
      setSuccessMessage("Failed to delete activity.");
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Activity History</Text>
        <Text style={styles.description}>
          View and manage logged activities. You can delete an entry if needed.
        </Text>
        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : activities.length === 0 ? (
          <Text style={styles.noActivityText}>No activity history found.</Text>
        ) : (
          activities.map((item) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityTextContainer}>
                <Text style={styles.tagName}>{item.tagName}</Text>
                <Text style={styles.timestamp}>{new Date(item.timestamp.toDate()).toLocaleString()}</Text>
              </View>
              <Button mode="text" onPress={() => confirmDeleteActivity(item.id, item.tagName)} textColor="red">
                Delete
              </Button>
            </View>
          ))
        )}
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {successMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { flexGrow: 1, padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 20 },
  noActivityText: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 20 },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  activityTextContainer: { flex: 1, marginRight: 10 },
  tagName: { fontSize: 16, fontWeight: 'bold', color: 'black' },
  timestamp: { fontSize: 14, color: '#666' },
  snackbar: { position: 'absolute', bottom: 20, alignSelf: 'center' },
});

export default HistoryScreen;
