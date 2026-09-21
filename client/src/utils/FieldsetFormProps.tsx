export type FieldsetFormProps<T> = {
    value: T;
    index: number;
    setAction: React.Dispatch<React.SetStateAction<T[]>>;
};