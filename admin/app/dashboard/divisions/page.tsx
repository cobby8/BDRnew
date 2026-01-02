"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Layers, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Division {
    id: string;
    category: string;
    divisionName: string;
    displayName: string;
    gender: string;
}

export default function DivisionsPage() {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Division Form
    const [newCategory, setNewCategory] = useState("");
    const [newDivisionName, setNewDivisionName] = useState("");
    const [newDisplayName, setNewDisplayName] = useState("");
    const [newGender, setNewGender] = useState("MALE");

    const fetchDivisions = async () => {
        try {
            const res = await axios.get("http://localhost:8081/divisions");
            setDivisions(res.data);
        } catch (error) {
            console.error("Failed to fetch divisions:", error);
            setDivisions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDivisions();
    }, []);

    const handleCreate = async () => {
        try {
            await axios.post("http://localhost:8081/divisions", {
                category: newCategory,
                divisionName: newDivisionName,
                displayName: newDisplayName,
                gender: newGender
            });
            setIsCreateOpen(false);
            setNewCategory("");
            setNewDivisionName("");
            setNewDisplayName("");
            fetchDivisions();
        } catch (error) {
            console.error("Failed to create division:", error);
            alert("Failed to create division");
        }
    };

    const filteredDivisions = divisions.filter(d =>
        d.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.divisionName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Divisions</h2>
                    <p className="text-muted-foreground">Manage competition divisions (e.g. U10, U12, Open)</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> New Division
                </Button>

                <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Division">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input placeholder="e.g. YOUTH" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Division Name</label>
                            <Input placeholder="e.g. U-12" value={newDivisionName} onChange={e => setNewDivisionName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Display Name</label>
                            <Input placeholder="e.g. Elementary Low" value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} />
                        </div>
                        <Button className="w-full bg-blue-600" onClick={handleCreate}>Create Division</Button>
                    </div>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search divisions..."
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
            ) : filteredDivisions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
                    <Layers className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No divisions found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new division.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDivisions.map((division) => (
                        <Card key={division.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl">{division.displayName || division.divisionName}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
                                        {division.category}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {division.gender}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
