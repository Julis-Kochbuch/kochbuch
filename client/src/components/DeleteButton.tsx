type DeleteButtonProps<T> =
    Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "createItem" | "onClick" | "setAction" | "type" | "children"
    > & {
        index: number;
        setAction: React.Dispatch<React.SetStateAction<T[]>>;
        children?: string | React.ReactNode;
    }

const DeleteButton = <T,>({ index, setAction, children, ...props } : DeleteButtonProps<T>) => {
    return (
        <button 
            type="button"
            onClick={() =>
                setAction(items => 
                    items.filter((_, i) => i !== index)
                )
            }
            className={"delete-button " + (props.className ?? "")}
            {...props}
        >
            {children}
        </button>
    )
}

export default DeleteButton