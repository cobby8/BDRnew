"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Team {
    id: number;
    name: string;
    divisionCategory: string;
    logoUrl?: string;
    description?: string;
    updatedAt: string;
}

interface TeamSelectionStepProps {
    onSelect: (team: Team) => void;
}

export function TeamSelectionStep({ onSelect }: TeamSelectionStepProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const url = query
                ? `http://localhost:8081/teams?search=${encodeURIComponent(query)}`
                : `http://localhost:8081/teams`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
            }
        } catch (error) {
            console.error("Failed to fetch teams", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="팀 이름 검색..."
                    className="pl-9"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        // Debounce could be added here
                        // For now, fetchTeams on enter or button click
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && fetchTeams()}
                />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-md p-2 bg-slate-50">
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading...</div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">검색 결과가 없습니다.</div>
                ) : (
                    teams.map((team) => (
                        <div
                            key={team.id}
                            className="bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between group"
                            onClick={() => onSelect(team)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                                    {team.logoUrl ? (
                                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Users className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{team.name}</h4>
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                            {team.divisionCategory}
                                        </Badge>
                                        <span>수정일: {new Date(team.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-blue-600">
                                선택
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
