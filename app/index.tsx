import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BenchArea from '../components/BenchArea';
import CourtPlayer from '../components/CourtPlayer';
import GameControls, { InGameSettingsModal } from '../components/GameControls';
import GameFlowSlider from '../components/GameFlowSlider';
import Layout from '../components/Layout';
import RadialMenu from '../components/RadialMenu';
import ScoreBug from '../components/ScoreBug';
import SideGameLog from '../components/SideGameLog';
import StatsBoard from '../components/StatsBoard';
import TeamSelection from '../components/TeamSelection';
import { useGameStore } from '../store/GameStore';

// Main Game Screen Component
export default function GameScreen() {
    const router = useRouter();
    const players = useGameStore(s => s.players);
    const setCourtDimensions = useGameStore(s => s.setCourtDimensions);
    const isGameStarted = useGameStore(s => s.isGameStarted);
    const foulOutPlayerName = useGameStore(s => s.foulOutPlayerName);
    const closeFoulOneAlert = useGameStore(s => s.closeFoulOneAlert);
    const isPanelSwapped = useGameStore(s => s.isPanelSwapped);
    const togglePanelSwap = useGameStore(s => s.togglePanelSwap);
    const resetPositions = useGameStore(s => s.resetPositions);

    const courtPlayers = players.filter(p => p.status === 'ON_COURT');
    const [showStats, setShowStats] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Force RESET positions on mount to ensure updates apply during dev
    React.useEffect(() => {
        if (!isGameStarted) {
            resetPositions();
        }
    }, []);

    // State to track the actual strict 16:9 container dimensions and offset
    const [courtLayout, setCourtLayout] = useState({ width: 0, height: 0, topOffset: 0 });

    const onCourtWrapperLayout = (event: any) => {
        let { width: sectionW, height: sectionH } = event.nativeEvent.layout;
        console.log('[GameScreen] onCourtWrapperLayout:', sectionW, sectionH, Platform.OS);

        // Fallback for Web if layout is 0 (prevents Black Screen)
        if ((!sectionW || sectionW < 10) && Platform.OS === 'web') {
            const win = Dimensions.get('window');
            sectionW = win.width - 400; // Subtract side panels (200 * 2)
            sectionH = win.height * 0.6;
            console.log('[GameScreen] Web Fallback used:', sectionW, sectionH);
        }

        // NBA/FIBA Court Ratio is roughly 1.88 (94ft/50ft) or just under 2:1.
        // User requested "perfectly fit left and right".
        // So we prioritize WIDTH.
        const targetRatio = 1.88;

        let finalW = sectionW;
        let finalH = finalW / targetRatio;

        console.log('[GameScreen] Calculated:', finalW, finalH);

        // Safety: If forcing width makes it taller than container, we might need to rethink, 
        // but user asked for width fit. We'll accept height as is.
        // However, if finalH > sectionH, it might overlap top elements? 
        // But centerPanel is flex:1, so usually tall enough.

        const gap = sectionH - finalH;
        // Offset Logic for ScoreBug (half the gap up from top of court)
        // Since court is bottom aligned, gap is all on top.
        const offset = -(gap / 2);

        if (Math.abs(courtLayout.width - finalW) < 0.5 && Math.abs(courtLayout.height - finalH) < 0.5) return;

        console.log('[GameScreen] Setting Layout:', finalW, finalH, offset);
        setCourtLayout({ width: finalW, height: finalH, topOffset: offset });
        setCourtDimensions(finalW, finalH);
    };

    if (!isGameStarted) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ width: '100%', maxWidth: 1000, height: '100%', maxHeight: 800, backgroundColor: '#111', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' }}>
                    <TeamSelection />
                </View>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1, position: 'relative' }}>
                <Layout>
                    <View style={styles.mainContainer}>
                        {/* Upper Section: Controls | Court | Log */}
                        <View style={styles.upperSection}>

                            {/* Left Panel */}
                            <View style={styles.sidePanelLeft}>
                                {!isPanelSwapped ? <GameControls /> : <SideGameLog />}
                            </View>

                            {/* Center Panel: Court */}
                            <View style={styles.centerCourtPanel} onLayout={onCourtWrapperLayout}>
                                {/* Score Bug - Moved outside court image to stick to top of panel. Top 0 for absolute flush. */}
                                <ScoreBug topOffset={0} />

                                {courtLayout.width > 0 && (
                                    <View style={{ width: courtLayout.width, height: courtLayout.height, position: 'relative' }}>
                                        <ImageBackground
                                            source={require('../assets/court_real.jpg')}
                                            style={{ flex: 1, width: '100%', height: '100%' }}
                                            resizeMode="stretch" // frame is already aspect-correct
                                        >
                                            {/* Render Players */}
                                            {courtPlayers.map(player => (
                                                <CourtPlayer key={player.id} id={player.id} />
                                            ))}
                                        </ImageBackground>
                                    </View>
                                )}
                            </View>

                            {/* Right Panel */}
                            <View style={styles.sidePanelRight}>
                                {isPanelSwapped ? <GameControls /> : <SideGameLog />}
                            </View>
                        </View>

                        {/* Game Flow Slider (Boundary between Court and Bench) */}
                        <GameFlowSlider />

                        {/* Bottom Section: Bench */}
                        <BenchArea />
                    </View>
                </Layout>

                {/* Stats Dashboard Overlay - Conditional Rendering */}
                {showStats && (
                    <View style={styles.statsOverlay}>
                        <View style={styles.statsContent}>
                            <StatsBoard />
                        </View>
                        {/* Close Button within Overlay area for clarity */}
                        <TouchableOpacity
                            style={styles.closeStatsButton}
                            onPress={() => setShowStats(false)}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Settings Modal - Hoisted to App Level */}
                <InGameSettingsModal
                    visible={showSettings}
                    onClose={() => setShowSettings(false)}
                />


                {/* === FLOATING BUTTONS === */}

                {/* 1. Stats Button (Bottom Left) */}
                <TouchableOpacity
                    style={styles.statsButton}
                    activeOpacity={0.8}
                    onPress={() => setShowStats(!showStats)}
                >
                    <Ionicons name={showStats ? "close" : "stats-chart"} size={20} color="white" />
                    <Text style={styles.btnLabel}>통계</Text>
                </TouchableOpacity>



                {/* 3. Panel Swap Button */}
                <TouchableOpacity
                    style={styles.swapButton}
                    activeOpacity={0.8}
                    onPress={togglePanelSwap}
                >
                    <Ionicons name="swap-horizontal" size={20} color="white" />
                    <Text style={styles.btnLabel}>패널</Text>
                </TouchableOpacity>

                {/* 4. Settings Button */}
                <TouchableOpacity
                    style={styles.settingsButton}
                    activeOpacity={0.8}
                    onPress={() => setShowSettings(true)}
                >
                    <Ionicons name="settings-sharp" size={20} color="white" />
                    <Text style={styles.btnLabel}>설정</Text>
                </TouchableOpacity>


                {/* Radial Menu Layer (Global Root Sibling) */}
                <RadialMenu />

                {/* Foul Out Alert & Substitution Overlay */}
                {foulOutPlayerName && (
                    <View style={styles.alertOverlay}>
                        <View style={styles.alertBox}>
                            <Ionicons name="warning" size={48} color="#ef4444" />
                            <Text style={styles.alertTitle}>5반칙 퇴장</Text>
                            <Text style={styles.alertMessage}>
                                <Text style={{ fontWeight: 'bold', color: players.find(p => p.name === foulOutPlayerName)?.team === 'HOME' ? '#ef4444' : '#3b82f6' }}>
                                    {foulOutPlayerName}
                                </Text> 선수가 5반칙으로 퇴장했습니다.
                            </Text>
                            <Text style={styles.alertSubMessage}>교체할 대기 선수를 선택해주세요.</Text>

                            {/* Candidates List */}
                            <ScrollView style={{ maxHeight: 200, width: '100%', marginTop: 10 }}>
                                {players.filter(p => p.team === players.find(x => x.name === foulOutPlayerName)?.team && p.status === 'BENCH' && p.stats.PF < 5).map(p => (
                                    <TouchableOpacity
                                        key={p.id}
                                        style={[styles.candidateBtn, { borderColor: p.team === 'HOME' ? '#ef4444' : '#3b82f6' }]}
                                        onPress={() => useGameStore.getState().substituteSinglePlayer(p.id)}
                                    >
                                        <Text style={styles.candidateText}>#{p.number} {p.name}</Text>
                                    </TouchableOpacity>
                                ))}
                                {players.filter(p => p.team === players.find(x => x.name === foulOutPlayerName)?.team && p.status === 'BENCH' && p.stats.PF < 5).length === 0 && (
                                    <Text style={{ color: '#666', textAlign: 'center', padding: 10 }}>교체할 선수가 없습니다.</Text>
                                )}
                            </ScrollView>

                            {/* Fallback Close if no subs */}
                            {players.filter(p => p.team === players.find(x => x.name === foulOutPlayerName)?.team && p.status === 'BENCH' && p.stats.PF < 5).length === 0 && (
                                <TouchableOpacity style={[styles.alertBtn, { marginTop: 20 }]} onPress={closeFoulOneAlert}>
                                    <Text style={styles.alertBtnText}>확인</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    upperSection: {
        flex: 1,
        flexDirection: 'row',
        zIndex: 1,
    },
    sidePanelLeft: {
        width: 200, // Fixed width for panels
        backgroundColor: '#111',
        zIndex: 2,
    },
    sidePanelRight: {
        width: 200, // Fixed width for panels
        backgroundColor: '#111',
        zIndex: 2,
    },
    centerCourtPanel: {
        flex: 1, // Takes remaining space
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'flex-end', // ALIGN COURT TO BOTTOM TO REMOVE GAP
        zIndex: 1,
    },

    // --- Floating Buttons ---
    statsButton: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        borderRadius: 22,
        width: 44, height: 44,
        justifyContent: 'center', alignItems: 'center',
        zIndex: 9999,
        borderWidth: 1, borderColor: '#60a5fa'
    },
    managerButton: {
        position: 'absolute',
        bottom: 25,
        right: 140,
        backgroundColor: '#0f172a',
        borderRadius: 22,
        width: 44, height: 44,
        justifyContent: 'center', alignItems: 'center',
        zIndex: 9999,
        borderWidth: 1, borderColor: '#475569'
    },
    swapButton: {
        position: 'absolute',
        bottom: 25,
        right: 80,
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        borderRadius: 22,
        width: 44, height: 44,
        justifyContent: 'center', alignItems: 'center',
        zIndex: 9999,
        borderWidth: 1, borderColor: '#60a5fa'
    },
    settingsButton: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        backgroundColor: '#333',
        borderRadius: 22,
        width: 44, height: 44,
        justifyContent: 'center', alignItems: 'center',
        zIndex: 9999,
        borderWidth: 1, borderColor: '#555'
    },

    btnLabel: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 0,
    },

    closeStatsButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#ef4444',
        borderRadius: 8,
    },
    statsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)', // Darker background
        zIndex: 9998, // Below button
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statsContent: {
        width: '95%', // Almost full width
        height: '80%', // Sufficient height
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 10000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        backgroundColor: '#1a1a1a',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        width: 300,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    alertTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 12,
    },
    alertMessage: {
        color: '#ccc',
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    alertSubMessage: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 20,
        textAlign: 'center',
    },
    alertBtn: {
        backgroundColor: '#ef4444',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    alertBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    candidateBtn: {
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
        alignItems: 'center',
    },
    candidateText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
