import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useGameStore } from '../store/GameStore';
import JerseyIcon from './JerseyIcon';

// --- Draggable Bench Player Icon (Jersey Style) ---
const BenchPlayerIcon = ({ player, onDrop }: { player: any, onDrop: (id: string, x: number, y: number) => void }) => {
    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Check if THIS bench player is being hovered by a Court Player
    const { registerBenchDropZone, hoveredBenchPlayerId, checkDragCollision, setHoveredCourtPlayerId } = useGameStore();
    const isHoveredTarget = hoveredBenchPlayerId === player.id;

    const viewRef = React.useRef<View>(null);

    // Register Drop Zone Location on mount/layout
    const updateLayout = () => {
        viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
            // Register this player's screen coordinates as a drop target
            registerBenchDropZone(player.id, { pageX, pageY, width, height });
        });
    };

    // Periodically re-measure to ensure accuracy if layout shifts
    React.useEffect(() => {
        const timer = setTimeout(updateLayout, 1000);
        return () => clearTimeout(timer);
    }, []);

    const checkCollision = (absX: number, absY: number) => {
        const hitId = checkDragCollision(absX, absY, 'COURT', player.id);
        setHoveredCourtPlayerId(hitId);
    };

    const handleDropEnd = (targetId: string | null, absX: number, absY: number) => {
        // Clear hover
        setHoveredCourtPlayerId(null);

        // If HIT, substitute
        if (targetId) {
            onDrop(targetId, absX, absY); // Target is the Court Player found
        }
    };

    // Foul Out Logic
    const isFouledOut = player.stats.PF >= 5;

    const pan = Gesture.Pan()
        .enabled(!isFouledOut) // Disable drag if fouled out
        .onStart(() => {
            isDragging.value = true;
        })
        .onUpdate((event) => {
            translationX.value = event.translationX;
            translationY.value = event.translationY;

            if (event.absoluteX && event.absoluteY) {
                runOnJS(checkCollision)(event.absoluteX, event.absoluteY);
            }
        })
        .onEnd((event) => {
            isDragging.value = false;
            const targetId = useGameStore.getState().hoveredCourtPlayerId;
            translationX.value = withSpring(0);
            translationY.value = withSpring(0);
            runOnJS(handleDropEnd)(targetId, event.absoluteX, event.absoluteY);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value },
            { translateY: translationY.value },
            { scale: isDragging.value ? 1.2 : (withSpring(isHoveredTarget ? 1.4 : 1)) }
        ],
        zIndex: isDragging.value ? 9999 : 1,
        opacity: isFouledOut ? 0.3 : 1, // Dim if fouled out
    }));

    // Jersey Color (Grayscale if fouled out?) -> Opacity handles it mostly.
    const jerseyColor = player.team === 'HOME' ? '#ef4444' : '#3b82f6';

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                ref={viewRef}
                onLayout={updateLayout}
                style={[styles.playerItem, animatedStyle]}
            >
                <View style={[styles.iconWrapper, isFouledOut && { opacity: 0.5 }]}>
                    <JerseyIcon size={48} color={jerseyColor} />
                    <View style={styles.numberOverlay}>
                        <Text style={styles.playerNumber}>{player.number}</Text>
                    </View>
                    {isFouledOut && (
                        <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 6, width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>X</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
            </Animated.View>
        </GestureDetector>
    );
};

const TeamInfoPanel = ({
    teamName, fouls, color, align,
    timeoutsLeft, onCallTimeout,
    isTimeoutActive, timeoutTimeLeft
}: {
    teamName: string, fouls: number, color: string, align: 'left' | 'right',
    timeoutsLeft: number, onCallTimeout: () => void,
    isTimeoutActive: boolean, timeoutTimeLeft: number
}) => (
    <View style={[
        styles.teamInfoPanel,
        align === 'left' ? { marginRight: 10 } : { marginLeft: 10 },
        { borderColor: color }
    ]}>
        <Text style={[styles.teamName, { color }]}>{teamName}</Text>
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>팀파울</Text>
            <Text style={styles.statValue}>{fouls}</Text>
        </View>
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>타임아웃</Text>
            <Text style={styles.statValue}>{timeoutsLeft}</Text>
        </View>

        {/* Timeout Action / Timer */}
        <View style={{ marginTop: 4, width: '100%' }}>
            {isTimeoutActive ? (
                <View style={styles.activeTimeoutBox}>
                    <Text style={styles.timeoutTimer}>{timeoutTimeLeft}초</Text>
                </View>
            ) : (
                <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(onCallTimeout)())}>
                    {/* Using GestureDetector for reliable tap inside absolute/z-index views if needed, 
                        but standard TouchableOpacity works too inside View. 
                        Let's use TouchableOpacity for simplicity first. 
                     */}
                    <TouchableOpacity
                        onPress={onCallTimeout}
                        style={[styles.timeoutBtn, { backgroundColor: color, opacity: timeoutsLeft > 0 ? 1 : 0.5 }]}
                        disabled={timeoutsLeft === 0}
                    >
                        <Text style={styles.timeoutBtnText}>작전타임</Text>
                    </TouchableOpacity>
                </GestureDetector>
            )}
        </View>
    </View>
);

