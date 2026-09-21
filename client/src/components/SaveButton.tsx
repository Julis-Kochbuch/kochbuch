type SaveButtonProps =
    Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "onClick" | "type" | "form" | "children"
    > & {
        form: string;
        children?: string | React.ReactNode;
    }

const SaveButton = ({ form, children, ...props } : SaveButtonProps) => {
    return (
        <button
            type="submit"
            className={"save-button " + (props.className ?? "")}
            {...props}
            form={form}
        >
            {children}
        </button>
    )
}

export default SaveButton