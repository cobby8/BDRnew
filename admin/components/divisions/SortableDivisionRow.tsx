import { Input } from "@/components/ui/input";
import { PresetDivision, getDivisionDisplayName } from "@/lib/constants";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

interface SortableDivisionRowProps {
    division: PresetDivision;
    divIdx: number; // Index in the preset's division array
    presetId: string;
    isEditing: boolean;
    updateDivisionRow: (presetId: string, divIdx: number, field: keyof PresetDivision, value: any) => void;
    removeDivisionRow: (presetId: string, divIdx: number) => void;
}

export function SortableDivisionRow({
    division,
    divIdx,
    presetId,
    isEditing,
    updateDivisionRow,
    removeDivisionRow
}: SortableDivisionRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: `div-${presetId}-${divIdx}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0 : 1,
    };

    const autoName = getDivisionDisplayName(division.divisionName);

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="grid grid-cols-12 gap-2 px-2 py-2 items-center text-sm bg-white border-b border-slate-100 last:border-0"
            >
                {/* Drag Handle */}
                <div className="col-span-1 flex justify-center cursor-move text-slate-300 hover:text-slate-500" {...attributes} {...listeners}>
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="col-span-2">
                    <Input className="h-8 text-xs px-2" value={division.category} onChange={(e) => updateDivisionRow(presetId, divIdx, 'category', e.target.value)} />
                </div>
                <div className="col-span-2">
                    <Input className="h-8 text-xs px-2 font-bold" value={division.divisionName} onChange={(e) => updateDivisionRow(presetId, divIdx, 'divisionName', e.target.value)} />
                </div>
                <div className="col-span-3">
                    <Input className="h-8 text-xs px-2" placeholder={autoName} value={division.displayName || ''} onChange={(e) => updateDivisionRow(presetId, divIdx, 'displayName', e.target.value)} />
                </div>
                <div className="col-span-4 flex gap-1">
                    <Input
                        className="h-8 text-xs px-2 bg-yellow-50/50 border-yellow-100 focus:bg-white focus:border-blue-200"
                        placeholder="?? ?¤ì—…?€ ë¶ˆê?"
                        value={division.description || ''}
                        onChange={(e) => updateDivisionRow(presetId, divIdx, 'description', e.target.value)}
                    />
                    <button onClick={() => removeDivisionRow(presetId, divIdx)} className="text-slate-300 hover:text-red-500 px-1">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // View Mode
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm group hover:bg-white transition-colors border-b border-slate-100 last:border-0"
        >
            {/* Empty Handle Space in View Mode to align columns or just skip? 
                Let's make col-span match. 
                Editing: 1 (Handle) + 2 + 2 + 3 + 4 = 12
                View: Need to adjust col-spans.
                Current View: 2 + 2 + 3 + 5 = 12.
                Let's adjust View to match Editing grid or hide handle.
                Actually, dragging might only be allowed in EDIT mode? 
                User said "Add functionality to change order", usually implies Edit mode.
                Let's enable dragging ONLY in Edit mode for safety, or View mode too?
                Usually View mode is static. Let's assume Edit mode for dragging rows.
             */}
            <div className="col-span-2 font-medium text-slate-600 truncate">{division.category}</div>
            <div className="col-span-2 font-bold text-slate-900">{division.divisionName}</div>
            <div className="col-span-3">
                <span className="text-blue-600 font-medium block truncate">{division.displayName || autoName}</span>
            </div>
            <div className="col-span-5">
                {division.description ? (
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                        {division.description}
                    </span>
                ) : (
                    <span className="text-[11px] text-slate-300">-</span>
                )}
            </div>
        </div>
    );
}
