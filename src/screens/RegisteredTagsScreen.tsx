import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Snackbar, List, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const RegisteredTagsScreen = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "registeredTags"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTags(data);
    } catch {
      setError("Failed to fetch registered tags.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      await deleteDoc(doc(db, "registeredTags", tagId));
      fetchTags();
    } catch {
      setError("Failed to delete tag.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tags List & New Tag</Text>
      <Text style={styles.description}>
        View and manage all registered NFC tags or add a new one.
      </Text>
      <Button mode="contained" onPress={() => navigation.navigate('Register Tag')} style={styles.button}>
        Register New Tag
      </Button>
      {loading ? (
        <ActivityIndicator animating={true} size="large" />
      ) : tags.length === 0 ? (
        <Text>No registered tags found.</Text>
      ) : (
        tags.map((item) => (
          <List.Item
            key={item.id}
            title={`Tag Name: ${item.tagName}`}
            description={`Tag ID: ${item.tagId}`}
            right={() => (
              <Button mode="text" onPress={() => deleteTag(item.id)} textColor="red">
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
  button: { marginBottom: 20 },
});

export default RegisteredTagsScreen;
