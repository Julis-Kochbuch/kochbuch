import { useState } from 'react';

import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import backendAddress from '../../utils/BackendAddress';

type LogoutButtonProps =
    Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "onClick" | "type" | "children"
    > & {
        children?: string | React.ReactNode;
    }

const LogoutButton = ({ children, ...props }: LogoutButtonProps) => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${backendAddress}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Logging out failed");
            }

            dispatchGlobalState({
                type: "set auth status",
                authStatus: "unauthenticated"
            });

            dispatchGlobalState({
                type: "reset user data"
            })
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";
            console.error(message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading || props.disabled || globalState.modalsOpen > 0}
            aria-label={props['aria-label'] ?? children ? undefined : "Log out"}
        >
            {children}
        </button>
    )
}

export default LogoutButton