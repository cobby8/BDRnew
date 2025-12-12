import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    useEffect(() => {
        async function lockOrientation() {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        lockOrientation();
    }, []);

    // Calculate generic 16:9 container if we still want that ratio restriction for the *App*,
    // or just full screen logic.
    // The User wants "Court" to not match Bench.
    // Let's make the Layout just a full-screen landscape container.
    // The CHILDREN (index.tsx) will decide sizing effectively.

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <View style={[styles.gameContainer, { width: screenWidth, height: screenHeight }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        width: '100%',
        height: '100%',
    },
});
