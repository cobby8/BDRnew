import { DivisionPreset, PresetDivision } from "@/lib/constants";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PresetCard } from "./PresetCard";
import { SortableDivisionRow } from "./SortableDivisionRow";

interface SortablePresetCardProps {
    preset: DivisionPreset;
    editingId: string | null;
    setEditingId: (id: string | null) => void;
    handleSave: (id: string) => void;
    handleDeletePreset: (id: string) => void;
    handleCopyPreset: (id: string) => void;
    updatePreset: (id: string, updater: (p: DivisionPreset) => DivisionPreset) => void;
    updateDivisionRow: (presetId: string, divIdx: number, field: keyof PresetDivision, value: any) => void;
    removeDivisionRow: (presetId: string, divIdx: number) => void;
    addDivisionRow: (presetId: string) => void;
}

export function SortablePresetCard({
    preset,
    editingId,
    setEditingId,
    handleSave,
    handleDeletePreset,
    handleCopyPreset,
    updatePreset,
    updateDivisionRow,
    removeDivisionRow,
    addDivisionRow
}: SortablePresetCardProps) {
    const isEditing = editingId === preset.id;

    // Draggable for CARD
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: preset.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <PresetCard
                preset={preset}
                editingId={editingId}
                setEditingId={setEditingId}
                handleSave={handleSave}
                handleDeletePreset={handleDeletePreset}
                handleCopyPreset={handleCopyPreset}
                updatePreset={updatePreset}
                updateDivisionRow={updateDivisionRow}
                removeDivisionRow={removeDivisionRow}
                addDivisionRow={addDivisionRow}
                dragHandleProps={{ ...attributes, ...listeners }}
                renderDivisions={() => (
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto bg-white">
                        <SortableContext
                            items={preset.divisions.map((_, idx) => `div-${preset.id}-${idx}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            {preset.divisions.map((div, idx) => (
                                <SortableDivisionRow
                                    key={`div-${preset.id}-${idx}`}
                                    division={div}
                                    divIdx={idx}
                                    presetId={preset.id}
                                    isEditing={isEditing}
                                    updateDivisionRow={updateDivisionRow}
                                    removeDivisionRow={removeDivisionRow}
                                />
                            ))}
                        </SortableContext>
                    </div>
                )}
            />
        </div>
    );
}
