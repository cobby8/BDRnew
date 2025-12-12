import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../store/GameStore';

// Simple Configuration
const MENU_RADIUS = 120;
const BUTTON_SIZE = 40;

const ACTIONS = [
    { id: '2pt_made', label: '2점 성공', color: '#10b981', icon: null, sub: '+2' },
    { id: '2pt_miss', label: '2점 실패', color: '#ef4444', icon: null },
    { id: '3pt_made', label: '3점 성공', color: '#10b981', icon: null, sub: '+3' },
    { id: '3pt_miss', label: '3점 실패', color: '#ef4444', icon: null },
    { id: 'reb', label: '리바운드', color: '#3b82f6', icon: null },
    { id: 'ast', label: '어시스트', color: '#f59e0b', icon: null },
    { id: 'stl', label: '스틸', color: '#8b5cf6', icon: null },
    { id: 'blk', label: '블록', color: '#6366f1', icon: null },
    { id: 'to', label: '턴오버', color: '#64748b', icon: null },
    { id: 'foul', label: '파울', color: '#ef4444', icon: null },
];

export default function RadialMenu() {
    const { activeMenu, closeMenu, recordStat } = useGameStore();

    if (!activeMenu || !activeMenu.visible) return null;

    const { x, y, playerId } = activeMenu;

    const handleAction = (actionId: any) => {
        let type: any = actionId;
        if (actionId === '2pt_made') type = '2PM';
        if (actionId === '2pt_miss') type = '2PA'; // Miss implies Attempt
        if (actionId === '3pt_made') type = '3PM';
        if (actionId === '3pt_miss') type = '3PA';
        if (actionId === 'foul') type = 'PF';
        if (['reb', 'ast', 'stl', 'blk', 'to'].includes(actionId)) {
            type = actionId.toUpperCase();
        }

        recordStat(playerId, type);
        closeMenu();
    };

    return (
        <React.Fragment>
            {/* Backdrop */}
            <Pressable
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
                onPress={() => closeMenu()}
            />

            {/* Menu Container */}
            <View
                style={[
                    styles.menuContainer,
                    {
                        top: y - MENU_RADIUS,
                        left: x - MENU_RADIUS,
                        width: MENU_RADIUS * 2,
                        height: MENU_RADIUS * 2
                    }
                ]}
                pointerEvents="box-none"
            >
                {ACTIONS.map((action, index) => {
                    const total = ACTIONS.length;
                    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
                    const btnX = MENU_RADIUS + Math.cos(angle) * (MENU_RADIUS * 0.75) - (BUTTON_SIZE / 2);
                    const btnY = MENU_RADIUS + Math.sin(angle) * (MENU_RADIUS * 0.75) - (BUTTON_SIZE / 2);

                    return (
                        <View
                            key={action.id}
                            style={[
                                styles.actionButtonWrapper,
                                {
                                    left: btnX,
                                    top: btnY,
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: action.color }]}
                                onPress={() => handleAction(action.id)}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={[styles.actionText, { fontSize: 10 }]}>{action.label}</Text>
                                    {action.sub && <Text style={[styles.actionText, { fontSize: 8 }]}>{action.sub}</Text>}
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    menuContainer: {
        position: 'absolute',
        zIndex: 1000,
        // backgroundColor: 'rgba(255,0,0,0.1)', // Debug
    },
    actionButtonWrapper: {
        position: 'absolute',
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
