import { DndContext, type DragEndEvent, type UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { JSX } from 'react';

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
        <DndContext onDragEnd={handleDragEnd}>
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