import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';

const RegisteredTagsScreen = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "registeredTags"), orderBy("timestamp", "desc")); // مرتب‌سازی بر اساس زمان ثبت
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTags(data);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTag = (tagId: string, tagName: string) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTag(tagId) }
      ]
    );
  };

  const deleteTag = async (tagId: string) => {
    try {
      await deleteDoc(doc(db, "registeredTags", tagId));
      setSuccessMessage("Tag deleted successfully.");
      setSnackbarVisible(true);
      fetchTags();
    } catch {
      setSuccessMessage("Failed to delete tag.");
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Tags List & New Tag</Text>
        <Text style={styles.description}>
          View and manage all registered NFC tags or add a new one.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Register Tag')} style={styles.addButton}>
          Register New Tag
        </Button>
        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : tags.length === 0 ? (
          <Text style={styles.noTagsText}>No registered tags found.</Text>
        ) : (
          tags.map((item) => (
            <View key={item.id} style={styles.tagItem}>
              <View style={styles.tagTextContainer}>
                <Text style={styles.tagName}>{item.tagName}</Text>
                <Text style={styles.tagId}>{item.tagId}</Text>
              </View>
              <Button mode="text" onPress={() => confirmDeleteTag(item.id, item.tagName)} textColor="red">
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
  noTagsText: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 20 },
  addButton: { marginBottom: 20 },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tagTextContainer: { flex: 1, marginRight: 10 },
  tagName: { fontSize: 16, fontWeight: 'bold', color: 'black' },
  tagId: { fontSize: 12, color: '#666' },
  snackbar: { position: 'absolute', bottom: 20, alignSelf: 'center' },
});

export default RegisteredTagsScreen;
