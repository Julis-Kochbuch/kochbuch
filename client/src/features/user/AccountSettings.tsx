import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import SaveButton from '../../components/SaveButton';
import backendAddress from '../../utils/BackendAddress';

const AccountSettings = () => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${backendAddress}/user/me`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: (username === "") ? undefined : username,
                    new_password: (newPassword === "") ? undefined : newPassword,
                    current_password: currentPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Action failed");
            }

            if (username != "") {
                dispatchGlobalState({
                    type: "set user data",
                    name: username
                })
            }

            setUsername("");
            setNewPassword("");
            setCurrentPassword("");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {globalState.refs?.headerMain?.current && createPortal(
                <>
                    <SaveButton form='account-settings' />
                </>,
                globalState.refs.headerMain.current)}
            <form id='account-settings' onSubmit={handleSubmit}>
                {error && (<p className='error-inline'>{error}</p>)}
                <fieldset className='settings__content' disabled={loading}>
                    <label htmlFor="username">Change Username:</label>
                    <input
                        type="text"
                        id="username"
                        maxLength={32}
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                    />
                    <label htmlFor="new-password">New password:</label>
                    <input
                        type="password"
                        id="new-password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        value={newPassword}
                    />
                    <label htmlFor="current-password">Current password:</label>
                    <input
                        type="password"
                        id="current-password"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        value={currentPassword}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Save"}
                    </button>
                </fieldset>
            </form>
        </>
    )
}

export default AccountSettings