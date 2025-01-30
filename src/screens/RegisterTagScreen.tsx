import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, Snackbar, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

NfcManager.start();

const RegisterTagScreen = () => {
  const [step, setStep] = useState(1);
  const [tagId, setTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const scanTag = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      await NfcManager.requestTechnology(NfcTech.NfcA);
      const tag = await NfcManager.getTag();
      if (tag && tag.id) {
        setTagId(tag.id);
        setStep(2);
      }
    } catch {
      setError("Failed to scan NFC tag.");
    } finally {
      setLoading(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  const saveTag = async () => {
    if (!tagId || !tagName.trim()) {
      setError("Tag ID and Name are required.");
      return;
    }

    try {
      await addDoc(collection(db, "registeredTags"), { tagId, tagName, timestamp: Timestamp.now() });
      setMessage("Tag registered successfully.");
      setTimeout(() => navigation.navigate("Registered Tags"), 1000);
    } catch {
      setError("Failed to save tag to server.");
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Step 1: Scan NFC Tag</Text>
          <Text style={styles.description}>Tap your NFC tag against the phone to scan.</Text>
          <Card style={styles.card}>
            {loading ? (
              <ActivityIndicator animating={true} size="large" />
            ) : (
              <Button mode="contained" onPress={scanTag} style={styles.button}>
                Scan NFC
              </Button>
            )}
          </Card>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Step 2: Enter Tag Name</Text>
          <Text style={styles.description}>Choose a name for your tag to easily identify it later.</Text>
          <Card style={styles.card}>
            <TextInput label="Tag Name" value={tagName} onChangeText={setTagName} style={styles.input} />
            <Button mode="contained" onPress={() => setStep(3)} disabled={!tagName} style={styles.button}>
              Next
            </Button>
          </Card>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Step 3: Save Your Tag</Text>
          <Text style={styles.description}>Confirm and save your tag to the database.</Text>
          <Card style={styles.card}>
            <Text style={styles.tagInfo}>Tag ID: {tagId}</Text>
            <Text style={styles.tagInfo}>Tag Name: {tagName}</Text>
            <Button mode="contained" onPress={saveTag} style={styles.button}>
              Save Tag
            </Button>
          </Card>
        </>
      )}

      {message && <Snackbar visible={!!message} onDismiss={() => setMessage(null)}>{message}</Snackbar>}
      {error && <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 20 },
  card: { width: '90%', padding: 20, alignItems: 'center', marginTop: 10 },
  input: { width: '90%', marginVertical: 10 },
  tagInfo: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  button: { marginTop: 10 },
});

export default RegisterTagScreen;
