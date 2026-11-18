import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

import type React from 'react';

type WithId = {
    id: UniqueIdentifier;
};

export type SortableFieldsetContextProps<T extends WithId> = {
    value: T[];
    setAction: React.Dispatch<React.SetStateAction<T[]>>;
    children: JSX.Element[];
};

const SortableFieldsetContext = <T extends WithId,>({ value, setAction, children }: SortableFieldsetContextProps<T>) => {

    const { t } = useTranslation("accessibility");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
    );

    const screenReaderInstructions = {
        draggable: t("drag_and_drop")
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setAction(items => {
            const oldIndex = items.findIndex(i => i.id === active.id);
            const newIndex = items.findIndex(i => i.id === over.id);

            return arrayMove(items, oldIndex, newIndex);
        });
    };

    return (
        <DndContext
            modifiers={[restrictToVerticalAxis]}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            accessibility={{
                screenReaderInstructions
            }}
        >
            <SortableContext
                items={value.map(value => value.id)}
                strategy={verticalListSortingStrategy}
            >
                {children}
            </SortableContext>
        </DndContext>
    )
}

export default SortableFieldsetContext