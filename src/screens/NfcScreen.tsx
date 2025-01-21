import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Start the NFC manager
NfcManager.start();

const NfcScreen = () => {
    const [tagId, setTagId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Scan an NFC tag
    const scanTag = async () => {
        try {
            setLoading(true);
            await NfcManager.requestTechnology(NfcTech.NfcA);
            const tag = await NfcManager.getTag();

            if (tag && tag.id) {
                setTagId(tag.id);
                Alert.alert("Tag Scanned!", `Tag ID: ${tag.id}`);

                // Send data to Firestore
                await sendDataToFirestore(tag.id);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to scan NFC tag.");
        } finally {
            setLoading(false);
            NfcManager.cancelTechnologyRequest();
        }
    };

    //
    const sendDataToFirestore = async (tagId: string) => {
        try {
            await addDoc(collection(db, "logs"), {
                tagId,
                activityType: "Watering",
                timestamp: Timestamp.now(),
            });

            Alert.alert("Success", "Activity logged successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to send data to Firestore.");
        }
    };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Scan an NFC Tag</Text>
          {tagId && <Text style={styles.tagText}>Tag ID: {tagId}</Text>}

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Scan NFC" onPress={scanTag} />
          )}
      </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    tagText: { fontSize: 16, marginVertical: 10, color: "blue" },
});

export default NfcScreen;
