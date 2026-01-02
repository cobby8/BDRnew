"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function GameControlPage() {
    const params = useParams();
    const router = useRouter();
    const gameId = params.id; // Correct param mapping from folder structure

    const [game, setGame] = useState<any>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Local Timer State
    const [timeLeft, setTimeLeft] = useState("10:00");
    const [shotClock, setShotClock] = useState("24");
    const [isClockRunning, setIsClockRunning] = useState(false);
    const [period, setPeriod] = useState(1);

    useEffect(() => {
        if (!gameId) return;

        // Fetch
        fetch(`http://localhost:8081/games/${gameId}`)
            .then(res => res.json())
            .then(data => {
                setGame(data);
                // Update local score state if needed, but we rely on DB for score
            });

        // Socket
        const newSocket = io("http://localhost:8081/games");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Controller Connected");
            newSocket.emit("join_game", { gameId });
        });

        // Cleanup
        return () => {
            newSocket.disconnect(); // Correct cleanup
        }
    }, [gameId]);

    // Timer Logic (source of truth is here for test mode)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isClockRunning) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    const [min, sec] = prev.split(':').map(Number);
                    let total = min * 60 + sec;
                    if (total > 0) total--;
                    const m = Math.floor(total / 60);
                    const s = total % 60;
                    return `${m}:${s.toString().padStart(2, '0')}`;
                });

                // Shot Clock
                setShotClock(prev => {
                    const sc = Number(prev);
                    if (sc > 0) return (sc - 1).toString();
                    return "0";
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isClockRunning]);

    // Broadcast Timer State whenever it changes significantly (e.g. every second or on toggle)
    // For smoothness, maybe just broadcast on Toggle, and let Client interpolate?
    // User requested "Test Mode" -> likely wants to see updates.
    // Broadcasting every second is fine for local network/test.
    useEffect(() => {
        if (!socket) return;
        socket.emit("client_update", {
            id: Number(gameId),
            timer: {
                timeLeft,
                shotClock,
                isShotClockRunning: isClockRunning,
                isTimeoutActive: false,
                period
            }
        });
    }, [timeLeft, isClockRunning, shotClock, period, socket, gameId]);

    // Score Updates (Direct API Call then Socket broadcast by Server)
    const updateScore = async (team: 'home' | 'away', delta: number) => {
        if (!game) return;

        const newHome = team === 'home' ? (game.homeScore || 0) + delta : (game.homeScore || 0);
        const newAway = team === 'away' ? (game.awayScore || 0) + delta : (game.awayScore || 0);

        // Optimistic update
        setGame({ ...game, homeScore: newHome, awayScore: newAway });

        await fetch(`http://localhost:8081/games/${gameId}/score`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                homeScore: newHome,
                awayScore: newAway
            })
        });
    };

    const updateStatus = async (status: string) => {
        if (!game) return;
        if (!confirm("정말로 경기를 종료하시겠습니까? 승자가 다음 라운드로 진출합니다.")) return;

        const res = await fetch(`http://localhost:8081/games/${gameId}/score`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            setGame({ ...game, status });
            alert("경기가 종료되었습니다.");
        } else {
            const err = await res.json();
            alert(`오류: ${err.message}`);
        }
    };

    if (!game) return <div>Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => window.close()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 닫기
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open(`/broadcast/scorebug/${gameId}`, '_blank')}>
                        스코어보드 팝업
                    </Button>
                </div>
            </div>

            <Card className="p-8 bg-black text-white text-center">
                {/* Scoreboard Preview UI */}
                <div className="grid grid-cols-3 gap-8 items-center mb-8">
                    {/* Home */}
                    <div className="text-right">
                        <h2 className="text-4xl font-bold mb-2 text-red-500">{game.homeTeam?.name}</h2>
                        <div className="text-8xl font-black bg-gray-900 rounded-xl p-4 inline-block font-mono">
                            {game.homeScore || 0}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button onClick={() => updateScore('home', -1)} variant="secondary" size="sm">-1</Button>
                            <Button onClick={() => updateScore('home', 1)} className="bg-red-600 hover:bg-red-700" size="sm">+1</Button>
                            <Button onClick={() => updateScore('home', 2)} className="bg-red-600 hover:bg-red-700" size="sm">+2</Button>
                            <Button onClick={() => updateScore('home', 3)} className="bg-red-600 hover:bg-red-700" size="sm">+3</Button>
                        </div>
                    </div>

                    {/* Clock */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-xl font-bold text-yellow-400">Period {period}</div>
                        <div className="text-6xl font-mono font-bold tracking-widest bg-gray-900 px-6 py-2 rounded-lg border border-gray-700">
                            {timeLeft}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setIsClockRunning(!isClockRunning)}
                                variant={isClockRunning ? "destructive" : "default"}
                                className="w-32"
                            >
                                {isClockRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                                {isClockRunning ? "STOP" : "START"}
                            </Button>
                        </div>

                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 w-full">
                            <div className="text-red-400 font-bold mb-1">SHOT CLOCK</div>
                            <div className="text-4xl font-mono text-red-500 font-bold mb-2">{shotClock}</div>
                            <div className="flex justify-center gap-2">
                                <Button size="sm" variant="outline" className="text-black" onClick={() => setShotClock("14")}>14</Button>
                                <Button size="sm" variant="outline" className="text-black" onClick={() => setShotClock("24")}>24</Button>
                            </div>
                        </div>

                        <div className="mt-4 w-full">
                            <Button
                                onClick={() => updateStatus('FINAL')}
                                variant="destructive"
                                className="w-full font-bold border-2 border-red-500"
                                disabled={game.status === 'FINAL'}
                            >
                                {game.status === 'FINAL' ? "경기 종료됨" : "경기 종료 (FINAL)"}
                            </Button>
                        </div>
                    </div>

                    {/* Away */}
                    <div className="text-left">
                        <h2 className="text-4xl font-bold mb-2 text-blue-500">{game.awayTeam?.name}</h2>
                        <div className="text-8xl font-black bg-gray-900 rounded-xl p-4 inline-block font-mono">
                            {game.awayScore || 0}
                        </div>
                        <div className="mt-4 flex justify-start gap-2">
                            <Button onClick={() => updateScore('away', 1)} className="bg-blue-600 hover:bg-blue-700" size="sm">+1</Button>
                            <Button onClick={() => updateScore('away', 2)} className="bg-blue-600 hover:bg-blue-700" size="sm">+2</Button>
                            <Button onClick={() => updateScore('away', 3)} className="bg-blue-600 hover:bg-blue-700" size="sm">+3</Button>
                            <Button onClick={() => updateScore('away', -1)} variant="secondary" size="sm">-1</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
