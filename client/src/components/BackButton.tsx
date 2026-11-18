import { useNavigate } from "react-router"
import { useTranslation } from 'react-i18next';

import { useGlobalState } from "../utils/GlobalState";

type BackButtonProps =
    Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "onClick" | "type" | "children"
    > & {
        delta?: number;
        children?: string | React.ReactNode;
    }

const BackButton = ({ delta=-1, children, ...props } : BackButtonProps) => {
    const globalState = useGlobalState();
    
    const { t } = useTranslation("common");

    const navigate = useNavigate();

    return (
        <button
            type="button"
            aria-label={props["aria-label"] ?? t("back")}
            onClick={() =>
                navigate(delta)
            }
            disabled={(globalState.modalsOpen > 0) || props.disabled}
            className={(children ? "has-children " : "") + "back-button " + (props.className ?? "")}
            {...props}
        >
            {children}
        </button>
    )
}

export default BackButton