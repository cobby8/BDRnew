import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DivisionPreset, PresetDivision } from "@/lib/constants";
import { BadgeCheck, Copy, Edit2, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { ReactNode } from "react";

// Props decoupled from DnD logic
interface PresetCardProps {
    preset: DivisionPreset;
    editingId: string | null;
    isOverlay?: boolean; // Prop to indicate overlay mode
    // Actions
    setEditingId?: (id: string | null) => void;
    handleSave?: (id: string) => void;
    handleDeletePreset?: (id: string) => void;
    handleCopyPreset?: (id: string) => void;
    updatePreset?: (id: string, updater: (p: DivisionPreset) => DivisionPreset) => void;
    updateDivisionRow?: (presetId: string, divIdx: number, field: keyof PresetDivision, value: any) => void;
    removeDivisionRow?: (presetId: string, divIdx: number) => void;
    addDivisionRow?: (presetId: string) => void;

    // Drag Handle Props
    dragHandleProps?: any;

    // Division Render Prop (Optional, to allow Sortable Context or static Map)
    renderDivisions?: () => ReactNode;
}

export function PresetCard({
    preset,
    editingId,
    isOverlay = false,
    setEditingId,
    handleSave,
    handleDeletePreset,
    handleCopyPreset,
    updatePreset,
    updateDivisionRow,
    removeDivisionRow,
    addDivisionRow,
    dragHandleProps,
    renderDivisions
}: PresetCardProps) {
    const isEditing = editingId === preset.id;

    return (
        <Card className={`p-6 border-slate-200 transition-all bg-white ${isEditing ? 'ring-2 ring-blue-500 shadow-xl' : isOverlay ? 'shadow-2xl ring-2 ring-blue-400 rotate-2' : 'hover:shadow-md'
            } ${isOverlay ? 'cursor-grabbing' : ''}`}>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="mr-3 mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600" {...dragHandleProps}>
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="space-y-1 flex-1 mr-4">
                    {isEditing && updatePreset ? (
                        <>
                            <Input
                                className="h-9 font-bold text-lg mb-1"
                                value={preset.label}
                                onChange={(e) => updatePreset(preset.id, p => ({ ...p, label: e.target.value }))}
                            />
                            <Input
                                className="h-8 text-sm text-slate-500"
                                value={preset.description}
                                onChange={(e) => updatePreset(preset.id, p => ({ ...p, description: e.target.value }))}
                            />
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-[#191F28] flex items-center gap-2">
                                {preset.label}
                                {preset.id.startsWith('CUSTOM_') && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">Custom</span>}
                            </h3>
                            <p className="text-sm text-slate-500">{preset.description}</p>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!isEditing && !preset.id.startsWith('CUSTOM_') && (
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            ?úÏ? ?∏Ï¶ù
                        </div>
                    )}
                    {isEditing && handleSave && handleDeletePreset ? (
                        <div className="flex gap-2">
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePreset(preset.id)} className="h-8 px-2 bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleSave(preset.id)} className="bg-blue-600 hover:bg-blue-700 h-8">
                                <Save className="w-4 h-4 mr-1" /> ?Ä??
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            {setEditingId && (
                                <Button size="sm" variant="outline" onClick={() => setEditingId(preset.id)} className="h-8">
                                    <Edit2 className="w-3.5 h-3.5 mr-1" /> ?òÏ†ï
                                </Button>
                            )}
                            {handleDeletePreset && (
                                <Button size="sm" variant="ghost" onClick={() => handleDeletePreset(preset.id)} className="h-8 px-2 text-slate-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            {handleCopyPreset && (
                                <Button size="sm" variant="ghost" onClick={() => handleCopyPreset(preset.id)} className="h-8 px-2 text-slate-400 hover:text-blue-500" title="Î≥µÏÇ¨">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Table (Rows) */}
            <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isEditing && <div className="col-span-1">?úÏÑú</div>}
                    <div className="col-span-2">Ïπ¥ÌÖåÍ≥†Î¶¨</div>
                    <div className="col-span-2">ÏΩîÎìú</div>
                    <div className="col-span-3">?úÍ∏∞Î™?/div>
                    <div className="col-span-4">?ÅÏÑ∏ ?§Î™Ö</div>
                </div>

                {renderDivisions ? renderDivisions() : (
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto bg-white">
                        {/* Fallback Static Render if no renderDivisions provided */}
                        {preset.divisions.map((div, idx) => (
                            <div key={idx} className="p-4 text-sm text-center text-slate-400">
                                {idx + 1}. {div.divisionName}
                            </div>
                        ))}
                    </div>
                )}

                {isEditing && addDivisionRow && (
                    <button
                        onClick={() => addDivisionRow(preset.id)}
                        className="w-full py-2 text-xs font-bold text-blue-500 hover:bg-blue-50 border-t border-slate-100 flex items-center justify-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> ?îÎπÑ??Ï∂îÍ?
                    </button>
                )}
            </div>
        </Card>
    );
}
