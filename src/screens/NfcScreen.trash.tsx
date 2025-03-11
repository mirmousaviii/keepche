import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text, Snackbar, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

NfcManager.start();

const NfcScreenTrash = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { tagId: deepLinkTagId } = route.params || {};

    const [tagId, setTagId] = useState<string | null>(null);
    const [tagName, setTagName] = useState<string | null>(null);
    const [timestamp, setTimestamp] = useState<string | null>(null);
    const [loading, setLoading] = useState(!!deepLinkTagId);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (deepLinkTagId) {
            scanTag();
        }
    }, [deepLinkTagId]);

    const scanTag = async () => {
        try {
            setLoading(true);
            setError(null);
            setTagId(null);
            setTagName(null);
            setTimestamp(null);

            await NfcManager.requestTechnology(NfcTech.NfcA);
            const tag = await NfcManager.getTag();

            if (tag && tag.id) {
                setTagId(tag.id);
                const tagData = await getRegisteredTagInfo(tag.id);
                if (!tagData) {
                    setError("This tag is not registered. Please register it first.");
                    setTagName(null);
                    setTimestamp(null);
                } else {
                    setTagName(tagData.tagName);
                    const savedTimestamp = await saveScanToFirestore(tag.id, tagData.tagName);
                    setTimestamp(savedTimestamp);

                    if (deepLinkTagId) {
                        setTimeout(() => {
                            navigation.goBack();
                        }, 2000);
                    }
                }
            } else {
                setError("No NFC tag detected. Please try again.");
            }
        } catch {
            setError("Failed to scan NFC tag.");
        } finally {
            setLoading(false);
            NfcManager.cancelTechnologyRequest();
        }
    };

    const getRegisteredTagInfo = async (tagId: string) => {
        const q = query(collection(db, "registeredTags"), where("tagId", "==", tagId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return querySnapshot.docs[0].data();
    };

    const saveScanToFirestore = async (tagId: string, tagName: string) => {
        try {
            const timestamp = Timestamp.now();
            await addDoc(collection(db, "logs"), {
                tagId,
                tagName,
                activityType: "General Activity",
                timestamp,
            });
            const formattedTimestamp = new Date(timestamp.toDate()).toLocaleString();
            setMessage("Activity added successfully.");
            return formattedTimestamp;
        } catch {
            setError("Failed to send data to server.");
            return null;
        }
    };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Scanning NFC Tag</Text>
          <Text style={styles.description}>
              Please hold your NFC tag near the phone to scan.{"\n"}
              If the app was opened automatically, scanning will start instantly.
          </Text>

          {loading ? (
            <ActivityIndicator animating={true} size="large" style={styles.loadingIndicator} />
          ) : (
            <>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {tagName && (
                  <Card style={styles.infoCard}>
                      <Card.Content>
                          <Text style={styles.infoText}><Text style={styles.label}>Tag Name:</Text> {tagName}</Text>
                          <Text style={styles.infoText}><Text style={styles.label}>Tag ID:</Text> {tagId}</Text>
                          <Text style={styles.infoText}><Text style={styles.label}>Time:</Text> {timestamp}</Text>
                      </Card.Content>
                  </Card>
                )}
                <Button mode="contained" onPress={scanTag} style={styles.button}>
                    Scan NFC Again
                </Button>
            </>
          )}

          <Snackbar
            visible={!!message}
            onDismiss={() => setMessage(null)}
            duration={2000}
          >
              {message}
          </Snackbar>
      </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'flex-start' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
    description: { fontSize: 16, color: 'gray', textAlign: 'left', marginBottom: 20, lineHeight: 22 },
    infoCard: { marginVertical: 10, padding: 15, backgroundColor: '#ffffff', borderRadius: 10, elevation: 3 },
    infoText: { fontSize: 16, marginVertical: 5, color: '#333' },
    label: { fontWeight: 'bold', color: 'black' },
    errorText: { color: 'red', fontSize: 16, marginBottom: 10, fontWeight: 'bold', lineHeight: 22 },
    button: { marginTop: 20 },
    loadingIndicator: { marginTop: 30 },
});

export default NfcScreenTrash;
