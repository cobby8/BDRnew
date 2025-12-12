import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../store/GameStore';
import TeamSelection from './TeamSelection';

// === Sub-Component: In-Game Settings Modal (Now Exported) ===
export const InGameSettingsModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
    const { config, setConfig, homeName, awayName, setTeamNames } = useGameStore();

    const [localHomeName, setLocalHomeName] = useState(homeName);
    const [localAwayName, setLocalAwayName] = useState(awayName);
    const [settings, setSettings] = useState({
        quarters: config.periods.toString(),
        minutes: config.minutesPerPeriod.toString(),
        fouls: config.teamFoulLimit.toString(),
        timeoutsFirst: config.timeoutsFirstHalf.toString(),
        timeoutsSecond: config.timeoutsSecondHalf.toString(),
        timeoutsOvertime: (config.timeoutsOvertime || 1).toString(),
        timeoutDuration: (config.timeoutDuration || 60).toString(),
    });

    // Update local state when opening
    useEffect(() => {
        if (visible) {
            setLocalHomeName(homeName);
            setLocalAwayName(awayName);
            setSettings({
                quarters: config.periods.toString(),
                minutes: config.minutesPerPeriod.toString(),
                fouls: config.teamFoulLimit.toString(),
                timeoutsFirst: config.timeoutsFirstHalf.toString(),
                timeoutsSecond: config.timeoutsSecondHalf.toString(),
                timeoutsOvertime: (config.timeoutsOvertime || 1).toString(),
                timeoutDuration: (config.timeoutDuration || 60).toString(),
            });
        }
    }, [visible]);

    const handleSave = () => {
        setTeamNames(localHomeName, localAwayName);
        setConfig({
            periods: Number(settings.quarters) || 4,
            minutesPerPeriod: Number(settings.minutes) || 10,
            teamFoulLimit: Number(settings.fouls) || 5,
            timeoutsFirstHalf: Number(settings.timeoutsFirst) || 2,
            timeoutsSecondHalf: Number(settings.timeoutsSecond) || 3,
            timeoutsOvertime: Number(settings.timeoutsOvertime) || 1,
            timeoutDuration: Number(settings.timeoutDuration) || 60,
        });
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>경기 설정 수정</Text>
                        <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#ccc" /></TouchableOpacity>
                    </View>

                    <ScrollView style={modalStyles.content}>
                        {/* Team Names */}
                        <View style={modalStyles.section}>
                            <Text style={modalStyles.sectionTitle}>팀 이름</Text>
                            <View style={modalStyles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={modalStyles.label}>HOME</Text>
                                    <TextInput style={modalStyles.input} value={localHomeName} onChangeText={setLocalHomeName} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={modalStyles.label}>AWAY</Text>
                                    <TextInput style={modalStyles.input} value={localAwayName} onChangeText={setLocalAwayName} />
                                </View>
                            </View>
                        </View>

                        {/* Rules */}
                        <View style={modalStyles.section}>
                            <Text style={modalStyles.sectionTitle}>규칙 설정</Text>
                            <View style={modalStyles.row}>
                                <View style={modalStyles.field}>
                                    <Text style={modalStyles.label}>쿼터 수</Text>
                                    <TextInput style={modalStyles.input} keyboardType="numeric" value={settings.quarters} onChangeText={t => setSettings({ ...settings, quarters: t })} />
                                </View>
                                <View style={modalStyles.field}>
                                    <Text style={modalStyles.label}>쿼터 시간(분)</Text>
                                    <TextInput style={modalStyles.input} keyboardType="numeric" value={settings.minutes} onChangeText={t => setSettings({ ...settings, minutes: t })} />
                                </View>
                                <View style={modalStyles.field}>
                                    <Text style={modalStyles.label}>팀 파울 제한</Text>
                                    <TextInput style={modalStyles.input} keyboardType="numeric" value={settings.fouls} onChangeText={t => setSettings({ ...settings, fouls: t })} />
                                </View>
                            </View>

                            <Text style={[modalStyles.sectionTitle, { marginTop: 15 }]}>타임아웃 (개수/시간)</Text>
                            <View style={modalStyles.row}>
                                <View style={modalStyles.field}>
                                    <Text style={modalStyles.label}>전반</Text>
                                    <TextInput style={modalStyles.input} keyboardType="numeric" value={settings.timeoutsFirst} onChangeText={t => setSettings({ ...settings, timeoutsFirst: t })} />
                                </View>
                                <View style={modalStyles.field}>
                                    <Text style={modalStyles.label}>후반</Text>
                                    <TextInput style={modalStyles.input} keyboardType="numeric" value={settings.timeoutsSecond} onChangeText={t => setSettings({ ...settings, timeoutsSecond: t })} />
                                </View>
                                <View style={modalStyles.field}>
                                    <Text style={modalStyles.label}>연장</Text>
                                    <TextInput style={modalStyles.input} keyboardType="numeric" value={settings.timeoutsOvertime} onChangeText={t => setSettings({ ...settings, timeoutsOvertime: t })} />
                                </View>
                                <View style={modalStyles.field}>
                                    <Text style={modalStyles.label}>시간(초)</Text>
                                    <TextInput style={modalStyles.input} keyboardType="numeric" value={settings.timeoutDuration} onChangeText={t => setSettings({ ...settings, timeoutDuration: t })} />
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={modalStyles.footer}>
                        <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                            <Text style={modalStyles.btnText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave}>
                            <Text style={modalStyles.btnTextData}>저장하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    container: { width: 500, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333', overflow: 'hidden', maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#222', borderBottomWidth: 1, borderBottomColor: '#333' },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
    row: { flexDirection: 'row', gap: 15 },
    field: { flex: 1 },
    label: { color: '#ccc', fontSize: 12, marginBottom: 5 },
    input: { backgroundColor: '#111', color: 'white', borderWidth: 1, borderColor: '#444', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10, fontSize: 14, textAlign: 'center' },
    footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#333', justifyContent: 'flex-end', gap: 10, backgroundColor: '#222' },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, backgroundColor: '#333' },
    saveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, backgroundColor: '#22c55e' },
    btnText: { color: '#ccc', fontWeight: 'bold' },
    btnTextData: { color: '#fff', fontWeight: 'bold' }
});


