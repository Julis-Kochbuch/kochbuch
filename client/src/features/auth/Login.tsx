import React, { useState } from 'react';
import { Navigate } from 'react-router';

import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import Modal from '../../components/Modal';
import backendAddress from '../../utils/BackendAddress';

import '../../assets/css/login.css'
import type { UserFull } from '@kochbuch/common';

const Login = () => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

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

            if (!response.ok) {
                dispatchGlobalState({
                    type: "set auth status",
                    authStatus: "unauthenticated"
                })
                throw new Error(data.error || data.message || "Login failed");
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
                throw new Error(data.error || data.message || "Fetching user data failed");
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
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter Username here"
                            maxLength={32}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter Password here"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        {error &&
                            <Modal onCloseButtonClick={() => setError("")}>
                                <h2>Error</h2>
                                <p>{error}</p>
                                <button type='button' onClick={() => setError("")}>OK</button>
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
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </div>
            </>
    )
}

export default Login
