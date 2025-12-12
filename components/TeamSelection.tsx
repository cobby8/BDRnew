import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Player, PlayerStats, useGameStore } from '../store/GameStore';
import { useTeamStore } from '../store/TeamStore';
import JerseyIcon from './JerseyIcon';

// === Sample Data ===
const SAMP_NAMES = [
    "James", "Davis", "Curry", "Durant", "Embiid",
    "Jokic", "Giannis", "Luka", "Tatum", "Booker",
    "Butler", "Lillard", "George", "Leonard", "Mitchell",
    "Fox", "Adebayo", "Sabonis", "Towns", "Gobert",
    "Zion", "Morant", "Young", "Edwards", "Brunson"
];

const generatePool = (count: number) => {
    return SAMP_NAMES.slice(0, count).map((name, i) => ({
        id: `pool_${i}`,
        name: name,
        number: String(Math.floor(Math.random() * 99) + 1).padStart(2, '0'), // 01 ~ 99
        pos: ['G', 'F', 'C'][i % 3]
    }));
};

const INITIAL_STATS: PlayerStats = {
    MIN: '00:00', FGM: 0, FGA: 0, FG_PCT: 0, TPM: 0, TPA: 0, TP_PCT: 0,
    FTM: 0, FTA: 0, FT_PCT: 0, PTS: 0, OREB: 0, DREB: 0, REB: 0,
    AST: 0, STL: 0, BLK: 0, TO: 0, PF: 0, PLUS_MINUS: 0
};

// === Interfaces ===
interface SetupPlayer {
    id: string;
    name: string;
    number: string;
    pos: string;
}

interface TeamRoster {
    starters: (SetupPlayer | null)[];
    bench: (SetupPlayer | null)[];
}

// === Components ===

// Simple Tappable Item for Pool and Roster
const PlayerItem = ({
    player,
    onPress,
    color = '#666',
    isPlaceholder = false
}: {
    player?: SetupPlayer | null,
    onPress?: () => void,
    color?: string,
    isPlaceholder?: boolean
}) => {
    if (isPlaceholder || !player) {
        return <View style={styles.emptySlotCircle} />;
    }

    return (
        <TouchableOpacity style={styles.playerWrapper} onPress={onPress}>
            <View style={styles.jerseyIconContainer}>
                <JerseyIcon size={56} color={color} />
                <Text style={styles.jerseyNumOverlay}>{player.number}</Text>
                <Text style={styles.playerNameInJersey} numberOfLines={1}>{player.name}</Text>
            </View>
        </TouchableOpacity>
    );
};


