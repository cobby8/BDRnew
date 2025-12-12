import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ManagerLogin() {
    const router = useRouter();

    const handleLogin = () => {
        console.log('Login Button Pressed');
        router.push('/manager/dashboard');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
                <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.center}>
                <Ionicons name="shield-checkmark" size={64} color="#3b82f6" style={{ marginBottom: 20 }} />
                <Text style={styles.title}>관리자 모드</Text>
                <Text style={styles.subtitle}>팀과 선수를 관리하려면 로그인하세요.</Text>

                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginBtnText}>관리자 계정으로 시작하기</Text>
                </TouchableOpacity>

                <Text style={styles.hint}>* 현재는 별도 인증 없이 진입합니다.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 5,
        marginBottom: 40,
    },
    loginBtn: {
        backgroundColor: '#3b82f6',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    loginBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    hint: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 20,
    }
});
