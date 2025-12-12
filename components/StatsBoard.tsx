import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Player, useGameStore } from '../store/GameStore';

const COLUMNS = [
    { label: 'Player', width: 140, key: 'name' },
    { label: 'MIN', width: 50, key: 'stats.MIN' },
    { label: 'PTS', width: 50, key: 'stats.PTS' },
    { label: 'FGM-A', width: 70, key: 'fg' },
    { label: 'FG%', width: 60, key: 'stats.FG_PCT' },
    { label: '3PM-A', width: 70, key: '3p' },
    { label: '3P%', width: 60, key: 'stats.TP_PCT' },
    { label: 'FTM-A', width: 70, key: 'ft' },
    { label: 'FT%', width: 60, key: 'stats.FT_PCT' },
    { label: 'OR', width: 40, key: 'stats.OREB' },
    { label: 'DR', width: 40, key: 'stats.DREB' },
    { label: 'REB', width: 50, key: 'stats.REB' },
    { label: 'AST', width: 50, key: 'stats.AST' },
    { label: 'STL', width: 50, key: 'stats.STL' },
    { label: 'BLK', width: 50, key: 'stats.BLK' },
    { label: 'TO', width: 50, key: 'stats.TO' },
    { label: 'PF', width: 50, key: 'stats.PF' },
    { label: '+/-', width: 50, key: 'stats.PLUS_MINUS' },
];

