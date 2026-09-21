import { NavLink, Outlet, type To } from "react-router";
import { createPortal } from "react-dom";

import { useGlobalState } from "../utils/GlobalState";
import BackButton from "../components/BackButton";

import '../assets/css/settings.css';

type SettingsProps = {
};

const SettingsView = ({  } : SettingsProps) => {
    const globalState = useGlobalState();

    const pages = [
        {to: '', text: 'General'},
        ...((globalState.user?.role === 10) ? [{ to: 'admin', text: 'Admin' }] : []),
        {to: 'account', text: 'User'},
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