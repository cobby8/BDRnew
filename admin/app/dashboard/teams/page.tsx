"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Grip, List as ListIcon, Plus, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
    id: number;
    name: string;
    teacherName?: string;
    logoUrl?: string;
    divisionCategory?: string;
    description?: string;
    players?: any[];
    school?: { name: string };
}

const CATEGORIES = [
    { value: "ALL", label: "전체" },
    { value: "Elementary", label: "초등부" },
    { value: "Middle", label: "중등부" },
    { value: "High", label: "고등부" },
    { value: "University", label: "대학부" },
    { value: "Pro", label: "일반부/프로" }
];

export default function TeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            // Adjust URL if backend is on a different port/host
            const res = await fetch("http://localhost:8081/teams");
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

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (team.school?.name && team.school.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "ALL" || team.divisionCategory === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">팀 관리</h1>
                    <p className="text-slate-500 mt-1">등록된 팀과 선수단을 관리합니다.</p>
                </div>
                <Button onClick={() => router.push("/dashboard/teams/new")} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transaction-all hover:-translate-y-0.5">
                    <Plus className="w-4 h-4 mr-2" />
                    새 팀 등록
                </Button>
            </div>

            {/* Controls */}
            <Card className="p-4 border-slate-200 shadow-sm bg-white/50 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                    selectedCategory === cat.value
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="팀 이름, 학교 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white border-slate-200 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex border border-slate-200 rounded-lg bg-white p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                <Grip className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading teams...</div>
            ) : filteredTeams.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">등록된 팀이 없습니다</h3>
                    <p className="text-slate-500">새로운 팀을 등록해보세요.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map(team => (
                        <div
                            key={team.id}
                            onClick={() => router.push(`/dashboard/teams/${team.id}`)}
                            className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform" />

                            <div className="flex items-start justify-between mb-4 relative">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:shadow-md transition-all">
                                    {team.logoUrl ? (
                                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <Users className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold border",
                                    team.divisionCategory === 'Elementary' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                        team.divisionCategory === 'Middle' ? "bg-green-50 text-green-700 border-green-200" :
                                            team.divisionCategory === 'High' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                "bg-slate-50 text-slate-600 border-slate-200"
                                )}>
                                    {CATEGORIES.find(c => c.value === team.divisionCategory)?.label || team.divisionCategory}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{team.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">{team.description || "팀 소개가 없습니다."}</p>

                            <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    <span>선수 {team.players?.length || 0}명</span>
                                </div>
                                {team.teacherName && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        <span>지도자: {team.teacherName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">팀 정보</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">카테고리</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">선수 수</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">지도자</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTeams.map(team => (
                                <tr key={team.id} onClick={() => router.push(`/dashboard/teams/${team.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                                                {team.logoUrl ? (
                                                    <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-blue-600">{team.name}</div>
                                                <div className="text-slate-500 text-xs">{team.school?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            {CATEGORIES.find(c => c.value === team.divisionCategory)?.label || team.divisionCategory}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{team.players?.length || 0}명</td>
                                    <td className="px-6 py-4 text-slate-600">{team.teacherName || "-"}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600">상세보기</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
