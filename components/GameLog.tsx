import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/GameStore';

export default function GameLog() {
    const { gameLogs } = useGameStore();

    // Reverse logs to show newest first
    const recentLogs = [...gameLogs].reverse();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Game Log</Text>
            <ScrollView style={styles.logList}>
                {recentLogs.length === 0 ? (
                    <Text style={styles.emptyText}>No events yet.</Text>
                ) : (
                    recentLogs.map((log) => (
                        <View key={log.id} style={styles.logItem}>
                            <Text style={styles.timestamp}>
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </Text>
                            <View style={styles.content}>
                                <Text style={styles.actionText}>
                                    <Text style={{ fontWeight: 'bold', color: log.team === 'HOME' ? '#ef4444' : '#3b82f6' }}>
                                        [{log.team}]
                                    </Text>{' '}
                                    {log.action}
                                </Text>
                            </View>
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
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        width: '100%',
        maxWidth: 600,
        maxHeight: 200, // Limit height
    },
    title: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    logList: {
        flex: 1,
    },
    logItem: {
        flexDirection: 'row',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    timestamp: {
        color: '#64748b',
        fontSize: 10,
        marginRight: 8,
        width: 60,
    },
    content: {
        flex: 1,
    },
    actionText: {
        color: '#cbd5e1',
        fontSize: 12,
    },
    emptyText: {
        color: '#64748b',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    }
});
