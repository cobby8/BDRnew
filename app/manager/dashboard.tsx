import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ManagerDashboard() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>관리자 대시보드</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>팀 관리</Text>
                {/* Team Management Placeholders */}
                <TouchableOpacity style={styles.card} onPress={() => console.log('Edit Team')}>
                    <Ionicons name="people" size={32} color="#3b82f6" />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>팀 로스터 편집</Text>
                        <Text style={styles.cardDesc}>선수 명단 추가/삭제 및 수정</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#64748b" />
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>경기 설정</Text>
                <TouchableOpacity style={styles.card} onPress={() => console.log('Game Settings')}>
                    <Ionicons name="settings" size={32} color="#10b981" />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>경기 규칙 설정</Text>
                        <Text style={styles.cardDesc}>쿼터 시간, 파울 제한 등 규칙 변경</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#64748b" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconBtn: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
    },
    cardTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardDesc: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 4,
    }
});