export default function StatsBoard() {
    const { players, homeName, awayName } = useGameStore();
    const [selectedTeam, setSelectedTeam] = useState<'HOME' | 'AWAY'>('HOME');
    const [isExporting, setIsExporting] = useState(false);
    const viewRef = useRef(null);

    const activeTeamName = selectedTeam === 'HOME' ? homeName : awayName;
    const teamPlayers = players.filter(p => p.team === selectedTeam)
        .sort((a, b) => parseInt(a.number) - parseInt(b.number));

    // Dynamic Constants based on Export Mode
    const bgColor = isExporting ? 'white' : '#1e293b';
    const textColor = isExporting ? 'black' : 'white';
    const subTextColor = isExporting ? '#333' : '#cbd5e1';
    const borderColor = isExporting ? '#ccc' : '#334155';
    const headerBgFn = isExporting ? '#eee' : '#1e293b'; // Header bg
    const highlightColor = '#fbbf24'; // Keep gold/accent even in white mode? Or darker? 
    // User requested "Only table printed". Usually simple black text is best for print.
    const accentText = isExporting ? 'black' : '#fbbf24';

    // Calculate Totals
    const totals = teamPlayers.reduce((acc, p) => ({
        MIN: acc.MIN,
        PTS: acc.PTS + p.stats.PTS,
        FGM: acc.FGM + p.stats.FGM, FGA: acc.FGA + p.stats.FGA,
        TPM: acc.TPM + p.stats.TPM, TPA: acc.TPA + p.stats.TPA,
        FTM: acc.FTM + p.stats.FTM, FTA: acc.FTA + p.stats.FTA,
        OREB: acc.OREB + p.stats.OREB,
        DREB: acc.DREB + p.stats.DREB,
        REB: acc.REB + p.stats.REB,
        AST: acc.AST + p.stats.AST,
        STL: acc.STL + p.stats.STL,
        BLK: acc.BLK + p.stats.BLK,
        TO: acc.TO + p.stats.TO,
        PF: acc.PF + p.stats.PF,
        PLUS_MINUS: acc.PLUS_MINUS + p.stats.PLUS_MINUS,
    }), {
        MIN: "200:00", PTS: 0, FGM: 0, FGA: 0, TPM: 0, TPA: 0, FTM: 0, FTA: 0,
        OREB: 0, DREB: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, PF: 0, PLUS_MINUS: 0
    });

    const totalFgPct = totals.FGA > 0 ? (totals.FGM / totals.FGA * 100) : 0;
    const totalTpPct = totals.TPA > 0 ? (totals.TPM / totals.TPA * 100) : 0;
    const totalFtPct = totals.FTA > 0 ? (totals.FTM / totals.FTA * 100) : 0;

    // --- Print (HTML) ---
    const handlePrint = async () => {
        // Generate HTML Table
        const rowsHtml = teamPlayers.map(p => `
            <tr>
                <td style="text-align: left; padding-left: 10px; font-weight: bold;">#${p.number} ${p.name}</td>
                <td>${p.stats.MIN}</td>
                <td style="font-weight: bold;">${p.stats.PTS}</td>
                <td>${p.stats.FGM}-${p.stats.FGA}</td>
                <td>${p.stats.FG_PCT.toFixed(0)}%</td>
                <td>${p.stats.TPM}-${p.stats.TPA}</td>
                <td>${p.stats.TP_PCT.toFixed(0)}%</td>
                <td>${p.stats.FTM}-${p.stats.FTA}</td>
                <td>${p.stats.FT_PCT.toFixed(0)}%</td>
                <td>${p.stats.OREB}</td>
                <td>${p.stats.DREB}</td>
                <td style="font-weight: bold;">${p.stats.REB}</td>
                <td>${p.stats.AST}</td>
                <td>${p.stats.STL}</td>
                <td>${p.stats.BLK}</td>
                <td>${p.stats.TO}</td>
                <td>${p.stats.PF}</td>
                <td>${p.stats.PLUS_MINUS > 0 ? '+' : ''}${p.stats.PLUS_MINUS}</td>
            </tr>
        `).join('');

        const totalRowHtml = `
            <tr style="background-color: #f3f3f3; font-weight: bold;">
                <td>TOTALS</td>
                <td>-</td>
                <td>${totals.PTS}</td>
                <td>${totals.FGM}-${totals.FGA}</td>
                <td>${totalFgPct.toFixed(0)}%</td>
                <td>${totals.TPM}-${totals.TPA}</td>
                <td>${totalTpPct.toFixed(0)}%</td>
                <td>${totals.FTM}-${totals.FTA}</td>
                <td>${totalFtPct.toFixed(0)}%</td>
                <td>${totals.OREB}</td>
                <td>${totals.DREB}</td>
                <td>${totals.REB}</td>
                <td>${totals.AST}</td>
                <td>${totals.STL}</td>
                <td>${totals.BLK}</td>
                <td>${totals.TO}</td>
                <td>${totals.PF}</td>
                <td>-</td>
            </tr>
        `;

        const html = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                </head>
                <body style="text-align: center; font-family: sans-serif; padding: 20px;">
                    <div style="text-align: left; margin-bottom: 20px;">
                        <h1 style="font-size: 24px; margin: 0;">${activeTeamName}</h1>
                        <p style="margin: 0; font-size: 14px; color: #666;">Game Stats</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background-color: #eee;">
                                ${COLUMNS.map(c => `<th style="border: 1px solid #ccc; padding: 6px;">${c.label}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                            ${totalRowHtml}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        await Print.printAsync({ html });
    };

    // --- Save JPG (ViewShot) ---
    const handleSaveJPG = async () => {
        setIsExporting(true);
        // Wait for render to update styles
        setTimeout(async () => {
            try {
                if (viewRef.current) {
                    const uri = await captureRef(viewRef, {
                        format: 'jpg',
                        quality: 0.9,
                        // If capturing full view, ensure background is opaque white
                    });
                    const uti = 'public.jpeg'; // iOS
                    await Sharing.shareAsync(uri, { dialogTitle: `Save Stats: ${activeTeamName}`, UTI: uti, mimeType: 'image/jpeg' });
                }
            } catch (error) {
                console.error("Snapshot failed", error);
            } finally {
                setIsExporting(false);
            }
        }, 100);
    };

    const renderHeader = () => (
        <View style={[styles.headerRow, isExporting && { backgroundColor: '#eee', borderColor: '#ccc' }]}>
            {COLUMNS.map((col, index) => (
                <Text key={index} style={[styles.headerCell, { width: col.width, color: isExporting ? 'black' : '#cbd5e1' }]}>
                    {col.label}
                </Text>
            ))}
        </View>
    );

    const renderRow = (player: Player) => (
        <View key={player.id} style={[styles.row, isExporting && { borderBottomColor: '#ddd' }]}>
            <Text style={[styles.cell, { width: 140, textAlign: 'left', paddingLeft: 12, fontWeight: 'bold', color: textColor }]} numberOfLines={1}>
                #{player.number} {player.name}
            </Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{player.stats.MIN}</Text>
            <Text style={[styles.cell, { width: 50, color: accentText, fontWeight: 'bold' }]}>{player.stats.PTS}</Text>

            <Text style={[styles.cell, { width: 70, color: textColor }]}>{player.stats.FGM}-{player.stats.FGA}</Text>
            <Text style={[styles.cell, { width: 60, color: subTextColor }]}>{player.stats.FG_PCT.toFixed(0)}%</Text>

            <Text style={[styles.cell, { width: 70, color: textColor }]}>{player.stats.TPM}-{player.stats.TPA}</Text>
            <Text style={[styles.cell, { width: 60, color: subTextColor }]}>{player.stats.TP_PCT.toFixed(0)}%</Text>

            <Text style={[styles.cell, { width: 70, color: textColor }]}>{player.stats.FTM}-{player.stats.FTA}</Text>
            <Text style={[styles.cell, { width: 60, color: subTextColor }]}>{player.stats.FT_PCT.toFixed(0)}%</Text>

            <Text style={[styles.cell, { width: 40, color: textColor }]}>{player.stats.OREB}</Text>
            <Text style={[styles.cell, { width: 40, color: textColor }]}>{player.stats.DREB}</Text>
            <Text style={[styles.cell, { width: 50, fontWeight: 'bold', color: textColor }]}>{player.stats.REB}</Text>

            <Text style={[styles.cell, { width: 50, color: textColor }]}>{player.stats.AST}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{player.stats.STL}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{player.stats.BLK}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{player.stats.TO}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{player.stats.PF}</Text>

            <Text style={[styles.cell, { width: 50, color: player.stats.PLUS_MINUS >= 0 ? (isExporting ? '#166534' : '#34d399') : '#ef4444' }]}>
                {player.stats.PLUS_MINUS > 0 ? '+' : ''}{player.stats.PLUS_MINUS}
            </Text>
        </View>
    );

    const renderTotalRow = () => (
        <View style={[styles.row, styles.totalRow, isExporting && { backgroundColor: '#f9f9f9', borderTopColor: '#ccc' }]}>
            <Text style={[styles.cell, { width: 140, fontWeight: 'bold', color: accentText, textAlign: 'center' }]}>TOTALS</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>-</Text>
            <Text style={[styles.cell, { width: 50, fontWeight: 'bold', color: accentText }]}>{totals.PTS}</Text>

            <Text style={[styles.cell, { width: 70, color: textColor }]}>{totals.FGM}-{totals.FGA}</Text>
            <Text style={[styles.cell, { width: 60, color: accentText }]}>{totalFgPct.toFixed(0)}%</Text>

            <Text style={[styles.cell, { width: 70, color: textColor }]}>{totals.TPM}-{totals.TPA}</Text>
            <Text style={[styles.cell, { width: 60, color: accentText }]}>{totalTpPct.toFixed(0)}%</Text>

            <Text style={[styles.cell, { width: 70, color: textColor }]}>{totals.FTM}-{totals.FTA}</Text>
            <Text style={[styles.cell, { width: 60, color: accentText }]}>{totalFtPct.toFixed(0)}%</Text>

            <Text style={[styles.cell, { width: 40, color: textColor }]}>{totals.OREB}</Text>
            <Text style={[styles.cell, { width: 40, color: textColor }]}>{totals.DREB}</Text>
            <Text style={[styles.cell, { width: 50, fontWeight: 'bold', color: textColor }]}>{totals.REB}</Text>

            <Text style={[styles.cell, { width: 50, color: textColor }]}>{totals.AST}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{totals.STL}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{totals.BLK}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{totals.TO}</Text>
            <Text style={[styles.cell, { width: 50, color: textColor }]}>{totals.PF}</Text>

            <Text style={[styles.cell, { width: 50, color: textColor }]}>-</Text>
        </View>
    );

    const homeColor = '#ef4444';
    const awayColor = '#3b82f6';
    const activeColor = selectedTeam === 'HOME' ? homeColor : awayColor;

    return (
        <View ref={viewRef as any} style={[styles.container, isExporting && { backgroundColor: 'white', shadowOpacity: 0 }]}>
            {/* Header: Controls + Teams */}
            <View style={[styles.headerContainer, isExporting && { justifyContent: 'flex-start', alignItems: 'flex-start', marginVertical: 10 }]}>
                {isExporting ? (
                    // Print Header: Team Name (Top Left)
                    <View style={{ marginBottom: 10, paddingLeft: 10 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{activeTeamName}</Text>
                        <Text style={{ fontSize: 14, color: '#666' }}>GAME STATS</Text>
                    </View>
                ) : (
                    // Regular UI Tabs
                    <View style={[styles.tabContainer]}>
                        <View style={[styles.tabs, { borderColor: activeColor }]}>
                            <TouchableOpacity
                                style={[styles.tab, selectedTeam === 'HOME' && { backgroundColor: homeColor }]}
                                onPress={() => setSelectedTeam('HOME')}
                            >
                                <Text style={[styles.tabText, selectedTeam === 'HOME' && { fontWeight: 'bold', color: 'white' }]}>{homeName}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, selectedTeam === 'AWAY' && { backgroundColor: awayColor }]}
                                onPress={() => setSelectedTeam('AWAY')}
                            >
                                <Text style={[styles.tabText, selectedTeam === 'AWAY' && { fontWeight: 'bold', color: 'white' }]}>{awayName}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Export Buttons (Hidden during export to clean up output) */}
                {!isExporting && (
                    <View style={{ flexDirection: 'row', gap: 10, position: 'absolute', right: 0, top: 0 }}>
                        <TouchableOpacity style={styles.exportBtn} onPress={handleSaveJPG}>
                            <Ionicons name="image" size={16} color="white" style={{ marginRight: 6 }} />
                            <Text style={styles.exportBtnText}>JPG 저장</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exportBtn} onPress={handlePrint}>
                            <Ionicons name="print" size={16} color="white" style={{ marginRight: 6 }} />
                            <Text style={styles.exportBtnText}>인쇄</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Table Area */}
            {/* Main horizontal scroll for narrow screens, but table is centered */}
            <ScrollView horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsHorizontalScrollIndicator={false}>
                <View style={styles.tableWrapper}>
                    {renderHeader()}

                    {/* Vertical scroll hidden but enabled to allow totals to be seen on overflow */}
                    <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.tableBody}>
                            {teamPlayers.map(renderRow)}
                            {renderTotalRow()}
                        </View>
                        {/* Add footer padding to ensure bottom row is definitely visible above safe area/borders */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        paddingBottom: 0,
        width: 'auto',
        alignSelf: 'center',
        maxWidth: '95%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    headerContainer: {
        position: 'relative',
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 40,
    },
    exportBtn: {
        flexDirection: 'row',
        backgroundColor: '#334155',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#475569',
    },
    exportBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    tabContainer: {
        alignItems: 'center',
    },
    tabs: {
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        width: 400, // Fixed reasonable width for tabs
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    tableWrapper: {
        // Enforce the centering wrapper
    },
    verticalScroll: {
        // Allow vertical scroll if height is constrained
        flexGrow: 1,
    },
    headerRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#475569',
        backgroundColor: '#1e293b', // Default
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        alignItems: 'center',
    },
    totalRow: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopWidth: 2,
        borderTopColor: '#64748b',
        marginTop: 0,
        paddingVertical: 14,
    },
    headerCell: {
        color: '#cbd5e1',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cell: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
    },
    tableBody: {
    }
});

