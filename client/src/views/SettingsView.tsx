import { NavLink, Outlet, type To } from "react-router";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';

import { useGlobalState } from "../utils/GlobalState";
import BackButton from "../components/BackButton";

import '../assets/css/settings.css';

type SettingsProps = {
};

const SettingsView = ({  } : SettingsProps) => {
    const globalState = useGlobalState();

    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    const { t: tSettings } = useTranslation("settings");

    const pages = [
        {to: '', text: t(tSettings("general"))},
        ...((globalState.user?.role === 10) ? [{ to: 'admin', text: t(tSettings("admin")) }] : []),
        {to: 'account', text: t(tSettings("user"))},
    ] satisfies { to: To; text: string; }[];

    return (
        <>
            {globalState.refs?.headerMain?.current && createPortal(
                <>
                    <BackButton />
                </>,
            globalState.refs.headerMain.current)}
            <div className="settings__wrapper">
                <ul className="settings__menu">
                    {pages.map((page) => (
                        <li className="settings__menu-item">
                            <NavLink to={page.to} replace end>{page.text}</NavLink>
                        </li>
                    ))}
                </ul>
                <Outlet />
            </div>
        </>
    )
}

export default SettingsView