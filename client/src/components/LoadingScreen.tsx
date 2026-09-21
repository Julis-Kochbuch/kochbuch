import { createPortal } from "react-dom";

import { useGlobalState } from "../utils/GlobalState";

const LoadingScreen = () => {
    const globalState = useGlobalState();

    if (globalState.loadingTasks.length === 0) {
        return null;
    }

    return createPortal(
        <div className="loader__wrapper">
            <div className="loader__inner">
                <div className="loader__spinner"></div>
                <div className="loader__text">
                    {globalState.loadingTasks[0]}
                </div>
            </div>
        </div>,
        document.body
    )
}

export default LoadingScreen