export default function BenchArea() {
    const {
        players, substitutePlayer,
        homeTimeoutsLeft, awayTimeoutsLeft,
        callTimeout, isTimeoutActive, timeoutTimeLeft, activeTimeoutTeam
    } = useGameStore();

    const homeBench = players.filter(p => p.team === 'HOME' && p.status === 'BENCH');
    const awayBench = players.filter(p => p.team === 'AWAY' && p.status === 'BENCH');

    // Calculate Team Fouls (Sum of PF of ALL players in team, on court + bench)
    const homeFouls = players.filter(p => p.team === 'HOME').reduce((sum, p) => sum + p.stats.PF, 0);
    const awayFouls = players.filter(p => p.team === 'AWAY').reduce((sum, p) => sum + p.stats.PF, 0);

    const handleDropAction = (benchId: string, targetCourtId: string | null) => {
        if (targetCourtId) {
            substitutePlayer(benchId, targetCourtId);
        }
    };

    return (
        <View style={styles.container}>
            {/* Center Content with Gap */}
            <View style={styles.centerWrapper}>

                {/* Home Info Panel */}
                <TeamInfoPanel
                    teamName="HOME" fouls={homeFouls} color="#ef4444" align="left"
                    timeoutsLeft={homeTimeoutsLeft}
                    onCallTimeout={() => callTimeout('HOME')}
                    isTimeoutActive={isTimeoutActive && activeTimeoutTeam === 'HOME'}
                    timeoutTimeLeft={timeoutTimeLeft}
                />

                {/* Home Bench (Left Group) */}
                <View style={[styles.benchPanel, { marginRight: 20 }]}>
                    <View style={styles.playersGrid}>
                        {Array.from({ length: 7 }).map((_, i) => {
                            const p = homeBench[i];
                            return p ? (
                                <BenchPlayerIcon key={p.id} player={p} onDrop={(tid, x, y) => handleDropAction(p.id, tid)} />
                            ) : (
                                <View key={`empty-h-${i}`} style={styles.emptySlot} />
                            );
                        })}
                    </View>
                </View>

                {/* Away Bench (Right Group) */}
                <View style={[styles.benchPanel, { marginLeft: 20 }]}>
                    <View style={styles.playersGrid}>
                        {Array.from({ length: 7 }).map((_, i) => {
                            const p = awayBench[i];
                            return p ? (
                                <BenchPlayerIcon key={p.id} player={p} onDrop={(tid, x, y) => handleDropAction(p.id, tid)} />
                            ) : (
                                <View key={`empty-a-${i}`} style={styles.emptySlot} />
                            );
                        })}
                    </View>
                </View>

                {/* Away Info Panel */}
                <TeamInfoPanel
                    teamName="AWAY" fouls={awayFouls} color="#3b82f6" align="right"
                    timeoutsLeft={awayTimeoutsLeft}
                    onCallTimeout={() => callTimeout('AWAY')}
                    isTimeoutActive={isTimeoutActive && activeTimeoutTeam === 'AWAY'}
                    timeoutTimeLeft={timeoutTimeLeft}
                />

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 120,
        width: '100%',
        paddingBottom: 10,
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 50,
    },
    centerWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'visible',
        zIndex: 100,
    },
    teamInfoPanel: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        padding: 8,
        borderWidth: 2,
        minWidth: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 2,
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: 10,
        marginRight: 8,
    },
    statValue: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    benchPanel: {
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        minWidth: 120, // Slightly improved compact width
        overflow: 'visible',
        zIndex: 100,
    },
    playersGrid: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    playerItem: {
        alignItems: 'center',
        width: 60,
    },
    emptySlot: {
        width: 60,
        height: 60,
        borderRadius: 30, // Make it look like a slot
        backgroundColor: 'rgba(255,255,255,0.05)', // Very faint
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: 2,
    },
    numberOverlay: {
        position: 'absolute',
        top: 8,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    playerNumber: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    playerName: {
        color: '#ccc',
        fontSize: 9,
        textAlign: 'center',
    },
    timeoutBtn: {
        marginTop: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeoutBtnText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    activeTimeoutBox: {
        backgroundColor: '#fbbf24',
        borderRadius: 4,
        padding: 4,
        alignItems: 'center',
        marginTop: 4,
    },
    timeoutTimer: {
        color: '#000',
        fontWeight: '900',
        fontSize: 12,
    }
});
