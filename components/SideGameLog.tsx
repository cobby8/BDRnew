import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/GameStore';

export default function SideGameLog() {
    const { gameLogs } = useGameStore();

    // Reverse logs to show newest first
    const recentLogs = [...gameLogs].reverse();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>LIVE LOG</Text>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {recentLogs.length === 0 ? (
                    <Text style={styles.emptyText}>-- No Events --</Text>
                ) : (
                    recentLogs.map((log) => (
                        <View key={log.id} style={styles.item}>
                            <Text style={styles.time}>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
                            <Text style={styles.text}>
                                <Text style={{ color: log.team === 'HOME' ? '#ef4444' : '#3b82f6', fontWeight: 'bold' }}>
                                    {log.team === 'HOME' ? 'H' : 'A'}
                                </Text>
                                {' '}{log.action}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
        padding: 5,
        borderLeftWidth: 1,
        borderLeftColor: '#333',
    },
    title: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    item: {
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        paddingBottom: 4,
    },
    time: {
        color: '#555',
        fontSize: 9,
        marginBottom: 2,
    },
    text: {
        color: '#ccc',
        fontSize: 10,
    },
    emptyText: {
        color: '#444',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 10,
    }
});
