"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Division {
    id?: number;
    category: string;
    divisionName: string;
    displayName?: string;
}

interface Tournament {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    places: string[];
    divisions: Division[];
}

interface TournamentSettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tournament: Tournament;
    onUpdate: () => void;
}

export function TournamentSettingsDialog({ isOpen, onClose, tournament, onUpdate }: TournamentSettingsDialogProps) {
    const [formData, setFormData] = useState<Tournament>(tournament);
    const [groupedDivisions, setGroupedDivisions] = useState<Record<string, Division[]>>({});

    useEffect(() => {
        if (tournament) {
            setFormData(tournament);
            // Group divisions by category
            const grouped = (tournament.divisions || []).reduce((acc, div) => {
                const cat = div.category || 'Uncategorized';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(div);
                return acc;
            }, {} as Record<string, Division[]>);
            setGroupedDivisions(grouped);
        }
    }, [tournament]);

    const handleChange = (field: keyof Tournament, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddCategory = () => {
        const cat = prompt("새로운 종별(Category) 이름을 입력하세요 (예: 유소년, 일반부)");
        if (cat && !groupedDivisions[cat]) {
            setGroupedDivisions(prev => ({ ...prev, [cat]: [] }));
        }
    };

    const handleAddDivision = (category: string) => {
        const divName = prompt(`'${category}'에 추가할 디비전 이름을 입력하세요 (예: U12, A조)`);
        if (divName) {
            setGroupedDivisions(prev => ({
                ...prev,
                [category]: [...prev[category], { category, divisionName: divName, displayName: divName }]
            }));
        }
    };

    const handleRemoveDivision = (category: string, index: number) => {
        if (!confirm("이 디비전을 삭제하시겠습니까?")) return;
        setGroupedDivisions(prev => {
            const newList = [...prev[category]];
            newList.splice(index, 1);
            return { ...prev, [category]: newList };
        });
    };

    const handleSave = async () => {
        // Flatten grouped divisions back to array
        const flatDivisions = Object.values(groupedDivisions).flat();

        try {
            const res = await fetch(`http://localhost:8081/tournaments/${tournament.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: formData.status,
                    places: formData.places,
                    divisions: flatDivisions
                })
            });

            if (res.ok) {
                alert("대회 설정이 저장되었습니다.");
                onUpdate();
                onClose();
            } else {
                const txt = await res.text();
                alert(`저장 실패: ${txt}`);
            }
        } catch (error) {
            console.error(error);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="대회 상세 설정">
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>대회명</Label>
                            <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>상태</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={formData.status}
                                onChange={e => handleChange('status', e.target.value)}
                            >
                                <option value="PREPARING">준비중</option>
                                <option value="RECRUITING">접수중</option>
                                <option value="ACTIVE">진행중</option>
                                <option value="FINISHED">종료됨</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>시작일</Label>
                            <Input type="date" value={formData.startDate?.split('T')[0]} onChange={e => handleChange('startDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>종료일</Label>
                            <Input type="date" value={formData.endDate?.split('T')[0]} onChange={e => handleChange('endDate', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Division Settings - The "Detailed" Request */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-semibold">종별 및 디비전 설정</h3>
                        <Button size="sm" variant="outline" onClick={handleAddCategory}>
                            <Plus className="w-4 h-4 mr-1" /> 종별(Category) 추가
                        </Button>
                    </div>

                    {Object.keys(groupedDivisions).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            설정된 종별이 없습니다. '종별 추가'를 눌러 시작하세요.
                        </div>
                    )}

                    {Object.entries(groupedDivisions).map(([category, divs]) => (
                        <div key={category} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-slate-800">{category}</h4>
                                <Button size="sm" variant="ghost" className="h-6 text-blue-600 hover:text-blue-700" onClick={() => handleAddDivision(category)}>
                                    + 디비전 추가
                                </Button>
                            </div>
                            <div className="grid gap-2">
                                {divs.map((div, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white p-2 border rounded shadow-sm">
                                        <div className="flex-1 text-sm">
                                            <span className="font-semibold">{div.divisionName}</span>
                                            {div.displayName && div.displayName !== div.divisionName && (
                                                <span className="text-slate-500 ml-2">({div.displayName})</span>
                                            )}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-red-400 hover:text-red-600"
                                            onClick={() => handleRemoveDivision(category, idx)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                {divs.length === 0 && (
                                    <div className="text-xs text-slate-400 italic px-2">디비전이 없습니다.</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" className="mr-2" onClick={onClose}>취소</Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">변경사항 저장</Button>
                </div>
            </div>
        </Dialog>
    );
}
