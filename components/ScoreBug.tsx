import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../store/GameStore';

// Helper Component for Bonus/Foul Indicators
const FoulIndicators = ({ count, color }: { count: number, color: string }) => {
    // 5 Dots Limit
    return (
        <View style={styles.foulContainer}>
            {[1, 2, 3, 4, 5].map((i) => {
                const isActive = i <= count;
                return (
                    <View
                        key={i}
                        style={[
                            styles.foulDot,
                            {
                                backgroundColor: isActive ? color : '#444',
                                borderColor: isActive ? color : '#666'
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
};

export default function ScoreBug({ topOffset = 0 }: { topOffset?: number }) {
    const [isPeriodMenuOpen, setIsPeriodMenuOpen] = React.useState(false);
    const {
        homeScore, awayScore,
        homeName, awayName,
        period, timeLeft, shotClock, isPlaying, isShotClockRunning, isTimeoutActive,
        toggleClock, toggleShotClock, resetShotClock, setPeriod, tick,
        players // Need players to calc fouls
    } = useGameStore();

    // Calculate Team Fouls
    const homeFouls = players.filter(p => p.team === 'HOME').reduce((sum, p) => sum + p.stats.PF, 0);
    const awayFouls = players.filter(p => p.team === 'AWAY').reduce((sum, p) => sum + p.stats.PF, 0);

    // Timer Logic - Runs if EITHER clock is active or TIMEOUT is active
    React.useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying || isShotClockRunning || isTimeoutActive) {
            interval = setInterval(() => {
                tick();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isShotClockRunning, isTimeoutActive, tick]);

    const handlePeriodSelect = (p: number) => {
        setPeriod(p);
        setIsPeriodMenuOpen(false);
    };

    const formatPeriod = (p: number) => {
        if (p > 4) return 'OT';
        return `${p}Q`;
    }

    return (
        <View style={[styles.container, { top: topOffset }]} pointerEvents="box-none">
            {/* pointerEvents box-none allows touches to pass through empty areas */}

            <LinearGradient
                colors={['#1a1a1ae6', '#000000e6']}
                style={styles.scoreBoard}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            >
                {/* --- LEFT SIDE: HOME --- */}
                <View style={styles.teamSectionLeft}>
                    {/* Strip */}
                    <View style={[styles.teamColorStrip, { backgroundColor: '#ef4444' }]} />

                    {/* Info (Name + Fouls) */}
                    <View style={styles.teamInfoLeft}>
                        <Text style={styles.teamName} numberOfLines={1}>{homeName}</Text>
                        <FoulIndicators count={homeFouls} color="#ef4444" />
                    </View>

                    {/* Score (Moved Next to Clock) */}
                    <View style={styles.scoreBox}>
                        <LinearGradient colors={['#ffffff', '#e5e5e5']} style={styles.scoreGradient}>
                            <Text style={styles.scoreText}>{homeScore}</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* --- CENTER: CLOCK & PERIOD --- */}
                <View style={[styles.centerInfo, { zIndex: 20 }]}>
                    {/* Period Selector */}
                    <View style={{ position: 'relative', zIndex: 30 }}>
                        <TouchableOpacity
                            style={styles.periodBadge}
                            onPress={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                        >
                            <Text style={styles.periodText}>{formatPeriod(period)}</Text>
                        </TouchableOpacity>

                        {/* Floating Period Menu */}
                        {isPeriodMenuOpen && (
                            <View style={styles.periodMenu}>
                                {[1, 2, 3, 4, 5].map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={styles.periodMenuItem}
                                        onPress={() => handlePeriodSelect(p)}
                                    >
                                        <Text style={[styles.periodMenuText, period === p && { color: '#fbbf24' }]}>
                                            {formatPeriod(p)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Main Clock Toggle */}
                    <TouchableOpacity
                        onPress={toggleClock}
                        activeOpacity={0.7}
                        disabled={isTimeoutActive}
                    >
                        <Text style={[
                            styles.gameClock,
                            !isPlaying && { color: '#fbbf24' },
                            isTimeoutActive && { color: '#666' }
                        ]}>{timeLeft}</Text>
                    </TouchableOpacity>

                    {/* Shot Clock Area */}
                    <View style={styles.shotClockWrapper}>
                        {/* Main Shot Clock Display */}
                        <TouchableOpacity
                            onPress={toggleShotClock}
                            activeOpacity={0.7}
                            style={[
                                styles.shotClockContainer,
                                Number(shotClock) < 5 && styles.shotClockLow,
                                isTimeoutActive && { borderColor: '#444', backgroundColor: '#222' }
                            ]}
                            disabled={isTimeoutActive}
                        >
                            <Text style={[
                                styles.shotClock,
                                !isShotClockRunning && { color: '#ffffff50' },
                                isTimeoutActive && { color: '#666' }
                            ]}>{shotClock}</Text>
                        </TouchableOpacity>

                        {/* Reset Buttons */}
                        <View style={styles.resetButtons}>
                            <TouchableOpacity
                                onPress={() => resetShotClock(14)}
                                style={[styles.resetBtn, isTimeoutActive && { opacity: 0.3 }]}
                                disabled={isTimeoutActive}
                            >
                                <Text style={styles.resetText}>14</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => resetShotClock(24)}
                                style={[styles.resetBtn, isTimeoutActive && { opacity: 0.3 }]}
                                disabled={isTimeoutActive}
                            >
                                <Text style={styles.resetText}>24</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* --- RIGHT SIDE: AWAY --- */}
                <View style={styles.teamSectionRight}>
                    {/* Score (Moved Next to Clock) */}
                    <View style={styles.scoreBox}>
                        <LinearGradient colors={['#ffffff', '#e5e5e5']} style={styles.scoreGradient}>
                            <Text style={styles.scoreText}>{awayScore}</Text>
                        </LinearGradient>
                    </View>

                    {/* Info (Name + Fouls) */}
                    <View style={styles.teamInfoRight}>
                        <Text style={styles.teamName} numberOfLines={1} adjustsFontSizeToFit>{awayName}</Text>
                        <FoulIndicators count={awayFouls} color="#3b82f6" />
                    </View>

                    {/* Strip */}
                    <View style={[styles.teamColorStrip, { backgroundColor: '#3b82f6', marginRight: 0, marginLeft: 12 }]} />
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 100,
        transform: [{ scale: 0.9 }],
    },
    scoreBoard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffffff20',
        minWidth: 800,
        justifyContent: 'center', // Center everything
    },

    // Team Sections
    teamSectionLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 12,
    },
    teamSectionRight: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
    },

    teamColorStrip: {
        width: 4,
        height: 32,
        borderRadius: 2,
        marginRight: 12,
    },

    // Team Info (Name + Dots)
    teamInfoLeft: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    teamInfoRight: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    teamName: {
        color: 'white',
        fontSize: 18, // Reduced to approx 80% of original 20-22
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4, // Space for dots
    },

    // Foul Dots
    foulContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    foulDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
    },

    scoreBox: {
        width: 50,
        height: 40,
        borderRadius: 6,
        overflow: 'hidden',
    },
    scoreGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        color: '#000',
        fontSize: 24,
        fontWeight: '900',
    },
    centerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ffffff15',
        marginHorizontal: 16,
        gap: 16,
    },
    periodBadge: {
        backgroundColor: '#ffffff20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    periodText: {
        color: '#fbbf24',
        fontWeight: 'bold',
        fontSize: 14,
    },
    periodMenu: {
        position: 'absolute',
        top: 30, // Below the badge
        left: -10,
        backgroundColor: '#222',
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: '#444',
        width: 60,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 100, // Ensure menu is above other elements in the card
    },
    periodMenuItem: {
        paddingVertical: 6,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    periodMenuText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    gameClock: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    shotClockWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Gap between Main Display and Reset Buttons
    },
    shotClockContainer: {
        backgroundColor: '#333',
        width: 48, // Fixed width for main clock
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#555',
    },
    shotClockLow: {
        borderColor: '#ef4444',
        backgroundColor: '#450a0a',
    },
    shotClock: {
        color: '#fbbf24',
        fontSize: 22, // Larger font
        fontWeight: 'bold',
    },
    resetButtons: {
        flexDirection: 'row', // Side by side
        gap: 4,
    },
    resetBtn: {
        backgroundColor: '#444',
        width: 24, // Fixed square size for buttons
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#666',
    },
    resetText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold'
    },
});
