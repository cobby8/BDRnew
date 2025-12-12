import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SavedPlayer {
    id: string; // UUID
    teamId: string;
    name: string;
    backNumber: string;
    position?: string; // e.g. 'G', 'F', 'C'
    createdAt: number;
}

export interface SavedTeam {
    id: string; // UUID
    name: string;
    shortName: string; // e.g. GSW
    color: string;
    players: SavedPlayer[];
    createdAt: number;
    updatedAt: number;
}

interface TeamStoreState {
    teams: SavedTeam[];

    // Actions
    addTeam: (name: string, shortName: string, color: string) => void;
    updateTeam: (id: string, updates: Partial<SavedTeam>) => void;
    deleteTeam: (id: string) => void;

    addPlayer: (teamId: string, name: string, backNumber: string, position?: string) => void;
    updatePlayer: (teamId: string, playerId: string, updates: Partial<SavedPlayer>) => void;
    deletePlayer: (teamId: string, playerId: string) => void;
    reorderPlayers: (teamId: string, newPlayers: SavedPlayer[]) => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9);

const storeCreator: StateCreator<TeamStoreState> = (set, get) => ({
    teams: [],

    addTeam: (name, shortName, color) => {
        console.log('[TeamStore] addTeam called:', name, shortName, color);
        set((state) => ({
            teams: [
                ...state.teams,
                {
                    id: generateId(),
                    name,
                    shortName,
                    color,
                    players: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
            ]
        }));
    },

    updateTeam: (id, updates) => set((state) => ({
        teams: state.teams.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
        )
    })),

    deleteTeam: (id) => set((state) => ({
        teams: state.teams.filter(t => t.id !== id)
    })),

    addPlayer: (teamId, name, backNumber, position) => {
        console.log('[TeamStore] addPlayer called:', teamId, name, backNumber);
        set((state) => ({
            teams: state.teams.map(t => {
                if (t.id !== teamId) return t;
                return {
                    ...t,
                    players: [
                        ...t.players,
                        {
                            id: generateId(),
                            teamId,
                            name,
                            backNumber,
                            position,
                            createdAt: Date.now()
                        }
                    ],
                    updatedAt: Date.now()
                };
            })
        }));
    },

    updatePlayer: (teamId, playerId, updates) => set((state) => ({
        teams: state.teams.map(t => {
            if (t.id !== teamId) return t;
            return {
                ...t,
                players: t.players.map(p => p.id === playerId ? { ...p, ...updates } : p),
                updatedAt: Date.now()
            };
        })
    })),

    deletePlayer: (teamId, playerId) => set((state) => ({
        teams: state.teams.map(t => {
            if (t.id !== teamId) return t;
            return {
                ...t,
                players: t.players.filter(p => p.id !== playerId),
                updatedAt: Date.now()
            };
        })
    })),

    reorderPlayers: (teamId, newPlayers) => set((state) => ({
        teams: state.teams.map(t => {
            if (t.id !== teamId) return t;
            return {
                ...t,
                players: newPlayers,
                updatedAt: Date.now()
            };
        })
    })),
});

export const useTeamStore = create<TeamStoreState>()(
    (Platform.OS !== 'web'
        ? persist(storeCreator, {
            name: 'bdr-team-storage',
            storage: createJSONStorage(() => AsyncStorage),
        })
        : storeCreator) as StateCreator<TeamStoreState>
);
