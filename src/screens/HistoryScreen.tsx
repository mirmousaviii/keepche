import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const HistoryScreen = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "logs"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFC Scan History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : logs.length === 0 ? (
        <Text style={styles.noData}>No logs found</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logText}>Tag ID: {item.tagId}</Text>
              <Text style={styles.logText}>Activity: {item.activityType}</Text>
              <Text style={styles.timestamp}>Time: {new Date(item.timestamp.seconds * 1000).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  noData: { textAlign: "center", fontSize: 16, color: "gray" },
  logItem: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  logText: { fontSize: 16, fontWeight: "bold" },
  timestamp: { fontSize: 14, color: "gray", marginTop: 5 },
});

export default HistoryScreen;
