import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

NfcManager.start();

const RegisterTagScreen = () => {
  const [step, setStep] = useState(1);
  const [tagId, setTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagNameError, setTagNameError] = useState<string | null>(null);
  const navigation = useNavigation();

  const scanTag = async () => {
    try {
      setLoading(true);
      setError(null);
      await NfcManager.requestTechnology(NfcTech.NfcA);
      const tag = await NfcManager.getTag();
      if (tag && tag.id) {
        const isDuplicate = await checkIfTagExists(tag.id);
        if (isDuplicate) {
          setError("This tag is already registered. To register again, first delete the existing tag.");
          setTagId(null);
        } else {
          setTagId(tag.id);
          setStep(2);
        }
      }
    } catch {
      setError("Failed to scan NFC tag.");
    } finally {
      setLoading(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  const checkIfTagExists = async (tagId: string) => {
    const q = query(collection(db, "registeredTags"), where("tagId", "==", tagId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkIfTagNameExists = async (tagName: string) => {
    const q = query(collection(db, "registeredTags"), where("tagName", "==", tagName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const saveTag = async () => {
    if (!tagId) {
      setError("Tag ID is required.");
      return;
    }

    setSaving(true);
    const isNameDuplicate = await checkIfTagNameExists(tagName);
    if (isNameDuplicate) {
      setTagNameError("This tag name is already in use. Please choose a different name.");
      setSaving(false);
      return;
    }

    try {
      await addDoc(collection(db, "registeredTags"), { tagId, tagName, timestamp: Timestamp.now() });
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'Home' }, { name: 'Tags List', params: { successMessage: "Tag registered successfully." } }],
        })
      );
    } catch {
      setError("Failed to save tag to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Scan NFC Tag</Text>
          <Text style={styles.description}>Tap your NFC tag against the phone to scan.</Text>
          {loading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button mode="contained" onPress={scanTag} style={styles.button}>
              Scan NFC
            </Button>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Enter Tag Name & Save</Text>
          <Text style={styles.description}>Choose a name for your tag and save it to the system.</Text>
          <TextInput
            label="Tag Name"
            value={tagName}
            onChangeText={(text) => {
              setTagName(text);
              setTagNameError(null);
            }}
            style={[styles.input, tagNameError ? styles.inputErrorBackground : null]}
            mode="outlined"
            editable={!saving}
          />
          {tagNameError && <Text style={styles.errorText}>{tagNameError}</Text>}
          <Text style={styles.tagInfo}>Tag ID: {tagId}</Text>
          {saving ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button mode="contained" onPress={saveTag} style={styles.button}>
              Save Tag
            </Button>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 20 },
  input: { width: '100%', marginBottom: 10 },
  inputErrorBackground: { backgroundColor: '#ffe6e6' },
  tagInfo: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  errorText: { color: 'red', fontSize: 14, marginBottom: 10, textAlign: 'left' },
  button: { marginTop: 10 },
});

export default RegisterTagScreen;
