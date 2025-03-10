import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

NfcManager.start();

const RegisterTagScreen = () => {
  const [step, setStep] = useState(1);
  const [tagId, setTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagNameError, setTagNameError] = useState<string | null>(null);
  const navigation = useNavigation();

  // Scan NFC tag
  const scanTag = async () => {
    try {
      setLoading(true);
      setError(null);
      await NfcManager.requestTechnology(NfcTech.NfcA);
      const tag = await NfcManager.getTag();
      if (tag && tag.id) {
        const existingTag = await checkIfTagExists(tag.id);
        if (existingTag) {
          setError(`This tag is already registered with the name "${existingTag.tagName}".\nTo register it again, you need to delete the existing entry first.`);
          setTagId(null);
        } else {
          setTagId(tag.id);
          setStep(2);
        }
      }
    } catch {
      setError("Could not scan the NFC tag.\nPlease try again.");
    } finally {
      setLoading(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  // Check if the NFC tag is already registered
  const checkIfTagExists = async (tagId: string) => {
    const q = query(collection(db, "registeredTags"), where("tagId", "==", tagId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data();
  };

  // Check if the tag name already exists
  const checkIfTagNameExists = async (tagName: string) => {
    const q = query(collection(db, "registeredTags"), where("tagName", "==", tagName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Save tag information to Firestore
  const saveTag = async () => {
    if (!tagId) {
      setError("Error: No NFC tag detected.");
      return;
    }

    setSaving(true);
    const isNameDuplicate = await checkIfTagNameExists(tagName);
    if (isNameDuplicate) {
      setTagNameError("This name is already taken.\nPlease choose another name.");
      setSaving(false);
      return;
    }

    try {
      await addDoc(collection(db, "registeredTags"), { tagId, tagName, timestamp: Timestamp.now() });
      setStep(3);
    } catch {
      setError("Could not save the tag.\nPlease try again.");
    } finally {
      setSaving(false);
    }
  };

  // Write deep link and AAR to NFC tag
  const writeNfcTag = async () => {
    if (!tagId) return;

    setWriting(true);
    const deepLink = `keepche://log?tagId=${tagId}`;
    const bytes = Ndef.encodeMessage([
      Ndef.uriRecord(deepLink),
      Ndef.androidApplicationRecord("com.keepche") // Ensures the app opens automatically
    ]);

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      setStep(4);
    } catch {
      setError("Could not write data to the NFC tag.\nMake sure your tag is compatible and try again.");
    } finally {
      setWriting(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Scan an NFC Tag</Text>
          <Text style={styles.description}>
            Tap the "Scan NFC Tag" button below, then place your NFC tag against the back of your phone.
          </Text>
          {loading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button mode="contained" onPress={scanTag} style={styles.button}>
              Scan NFC Tag
            </Button>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Assign a Name</Text>
          <Text style={styles.description}>
            Enter a unique name for this tag.{"\n"}This will help you recognize it later.
          </Text>
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
              Save Tag Name
            </Button>
          )}
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Write Data to NFC Tag</Text>
          <Text style={styles.description}>
            Tap the "Write Data to NFC Tag" button below,{"\n"}then place your NFC tag against the back of your phone again.
          </Text>
          {writing ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button mode="contained" onPress={writeNfcTag} style={styles.button}>
              Write Data to NFC Tag
            </Button>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.title}>Tag Registered Successfully</Text>
          <Text style={styles.description}>
            The NFC tag has been registered successfully.{"\n"}You can now use it to log activities.
          </Text>
          <Button
            mode="contained"
            onPress={() =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: 'Home' }, { name: 'Tags List', params: { successMessage: "Tag registered successfully." } }],
                })
              )
            }
            style={styles.button}
          >
            Done
          </Button>
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 20, lineHeight: 24 },
  bold: { fontWeight: 'bold' },
  input: { width: '100%', marginBottom: 10 },
  inputErrorBackground: { backgroundColor: '#ffe6e6' },
  tagInfo: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  errorText: { color: 'red', fontSize: 14, marginBottom: 10, textAlign: 'left', lineHeight: 22 },
  button: { marginTop: 10 },
});

export default RegisterTagScreen;
