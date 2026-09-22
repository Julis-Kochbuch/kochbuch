import { useSortable } from '@dnd-kit/sortable';
import type { UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from '@dnd-kit/utilities';

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
                transform: CSS.Transform.toString(transform),
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