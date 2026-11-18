import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import Modal from '../../components/Modal';
import backendAddress from '../../utils/BackendAddress';

import '../../assets/css/login.css'
import type { UserFull } from '@kochbuch/common';

const Login = () => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const { t } = useTranslation("authentication");
    const { t: tCommon } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        dispatchGlobalState({
            type: "add loading tasks",
            task: t("logging_in")
        });

        try {
            dispatchGlobalState({
                type: "set auth status",
                authStatus: "loading"
            });

            const response = await fetch(`${backendAddress}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            dispatchGlobalState({
                type: "remove loading tasks",
                task: t("logging_in")
            });

            if (!response.ok) {
                dispatchGlobalState({
                    type: "set auth status",
                    authStatus: "unauthenticated"
                })
                throw new Error(data.error || data.message || t(tErrors("login_failed")));
            }

            dispatchGlobalState({
                type: "set auth status",
                authStatus: "authenticated"
            })

            const userResponse = await fetch(`${backendAddress}/user/me`, {
                method: "GET",
                credentials: "include",
            });

            const responseData = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error(data.error || data.message || t(tErrors("fetching_user_data_failed")));
            }

            const userData = responseData as UserFull;

            dispatchGlobalState({
                type: "set user data",
                id: userData.id,
                name: userData.name,
                role: userData.role,
                settingTheme: userData.setting_theme === null ? undefined : userData.setting_theme,
                settingAdvancedOptions: userData.setting_advanced_options
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        globalState.authStatus === "authenticated" ?
            <Navigate to="/overview" replace />
            :
            <>
                <form onSubmit={handleSubmit} className='login-form' id='login-form'>
                    <fieldset disabled={(error || loading) ? true : false}>
                        <label htmlFor="username">{t(tCommon("username"))}:</label>
                        <input
                            type="text"
                            id="username"
                            autoComplete="username"
                            autoCapitalize="off"
                            placeholder={t("enter_username_here")}
                            maxLength={32}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="password">{t(tCommon("password"))}:</label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            placeholder={t("enter_password_here")}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        {error &&
                            <Modal onCloseButtonClick={() => setError("")}>
                                <h2>{t(tErrors("error"))}</h2>
                                <p>{error}</p>
                                <button type='button' onClick={() => setError("")}>{t(tCommon("ok"))}</button>
                            </Modal>
                        }
                    </fieldset>
                </form>
                <div className='modal__controls'>
                    <button
                        type="submit"
                        disabled={loading}
                        form='login-form'
                    >
                        {loading ? (t("logging_in") + "...") : t("log_in")}
                    </button>
                </div>
            </>
    )
}

export default Login
