import { type MouseEventHandler } from "react";

type AddButtonProps<T> =
    Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "createItem" | "setAction" | "className" | "onClick" | "type" | "children"
    > & {
        createItem: () => T;
        setAction: React.Dispatch<React.SetStateAction<T[]>>;
        className?: string;
        onClick?: MouseEventHandler<HTMLButtonElement>;
        children?: string | React.ReactNode;
    }

const AddButton = <T,>({ createItem, setAction, className, onClick, children, ...props } : AddButtonProps<T>) => {
    return (
        <button
            type="button"
            onClick={(e) => {
                setAction(items => [...items, createItem()]);
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