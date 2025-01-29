import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const RegisteredTagsScreen = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  // Fetch registered tags from Firestore
  const fetchTags = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "registeredTags"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTags(data);
    } catch (error) {
      console.error("Error fetching registered tags: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a tag from Firestore
  const deleteTag = async (tagId: string) => {
    try {
      await deleteDoc(doc(db, "registeredTags", tagId));
      Alert.alert("Deleted", "The tag has been removed.");
      fetchTags(); // Refresh the list after deletion
    } catch (error) {
      Alert.alert("Error", "Failed to delete the tag.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registered NFC Tags</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : tags.length === 0 ? (
        <Text style={styles.noData}>No registered tags found</Text>
      ) : (
        <FlatList
          data={tags}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.tagItem}>
              <Text style={styles.tagText}>Tag Name: {item.tagName}</Text>
              <Text style={styles.tagText}>Tag ID: {item.tagId}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTag(item.id)}>
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
  tagItem: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  tagText: { fontSize: 16, fontWeight: "bold" },
  deleteButton: { backgroundColor: "red", padding: 8, borderRadius: 5, marginTop: 10 },
  deleteText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});

export default RegisteredTagsScreen;
