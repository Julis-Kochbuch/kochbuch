import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type User, type Theme, type ThemeUpdate } from '@kochbuch/common';
import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import Modal from '../../components/Modal';
import backendAddress from '../../utils/BackendAddress';

const AdminSettings = () => {
    const globalState = useGlobalState();
    const globalStateDispatch = useGlobalStateDispatch();

    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    const { t: tSettings } = useTranslation("settings");

    const [users, setUsers] = useState<User[]>([]);
    const [currentThemes, setCurrentThemes] = useState<Theme[]>([]);
    const [upToDateThemes, setUpToDateThemes] = useState<(ThemeUpdate | undefined)[]>([]);
    const [currentlyEditting, setCurrentlyEditting] = useState<number>();
    const [name, setName] = useState<string>();
    const [role, setRole] = useState<number>();
    const [deleting, setDeleting] = useState<number>();
    const [password, setPassword] = useState<string>("");
    const [adminPassword, setAdminPassword] = useState<string>("");
    const [creatingUser, setCreatingUser] = useState<boolean>(false);
    const [changingPassword, setChangingPassword] = useState<number>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`${backendAddress}/user`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || t(tErrors("fetching_users_failed")));
                }

                setUsers(data as User[]);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : t(tErrors("unexpected_error"));
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        const fetchThemes = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`${backendAddress}/theme`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || t(tErrors("fetching_themes_failed")));
                }

                const themeSlugs: string[] = data.map((themeData: { slug: string }) => { return themeData.slug });

                const currentThemesData = await Promise.all(
                    themeSlugs.map(async (slug) => {
                        const response = await fetch(`/uploads/themes/${slug}/theme.json`, {
                            method: "GET",
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(data.error || data.message || t(tErrors("fetching_theme_data_failed")));
                        }

                        return data as Theme;
                    })
                );

                setCurrentThemes(currentThemesData);

                const upToDateThemeData = await Promise.all(
                    currentThemesData.map(async (theme) => {
                        if (!theme.update_url) return;

                        const response = await fetch(`${theme.update_url}`, {
                            method: "GET",
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(data.error || data.message || t(tErrors("fetching_theme_data_failed")));
                        }

                        return data as ThemeUpdate;
                    })
                );

                setUpToDateThemes(upToDateThemeData);

            } catch (err) {
                const message =
                    err instanceof Error ? err.message : t(tErrors("unexpected_error"));
                setError(message);
            } finally {
                setLoading(false);
                console.log(JSON.stringify(currentThemes));
                console.log(JSON.stringify(upToDateThemes));
            }
        };

        fetchUsers();
        fetchThemes();
    }, []);

    const handleDelete = async (e: React.SyntheticEvent<HTMLFormElement>, userId: number, index: number) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            setDeleting(undefined);
            globalStateDispatch({ type: "close modal" });

            if (userId === globalState.user?.id) {
                throw new Error(t(tErrors("you_cannot_delete_your_own_user_here")));
            }

            const response = await fetch(`${backendAddress}/user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || t(tErrors("deleting_user_failed")));
            }

            setUsers(items =>
                items.filter((_, i) => i !== index)
            );
            if (globalState.user.id === userId) {
                globalStateDispatch({
                    type: "set user data",
                    name: name,
                    role: role
                })
            }

            setName(undefined);
            setRole(undefined);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));
            setDeleting(index);
            globalStateDispatch({ type: "open modal" });
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>, userId: number, index: number) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            setCurrentlyEditting(undefined);
            globalStateDispatch({ type: "close modal" });

            if (name === undefined || name === "") {
                throw new Error(t(tErrors("name_must_not_be_empty")));
            }

            if (role === undefined) {
                throw new Error(t(tErrors("role_must_not_be_undefined")));
            }

            const response = await fetch(`${backendAddress}/user/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: name,
                    role: role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || t(tErrors("modifying_user_failed")));
            }

            setUsers(prev => {
                const next = [...prev];

                next[index].name = name;
                next[index].role = role;

                return next;
            });
            if (globalState.user.id === userId) {
                globalStateDispatch({
                    type: "set user data",
                    name: name,
                    role: role
                })
            }

            setName(undefined);
            setRole(undefined);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));
            setCurrentlyEditting(index);
            globalStateDispatch({ type: "open modal" });
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const handleNewUserSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            setCreatingUser(false);
            globalStateDispatch({ type: "close modal" });

            if (name === undefined || name === "") {
                throw new Error(t(tErrors("name_must_not_be_empty")));
            }

            if (password === "") {
                throw new Error(t(tErrors("password_must_not_be_empty")));
            }

            const response = await fetch(`${backendAddress}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: name,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || t(tErrors("creating_user_failed")));
            }

            setUsers(prev => {
                const next = [...prev];

                next.push({ id: data.id satisfies number, name: name, role: 0 })

                return next;
            });
            setName(undefined);
            setRole(undefined);
            setPassword("");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));

            setCreatingUser(true);
            globalStateDispatch({ type: "open modal" });

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const handleChangingPassword = async (e: React.SyntheticEvent<HTMLFormElement>, userId: number, index: number) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            setChangingPassword(undefined);
            globalStateDispatch({ type: "close modal" });

            if (password === "" || adminPassword === "") {
                throw new Error(t(tErrors("password_must_not_be_empty")));
            }

            const response = await fetch(`${backendAddress}/user/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    new_password: password,
                    admin_password: adminPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || t(tErrors("changing_password_failed")));
            }

            setName(undefined);
            setRole(undefined);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));

            setChangingPassword(index);
            globalStateDispatch({ type: "open modal" });
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h2>{t(tSettings("manage_users"))}</h2>
            <ul className='settings-admin-userlist'>
                {error &&
                    <Modal onCloseButtonClick={() => setError("")}>
                        <h2>{t(tErrors("error"))}</h2>
                        <p>{error}</p>
                        <button type='button' onClick={() => setError("")}>{t("ok")}</button>
                    </Modal>
                }
                <div className='user user-head'>
                    <div id='username' className='user__name'>{t("username")}</div>
                    <div id='role' className='user__role'>{t("role")}</div>
                </div>
                {users.map((user, index) => (
                    <li className='user'>
                        {currentlyEditting === index ?
                            <form onSubmit={(e) => handleSubmit(e, user.id, index)}>
                                <input
                                    type='text'
                                    autoComplete='off'
                                    autoCapitalize='off'
                                    className='user__name'
                                    maxLength={32}
                                    aria-labelledby='username'
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                    required
                                />
                                <input
                                    type='number'
                                    className='user__role'
                                    aria-labelledby='role'
                                    min={0}
                                    max={10}
                                    value={role}
                                    onChange={(e) => {
                                        setRole(parseInt(e.target.value));
                                    }}
                                    required
                                />
                                <div className='user__controls'>
                                    <button
                                        type='button'
                                        aria-label='Cancel'
                                        onClick={() => {
                                            setCurrentlyEditting(undefined);
                                            setName(undefined);
                                            setRole(undefined);
                                        }}>
                                    </button>
                                    <button type='submit' aria-label='Save'></button>
                                </div>
                            </form>
                            :
                            <>
                                <div className='user__name' aria-labelledby='username'>{user.name}</div>
                                <div className='user__role' aria-labelledby='role'>{user.role}</div>
                                <div className='user__controls'>
                                    <button
                                        type='button'
                                        aria-label={t("edit")}
                                        onClick={() => {
                                            setCurrentlyEditting(index);
                                            setDeleting(undefined);
                                            setChangingPassword(undefined);
                                            setName(user.name);
                                            setRole(user.role);
                                        }}>
                                    </button>
                                    <button type='button' aria-label={t(tSettings("change_password"))} onClick={() => {
                                        setDeleting(undefined);
                                        setCurrentlyEditting(undefined);
                                        setChangingPassword(index);
                                        globalStateDispatch({ type: "open modal" });
                                    }}></button>
                                    <button type='button' aria-label={t("delete")} className='delete-button' onClick={() => {
                                        setDeleting(index);
                                        setCurrentlyEditting(undefined);
                                        setChangingPassword(undefined);
                                        globalStateDispatch({ type: "open modal" });
                                    }}></button>
                                </div>
                            </>
                        }
                    </li>
                ))}
                {!(deleting === undefined) &&
                    <Modal onCloseButtonClick={() => {
                        setDeleting(undefined);
                        globalStateDispatch({ type: "close modal" });
                    }}>
                        <h2>{t("warning")}</h2>
                        <p>
                            {t(tSettings("are_you_sure_you_want_to_delete_user_xyz", { user: users[deleting].name }))}
                        </p>
                        <p>
                            {t("this_is_irreversible")}
                        </p>
                        <form className='settings__content' id='password-form' onSubmit={(e) => handleDelete(e, users[deleting].id, deleting)}>
                            <label htmlFor="password">{t(tSettings("your_password"))}:</label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                        </form>
                        <div className='modal__controls'>
                            <button type='submit' form='password-form' aria-label='Delete'></button>
                            <button type='button' aria-label='Cancel' onClick={() => {
                                setDeleting(undefined);
                                globalStateDispatch({ type: "close modal" });
                            }}></button>
                        </div>
                    </Modal>
                }
                {!(changingPassword === undefined) &&
                    <Modal onCloseButtonClick={() => {
                        setChangingPassword(undefined);
                        globalStateDispatch({ type: "close modal" });
                    }}>
                        <h2>{t(tSettings("change_user_xyzs_password", { user: users[changingPassword].name }))}</h2>
                        <form className='settings__content' id='change-password-form' onSubmit={(e) => handleChangingPassword(e, users[changingPassword].id, changingPassword)}>
                            <label htmlFor="new-password">{t(tSettings("new_password"))}:</label>
                            <input
                                type="password"
                                id="new-password"
                                autoComplete="new-password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                            <label htmlFor="admin-password">{t(tSettings("your_password"))}:</label>
                            <input
                                type="password"
                                id="admin-password"
                                autoComplete="current-password"
                                onChange={(e) => setAdminPassword(e.target.value)}
                                value={adminPassword}
                                required
                            />
                        </form>
                        {error && <p>{error}</p>}
                        <div className='modal__controls'>
                            <button type='submit' form='change-password-form' aria-label={t("confirm")}></button>
                            <button type='button' aria-label={t("cancel")} onClick={() => {
                                setChangingPassword(undefined);
                                globalStateDispatch({ type: "close modal" });
                            }}></button>
                        </div>
                    </Modal>
                }
            </ul>
            <button
                type='button'
                className='add-button'
                aria-label={t(tSettings("create_new_user"))}
                onClick={() => {
                    setCreatingUser(true);
                    setCurrentlyEditting(undefined);
                    setName("");
                    globalStateDispatch({ type: "open modal" });
                }}
            ></button>
            {creatingUser &&
                <Modal onCloseButtonClick={() => {
                    setCreatingUser(false);
                    setName(undefined);
                    setRole(undefined);
                    setPassword("");
                    globalStateDispatch({ type: "close modal" });
                }}>
                    <h2>{t(tSettings("create_new_user"))}</h2>
                    <form className='settings__content' id='create-user' onSubmit={handleNewUserSubmit}>
                        <label htmlFor="new-username">{t("username")}:</label>
                        <input
                            type="text"
                            id="new-username"
                            autoComplete="off"
                            autoCapitalize="off"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                        <label htmlFor="password">{t("password")}:</label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </form>
                    <div className='modal__controls'>
                        <button
                            type="submit"
                            form='create-user'
                            disabled={loading}
                            aria-label={t("save")}
                        ></button>
                        <button type='button' aria-label={t("cancel")} onClick={() => {
                            setCreatingUser(false);
                            setName(undefined);
                            setRole(undefined);
                            setPassword("");
                            globalStateDispatch({ type: "close modal" });
                        }}></button>
                    </div>
                </Modal>
            }
            <h2>{t(tSettings("manage_themes"))}</h2>
            <ul className='settings-admin-userlist'>
                {error != "" && <p>{error}</p>}
                <div className='user user-head'>
                    <div id='theme' className='user__name'>{t(tSettings("theme"))}</div>
                    <div id='version' className='user__role'>{t(tSettings("version"))}</div>
                </div>
                {currentThemes.map((theme, index) => (
                    <li className='user'>
                        <div className='user__name' aria-labelledby='theme'>{theme.slug}</div>
                        <div className='user__role' aria-labelledby='version'>{theme.version ?? ""}</div>
                        <div className='user__controls'>
                            {(!theme.version || !upToDateThemes[index]?.version || theme.version === upToDateThemes[index]?.version) ?
                                <button disabled>{t(tSettings("no_update_available"))}</button>
                                :
                                <button
                                    onClick={() => {
                                        const updateTheme = async () => {
                                            try {
                                                globalStateDispatch({
                                                    type: "add loading tasks",
                                                    task: t(tSettings("updating_xyz_theme", {theme: theme.slug}))
                                                })
                                                const response = await fetch(`${backendAddress}/theme/${theme.slug}`, {
                                                    method: "POST",
                                                    credentials: "include",
                                                });

                                                const data = await response.json();

                                                globalStateDispatch({
                                                    type: "remove loading tasks",
                                                    task: t(tSettings("updating_xyz_theme", {theme: theme.slug}))
                                                })

                                                if (!response.ok) {
                                                    throw new Error(data.error || data.message || t(tErrors("updating_theme_failed")));
                                                }

                                                window.location.reload();
                                            } catch (err: any) {
                                                if (typeof err.message === "string") setError(err.message);
                                            }
                                        }

                                        updateTheme();
                                    }}
                                >
                                    {`Download ${upToDateThemes[index]?.version}`}
                                </button>
                            }
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default AdminSettings