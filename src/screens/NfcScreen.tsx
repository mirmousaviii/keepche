import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, ActivityIndicator, Snackbar, Card } from 'react-native-paper';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

NfcManager.start();

const NfcScreen = () => {
    const [tagId, setTagId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const scanTag = async () => {
        try {
            setLoading(true);
            setMessage(null);
            setError(null);
            await NfcManager.requestTechnology(NfcTech.NfcA);
            const tag = await NfcManager.getTag();
            if (tag && tag.id) {
                setTagId(tag.id);
                await saveScanToFirestore(tag.id);
            }
        } catch {
            setError("Failed to scan NFC tag.");
        } finally {
            setLoading(false);
            NfcManager.cancelTechnologyRequest();
        }
    };

    const saveScanToFirestore = async (tagId: string) => {
        try {
            await addDoc(collection(db, "logs"), {
                tagId,
                activityType: "General Activity",
                timestamp: Timestamp.now(),
            });
            setMessage("Activity added successfully.");
        } catch {
            setError("Failed to send data to server.");
        }
    };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Add a New Activity</Text>
          <Text style={styles.description}>
              Scan an NFC tag to log a new activity.
          </Text>
          <Card style={styles.card}>
              {loading ? (
                <ActivityIndicator animating={true} size="large" />
              ) : (
                <>
                    {tagId && <Text style={styles.tagText}>Tag ID: {tagId}</Text>}
                    <Button mode="contained" onPress={scanTag} style={styles.button}>
                        Scan NFC
                    </Button>
                </>
              )}
          </Card>
          {message && <Snackbar visible={!!message} onDismiss={() => setMessage(null)}>{message}</Snackbar>}
          {error && <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>}
      </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
    description: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 20 },
    card: { width: '90%', padding: 20, alignItems: 'center' },
    tagText: { fontSize: 16, marginVertical: 10, color: 'blue' },
    button: { marginTop: 20 },
});

export default NfcScreen;
