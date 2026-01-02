"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Shuffle, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface BracketManagerProps {
    divisionId: number;
}

interface Game {
    id: number;
    stage: 'GROUP' | 'TOURNAMENT';
    groupName: string;
    roundOf: number;
    matchIndex: number;
    homeTeam?: { name: string };
    awayTeam?: { name: string };
    homeScore?: number;
    awayScore?: number;
    status: string;
}

export function BracketManager({ divisionId }: BracketManagerProps) {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [groupCount, setGroupCount] = useState(2); // Default 2 groups

    useEffect(() => {
        fetchGames();
    }, [divisionId]);

    const fetchGames = async () => {
        try {
            const res = await fetch(`http://localhost:8081/games/division/${divisionId}`);
            if (res.ok) setGames(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const generateGroupStage = async () => {
        if (!confirm(`현재 신청 팀을 무작위로 섞어 ${groupCount}개 조로 편성하고 풀리그 대진을 생성합니다.\n진행하시겠습니까?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/games/group-stage/${divisionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify({ groupCount })
            });

            if (res.ok) {
                alert("조편성 및 대진표 생성이 완료되었습니다.");
                fetchGames();
            } else {
                const err = await res.json();
                alert(`실패: ${err.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("네트워크 오류");
        } finally {
            setLoading(false);
        }
    };

    const generateTournamentBracket = async () => {
        if (!confirm("현재 신청 팀으로 싱글 엘리미네이션(토너먼트) 대진표를 생성하시겠습니까?")) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/games/bracket/${divisionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                }
            });

            if (res.ok) {
                alert("토너먼트 대진표가 생성되었습니다.");
                fetchGames();
            } else {
                const err = await res.json();
                alert(`실패: ${err.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("네트워크 오류");
        } finally {
            setLoading(false);
        }
    };

    // Group games by "Group Name"
    const groupGames = games.filter(g => g.stage === 'GROUP').reduce((acc, game) => {
        const key = game.groupName || 'Unassigned';
        if (!acc[key]) acc[key] = [];
        acc[key].push(game);
        return acc;
    }, {} as Record<string, Game[]>);

    // Group tournament games by Round
    const tournamentGames = games.filter(g => g.stage === 'TOURNAMENT').reduce((acc, game) => {
        const key = game.roundOf;
        if (!acc[key]) acc[key] = [];
        acc[key].push(game);
        return acc;
    }, {} as Record<number, Game[]>);

    // Sort rounds descending (Final last or first?) -> Usually Final (2) is at top or bottom.
    // Let's display descending: 16 -> 8 -> 4 -> 2
    const sortedRounds = Object.keys(tournamentGames).map(Number).sort((a, b) => b - a);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Control Panel */}
            <Card className="p-6 bg-slate-50 border-slate-200">
                <div className="flex flex-col gap-6">
                    {/* Group Stage Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">예선 조별리그 설정</h3>
                            <p className="text-slate-500 text-sm">랜덤 조편성 및 풀리그 대진을 자동 생성합니다.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 px-2">
                                <span className="text-sm font-medium text-slate-600">조 개수:</span>
                                <input
                                    type="number"
                                    min={1} max={8}
                                    value={groupCount}
                                    onChange={(e) => setGroupCount(+e.target.value)}
                                    className="w-12 border border-slate-300 rounded px-1 py-0.5 text-center font-bold"
                                />
                            </div>
                            <Button onClick={generateGroupStage} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shuffle className="w-4 h-4 mr-2" />}
                                랜덤 조편성 결과보기
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-slate-200" />

                    {/* Tournament Bracket Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">본선 토너먼트 설정</h3>
                            <p className="text-slate-500 text-sm">싱글 엘리미네이션 대진표를 자동 생성합니다.</p>
                        </div>
                        <Button onClick={generateTournamentBracket} disabled={loading} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Trophy className="w-4 h-4 mr-2" />
                            토너먼트 대진표 생성
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Display Groups */}
            {Object.keys(groupGames).length > 0 && (
                <div>
                    <h3 className="text-lg font-bold mb-4">예선 리그</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(groupGames).map(([groupName, matches]) => (
                            <Card key={groupName} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800">{groupName}조</h4>
                                    <Badge variant="secondary" className="bg-white text-slate-500 text-[10px] px-1.5">{matches.length}경기</Badge>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {matches.map((game) => (
                                        <GameItem key={game.id} game={game} />
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Display Bracket */}
            {sortedRounds.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold mb-4 mt-8">본선 토너먼트</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {sortedRounds.map(round => (
                            <div key={round} className="min-w-[280px]">
                                <h4 className="text-center font-bold text-slate-500 mb-3 block bg-slate-100 rounded py-1 text-sm">
                                    {round === 2 ? '결승 (Final)' : round === 4 ? '4강 (Semi-Final)' : `${round}강`}
                                </h4>
                                <div className="flex flex-col gap-4">
                                    {tournamentGames[round].sort((a, b) => a.matchIndex - b.matchIndex).map(game => (
                                        <Card key={game.id} className="p-3 border-slate-200 shadow-sm">
                                            <div className="text-[10px] text-slate-400 mb-1">Match #{game.matchIndex + 1}</div>
                                            <GameItem game={game} />
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {games.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    대진표가 생성되지 않았습니다. 설정을 완료하고 생성 버튼을 눌러주세요.
                </div>
            )}
        </div >
    );
}

function GameItem({ game }: { game: Game }) {
    return (
        <div className="p-2 flex items-center justify-between text-sm">
            <div className={`flex-1 text-right font-medium truncate pr-2 ${game.homeTeam ? 'text-slate-700' : 'text-slate-400'}`}>
                {game.homeTeam?.name || 'TBD'}
            </div>
            <div className="flex flex-col items-center">
                <div className="text-slate-300 font-bold px-1 text-xs">VS</div>
                <a
                    href={`/dashboard/games/${game.id}/control`}
                    target="_blank"
                    className="text-[10px] text-blue-500 hover:underline mt-1"
                >
                    경기 운영
                </a>
            </div>
            <div className={`flex-1 text-left font-medium truncate pl-2 ${game.awayTeam ? 'text-slate-700' : 'text-slate-400'}`}>
                {game.awayTeam?.name || 'TBD'}
            </div>
        </div>
    );
}
