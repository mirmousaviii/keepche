import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const HistoryScreen = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  // Fetch logs from Firestore
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

  // Delete log from Firestore
  const deleteLog = async (logId: string) => {
    try {
      await deleteDoc(doc(db, "logs", logId));
      Alert.alert("Deleted", "The log has been removed.");
      fetchLogs(); // Refresh the list after deletion
    } catch (error) {
      Alert.alert("Error", "Failed to delete the log.");
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
              <Text style={styles.timestamp}>
                Time: {new Date(item.timestamp.seconds * 1000).toLocaleString()}
              </Text>

              {/* Delete button */}
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteLog(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
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
  deleteButton: { backgroundColor: "red", padding: 8, borderRadius: 5, marginTop: 10 },
  deleteText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});

export default HistoryScreen;