// === Sub-Component: Operator Dashboard (Re-used) ===
const OperatorDashboard = () => {
    const {
        timeLeft, setTimeLeft, isPlaying, toggleClock,
        shotClock, isShotClockRunning, toggleShotClock, resetShotClock,
        period, setPeriod, config,
        homeName, awayName, homeTeamColor, awayTeamColor,
        possession, togglePossession,
        players, callTimeout, cancelTimeout, homeTimeoutsLeft, awayTimeoutsLeft,
        isTimeoutActive, activeTimeoutTeam, timeoutTimeLeft, adjustTimeouts,
        adjustScore // New Action
    } = useGameStore();

    // Quarter Confirm State
    const [isQuarterConfirmOpen, setIsQuarterConfirmOpen] = useState(false);

    // Calculate Team Fouls
    const homeFouls = players.filter(p => p.team === 'HOME').reduce((sum, p) => sum + p.stats.PF, 0);
    const awayFouls = players.filter(p => p.team === 'AWAY').reduce((sum, p) => sum + p.stats.PF, 0);

    // Helpers for Time Adjustment
    const adjustTime = (seconds: number) => {
        if (isTimeoutActive) return;
        const [mm, ss] = timeLeft.split(':').map(Number);
        let total = mm * 60 + ss + seconds;
        if (total < 0) total = 0;
        const newMM = Math.floor(total / 60).toString().padStart(2, '0');
        const newSS = (total % 60).toString().padStart(2, '0');
        setTimeLeft(`${newMM}:${newSS}`);
    };

    return (
        <View style={styles.compactContainer}>
            {/* Header (Removed Buttons) */}
            <View style={styles.compactHeader}>
                {/* Empty Header for spacing if needed or just removed */}
            </View>

            {/* 1. Timer Controls */}
            <View style={styles.compactSection}>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                    <TouchableOpacity
                        style={[
                            styles.bigBtn,
                            { backgroundColor: isTimeoutActive ? '#333' : (isPlaying ? '#ef4444' : '#22c55e') }
                        ]}
                        onPress={toggleClock}
                        disabled={isTimeoutActive}
                    >
                        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={isTimeoutActive ? "#666" : "white"} />
                        <Text style={[styles.bigBtnText, isTimeoutActive && { color: '#666' }]}>
                            {isPlaying ? "경기 멈춤" : "경기 시작"}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity disabled={isTimeoutActive} style={[styles.adjBtn, isTimeoutActive && styles.disabledBtn]} onPress={() => adjustTime(-60)}><Text style={styles.adjText}>-1분</Text></TouchableOpacity>
                    <TouchableOpacity disabled={isTimeoutActive} style={[styles.adjBtn, isTimeoutActive && styles.disabledBtn]} onPress={() => adjustTime(-1)}><Text style={styles.adjText}>-1초</Text></TouchableOpacity>
                    <TouchableOpacity disabled={isTimeoutActive} style={[styles.adjBtn, isTimeoutActive && styles.disabledBtn]} onPress={() => adjustTime(1)}><Text style={styles.adjText}>+1초</Text></TouchableOpacity>
                    <TouchableOpacity disabled={isTimeoutActive} style={[styles.adjBtn, isTimeoutActive && styles.disabledBtn]} onPress={() => adjustTime(60)}><Text style={styles.adjText}>+1분</Text></TouchableOpacity>
                </View>
            </View>

            {/* 2. Shot Clock */}
            <View style={styles.compactSection}>
                <Text style={styles.compactTitle}>샷 클락</Text>

                {/* New Toggle Button */}
                <TouchableOpacity
                    style={[
                        styles.bigBtn,
                        { backgroundColor: isShotClockRunning ? '#ef4444' : '#22c55e', marginBottom: 8, paddingVertical: 8 }
                    ]}
                    onPress={toggleShotClock}
                    disabled={isTimeoutActive}
                >
                    <Ionicons name={isShotClockRunning ? "pause-circle" : "play-circle"} size={18} color="white" />
                    <Text style={styles.bigBtnText}>{isShotClockRunning ? "24초 멈춤" : "24초 시작"}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity disabled={isTimeoutActive} style={[styles.midBtn, isTimeoutActive && styles.disabledBtn]} onPress={() => resetShotClock(14)}>
                        <Text style={[styles.midBtnText, isTimeoutActive && { color: '#666' }]}>14초 리셋</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={isTimeoutActive} style={[styles.midBtn, isTimeoutActive && styles.disabledBtn]} onPress={() => resetShotClock(24)}>
                        <Text style={[styles.midBtnText, isTimeoutActive && { color: '#666' }]}>24초 리셋</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 3. Manual Score Control (Refined Layout: +2 +3 / +1 -1) */}
            <View style={styles.compactSection}>
                <Text style={styles.compactTitle}>점수 수동 조절</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>

                    {/* HOME */}
                    <View style={[styles.scoreCtrlBox, { borderColor: homeTeamColor }]}>
                        <Text style={[styles.miniLabel, { color: homeTeamColor, marginBottom: 4 }]}>HOME</Text>
                        <View style={{ gap: 4 }}>
                            {/* Top Row: +2, +3 */}
                            <View style={styles.scoreRow}>
                                <TouchableOpacity onPress={() => adjustScore('HOME', 2)} style={styles.scoreBtn}><Text style={styles.scoreBtnText}>+2</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => adjustScore('HOME', 3)} style={styles.scoreBtn}><Text style={styles.scoreBtnText}>+3</Text></TouchableOpacity>
                            </View>
                            {/* Bottom Row: +1, -1 */}
                            <View style={styles.scoreRow}>
                                <TouchableOpacity onPress={() => adjustScore('HOME', 1)} style={styles.scoreBtn}><Text style={styles.scoreBtnText}>+1</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => adjustScore('HOME', -1)} style={[styles.scoreBtn, { backgroundColor: '#333', borderColor: '#555' }]}><Text style={styles.scoreBtnText}>-1</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* AWAY */}
                    <View style={[styles.scoreCtrlBox, { borderColor: awayTeamColor }]}>
                        <Text style={[styles.miniLabel, { color: awayTeamColor, marginBottom: 4 }]}>AWAY</Text>
                        <View style={{ gap: 4 }}>
                            {/* Top Row: +2, +3 */}
                            <View style={styles.scoreRow}>
                                <TouchableOpacity onPress={() => adjustScore('AWAY', 2)} style={styles.scoreBtn}><Text style={styles.scoreBtnText}>+2</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => adjustScore('AWAY', 3)} style={styles.scoreBtn}><Text style={styles.scoreBtnText}>+3</Text></TouchableOpacity>
                            </View>
                            {/* Bottom Row: +1, -1 */}
                            <View style={styles.scoreRow}>
                                <TouchableOpacity onPress={() => adjustScore('AWAY', 1)} style={styles.scoreBtn}><Text style={styles.scoreBtnText}>+1</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => adjustScore('AWAY', -1)} style={[styles.scoreBtn, { backgroundColor: '#333', borderColor: '#555' }]}><Text style={styles.scoreBtnText}>-1</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>
            </View>

            {/* 4. Game Flow & Possession */}
            <View style={styles.compactSection}>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                    {/* Next Quarter */}
                    <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#333', flex: 1.5 }]} onPress={() => setIsQuarterConfirmOpen(true)}>
                        <Text style={styles.controlBtnText}>다음 쿼터 ({period}Q)</Text>
                    </TouchableOpacity>

                    {/* Court Change Button */}
                    <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#444', flex: 1 }]} onPress={useGameStore.getState().swapSides}>
                        <Text style={styles.controlBtnText}>코트 체인지</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.possRow}>
                    <TouchableOpacity
                        style={[styles.possBtn, possession === 'HOME' && { backgroundColor: homeTeamColor }]}
                        onPress={togglePossession}
                    >
                        <Text style={styles.possText}>HOME</Text>
                        {possession === 'HOME' && <Ionicons name="caret-back" size={14} color="white" />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.possBtn, possession === 'AWAY' && { backgroundColor: awayTeamColor }]}
                        onPress={togglePossession}
                    >
                        {possession === 'AWAY' && <Ionicons name="caret-forward" size={14} color="white" />}
                        <Text style={styles.possText}>AWAY</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 5. Team Controls (Fouls/Timeouts) */}
            <View style={[styles.compactSection, { flex: 1, marginBottom: 0 }]}>
                {/* HOME */}
                <View style={[styles.teamControlBox, { borderColor: homeTeamColor }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={[styles.teamLabel, { color: homeTeamColor }]}>HOME {homeName}</Text>
                        <Text style={[styles.teamLabel, { color: '#ccc' }]}>파울: {homeFouls}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.smBtn,
                            { backgroundColor: (homeTimeoutsLeft > 0 || (isTimeoutActive && activeTimeoutTeam === 'HOME')) ? homeTeamColor : '#333' },
                            isTimeoutActive && activeTimeoutTeam === 'HOME' && { borderWidth: 2, borderColor: '#fff' }
                        ]}
                        onPress={() => isTimeoutActive && activeTimeoutTeam === 'HOME' ? cancelTimeout() : callTimeout('HOME')}
                        disabled={(homeTimeoutsLeft === 0 && !isTimeoutActive) || (isTimeoutActive && activeTimeoutTeam !== 'HOME')}
                    >
                        <Text style={styles.smBtnText}>
                            {isTimeoutActive && activeTimeoutTeam === 'HOME'
                                ? `${timeoutTimeLeft}초 (취소)`
                                : `작전타임 (${homeTimeoutsLeft})`}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, gap: 4 }}>
                        <TouchableOpacity onPress={() => adjustTimeouts('HOME', 1)} style={styles.miniBtn}><Text style={styles.miniText}>+T</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => adjustTimeouts('HOME', -1)} style={styles.miniBtn}><Text style={styles.miniText}>-T</Text></TouchableOpacity>
                    </View>
                </View>

                {/* AWAY */}
                <View style={[styles.teamControlBox, { borderColor: awayTeamColor, marginTop: 8 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={[styles.teamLabel, { color: awayTeamColor }]}>AWAY {awayName}</Text>
                        <Text style={[styles.teamLabel, { color: '#ccc' }]}>파울: {awayFouls}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.smBtn,
                            { backgroundColor: (awayTimeoutsLeft > 0 || (isTimeoutActive && activeTimeoutTeam === 'AWAY')) ? awayTeamColor : '#333' },
                            isTimeoutActive && activeTimeoutTeam === 'AWAY' && { borderWidth: 2, borderColor: '#fff' }
                        ]}
                        onPress={() => isTimeoutActive && activeTimeoutTeam === 'AWAY' ? cancelTimeout() : callTimeout('AWAY')}
                        disabled={(awayTimeoutsLeft === 0 && !isTimeoutActive) || (isTimeoutActive && activeTimeoutTeam !== 'AWAY')}
                    >
                        <Text style={styles.smBtnText}>
                            {isTimeoutActive && activeTimeoutTeam === 'AWAY'
                                ? `${timeoutTimeLeft}초 (취소)`
                                : `작전타임 (${awayTimeoutsLeft})`}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, gap: 4 }}>
                        <TouchableOpacity onPress={() => adjustTimeouts('AWAY', 1)} style={styles.miniBtn}><Text style={styles.miniText}>+T</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => adjustTimeouts('AWAY', -1)} style={styles.miniBtn}><Text style={styles.miniText}>-T</Text></TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Quarter Confirmation Modal */}
            <Modal visible={isQuarterConfirmOpen} transparent={true} animationType="fade" onRequestClose={() => setIsQuarterConfirmOpen(false)}>
                <View style={modalStyles.overlay}>
                    <View style={[modalStyles.container, { width: 320, height: 'auto' }]}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>쿼터 종료 확인</Text>
                        </View>
                        <View style={{ padding: 20 }}>
                            <Text style={{ color: '#ccc', textAlign: 'center', marginBottom: 20 }}>
                                쿼터를 종료하고 기록을 저장 후{'\n'}다음 쿼터로 이동하겠습니까?
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                                <TouchableOpacity
                                    style={[modalStyles.cancelBtn, { flex: 1, alignItems: 'center' }]}
                                    onPress={() => setIsQuarterConfirmOpen(false)}
                                >
                                    <Text style={modalStyles.btnText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[modalStyles.saveBtn, { flex: 1, alignItems: 'center' }]}
                                    onPress={() => {
                                        setPeriod(period < config.periods ? period + 1 : 1);
                                        // Optional: Reset time or other logic could go here if requested later
                                        setIsQuarterConfirmOpen(false);
                                    }}
                                >
                                    <Text style={modalStyles.btnTextData}>확인</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


