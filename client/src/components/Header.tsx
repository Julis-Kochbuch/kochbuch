import { useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';

import { useGlobalState, useGlobalStateDispatch } from "../utils/GlobalState";
import useTheme from "../utils/useTheme";
import useTitle from "../utils/useTitle";
import LanguageSwitcher from "./LanguageSwitcher";

import '../assets/css/header.css';

type HeaderProps = {
    children?: string | JSX.Element | JSX.Element[] | React.ReactNode;
};

const Header = ({ children }: HeaderProps) => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const { t } = useTranslation("common");

    const headerMainRef = useRef<HTMLDivElement | null>(null);
    const headerMenuRef = useRef<HTMLDivElement | null>(null);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    useTheme(globalState.settings?.theme);

    useTitle(globalState.user?.name ? t("user_xyzs_kochbuch", {user: globalState.user.name}) : t("kochbuch"));

    useEffect(() => {
        dispatchGlobalState({
            type: "set header refs",
            headerMainRef,
            headerMenuRef,
        });
    }, []);

    return createPortal(
        <>
            <header className="header__wrapper">
                <div className="header__inner">
                    <div className="header__portal-main" ref={headerMainRef}></div>
                    <div className="header__content">
                        {children}
                    </div>
                    <div className="header__portal-menu">
                        <LanguageSwitcher />
                        <button type="button" className="menu-button" onClick={() => setMenuOpen(!menuOpen)}></button>
                        <div className="header__portal-menu__items" ref={headerMenuRef} aria-expanded={menuOpen} onClick={() => setMenuOpen(false)}></div>
                    </div>
                </div>
            </header>
        </>,
        document.body
    )
}

export default Header