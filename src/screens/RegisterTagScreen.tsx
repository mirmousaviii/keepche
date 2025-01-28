import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Initialize NFC
NfcManager.start();

const RegisterTagScreen = () => {
  const [tagId, setTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scan NFC tag
  const scanTag = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      setErrorMessage(null);

      await NfcManager.requestTechnology(NfcTech.NfcA);
      const tag = await NfcManager.getTag();

      if (tag && tag.id) {
        setTagId(tag.id);
      }
    } catch (err) {
      setErrorMessage("Failed to scan NFC tag.");
    } finally {
      setLoading(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  // Save tag data to Firestore
  const saveTagToFirestore = async () => {
    if (!tagId || !tagName.trim()) {
      setErrorMessage("Tag ID and Name are required.");
      return;
    }

    try {
      await addDoc(collection(db, "registeredTags"), {
        tagId,
        tagName,
        timestamp: Timestamp.now(),
      });

      setStatusMessage("Tag registered successfully");
      setTagId(null);
      setTagName('');
    } catch (error) {
      setErrorMessage("Failed to save tag to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register a New NFC Tag</Text>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {tagId && <Text style={styles.tagText}>Tag ID: {tagId}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter tag name"
        value={tagName}
        onChangeText={setTagName}
      />

      {statusMessage && <Text style={styles.successMessage}>{statusMessage}</Text>}
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

      {!loading && (
        <>
          <Button title="Scan NFC" onPress={scanTag} />
          <Button title="Save Tag" onPress={saveTagToFirestore} disabled={!tagId} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  tagText: { fontSize: 16, marginVertical: 10, color: "blue" },
  input: { borderWidth: 1, padding: 10, width: "80%", marginVertical: 10 },
  successMessage: { fontSize: 16, color: "green", marginTop: 10 },
  errorMessage: { fontSize: 16, color: "red", marginTop: 10 },
});

export default RegisterTagScreen;
