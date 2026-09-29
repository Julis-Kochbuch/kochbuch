import type { Ref } from 'react';

export type FieldsetFormProps<T, E extends HTMLElement = HTMLElement> = {
    value: T;
    index: number;
    ref?: Ref<E>;
    setAction: React.Dispatch<React.SetStateAction<T[]>>;
};