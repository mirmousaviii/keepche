import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
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
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Tags List' }],
          })
        );
      }, 1000);
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
          {loading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button mode="contained" onPress={scanTag} style={styles.button}>
              Scan NFC
            </Button>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Step 2: Enter Tag Name</Text>
          <Text style={styles.description}>Choose a name for your tag to easily identify it later.</Text>
          <TextInput
            label="Tag Name"
            value={tagName}
            onChangeText={setTagName}
            style={styles.input}
            mode="outlined"
          />
          <Button mode="contained" onPress={() => setStep(3)} disabled={!tagName} style={styles.button}>
            Next
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Step 3: Save Your Tag</Text>
          <Text style={styles.description}>Confirm and save your tag to the database.</Text>
          <Text style={styles.tagInfo}>Tag ID: {tagId}</Text>
          <Text style={styles.tagInfo}>Tag Name: {tagName}</Text>
          <Button mode="contained" onPress={saveTag} style={styles.button}>
            Save Tag
          </Button>
        </>
      )}

      {message && <Snackbar visible={!!message} onDismiss={() => setMessage(null)}>{message}</Snackbar>}
      {error && <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 20 },
  input: { width: '100%', marginBottom: 20 },
  tagInfo: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  button: { marginTop: 10 },
});

export default RegisterTagScreen;
