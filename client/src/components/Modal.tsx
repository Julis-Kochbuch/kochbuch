import { type JSX } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';

import '../assets/css/modal.css';
import { useGlobalStateDispatch } from "../utils/GlobalState";

type ModalProps = {
    name?: string;
    onCloseButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: string | JSX.Element | JSX.Element[] | React.ReactNode;
};

const Modal = ({ onCloseButtonClick, children } : ModalProps) => {
    const dispatchGlobalState = useGlobalStateDispatch();

    const { t } = useTranslation("common");

    const modalRoot = document.getElementById("modal-root");

    if (!modalRoot) {
        return null;
    }

    return createPortal(
        <div className='modal__wrapper'>
            <div className='modal'>
                {children}
            </div>
            {onCloseButtonClick && (
                <button
                    type="button"
                    className="close-button"
                    onClick={(e) => {
                        onCloseButtonClick(e);
                        dispatchGlobalState({
                            type: "close modal"
                        });
                    }}
                    aria-label={t("close")}
                />
            )}
        </div>,
        modalRoot
    );
}

export default Modal