// === Main Container ===
export default function GameControls() {
    const { isGameStarted } = useGameStore();

    // Initial Setup Mode (Full Wizard)
    if (!isGameStarted) {
        return (
            <View style={styles.container}>
                <View style={styles.tabBar}>
                    <Text style={styles.headerTitle}>게임 준비</Text>
                </View>
                <TeamSelection />
            </View>
        );
    }

    // In-Game Mode (Dashboard Only - Modal Moved to App Level)
    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <Text style={styles.headerTitle}>경기 운영</Text>
            </View>

            <OperatorDashboard />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111', borderRightWidth: 1, borderRightColor: '#333' },
    tabBar: {
        height: 32, // Reduced height (was 48)
        maxHeight: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#222', // Subtler border
        marginBottom: 4,
    },
    headerTitle: { color: '#888', fontWeight: 'bold', fontSize: 10 }, // Matched LIVE LOG style
    // Styles for Dashboard
    compactContainer: { flex: 1, padding: 6, justifyContent: 'space-between', paddingBottom: 6 },
    compactHeader: { flexDirection: 'row', justifyContent: 'flex-end', height: 0, marginBottom: 0, overflow: 'visible', zIndex: 1 },
    compactSection: { marginBottom: 4, backgroundColor: '#1a1a1a', padding: 5, borderRadius: 6 }, // Reduced margin (6->4)
    compactTitle: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
    disabledBtn: { opacity: 0.3 },
    iconBtn: { padding: 4, marginTop: -36, marginRight: 0 },

    bigBtn: { flex: 1, paddingVertical: 6, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }, // Reduced padding (8->6)
    bigBtnText: { color: 'white', fontSize: 13, fontWeight: 'bold' }, // Reduced font size (14->13)

    adjBtn: { flex: 1, backgroundColor: '#333', paddingVertical: 6, borderRadius: 4, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
    adjText: { color: '#ccc', fontSize: 9 },

    midBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#555', backgroundColor: '#333' },
    midBtnText: { color: '#fbbf24', fontWeight: 'bold', fontSize: 11 },

    controlBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#555' },
    controlBtnText: { color: 'white', fontWeight: 'bold', fontSize: 11 },

    possRow: { flexDirection: 'row', marginTop: 4, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    possBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, backgroundColor: '#222', gap: 4 },
    possText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    teamControlBox: { borderWidth: 1, borderRadius: 6, padding: 6, backgroundColor: '#000' },
    teamLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 0 },
    smBtn: { padding: 6, borderRadius: 4, alignItems: 'center' },
    smBtnText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    miniBtn: { padding: 2, paddingHorizontal: 6, backgroundColor: '#333', borderRadius: 4, borderWidth: 1, borderColor: '#555' },
    miniText: { color: '#aaa', fontSize: 8 },

    row: { flexDirection: 'row', gap: 8 },
    rowCenter: { flexDirection: 'row', justifyContent: 'center', gap: 8 },

    // Score Control Styles
    scoreCtrlBox: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 4, backgroundColor: '#111' },
    miniLabel: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 2 },
    scoreBtn: { flex: 1, backgroundColor: '#222', borderRadius: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, borderWidth: 1, borderColor: '#444' },
    scoreBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
