import { useSortable } from '@dnd-kit/sortable';
import type { UniqueIdentifier } from "@dnd-kit/core";

type SortableFieldsetProps = {
    id: UniqueIdentifier;
    className?: string;
    children?: React.ReactNode;
};

const SortableFieldset = ({ id, children, className }: SortableFieldsetProps) => {
    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id });

    return (
        <fieldset
            ref={setNodeRef}
            className={'sortable-fieldset ' + className}
            style={{
                transform: transform
                    ? `translateY(${transform.y}px)`
                    : undefined,
                transition,
            }}
        >
            <button
                type="button"
                className='drag-button'
                {...attributes}
                {...listeners}
            />
            {children}
        </fieldset>
    )
}

export default SortableFieldset