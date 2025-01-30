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
                activityType: "Watering",
                timestamp: Timestamp.now(),
            });
            setMessage("Activity logged successfully.");
        } catch {
            setError("Failed to send data to server.");
        }
    };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Scan an NFC Tag</Text>
          <Card style={styles.card}>
              {loading ? (
                <ActivityIndicator animating={true} size="large" />
              ) : (
                <>
                    {tagId && <Text style={styles.tagText}>Tag ID: {tagId}</Text>}
                    <Button mode="contained" onPress={scanTag} loading={loading} style={styles.button}>
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
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    card: { width: '90%', padding: 20, alignItems: 'center', marginTop: 10 },
    tagText: { fontSize: 16, marginVertical: 10, color: 'blue' },
    button: { marginTop: 20 },
});

export default NfcScreen;
