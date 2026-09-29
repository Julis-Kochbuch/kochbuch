import { type MouseEventHandler } from "react";

type AddButtonProps<T> =
    Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "createItem" | "setAction" | "className" | "onClick" | "type" | "children"
    > & {
        createItem: () => T;
        setAction: React.Dispatch<React.SetStateAction<T[]>>;
        className?: string;
        onItemAdded?: (item: T) => void;
        onClick?: MouseEventHandler<HTMLButtonElement>;
        children?: string | React.ReactNode;
    }

const AddButton = <T,>({ createItem, setAction, className, onItemAdded, onClick, children, ...props }: AddButtonProps<T>) => {
    return (
        <button
            type="button"
            onClick={(e) => {
                const newItem = createItem();
                setAction(items => [...items, newItem]);
                onItemAdded?.(newItem);
                onClick?.(e);
            }}
            className={"add-button " + (className ?? "")}
            {...props}
        >
            {children}
        </button>
    )
}

export default AddButton