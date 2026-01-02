"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { ArrowRight, Calendar, Plus, Search, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Tournament {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Tournament Form
    const [newName, setNewName] = useState("");
    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");

    const fetchTournaments = async () => {
        try {
            const res = await axios.get("http://localhost:8081/tournaments");
            setTournaments(res.data);
        } catch (error) {
            console.error("Failed to fetch tournaments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleCreate = async () => {
        try {
            await axios.post("http://localhost:8081/tournaments", {
                name: newName,
                startDate: newStart,
                endDate: newEnd
            });
            setIsCreateOpen(false);
            setNewName("");
            setNewStart("");
            setNewEnd("");
            fetchTournaments(); // Refresh list
        } catch (error) {
            console.error("Failed to create tournament:", error);
            alert("Failed to create tournament");
        }
    };

    const filteredTournaments = tournaments.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tournaments</h2>
                    <p className="text-muted-foreground">Manage your seasons and competitions</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> New Tournament
                </Button>

                <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Tournament">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tournament Name</label>
                            <Input placeholder="e.g. 2024 Summer League" value={newName} onChange={e => setNewName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} />
                            </div>
                        </div>
                        <Button className="w-full bg-blue-600" onClick={handleCreate}>Create Tournament</Button>
                    </div>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tournaments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : filteredTournaments.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
                    <Trophy className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No tournaments found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new tournament.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTournaments.map((tournament) => (
                        <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl">{tournament.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tournament.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {tournament.status || "SCHEDULED"}
                                    </span>
                                    <Link href={`/dashboard/tournaments/${tournament.id}`}>
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            Manage <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
