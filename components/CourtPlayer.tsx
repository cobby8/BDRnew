import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'; // Added Platform
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useGameStore } from '../store/GameStore';
import JerseyIcon from './JerseyIcon';

interface Props {
    id: string;
}

export default function CourtPlayer({ id }: Props) {
    const { players, updatePlayerPosition, openMenu, courtDimensions, checkDragCollision, setHoveredBenchPlayerId, substitutePlayer, hoveredCourtPlayerId, registerCourtDropZone, fieldPosition } = useGameStore();
    const player = players.find(p => p.id === id);

    if (!player) return null;

    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const flowX = useSharedValue(0);

    // Sync flowX with fieldPosition
    useEffect(() => {
        const offset = (fieldPosition - 50) * 0.4;
        if (Platform.OS === 'web') {
            flowX.value = offset; // Immediate update for Web (no plugin)
        } else {
            flowX.value = withSpring(offset, { damping: 20, stiffness: 90 });
        }
    }, [fieldPosition]);

    // Scaling when THIS player is target of BENCH DRAG
    const isHoveredTarget = hoveredCourtPlayerId === id;

    const viewRef = useRef<View>(null);
    // Ref for the specific Icon Wrapper to get precise visual center
    const iconRef = useRef<View>(null);

    // Register Drop Zone
    const updateLayout = () => {
        viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
            // Apply Flow Offset to Drop Zone (match visual transform)
            const flowPercent = (fieldPosition - 50) * 0.4;
            const flowPixelOffset = courtDimensions.width * (flowPercent / 100);

            registerCourtDropZone(id, {
                pageX: pageX + flowPixelOffset,
                pageY,
                width,
                height
            });
        });
    };

    useEffect(() => {
        const timer = setTimeout(updateLayout, 500); // Reduced delay for responsiveness
        return () => clearTimeout(timer);
    }, [player.x, player.y, fieldPosition, courtDimensions.width]); // Re-register when slider moves

    // Collision Check Callback
    const handleDragUpdate = (absX: number, absY: number) => {
        const hoveredId = checkDragCollision(absX, absY, 'BENCH', id);
        setHoveredBenchPlayerId(hoveredId);
    };

    // Swap Callback
    const handleDrop = (targetBenchId: string | null, isSwap: boolean, coords?: { x: number, y: number }) => {
        if (targetBenchId && isSwap) {
            substitutePlayer(targetBenchId, id);
        } else {
            // Open Menu Logic (Strict Centering on Icon)
            // We ignore 'coords' (touch position) and always measure the icon's final location
            const openAtIconCenter = () => {
                iconRef.current?.measure((x, y, width, height, pageX, pageY) => {
                    const centerX = pageX + width / 2;
                    // Vertical Adjustment: User requested slightly lower than geometric center
                    // Adding +10px to target the "gut" of the jersey
                    const centerY = pageY + height / 2 + 10;
                    // Add flow offset in PIXELS
                    // flowX is relative offset based on slider (already calc'd in effect)
                    // We need to retrieve the current flow X translation value
                    // Since flowX is a SharedValue, reading .value on JS thread during callback might be tricky if not careful, good thing runOnJS allows it?
                    // Actually, measure returns the LAYOUT position (without transform usually).
                    // We need to ADD the transform offset manually.

                    const flowOffset = courtDimensions.width * (flowX.value / 100);
                    const finalCenterX = centerX + flowOffset;

                    openMenu(id, finalCenterX, centerY);
                });
            };

            if (coords) {
                // Drag Drop: Wait for state update & snap animation (50ms)
                setTimeout(openAtIconCenter, 50);
            } else {
                // Tap: Immediate
                openAtIconCenter();
            }
        }
        // Always clear hover state
        setHoveredBenchPlayerId(null);
    };

    const pan = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
        })
        .onUpdate((event) => {
            translationX.value = event.translationX;
            translationY.value = event.translationY;

            if (event.absoluteX && event.absoluteY) {
                runOnJS(handleDragUpdate)(event.absoluteX, event.absoluteY);
            }
        })
        .onEnd((event) => {
            isDragging.value = false;

            const currentHoveredId = useGameStore.getState().hoveredBenchPlayerId;

            if (currentHoveredId) {
                // Perform Swap (Bench Hover)
                translationX.value = withSpring(0);
                translationY.value = withSpring(0);
                runOnJS(handleDrop)(currentHoveredId, true, undefined);
            } else {
                // Move Logic
                if (courtDimensions.width > 0 && courtDimensions.height > 0) {
                    const finalX = player.x + (event.translationX / courtDimensions.width) * 100;
                    const finalY = player.y + (event.translationY / courtDimensions.height) * 100;

                    const clampedX = Math.max(0, Math.min(100, finalX));
                    const clampedY = Math.max(0, Math.min(100, finalY));

                    // 1. Update State
                    runOnJS(updatePlayerPosition)(id, clampedX, clampedY);

                    // 2. IMMEDIATE RESET for visual stability
                    translationX.value = 0;
                    translationY.value = 0;

                    // 3. Open Menu at NEW LOCATION (using event coords)
                    runOnJS(handleDrop)(null, false, { x: event.absoluteX, y: event.absoluteY });
                } else {
                    translationX.value = withSpring(0);
                    translationY.value = withSpring(0);
                }
            }
        });

    const tap = Gesture.Tap()
        .maxDistance(10) // Allow slight movement
        .onEnd((e) => {
            // @ts-ignore
            if (e.numberOfPointers > 1) return;
            runOnJS(handleDrop)(null, false, undefined);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value + (courtDimensions.width * (flowX.value / 100)) }, // Apply flow offset in pixels
            { translateY: translationY.value },
            // Scale if hovered by Bench Player OR if dragging self
            { scale: isDragging.value ? 1.2 : (withSpring(isHoveredTarget ? 1.4 : 1)) }
        ],
        left: `${player.x}%`,
        top: `${player.y}%`,
        position: 'absolute',
        zIndex: isDragging.value ? 1000 : (isHoveredTarget ? 999 : 20)
    }));

    const jerseyColor = player.team === 'HOME' ? '#ef4444' : '#3b82f6';
    const numberColor = 'white';

    const composed = Gesture.Race(tap, pan);

    return (
        <GestureDetector gesture={composed}>
            <Animated.View
                ref={viewRef}
                onLayout={updateLayout}
                style={[styles.playerContainer, animatedStyle]}
            >
                {/* Fallback for Web/Testing: Inner Pressable if Gestures fail */}
                <Pressable
                    onPress={() => {
                        runOnJS(handleDrop)(null, false, undefined);
                    }}
                    style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                >
                    <View ref={iconRef} style={styles.iconWrapper}>
                        <JerseyIcon size={48} color={jerseyColor} />
                        <View style={styles.numberOverlay}>
                            <Text style={[styles.playerNumber, { color: numberColor }]}>{player.number}</Text>
                        </View>
                    </View>
                    <View style={styles.nameBadge}>
                        <Text style={styles.playerName}>{player.name}</Text>
                    </View>
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    playerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        marginLeft: -30,
        marginTop: -30,
        zIndex: 20
    },
    iconWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberOverlay: {
        position: 'absolute',
        top: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    playerNumber: {
        fontSize: 14,
        fontWeight: '900',
        textAlign: 'center',
    },
    nameBadge: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: -4,
    },
    playerName: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    }
});
