"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/constants/countries";
import { AlertTriangle, ArrowLeft, Check, ChevronDown, Edit, Plus, Search, Trash2, Upload, User, UserPlus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];
const YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

interface Player {
    id: number;
    name: string;
    backNumber: number;
    birthDate?: string;
    height?: number;
    weight?: number;
    position?: string;
    profileImageUrl?: string;
    country?: string;
    lastAttended?: string;
    experience?: string;
}

interface Team {
    id: number;
    name: string;
    teacherName?: string;
    logoUrl?: string;
    divisionCategory?: string;
    description?: string;
    players: Player[];
}

export default function TeamDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [team, setTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"CARD" | "LIST">("CARD");

    // Add Player State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newPlayer, setNewPlayer] = useState({
        name: "",
        backNumber: "",
        birthDate: "",
        height: "",
        weight: "",
        position: "",
        country: "",
        lastAttended: "",
        experience: "",
        profileImageUrl: ""
    });
    const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Detail & Delete State
    const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
    const [deleteState, setDeleteState] = useState<{
        isOpen: boolean;
        step: "CONFIRM" | "PASSWORD";
        playerId: number | null;
        passwordInput: string;
    }>({ isOpen: false, step: "CONFIRM", playerId: null, passwordInput: "" });

    // Edit Team State
    const [isTeamEditOpen, setIsTeamEditOpen] = useState(false);
    const [teamForm, setTeamForm] = useState({
        name: "",
        teacherName: "",
        description: "",
        divisionCategory: ""
    });

    // Filter States
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [isPositionOpen, setIsPositionOpen] = useState(false);

    // Refs for click outside
    const countryRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
                setIsCountryOpen(false);
            }
            if (positionRef.current && !positionRef.current.contains(event.target as Node)) {
                setIsPositionOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchTeam = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/teams/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
                setTeamForm({
                    name: data.name,
                    teacherName: data.teacherName || "",
                    description: data.description || "",
                    divisionCategory: data.divisionCategory || ""
                });
            }
        } catch (error) {
            console.error("Failed to fetch team", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [params.id]);

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", newPlayer.name);
        formData.append("backNumber", newPlayer.backNumber || "0");
        if (newPlayer.birthDate) formData.append("birthDate", newPlayer.birthDate);
        if (newPlayer.height) formData.append("height", newPlayer.height);
        if (newPlayer.weight) formData.append("weight", newPlayer.weight);
        if (newPlayer.position) formData.append("position", newPlayer.position);
        if (newPlayer.country) formData.append("country", newPlayer.country);
        if (newPlayer.lastAttended) formData.append("lastAttended", newPlayer.lastAttended);
        if (newPlayer.experience) formData.append("experience", newPlayer.experience);
        if (profileImageFile) formData.append("profileImage", profileImageFile);

        try {
            const url = editingPlayerId
                ? `http://localhost:8081/teams/${params.id}/players/${editingPlayerId}`
                : `http://localhost:8081/teams/${params.id}/players`;

            const method = editingPlayerId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                body: formData,
            });

            if (res.ok) {
                setIsAddOpen(false);
                setNewPlayer({
                    name: "", backNumber: "", birthDate: "",
                    height: "", weight: "", position: "",
                    country: "", lastAttended: "", experience: "", profileImageUrl: ""
                });
                setProfileImageFile(null);
                setPreviewUrl(null);
                setEditingPlayerId(null);
                fetchTeam();
            } else {
                const errorText = await res.text();
                alert(`선수 저장 실패: ${errorText}`);
                console.error("Save failed response:", errorText);
            }
        } catch (error) {
            console.error("Failed to save player", error);
            alert("선수 저장 중 오류가 발생했습니다.");
        }
    };

    const handleTeamUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8081/teams/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(teamForm),
            });

            if (res.ok) {
                setIsTeamEditOpen(false);
                fetchTeam();
            }
        } catch (error) {
            console.error("Failed to update team", error);
        }
    };

    const openEditModal = (player: Player) => {
        setNewPlayer({
            name: player.name,
            backNumber: player.backNumber.toString(),
            birthDate: player.birthDate || "",
            height: player.height?.toString() || "",
            weight: player.weight?.toString() || "",
            position: player.position || "",
            country: player.country || "",
            lastAttended: player.lastAttended || "",
            experience: player.experience || "",
            profileImageUrl: player.profileImageUrl || ""
        });
        setPreviewUrl(player.profileImageUrl || null);
        setEditingPlayerId(player.id);
        setIsAddOpen(true);
    };

    const togglePosition = (pos: string) => {
        const current = newPlayer.position ? newPlayer.position.split(", ").filter(Boolean) : [];
        const updated = current.includes(pos)
            ? current.filter(p => p !== pos)
            : [...current, pos];
        setNewPlayer({ ...newPlayer, position: updated.join(", ") });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const initiateDelete = (id: number) => {
        setDeleteState({ isOpen: true, step: "CONFIRM", playerId: id, passwordInput: "" });
    };

    const executeDelete = async () => {
        if (!deleteState.playerId) return;

        // Simple mock password check
        if (deleteState.step === "PASSWORD" && deleteState.passwordInput !== "admin") {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8081/teams/${params.id}/players/${deleteState.playerId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setDeleteState(prev => ({ ...prev, isOpen: false }));
                setViewingPlayer(null);
                fetchTeam();
            } else {
                const errorText = await res.text();
                alert(`삭제 실패: ${errorText}`);
                console.error("Delete failed:", errorText);
            }
        } catch (error) {
            console.error("Failed to delete player", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const calculateBasketballAge = (birthDate?: string) => {
        if (!birthDate) return "-";
        const birthYear = new Date(birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        // Simple logic: U12 = 12 years old turning this year (approx)
        return `U${currentYear - birthYear + 1}`;
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!team) return <div className="p-8">Team not found</div>;

    return (
        <div className="p-8 max-w-[1200px] mx-auto space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <h1 className="text-xl font-bold text-slate-800">팀 상세 정보</h1>
            </div>

            <Card className="p-6 border-slate-200 shadow-sm bg-white overflow-visible">
                <div className="flex items-start gap-6">
                    {/* Logo Placeholder */}
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {team.logoUrl ? (
                            <img src={team.logoUrl} alt="Team Logo" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <User className="w-10 h-10 text-slate-300" />
                        )}
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-600">
                                {team.divisionCategory || "종별 미정"}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{team.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                지도자: <span className="font-medium text-slate-700">{team.teacherName || "-"}</span>
                            </span>
                            <span className="w-px h-3 bg-slate-300"></span>
                            <span>등록 선수: <span className="font-medium text-slate-700">{team.players.length}명</span></span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 h-7 text-xs border-slate-200"
                                onClick={() => setIsTeamEditOpen(true)}
                            >
                                팀 정보 수정
                            </Button>
                        </div>
                        <p className="text-sm text-slate-400 mt-2 line-clamp-1">{team.description || "팀 소개글이 없습니다."}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => {
                                setNewPlayer({
                                    name: "", backNumber: "", birthDate: "",
                                    height: "", weight: "", position: "",
                                    country: "", lastAttended: "", experience: "", profileImageUrl: ""
                                });
                                setProfileImageFile(null);
                                setPreviewUrl(null);
                                setEditingPlayerId(null);
                                setIsAddOpen(true);
                            }}
                            className="bg-[#3182F6] hover:bg-[#1B64DA] text-white shadow-md shadow-blue-500/20"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            선수 등록
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Roster Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">선수 로스터 (Roster)</h3>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("CARD")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'CARD' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                                <div className="bg-current rounded-[1px]"></div>
                            </div>
                            카드 보기
                        </button>
                        <button
                            onClick={() => setViewMode("LIST")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'LIST' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex flex-col gap-0.5 w-3 h-3 justify-center">
                                <div className="h-[2px] w-full bg-current rounded-full"></div>
                                <div className="h-[2px] w-full bg-current rounded-full"></div>
                                <div className="h-[2px] w-full bg-current rounded-full"></div>
                            </div>
                            리스트 보기
                        </button>
                    </div>
                </div>

                {viewMode === 'LIST' ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[12px] font-bold text-slate-500 uppercase">
                            <div className="col-span-1 text-center">No.</div>
                            <div className="col-span-3">이름</div>
                            <div className="col-span-1">포지션</div>
                            <div className="col-span-2">신장/체중</div>
                            <div className="col-span-2">농구 나이</div>
                            <div className="col-span-2">생년월일</div>
                            <div className="col-span-1 text-right">삭제</div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {team.players.map((player) => (
                                <div key={player.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setViewingPlayer(player)}>
                                    <div className="col-span-1 text-center font-mono font-bold text-slate-600 bg-slate-100 rounded py-1 text-sm">
                                        {player.backNumber}
                                    </div>
                                    <div className="col-span-3 font-bold text-slate-800 flex items-center gap-2">
                                        {player.profileImageUrl ? (
                                            <img src={player.profileImageUrl} className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><User className="w-3 h-3 text-white" /></div>
                                        )}
                                        {player.name}
                                    </div>
                                    <div className="col-span-1 text-xs font-bold text-slate-500">
                                        {player.position || "-"}
                                    </div>
                                    <div className="col-span-2 text-xs text-slate-500">
                                        {player.height ? `${player.height}cm` : "-"} / {player.weight ? `${player.weight}kg` : "-"}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[11px] font-bold">
                                            {calculateBasketballAge(player.birthDate)}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-xs text-slate-500">{player.birthDate || "-"}</div>
                                    <div className="col-span-1 text-right">
                                        <button onClick={(e) => { e.stopPropagation(); initiateDelete(player.id); }} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4 ml-auto" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {team.players.map((player) => (
                            <Card
                                key={player.id}
                                className="group relative overflow-hidden bg-white hover:shadow-md transition-all border-slate-200 cursor-pointer"
                                onClick={() => setViewingPlayer(player)}
                            >
                                {/* Back Number Watermark */}
                                <div className="absolute -top-4 -right-2 text-[80px] font-black text-slate-50 opacity-10 leading-none select-none">
                                    {player.backNumber}
                                </div>

                                <div className="p-5 flex flex-col items-center text-center relative z-10">
                                    <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-white shadow-sm mb-3 flex items-center justify-center relative group-hover:scale-105 transition-transform overflow-hidden">
                                        {player.profileImageUrl ? (
                                            <img src={player.profileImageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-slate-300" />
                                        )}
                                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#191F28] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                            {player.position ? player.position.split(',')[0] : "?"}
                                        </div>
                                    </div>

                                    <h4 className="text-base font-bold text-slate-800 mb-0.5">{player.name}</h4>
                                    <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-3">
                                        {calculateBasketballAge(player.birthDate)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-slate-100">
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-400 font-medium">HEIGHT</div>
                                            <div className="text-xs font-bold text-slate-700">{player.height ? `${player.height}cm` : "-"}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-400 font-medium">WEIGHT</div>
                                            <div className="text-xs font-bold text-slate-700">{player.weight ? `${player.weight}kg` : "-"}</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); initiateDelete(player.id); }}
                                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </Card>
                        ))}

                        <button
                            onClick={() => {
                                setNewPlayer({
                                    name: "", backNumber: "", birthDate: "",
                                    height: "", weight: "", position: "",
                                    country: "", lastAttended: "", experience: "", profileImageUrl: ""
                                });
                                setProfileImageFile(null);
                                setPreviewUrl(null);
                                setEditingPlayerId(null);
                                setIsAddOpen(true);
                            }}
                            className="flex flex-col items-center justify-center h-[240px] rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">선수 추가</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Player Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsAddOpen(false)} />
                    <div className="bg-white rounded-2xl p-6 w-[500px] z-50 shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-[#191F28] mb-6">{editingPlayerId ? "선수 정보 수정" : "선수 등록"}</h2>
                        <form onSubmit={handleAddPlayer} className="space-y-5">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">이름</label>
                                    <Input
                                        className="bg-slate-50 border-slate-200 h-11"
                                        value={newPlayer.name}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">등번호(백넘버)</label>
                                    <Input
                                        type="number"
                                        className="bg-slate-50 border-slate-200 text-center h-11"
                                        value={newPlayer.backNumber}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, backNumber: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">신장 (cm)</label>
                                    <Input
                                        type="number"
                                        className="bg-slate-50 border-slate-200 h-11"
                                        value={newPlayer.height}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">체중 (kg)</label>
                                    <Input
                                        type="number"
                                        className="bg-slate-50 border-slate-200 h-11"
                                        value={newPlayer.weight}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                                    />
                                </div>
                                <div ref={positionRef} className="relative">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">포지션</label>
                                    <div
                                        className="flex items-center justify-between h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm cursor-pointer hover:bg-slate-100"
                                        onClick={() => setIsPositionOpen(!isPositionOpen)}
                                    >
                                        <span className={newPlayer.position ? "text-slate-900" : "text-slate-400"}>
                                            {newPlayer.position || "선택"}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </div>
                                    {isPositionOpen && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 p-2">
                                            {POSITIONS.map(pos => (
                                                <div
                                                    key={pos}
                                                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                                                    onClick={() => togglePosition(pos)}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${newPlayer.position?.includes(pos) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                                        {newPlayer.position?.includes(pos) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{pos}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div ref={countryRef} className="relative">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">국적</label>
                                    <div
                                        className="flex items-center justify-between h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm cursor-pointer hover:bg-slate-100"
                                        onClick={() => setIsCountryOpen(!isCountryOpen)}
                                    >
                                        <span className={newPlayer.country ? "truncate pr-2" : "text-slate-400 truncate pr-2"}>
                                            {newPlayer.country || "국적 선택"}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    </div>
                                    {isCountryOpen && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto p-2">
                                            <div className="flex items-center px-2 py-1 mb-2 bg-slate-50 rounded border border-slate-200 sticky top-0">
                                                <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                                                <input
                                                    className="bg-transparent text-sm w-full focus:outline-none"
                                                    placeholder="검색..."
                                                    value={countrySearch}
                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            {COUNTRIES.filter(c => c.label.toLowerCase().includes(countrySearch.toLowerCase())).map(country => (
                                                <div
                                                    key={country.code}
                                                    className="px-2 py-2 text-sm hover:bg-slate-50 rounded cursor-pointer text-slate-700"
                                                    onClick={() => {
                                                        setNewPlayer({ ...newPlayer, country: country.label });
                                                        setIsCountryOpen(false);
                                                        setCountrySearch("");
                                                    }}
                                                >
                                                    {country.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">출신 학교</label>
                                    <Input
                                        className="bg-slate-50 border-slate-200 h-11"
                                        placeholder="BDR고등학교"
                                        value={newPlayer.lastAttended}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, lastAttended: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">생년월일</label>
                                    <Input
                                        type="date"
                                        className="bg-slate-50 border-slate-200 h-11"
                                        value={newPlayer.birthDate}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, birthDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">경력 (시작 연도)</label>
                                    <select
                                        className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newPlayer.experience}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, experience: e.target.value })}
                                    >
                                        <option value="">연도 선택</option>
                                        {YEARS.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Profile Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">프로필 이미지</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    {previewUrl ? (
                                        <div className="relative w-32 h-32">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-full border-4 border-white shadow-sm" />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full shadow-md hover:bg-red-500 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProfileImageFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-slate-400">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600">클릭하여 이미지 업로드</p>
                                            <p className="text-xs text-slate-400 mt-1">또는 파일을 여기로 드래그하세요</p>
                                        </>
                                    )}
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="h-11 px-6">취소</Button>
                                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 h-11 px-6">{editingPlayerId ? "저장" : "등록"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Edit Modal */}
            {isTeamEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsTeamEditOpen(false)} />
                    <div className="bg-white rounded-2xl p-6 w-[500px] z-50 shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-[#191F28] mb-6">팀 정보 수정</h2>
                        <form onSubmit={handleTeamUpdate} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">팀명</label>
                                <Input
                                    className="bg-slate-50 border-slate-200 h-11"
                                    value={teamForm.name}
                                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">지도자</label>
                                <Input
                                    className="bg-slate-50 border-slate-200 h-11"
                                    value={teamForm.teacherName}
                                    onChange={(e) => setTeamForm({ ...teamForm, teacherName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">설명</label>
                                <Input
                                    className="bg-slate-50 border-slate-200 h-11"
                                    value={teamForm.description}
                                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">종별</label>
                                <Input
                                    className="bg-slate-50 border-slate-200 h-11"
                                    value={teamForm.divisionCategory}
                                    onChange={(e) => setTeamForm({ ...teamForm, divisionCategory: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsTeamEditOpen(false)} className="h-11 px-6">취소</Button>
                                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 h-11 px-6">저장</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Player Detail NBA Card Modal */}
            {viewingPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingPlayer(null)} />
                    <div className="bg-white rounded-3xl w-[400px] z-50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative pb-6" onClick={(e) => e.stopPropagation()}>

                        {/* Card Header / Background */}
                        <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => {
                                        setViewingPlayer(null);
                                        openEditModal(viewingPlayer);
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-md transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => initiateDelete(viewingPlayer.id)}
                                    className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-100 hover:text-white backdrop-blur-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={() => setViewingPlayer(null)}
                                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-md transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Player Image & Name */}
                        <div className="flex flex-col items-center -mt-16 px-6">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden mb-4">
                                {viewingPlayer.profileImageUrl ? (
                                    <img src={viewingPlayer.profileImageUrl} alt={viewingPlayer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-slate-800">{viewingPlayer.name}</h2>
                                <div className="text-sm font-bold text-slate-400 mt-1">NO. {viewingPlayer.backNumber} | {viewingPlayer.position}</div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                <div className="bg-slate-50 rounded-xl p-4 text-center">
                                    <div className="text-xs font-bold text-slate-400 mb-1">HEIGHT</div>
                                    <div className="text-lg font-black text-slate-800">{viewingPlayer.height ? `${viewingPlayer.height}cm` : "-"}</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center">
                                    <div className="text-xs font-bold text-slate-400 mb-1">WEIGHT</div>
                                    <div className="text-lg font-black text-slate-800">{viewingPlayer.weight ? `${viewingPlayer.weight}kg` : "-"}</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center">
                                    <div className="text-xs font-bold text-slate-400 mb-1">EXPERIENCE</div>
                                    <div className="text-lg font-black text-slate-800">{viewingPlayer.experience ? `${new Date().getFullYear() - parseInt(viewingPlayer.experience)} Yrs` : "-"}</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center">
                                    <div className="text-xs font-bold text-slate-400 mb-1">AGE (Est)</div>
                                    <div className="text-lg font-black text-slate-800">{viewingPlayer.birthDate ? calculateBasketballAge(viewingPlayer.birthDate) : "-"}</div>
                                </div>
                            </div>

                            <div className="w-full bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">NATIONALITY</span>
                                <span className="text-sm font-bold text-slate-800">{viewingPlayer.country || "Korea, Republic of"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteState.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteState(prev => ({ ...prev, isOpen: false }))} />
                    <div className="bg-white rounded-2xl p-6 w-[400px] z-[60] shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">선수 삭제 확인</h3>

                            {deleteState.step === "CONFIRM" ? (
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    정말 이 선수를 삭제하시겠습니까?<br />
                                    삭제된 선수는 보관함으로 이동합니다.
                                </p>
                            ) : (
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    삭제를 위해 관리자 비밀번호를 입력해주세요.<br />
                                    <span className="text-xs text-slate-400">(초기 비밀번호: admin)</span>
                                </p>
                            )}
                        </div>

                        {deleteState.step === "PASSWORD" && (
                            <div className="mb-6">
                                <Input
                                    type="password"
                                    placeholder="비밀번호 입력"
                                    className="text-center h-11 bg-slate-50"
                                    value={deleteState.passwordInput}
                                    onChange={(e) => setDeleteState(prev => ({ ...prev, passwordInput: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="flex-1 h-11"
                                onClick={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
                            >
                                취소
                            </Button>
                            {deleteState.step === "CONFIRM" ? (
                                <Button
                                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => setDeleteState(prev => ({ ...prev, step: "PASSWORD" }))}
                                >
                                    삭제 진행
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={executeDelete}
                                >
                                    삭제 완료
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
