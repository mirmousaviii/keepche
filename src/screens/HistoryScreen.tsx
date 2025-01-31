import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Snackbar, List, Button } from 'react-native-paper';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const HistoryScreen = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "logs"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    } catch {
      setError("Failed to fetch activity history.");
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      await deleteDoc(doc(db, "logs", logId));
      fetchLogs();
    } catch {
      setError("Failed to delete activity log.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity History</Text>
      <Text style={styles.description}>
        View and manage your past NFC activities.
      </Text>
      {loading ? (
        <ActivityIndicator animating={true} size="large" />
      ) : logs.length === 0 ? (
        <Text>No activity logs found.</Text>
      ) : (
        logs.map((item) => (
          <List.Item
            key={item.id}
            title={`Tag ID: ${item.tagId}`}
            description={`Activity: ${item.activityType}\nTime: ${new Date(item.timestamp.seconds * 1000).toLocaleString()}`}
            right={() => (
              <Button mode="text" onPress={() => deleteLog(item.id)} textColor="red">
                Delete
              </Button>
            )}
          />
        ))
      )}
      {error && <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  description: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 20 },
});

export default HistoryScreen;
