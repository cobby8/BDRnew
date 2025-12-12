import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../store/GameStore';

interface GameLogEditorProps {
    visible: boolean;
    onClose: () => void;
}

export default function GameLogEditor({ visible, onClose }: GameLogEditorProps) {
    const { gameLogs, deleteGameLog } = useGameStore();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>게임 기록 (수정)</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={gameLogs}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 10 }}
                        renderItem={({ item }) => (
                            <View style={[styles.logItem, { borderLeftColor: item.team === 'HOME' ? '#ef4444' : '#3b82f6' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logTime}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
                                    <Text style={styles.logAction}>{item.action}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteGameLog(item.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>기록이 없습니다.</Text>}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: {
        width: '90%', height: '80%', backgroundColor: '#1a1a1a', borderRadius: 12, overflow: 'hidden',
        borderWidth: 1, borderColor: '#333'
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },

    logItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#222',
        marginBottom: 8, padding: 12, borderRadius: 8, borderLeftWidth: 4,
    },
    logTime: { color: '#888', fontSize: 12, marginBottom: 2 },
    logAction: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    deleteBtn: { padding: 8, backgroundColor: 'rgba(255, 68, 68, 0.1)', borderRadius: 6 },

    emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
});
