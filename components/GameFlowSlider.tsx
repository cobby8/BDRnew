import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useGameStore } from '../store/GameStore';

export default function GameFlowSlider() {
    const { fieldPosition, setFieldPosition, homeTeamColor, awayTeamColor } = useGameStore();

    const [width, setWidth] = useState(0);
    const translationX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Initial Sync & External Updates
    useEffect(() => {
        // IMPORTANT: Do NOT overwrite translationX while user is dragging.
        // This prevents the "fighting" flicker between gesture logic and store updates.
        if (width > 0 && !isDragging.value) {
            const newX = (fieldPosition / 100) * width;
            translationX.value = withSpring(newX);
        }
    }, [fieldPosition, width]);

    // Update Store
    const updateStore = (x: number) => {
        if (width > 0) {
            const percent = (x / width) * 100;
            setFieldPosition(Math.max(0, Math.min(100, percent)));
        }
    };

    const pan = Gesture.Pan()
        .onStart((e) => {
            isDragging.value = true;

            // Allow tap-to-jump on start
            runOnJS(updateStore)(e.x);
            translationX.value = e.x;
        })
        .onUpdate((e) => {
            let newX = e.x;
            // Bound checks
            if (newX < 0) newX = 0;
            if (newX > width) newX = width;

            translationX.value = newX;
            // Throttle store updates if needed, but runOnJS is okay for now.
            runOnJS(updateStore)(newX);
        })
        .onEnd(() => {
            isDragging.value = false;
        });

    // Thumb Animation (Basketball)
    const thumbStyle = useAnimatedStyle(() => {
        // Rotate based on X position to simulate rolling (0 to 720 degrees across width)
        const rotate = interpolate(translationX.value, [0, width || 1], [0, 720]);

        return {
            transform: [
                { translateX: translationX.value - 30 }, // Center 60px thumb
                { rotate: `${rotate}deg` }
            ]
        };
    });

    // Arrow Visibility Logic
    // Left Arrow (Movement < 45) -> Home (Right side) attacking Left (Own Bench).
    // Arrow Color: Home Color.
    const arrowStyleLeft = useAnimatedStyle(() => ({
        opacity: withSpring(fieldPosition < 45 ? 1 : 0),
        transform: [{ translateX: withRepeat(withSequence(withTiming(-5, { duration: 500 }), withTiming(0, { duration: 500 })), -1, true) }]
    }));

    // Right Arrow (Movement > 55) -> Away (Left side) attacking Right (Own Bench).
    // Arrow Color: Away Color.
    const arrowStyleRight = useAnimatedStyle(() => ({
        opacity: withSpring(fieldPosition > 55 ? 1 : 0),
        transform: [{ translateX: withRepeat(withSequence(withTiming(5, { duration: 500 }), withTiming(0, { duration: 500 })), -1, true) }]
    }));

    return (
        // Wrapper adds minimal vertical space if needed, mainly for centering in parent layout
        <View style={styles.wrapper}>
            {/* 
              WRAP GESTURE DETECTOR AROUND THE CONTAINER 
              This ensures touches anywhere on the bar are caught.
            */}
            <GestureDetector gesture={pan}>
                <View
                    style={styles.container}
                    onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
                >
                    <View style={styles.trackBackground} />

                    {/* Center Label / Arrows */}
                    <View style={styles.centerLabelContainer} pointerEvents="none">
                        <Animated.View style={[styles.arrowContainer, arrowStyleLeft]}>
                            {/* Triple Thicker Arrows (Caret) for Left (Home Attack) */}
                            <Ionicons name="caret-back" size={16} color={homeTeamColor} style={{ marginRight: -12 }} />
                            <Ionicons name="caret-back" size={16} color={homeTeamColor} style={{ marginRight: -12 }} />
                            <Ionicons name="caret-back" size={16} color={homeTeamColor} />
                        </Animated.View>

                        <Text style={styles.centerText}>CENTER</Text>

                        <Animated.View style={[styles.arrowContainer, arrowStyleRight]}>
                            {/* Triple Thicker Arrows (Caret) for Right (Away Attack) */}
                            <Ionicons name="caret-forward" size={16} color={awayTeamColor} />
                            <Ionicons name="caret-forward" size={16} color={awayTeamColor} style={{ marginLeft: -12 }} />
                            <Ionicons name="caret-forward" size={16} color={awayTeamColor} style={{ marginLeft: -12 }} />
                        </Animated.View>
                    </View>

                    {/* Thumb is now just a visual child, not the gesture source */}
                    <Animated.View style={[styles.thumb, thumbStyle]} pointerEvents="none">
                        {/* Basketball Icon */}
                        <View style={styles.ballShadow} />
                        <Ionicons name="basketball" size={28} color="#fbbf24" style={styles.ballIcon} />
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        alignItems: 'center', // Center the slider strip horizontally
        zIndex: 50,
        marginBottom: -1, // Overlap slightly
    },
    container: {
        height: 24,
        width: 450, // Constrain width (approx 6 players * 60px + gaps)
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12, // Rounded pill shape
        overflow: 'visible', // Allow ball to overflow slightly
    },
    trackBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111',
        borderRadius: 12,
    },
    centerLabelContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12, // Space between arrows and text
    },
    centerText: {
        color: '#555',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    arrowContainer: {
        // Animation applied via style
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumb: {
        width: 60,
        height: 60,
        position: 'absolute',
        top: -18, // (24 - 60) / 2 = -18
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        // Larger hit target visual
    },
    ballIcon: {
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    ballShadow: {
        position: 'absolute',
        width: 20, height: 20,
        borderRadius: 10,
        backgroundColor: 'black',
        opacity: 0.5,
        top: 2,
        left: 5, // manual centering adjustment
    }
});
