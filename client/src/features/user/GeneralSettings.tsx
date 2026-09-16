import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import SaveButton from '../../components/SaveButton';
import { type Theme } from '@kochbuch/common';
import backendAddress from '../../utils/BackendAddress';

const GeneralSettings = () => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const [themes, setThemes] = useState<Theme[]>([]);
    const [theme, setTheme] = useState<Theme>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (globalState.settings?.themeSlug) {
            setTheme({ slug: globalState.settings.themeSlug });
        }
    }, [globalState.settings]);

    useEffect(() => {
        const fetchThemes = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`${backendAddress}/user/theme`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || "Fetching themes failed");
                }

                setThemes(data.themes as Theme[]);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchThemes();
    }, []);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!theme?.slug) return;

            const response = await fetch(`${backendAddress}/user/theme`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    slug: theme.slug
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Action failed");
            }

            dispatchGlobalState({ type: "set theme", themeSlug: theme.slug })
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
                    <SaveButton form='general-settings' />
                </>,
                globalState.refs.headerMain.current)}
            <form id='general-settings' onSubmit={handleSubmit}>
                {error && (<div className='error-inline'>{error}</div>)}
                <fieldset className='settings__content' disabled={loading}>
                    <label id='theme-label' htmlFor="theme">Select Theme:</label>
                    <select
                        id="theme"
                        onChange={(e => {
                            setTheme(themes.filter((theme) => theme.slug === e.target.value)[0]);
                        })}
                        value={theme?.slug}
                        aria-labelledby='theme-label'
                        disabled={loading || globalState.modalsOpen > 0}
                        required
                    >
                        {
                            (themes ?? []).map((theme, index) => (
                                <option key={index} value={theme.slug}>
                                    {theme.slug}
                                </option>
                            ))
                        }
                    </select>
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

export default GeneralSettings