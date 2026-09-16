import { useEffect, useState } from 'react';

import { type UserApi } from '../../utils/ApiTypes';
import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import Modal from '../../components/Modal';
import backendAddress from '../../utils/BackendAddress';

const AdminSettings = () => {
    const globalState = useGlobalState();
    const globalStateDispatch = useGlobalStateDispatch();

    const [users, setUsers] = useState<UserApi[]>([]);
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
                    throw new Error(data.error || data.message || "Fetching users failed");
                }

                setUsers(data as UserApi[]);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (e: React.SyntheticEvent<HTMLFormElement>, userId: number, index: number) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            setDeleting(undefined);
            globalStateDispatch({ type: "close modal" });

            if (userId === globalState.user?.id) {
                throw new Error("You cannot delete your own user here. Go to Settings -> User");
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
                throw new Error(data.error || data.message || "Deleting user failed");
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
                err instanceof Error ? err.message : "Unexpected error";
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
                throw new Error("Name must not be empty");
            }

            if (role === undefined) {
                throw new Error("Role must not be undefined");
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
                throw new Error(data.error || data.message || "Modifying user failed");
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
                err instanceof Error ? err.message : "Unexpected error";
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
                throw new Error("Name must not be empty");
            }

            if (password === "") {
                throw new Error("Password must not be empty");
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
                throw new Error(data.error || data.message || "Creating user failed");
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
                err instanceof Error ? err.message : "Unexpected error";

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
                throw new Error("Password must not be empty");
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
                throw new Error(data.error || data.message || "Changing password failed");
            }

            setName(undefined);
            setRole(undefined);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";

            setChangingPassword(index);
            globalStateDispatch({ type: "open modal" });
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ul className='settings-admin'>
                {error != "" && <p>{error}</p>}
                <div className='user user-head'>
                    <div id='username' className='user__name'>Username</div>
                    <div id='role' className='user__role'>Role</div>
                </div>
                {users.map((user, index) => (
                    <li className='user'>
                        {currentlyEditting === index ?
                            <form onSubmit={(e) => handleSubmit(e, user.id, index)}>
                                <input
                                    type='text'
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
                                        aria-label='Edit'
                                        onClick={() => {
                                            setCurrentlyEditting(index);
                                            setDeleting(undefined);
                                            setChangingPassword(undefined);
                                            setName(user.name);
                                            setRole(user.role);
                                        }}>
                                    </button>
                                    <button type='button' aria-label='Change password' onClick={() => {
                                        setDeleting(undefined);
                                        setCurrentlyEditting(undefined);
                                        setChangingPassword(index);
                                        globalStateDispatch({ type: "open modal" });
                                    }}></button>
                                    <button type='button' aria-label='Delete' className='delete-button' onClick={() => {
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
                        <h2>Warning</h2>
                        <p>Are you sure you want to delete user {users[deleting].name}? This is not reversible!</p>
                        <form className='settings__content' id='password-form' onSubmit={(e) => handleDelete(e, users[deleting].id, deleting)}>
                            <label htmlFor="password">Your password:</label>
                            <input
                                type="password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                        </form>
                        {error && <p>{error}</p>}
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
                        <h2>Change {users[changingPassword].name}s Password</h2>
                        <form className='settings__content' id='change-password-form' onSubmit={(e) => handleChangingPassword(e, users[changingPassword].id, changingPassword)}>
                            <label htmlFor="new-password">New password:</label>
                            <input
                                type="password"
                                id="new-password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                            <label htmlFor="admin-password">Your password:</label>
                            <input
                                type="password"
                                id="admin-password"
                                onChange={(e) => setAdminPassword(e.target.value)}
                                value={adminPassword}
                                required
                            />
                        </form>
                        {error && <p>{error}</p>}
                        <div className='modal__controls'>
                            <button type='submit' form='change-password-form' aria-label='Submit'></button>
                            <button type='button' aria-label='Cancel' onClick={() => {
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
                aria-label='Create user'
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
                    <h2>Create new user</h2>
                    <form className='settings__content' id='create-user' onSubmit={handleNewUserSubmit}>
                        <label htmlFor="new-username">Username:</label>
                        <input
                            type="text"
                            id="new-username"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </form>
                    <div className='modal__controls'>
                        <button
                            type="submit"
                            form='create-user'
                            disabled={loading}
                            aria-label='Save'
                        ></button>
                        <button type='button' aria-label='Cancel' onClick={() => {
                            setCreatingUser(false);
                            setName(undefined);
                            setRole(undefined);
                            setPassword("");
                            globalStateDispatch({ type: "close modal" });
                        }}></button>
                    </div>
                </Modal>
            }
        </>
    )
}

export default AdminSettings