export default function TeamSelection() {
    const { setPlayers, setTeamNames, setConfig, setTimeLeft, startGame, config } = useGameStore();

    // Steps: 0=Home, 1=Away, 2=Settings
    const [step, setStep] = useState(0);

    // Data
    // Generate and Sort Pool by Number Initially
    const [pool] = useState<SetupPlayer[]>(() =>
        generatePool(25).sort((a, b) => parseInt(a.number) - parseInt(b.number))
    );

    const [homeRoster, setHomeRoster] = useState<TeamRoster>({ starters: Array(5).fill(null), bench: Array(7).fill(null) });
    const [awayRoster, setAwayRoster] = useState<TeamRoster>({ starters: Array(5).fill(null), bench: Array(7).fill(null) });

    const [homeName, setHomeName] = useState('LAKERS');
    const [awayName, setAwayName] = useState('WARRIORS');

    const [settings, setSettings] = useState({
        quarters: '4', minutes: '10', fouls: '5', timeoutsFirst: '2', timeoutsSecond: '3', timeoutDuration: '60'
    });


    // === ACTIONS ===

    // ADD: Tap Pool Item -> Add to first empty slot
    const handleAdd = (player: SetupPlayer) => {
        const currentRoster = step === 0 ? homeRoster : awayRoster;
        const setRoster = step === 0 ? setHomeRoster : setAwayRoster;

        const newStarters = [...currentRoster.starters];
        const newBench = [...currentRoster.bench];

        // 1. Fill Starter
        const emptyStarter = newStarters.findIndex(p => p === null);
        if (emptyStarter !== -1) {
            newStarters[emptyStarter] = player;
            setRoster({ starters: newStarters, bench: newBench });
            return;
        }

        // 2. Fill Bench
        const emptyBench = newBench.findIndex(p => p === null);
        if (emptyBench !== -1) {
            newBench[emptyBench] = player;
            setRoster({ starters: newStarters, bench: newBench });
            return;
        }

        // Full -> Do nothing
    };

    // REMOVE: Tap Roster Item -> Remove
    const handleRemove = (playerId: string) => {
        const currentRoster = step === 0 ? homeRoster : awayRoster;
        const setRoster = step === 0 ? setHomeRoster : setAwayRoster;

        const newStarters = currentRoster.starters.map(p => p?.id === playerId ? null : p);
        const newBench = currentRoster.bench.map(p => p?.id === playerId ? null : p);

        setRoster({ starters: newStarters, bench: newBench });
    };

    // Finalize
    const finalizeGame = () => {
        // Formation Helper
        // Home (Left) Base X: ~42. Away (Right) Base X: ~58.
        // Formation: 1 Center, 2 Wings, 2 Guards.
        const getFormationPos = (index: number, team: 'HOME' | 'AWAY') => {
            const isHome = team === 'HOME';
            // Home (Left): X around 38-42. Away (Right): X around 58-62.
            const baseX = isHome ? 42 : 58;
            const offset = isHome ? -4 : 4; // Shift outwards for wings/guards to form a semi-circle

            // Standard 5-man positions
            switch (index) {
                case 0: return { x: baseX, y: 50 }; // Center
                case 1: return { x: baseX + offset, y: 25 }; // Top Wing
                case 2: return { x: baseX + offset, y: 75 }; // Bottom Wing
                case 3: return { x: baseX + (offset * 0.5), y: 38 }; // High Guard
                case 4: return { x: baseX + (offset * 0.5), y: 62 }; // Low Guard
                default: return { x: baseX, y: 50 }; // Fallback
            }
        };

        const convert = (p: SetupPlayer, team: 'HOME' | 'AWAY', status: 'ON_COURT' | 'BENCH', index: number): Player => {
            let pos = { x: 0, y: 0 };
            if (status === 'ON_COURT') {
                pos = getFormationPos(index, team);
            }

            return {
                id: `${team.toLowerCase()}_${status === 'ON_COURT' ? 's' : 'b'}_${index}`,
                name: p.name, number: p.number, team, status, stats: { ...INITIAL_STATS },
                x: pos.x,
                y: status === 'ON_COURT' ? pos.y : 0,
            };
        };

        const activeHome = homeRoster.starters.filter(p => p !== null).map((p, i) => convert(p!, 'HOME', 'ON_COURT', i));
        const benchHome = homeRoster.bench.filter(p => p !== null).map((p, i) => convert(p!, 'HOME', 'BENCH', i));
        const activeAway = awayRoster.starters.filter(p => p !== null).map((p, i) => convert(p!, 'AWAY', 'ON_COURT', i));
        const benchAway = awayRoster.bench.filter(p => p !== null).map((p, i) => convert(p!, 'AWAY', 'BENCH', i));

        const finalPlayers = [...activeHome, ...benchHome, ...activeAway, ...benchAway];
        setPlayers(finalPlayers); setTeamNames(homeName, awayName);
        setConfig({ ...config, periods: Number(settings.quarters) || 4, minutesPerPeriod: Number(settings.minutes) || 10, teamFoulLimit: Number(settings.fouls) || 5, timeoutsFirstHalf: Number(settings.timeoutsFirst) || 2, timeoutsSecondHalf: Number(settings.timeoutsSecond) || 3, timeoutDuration: Number(settings.timeoutDuration) || 60 });
        setTimeLeft(`${settings.minutes.padStart(2, '0')}:00`);
        startGame();
    };

    const isStepValid = () => {
        if (step === 0) return homeRoster.starters.filter(p => p !== null).length === 5;
        if (step === 1) return awayRoster.starters.filter(p => p !== null).length === 5;
        return true;
    };


    const teamStoreTeams = useTeamStore(state => state.teams);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

    const handleLoadTeam = (teamId: string) => {
        const savedTeam = teamStoreTeams.find(t => t.id === teamId);
        if (!savedTeam) return;

        const currentSetRoster = step === 0 ? setHomeRoster : setAwayRoster;
        const currentSetName = step === 0 ? setHomeName : setAwayName;

        // Auto-assign first 5 to starters, rest to bench
        const newStarters: (SetupPlayer | null)[] = Array(5).fill(null);
        const newBench: (SetupPlayer | null)[] = Array(7).fill(null);

        savedTeam.players.forEach((p, i) => {
            const setupPlayer: SetupPlayer = {
                id: p.id,
                name: p.name,
                number: p.backNumber,
                pos: p.position || 'F'
            };

            if (i < 5) newStarters[i] = setupPlayer;
            else if (i < 12) newBench[i - 5] = setupPlayer;
        });

        currentSetRoster({ starters: newStarters, bench: newBench });
        currentSetName(savedTeam.shortName || savedTeam.name); // Prefer short name if available? Or just Name? Let's use Name for logic, ShortName for display? actually game uses Name.
        setIsLoadModalOpen(false);
    };

    const renderRosterStep = (type: 'HOME' | 'AWAY') => {
        const roster = type === 'HOME' ? homeRoster : awayRoster;
        const color = type === 'HOME' ? '#ef4444' : '#3b82f6';

        const usedIds = new Set([...roster.starters, ...roster.bench].filter(p => p).map(p => p!.id));
        const availablePool = pool
            .filter(p => !usedIds.has(p.id))
            .sort((a, b) => parseInt(a.number) - parseInt(b.number));

        return (
            <View style={styles.stepContainer}>
                {/* Pool (Left) */}
                <View style={styles.poolArea}>
                    <Text style={styles.sectionHeader}>선수 풀 (터치하여 추가)</Text>
                    <ScrollView contentContainerStyle={styles.poolGrid} showsVerticalScrollIndicator={false}>
                        {availablePool.map(p => (
                            <PlayerItem
                                key={p.id}
                                player={p}
                                onPress={() => handleAdd(p)}
                                color={color}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Roster (Right) */}
                <View style={[styles.rosterArea, { borderColor: color }]}>
                    <View style={styles.teamHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={[styles.teamTitle, { color }]}>{type} TEAM</Text>
                            <TouchableOpacity
                                style={{ backgroundColor: '#333', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#555' }}
                                onPress={() => setIsLoadModalOpen(true)}
                            >
                                <Text style={{ color: '#aaa', fontSize: 12 }}>불러오기</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput style={styles.teamNameInput} value={type === 'HOME' ? homeName : awayName} onChangeText={type === 'HOME' ? setHomeName : setAwayName} />
                    </View>

                    {/* Starters */}
                    <Text style={styles.zoneLabel}>선발 라인업 (5명) {roster.starters.filter(x => x).length}/5</Text>
                    <View style={styles.starterZone}>
                        {roster.starters.map((p, i) => (
                            <View key={i} style={styles.slot}>
                                <PlayerItem
                                    player={p}
                                    onPress={p ? () => handleRemove(p.id) : undefined}
                                    color={color}
                                    isPlaceholder={!p}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Bench */}
                    <Text style={styles.zoneLabel}>벤치 멤버 (최대 7명) {roster.bench.filter(x => x).length}</Text>
                    <View style={styles.benchZone}>
                        {roster.bench.map((p, i) => (
                            <View key={i} style={styles.smallSlot}>
                                <PlayerItem
                                    player={p}
                                    onPress={p ? () => handleRemove(p.id) : undefined}
                                    color={color}
                                    isPlaceholder={!p}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Load Team Modal */}
                <Modal visible={isLoadModalOpen} transparent animationType="fade" onRequestClose={() => setIsLoadModalOpen(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={styles.modalTitle}>저장된 팀 불러오기</Text>
                                <TouchableOpacity onPress={() => setIsLoadModalOpen(false)}>
                                    <Text style={{ color: '#888' }}>닫기</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                                {teamStoreTeams.length === 0 ? (
                                    <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>저장된 팀이 없습니다.</Text>
                                ) : (
                                    teamStoreTeams.map(t => (
                                        <TouchableOpacity
                                            key={t.id}
                                            style={[styles.teamLoadItem, { borderLeftColor: t.color || '#3b82f6' }]}
                                            onPress={() => handleLoadTeam(t.id)}
                                        >
                                            <Text style={styles.teamLoadName}>{t.name}</Text>
                                            <Text style={styles.teamLoadInfo}>선수 {t.players.length}명 • {t.shortName}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.wizardHeader}>
                <View style={[styles.stepItem, step >= 0 && styles.activeStep]}><Text style={styles.stepText}>1. HOME</Text></View>
                <View style={[styles.stepLine, step >= 1 && styles.activeLine]} />
                <View style={[styles.stepItem, step >= 1 && styles.activeStep]}><Text style={styles.stepText}>2. AWAY</Text></View>
                <View style={[styles.stepLine, step >= 2 && styles.activeLine]} />
                <View style={[styles.stepItem, step >= 2 && styles.activeStep]}><Text style={styles.stepText}>3. 설정</Text></View>
            </View>

            <View style={styles.content}>
                {step === 0 && renderRosterStep('HOME')}
                {step === 1 && renderRosterStep('AWAY')}
                {step === 2 && (
                    <View style={styles.settingsForm}>
                        <Text style={styles.sectionHeader}>경기 규칙 설정</Text>
                        <View style={styles.row}><Text style={styles.label}>쿼터 수</Text><TextInput style={styles.input} value={settings.quarters} onChangeText={t => setSettings({ ...settings, quarters: t })} /></View>
                        <View style={styles.row}><Text style={styles.label}>쿼터 시간 (분)</Text><TextInput style={styles.input} value={settings.minutes} onChangeText={t => setSettings({ ...settings, minutes: t })} /></View>
                        <View style={styles.row}><Text style={styles.label}>파울 제한</Text><TextInput style={styles.input} value={settings.fouls} onChangeText={t => setSettings({ ...settings, fouls: t })} /></View>
                        <View style={styles.row}><Text style={styles.label}>타임아웃 (전반)</Text><TextInput style={styles.input} value={settings.timeoutsFirst} onChangeText={t => setSettings({ ...settings, timeoutsFirst: t })} /></View>
                        <View style={styles.row}><Text style={styles.label}>타임아웃 (후반)</Text><TextInput style={styles.input} value={settings.timeoutsSecond} onChangeText={t => setSettings({ ...settings, timeoutsSecond: t })} /></View>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                {step > 0 && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                        <Text style={styles.backBtnText}>이전</Text>
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    style={[styles.nextBtn, !isStepValid() && styles.disabledBtn]}
                    disabled={!isStepValid()}
                    onPress={() => step < 2 ? setStep(step + 1) : finalizeGame()}
                >
                    <Text style={styles.nextBtnText}>{step < 2 ? "다음 단계" : "경기 시작"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111', padding: 20 },
    wizardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    stepItem: { width: 80, paddingVertical: 8, borderRadius: 20, backgroundColor: '#333', alignItems: 'center' },
    activeStep: { backgroundColor: '#22c55e' },
    stepText: { color: 'white', fontWeight: 'bold' },
    stepLine: { width: 40, height: 2, backgroundColor: '#333' },
    activeLine: { backgroundColor: '#22c55e' },

    content: { flex: 1 },
    stepContainer: { flex: 1, flexDirection: 'row', gap: 20 },

    poolArea: { flex: 0.4, backgroundColor: '#161616', borderRadius: 8, padding: 10 },
    poolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center', paddingBottom: 20 },

    rosterArea: { flex: 0.6, backgroundColor: '#161616', borderRadius: 8, padding: 20, borderWidth: 2 },

    teamHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
    teamTitle: { fontSize: 24, fontWeight: 'bold' },
    teamNameInput: { backgroundColor: '#000', color: 'white', fontSize: 20, borderBottomWidth: 1, borderColor: '#666', width: 200, textAlign: 'center', padding: 4 },

    zoneLabel: { color: '#888', marginBottom: 10, marginTop: 10, fontWeight: 'bold', fontSize: 14 },
    starterZone: { flexDirection: 'row', justifyContent: 'space-around', height: 130, backgroundColor: '#0a0a0a', borderRadius: 12, alignItems: 'center', padding: 10 },
    benchZone: { flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 12, minHeight: 110, backgroundColor: '#0a0a0a', borderRadius: 12, padding: 12 },

    slot: { width: 80, height: 100, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', backgroundColor: '#111' },
    smallSlot: { width: 60, height: 80, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', backgroundColor: '#111' },

    emptySlotCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222' },

    // Player Item Styles
    playerWrapper: { alignItems: 'center', justifyContent: 'center', width: 70, height: 90 },
    jerseyIconContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    jerseyNumOverlay: { position: 'absolute', color: 'white', fontWeight: 'bold', fontSize: 20, textAlign: 'center', top: 10 },
    playerNameInJersey: { position: 'absolute', bottom: 6, color: 'white', fontSize: 9, fontWeight: 'bold', textAlign: 'center', width: '100%', textShadowColor: 'black', textShadowRadius: 2 },

    settingsForm: { flex: 1, maxWidth: 500, alignSelf: 'center', backgroundColor: '#222', padding: 30, borderRadius: 12 },
    sectionHeader: { color: '#ddd', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    label: { color: '#ccc', fontSize: 14 },
    input: { backgroundColor: '#111', color: 'white', width: 80, textAlign: 'center', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#444' },

    footer: { flexDirection: 'row', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#333' },
    backBtn: { padding: 15, backgroundColor: '#444', borderRadius: 8 },
    backBtnText: { color: 'white', fontWeight: 'bold' },
    nextBtn: { padding: 15, backgroundColor: '#22c55e', borderRadius: 8, minWidth: 150, alignItems: 'center' },
    nextBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    disabledBtn: { backgroundColor: '#1a1a1a', opacity: 0.5 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#1e293b', borderRadius: 12, padding: 20, maxHeight: '80%' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    teamLoadItem: {
        backgroundColor: '#0f172a',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
    },
    teamLoadName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    teamLoadInfo: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
});
