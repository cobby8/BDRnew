"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, MapPin, MoreHorizontal, Plus, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BracketManager } from "./BracketManager";
import { RosterSelectionStep } from "./components/RosterSelectionStep";
import { TeamSelectionStep } from "./components/TeamSelectionStep";
import { TournamentSettingsDialog } from "./components/TournamentSettingsDialog";

interface Participation {
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    paymentStatus: string;
    team: {
        id: number;
        name: string;
        teacherName: string;
        school?: { name: string };
    };
    division: {
        id: number;
        category: string;
        divisionName: string;
        displayName: string;
    };
    createdAt: string;
}

interface Tournament {
    id: number;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    places: string[];
    divisions: any[];
}

export default function TournamentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [participations, setParticipations] = useState<Participation[]>([]);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TEAMS' | 'BRACKET'>('TEAMS');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Registration Modal State
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [registerStep, setRegisterStep] = useState<1 | 2>(1);
    const [selectedTeam, setSelectedTeam] = useState<{ id: number; name: string } | null>(null);
    const [selectedRosterIds, setSelectedRosterIds] = useState<number[]>([]);

    useEffect(() => {
        fetchTournament();
        fetchParticipations();
    }, []);

    const resetRegistration = () => {
        setIsRegisterOpen(false);
        setRegisterStep(1);
        setSelectedTeam(null);
        setSelectedRosterIds([]);
    };

    const handleRegister = async () => {
        if (!selectedTeam) return;

        try {
            const res = await fetch(`http://localhost:8081/tournaments/${params.id}/registrations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify({
                    teamId: selectedTeam.id,
                    playerIds: selectedRosterIds
                })
            });

            if (res.ok) {
                alert("팀 등록이 완료되었습니다.");
                resetRegistration();
                fetchParticipations();
            } else {
                const errorText = await res.text();
                alert(`등록 실패: ${errorText}`);
            }
        } catch (error) {
            console.error(error);
            alert("오류가 발생했습니다.");
        }
    };

    const fetchTournament = async () => {
        try {
            const res = await fetch(`http://localhost:8081/tournaments/${params.id}`);
            if (res.ok) setTournament(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchParticipations = async () => {
        try {
            const res = await fetch(`http://localhost:8081/participations/tournament/${params.id}`);
            if (res.ok) setParticipations(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const updateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`정말로 ${status === 'APPROVED' ? '승인' : '거절'}하시겠습니까?`)) return;

        try {
            const res = await fetch(`http://localhost:8081/participations/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // toast.success(`상태가 ${status}로 변경되었습니다.`);
                alert(`상태가 ${status}로 변경되었습니다.`);
                fetchParticipations(); // Refresh
            } else {
                alert("실패했습니다.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!tournament) return <div className="p-8">Loading...</div>;

    // Group participations by Division
    const groupedParticipations = participations.reduce((acc, p) => {
        const key = p.division.displayName || p.division.divisionName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
    }, {} as Record<string, Participation[]>);

    return (
        <div className="space-y-6 animate-fade-in-up pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="w-fit text-slate-500 hover:text-slate-900 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    목록으로 돌아가기
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={cn("px-2 py-0.5 text-xs font-bold",
                                tournament.status === 'ACTIVE' ? "bg-green-50 text-green-700 border-green-200" :
                                    tournament.status === 'RECRUITING' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-500")}>
                                {tournament.status}
                            </Badge>
                            <span className="text-slate-400 text-sm">ID: {tournament.id}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">{tournament.name}</h1>
                        <div className="flex items-center gap-4 mt-3 text-slate-500 text-sm">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5" />
                                {new Date(tournament.startDate).toLocaleDateString()} ~ {new Date(tournament.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1.5" />
                                {tournament.places?.join(', ') || '미정'}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>대회 설정 수정</Button>
                        <Button variant="outline">대진표 관리</Button>
                        <Button onClick={() => setIsRegisterOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1.5" />
                            팀 등록
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('TEAMS')}
                        className={cn("py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                            activeTab === 'TEAMS' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300")}
                    >
                        참가팀 관리 ({participations.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('BRACKET')}
                        className={cn("py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                            activeTab === 'BRACKET' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300")}
                    >
                        대진표 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={cn("py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                            activeTab === 'OVERVIEW' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300")}
                    >
                        대회 개요
                    </button>
                </nav>
            </div>

            {/* Content: BRACKET */}
            {activeTab === 'BRACKET' && tournament?.divisions.length > 0 && (
                <div className="space-y-12">
                    {tournament.divisions.map((div: any) => (
                        <div key={div.id}>
                            <h2 className="text-xl font-bold mb-4 pl-2 border-l-4 border-blue-500">{div.displayName || div.divisionName}</h2>
                            <BracketManager divisionId={div.id} />
                        </div>
                    ))}
                </div>
            )}

            {/* Content: TEAMS */}
            {activeTab === 'TEAMS' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 bg-blue-50 border-blue-100">
                            <div className="text-sm text-blue-600 font-medium">총 신청 팀</div>
                            <div className="text-2xl font-bold text-blue-900">{participations.length}</div>
                        </Card>
                        <Card className="p-4 bg-yellow-50 border-yellow-100">
                            <div className="text-sm text-yellow-600 font-medium">승인 대기</div>
                            <div className="text-2xl font-bold text-yellow-900">{participations.filter(p => p.status === 'PENDING').length}</div>
                        </Card>
                        <Card className="p-4 bg-green-50 border-green-100">
                            <div className="text-sm text-green-600 font-medium">신청 승인</div>
                            <div className="text-2xl font-bold text-green-900">{participations.filter(p => p.status === 'APPROVED').length}</div>
                        </Card>
                        <Card className="p-4 bg-red-50 border-red-100">
                            <div className="text-sm text-red-600 font-medium">거절/취소</div>
                            <div className="text-2xl font-bold text-red-900">{participations.filter(p => p.status === 'REJECTED' || p.status === 'CANCELLED').length}</div>
                        </Card>
                    </div>

                    {/* Grouped Lists */}
                    {Object.entries(groupedParticipations).length > 0 ? (
                        Object.entries(groupedParticipations).map(([divName, parts]) => (
                            <Card key={divName} className="overflow-hidden">
                                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">{divName} <span className="text-slate-400 font-normal text-sm ml-2">({parts.length}팀)</span></h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {parts.map((p) => (
                                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-2 h-12 rounded-full",
                                                    p.status === 'APPROVED' ? "bg-green-500" :
                                                        p.status === 'PENDING' ? "bg-yellow-400" : "bg-red-400"
                                                )} />
                                                <div>
                                                    <div className="font-bold text-slate-900 text-lg">{p.team.name}</div>
                                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                                        <span>{p.team.school?.name || '소속 없음'}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span>교사: {p.team.teacherName || '미지정'}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span>신청일: {new Date(p.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className={cn("px-3 py-1 rounded-full text-xs font-bold",
                                                    p.paymentStatus === 'PAID' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {p.paymentStatus === 'PAID' ? '입금완료' : '입금대기'}
                                                </div>

                                                {p.status === 'PENDING' && (
                                                    <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                                        <Button size="sm" onClick={() => updateStatus(p.id, 'APPROVED')} className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none">
                                                            승인
                                                        </Button>
                                                        <div className="w-[1px] bg-slate-200 mx-1 my-1" />
                                                        <Button size="sm" onClick={() => updateStatus(p.id, 'REJECTED')} variant="ghost" className="h-8 text-slate-400 hover:text-red-500 hover:bg-red-50">
                                                            거절
                                                        </Button>
                                                    </div>
                                                )}
                                                {p.status !== 'PENDING' && (
                                                    <span className={cn("text-sm font-bold mr-2",
                                                        p.status === 'APPROVED' ? "text-green-600" : "text-red-500"
                                                    )}>
                                                        {p.status === 'APPROVED' ? "승인됨" : "거절됨"}
                                                    </span>
                                                )}

                                                <Button variant="ghost" size="icon" className="text-slate-300">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                            <Users className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">아직 참가 신청한 팀이 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
            {/* Content: TEAMS (End of existing block) */}

            {/* Registration Modal */}
            <Dialog isOpen={isRegisterOpen} onClose={resetRegistration} title="대회 참가 팀 등록">
                <div className="py-4">
                    {registerStep === 1 && (
                        <TeamSelectionStep
                            onSelect={(team) => {
                                setSelectedTeam(team);
                                setRegisterStep(2);
                            }}
                        />
                    )}

                    {registerStep === 2 && selectedTeam && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                                <div>
                                    <div className="text-xs text-blue-600 font-bold mb-0.5">선택된 팀</div>
                                    <div className="font-bold text-blue-900">{selectedTeam.name}</div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setRegisterStep(1)} className="text-blue-600 hover:text-blue-800">
                                    팀 변경
                                </Button>
                            </div>
                            <RosterSelectionStep
                                teamId={selectedTeam.id}
                                selectedPlayerIds={selectedRosterIds}
                                onChange={setSelectedRosterIds}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-slate-100">
                    {registerStep === 1 ? (
                        <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>취소</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setRegisterStep(1)}>이전</Button>
                            <Button onClick={handleRegister} disabled={selectedRosterIds.length === 0}>
                                등록 완료 ({selectedRosterIds.length}명)
                            </Button>
                        </>
                    )}
                </div>
            </Dialog>

            {tournament && (
                <TournamentSettingsDialog
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    tournament={tournament}
                    onUpdate={fetchTournament}
                />
            )}
        </div>
    );
}
