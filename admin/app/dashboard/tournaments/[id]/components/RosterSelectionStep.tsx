"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

interface Player {
    id: number;
    name: string;
    backNumber: number;
    position?: string;
    profileImageUrl?: string;
}

interface RosterSelectionStepProps {
    teamId: number;
    selectedPlayerIds: number[];
    onChange: (ids: number[]) => void;
}

export function RosterSelectionStep({ teamId, selectedPlayerIds, onChange }: RosterSelectionStepProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRoster();
    }, [teamId]);

    const fetchRoster = async () => {
        setLoading(true);
        try {
            // Assuming this endpoint exists from previous work
            const res = await fetch(`http://localhost:8081/teams/${teamId}/players`);
            if (res.ok) {
                const data = await res.json();
                setPlayers(data);
                // By default select all? Or none? Let's select none.
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePlayer = (id: number) => {
        if (selectedPlayerIds.includes(id)) {
            onChange(selectedPlayerIds.filter(pid => pid !== id));
        } else {
            onChange([...selectedPlayerIds, id]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-sm text-slate-500 font-medium">
                대회에 참가할 선수를 선택하세요 ({selectedPlayerIds.length}명 선택됨)
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                {loading ? (
                    <div className="col-span-2 text-center py-8">Loading roster...</div>
                ) : players.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-slate-400">등록된 선수가 없습니다.</div>
                ) : (
                    players.map((player) => {
                        const isSelected = selectedPlayerIds.includes(player.id);
                        return (
                            <div
                                key={player.id}
                                className={`
                                    relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                    ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-slate-300'}
                                `}
                                onClick={() => togglePlayer(player.id)}
                            >
                                <div className="absolute top-3 right-3 pointer-events-none">
                                    <Checkbox checked={isSelected} />
                                </div>

                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                                    {player.profileImageUrl ? (
                                        <img src={player.profileImageUrl} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900">{player.name}</span>
                                        <Badge variant="outline" className="text-[10px] h-5 px-1 py-0 bg-white">
                                            {player.backNumber}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {player.position || '포지션 미정'}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
