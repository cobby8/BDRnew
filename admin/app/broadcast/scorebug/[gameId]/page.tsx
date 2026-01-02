"use client";

import WebScoreBug from "@/components/broadcast/WebScoreBug";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface GameData {
    id: number;
    homeTeam: any;
    awayTeam: any;
    homeScore: number;
    awayScore: number;
    status: string;
}

interface TimerState {
    timeLeft: string;
    shotClock: string;
    isShotClockRunning: boolean;
    isTimeoutActive: boolean;
    period: number;
}

export default function ScoreBugPage() {
    const params = useParams();
    const gameId = params.gameId;

    const [game, setGame] = useState<GameData | null>(null);
    const [timer, setTimer] = useState<TimerState>({
        timeLeft: "10:00",
        shotClock: "24",
        isShotClockRunning: false,
        isTimeoutActive: false,
        period: 1
    });

    const [socket, setSocket] = useState<Socket | null>(null);

    // Initial Fetch
    useEffect(() => {
        if (!gameId) return;

        // Fetch Initial Game Data (Scores, Teams)
        fetch(`http://localhost:8081/games/${gameId}`) // Assuming we have a get-one endpoint or use findByDivision and filter?
            .then(res => {
                if (res.ok) return res.json();
                console.error("Failed to fetch game");
            })
            // Since we don't have a direct get-one endpoint for Game ID exposed in Controller yet (only by Division), 
            // We might need to add one or use valid endpoint. 
            // Actually `GamesController` has `updateGameScore` (PATCH :id) but NO `findOne` (GET :id).
            // I should add `findOne` to controller.
            .then(data => {
                if (data) setGame(data);
            });

        // Socket Connection
        const newSocket = io("http://localhost:8081/games");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to Game Socket");
            newSocket.emit("join_game", { gameId });
        });

        newSocket.on("game_update", (updatedGame: any) => {
            console.log("Game Update:", updatedGame);
            // UpdatedGame usually is the TypeORM entity
            // If the payload from Control contained timer info, we should merge it.
            // But currently backend game_update only sends the Entity (Score/Status).
            // Timer info must be sent separately or attached.

            // For MVP: Assuming generic payload that might contain everything
            if (updatedGame.id) {
                setGame(prev => ({ ...prev, ...updatedGame }));
            }
            // If payload has timer info (not in DB entity), update timer
            if (updatedGame.timer) {
                setTimer(updatedGame.timer);
            }
        });

        // Dedicated Timer Event?
        newSocket.on("timer_update", (timerData: TimerState) => {
            setTimer(timerData);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [gameId]);

    // Client-side Timer Ticker (Interpolation)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer.isShotClockRunning && !timer.isTimeoutActive) {
            interval = setInterval(() => {
                // Determine if we should count down
                // Simple string parsing for MVP
                setTimer(prev => {
                    const [min, sec] = prev.timeLeft.split(':').map(Number);
                    let totalSec = min * 60 + sec;
                    if (totalSec > 0) totalSec--;

                    const newMin = Math.floor(totalSec / 60);
                    const newSec = totalSec % 60;
                    const newTimeLeft = `${newMin}:${newSec.toString().padStart(2, '0')}`;

                    // Shot Clock
                    let sc = Number(prev.shotClock);
                    if (sc > 0) sc--;

                    return {
                        ...prev,
                        timeLeft: newTimeLeft,
                        shotClock: sc.toString()
                    };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer.isShotClockRunning, timer.isTimeoutActive]);


    if (!game) return <div className="text-white p-10">Waiting for Game Data... (Game ID: {gameId})</div>;

    return (
        <div className="min-h-screen bg-transparent flex items-start justify-center pt-10">
            <WebScoreBug game={game} timer={timer} />
        </div>
    );
}
