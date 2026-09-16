import { useEffect, useState } from 'react';

import Modal from '../../components/Modal';
import { type ShareableUserApi, type ShareableUserListApi } from '../../utils/ApiTypes'
import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import backendAddress from '../../utils/BackendAddress';

type ShareButtonProps = {
    recipeId: number | string;
    children?: string | React.ReactNode;
};

type UserCheckboxProps = {
    selectedUsersHook: [Number[], React.Dispatch<React.SetStateAction<Number[]>>];
    removedUsersHook: [Number[], React.Dispatch<React.SetStateAction<Number[]>>];
    user: ShareableUserApi;
    disabled?: boolean;
};

const UserCheckbox = ({ selectedUsersHook, removedUsersHook, user, disabled }: UserCheckboxProps) => {
    const [selectedUsers, setSelectedUsers] = selectedUsersHook;
    const [removedUsers, setRemovedUsers] = removedUsersHook;

    return (
        <div>
            <input
                type='checkbox'
                className='input input__hidden'
                disabled={disabled}
                id={'shared-users-' + user.key_id.toString()}
                name='shared-users'
                value={user.key_id}
                onChange={(e) => {
                    if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, parseInt(e.target.value)]);
                        setRemovedUsers(removedUsers.filter(item => item !== parseInt(e.target.value)));
                    } else {
                        setSelectedUsers(selectedUsers.filter(item => item !== parseInt(e.target.value)));
                        setRemovedUsers([...removedUsers, parseInt(e.target.value)]);
                    }
                }}
                checked={selectedUsers.includes(user.key_id)}
            />
            <label htmlFor={'shared-users-' + user.key_id.toString()}>{user.name}</label>
        </div>
    );
}

const ShareButton = ({ recipeId, children = "Share" }: ShareButtonProps) => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const [selectedUsers, setSelectedUsers] = useState<Number[]>([]);
    const [removedUsers, setRemovedUsers] = useState<Number[]>([]);
    const [allUsers, setAllUsers] = useState<ShareableUserListApi>({ local: [], foreign: [] });

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${backendAddress}/user/share`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || "Fetching users failed");
                }

                setAllUsers(data as ShareableUserListApi);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error";
                console.log(message);
                setError("Unable to load users");
            } finally {
                setLoading(false);
            }
        };
        const fetchShared = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${backendAddress}/recipe/${recipeId}/share`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || "Fetching shared users failed");
                }

                setSelectedUsers(data.map((user: { key_id: number }) => user.key_id))
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error";
                console.log(message);
                setError("Unable to load shared users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
        fetchShared();
    }, []);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const users_parsed = {
            recipe_id: recipeId,
            selected_users: selectedUsers,
            removed_users: removedUsers
        }

        try {
            const response = await fetch(`${backendAddress}/recipe/${recipeId}/share`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(users_parsed)
            });

            dispatchGlobalState({
                type: "close modal"
            });

            setOpen(false);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Sharing recipe failed");
            }
        } catch (err) {
            if (!open) {
                dispatchGlobalState({
                    type: "open modal"
                });
            }

            setOpen(true);
            const message =
                err instanceof Error ? err.message : "Unexpected error";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setOpen(true);
                    dispatchGlobalState({
                        type: "open modal"
                    })
                }}
                disabled={globalState.modalsOpen > 0}
            >
                {children}
            </button>
            {open && (
                <Modal
                    onCloseButtonClick={() => setOpen(false)}
                >
                    <h2>Share recipe</h2>
                    <p>Select users:</p>
                    <form id='share-form' onSubmit={handleSubmit}>
                        {allUsers.foreign.length > 0 ?
                            <>
                                <div>
                                    {allUsers.local.map((user) => (
                                        <UserCheckbox
                                            selectedUsersHook={[selectedUsers, setSelectedUsers]}
                                            removedUsersHook={[removedUsers, setRemovedUsers]}
                                            user={user}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                                <div>
                                    {allUsers.local.map((user) => (
                                        <UserCheckbox
                                            selectedUsersHook={[selectedUsers, setSelectedUsers]}
                                            removedUsersHook={[removedUsers, setRemovedUsers]}
                                            user={user}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                            </>
                            :
                            allUsers.local.map((user) => (
                                <UserCheckbox
                                    selectedUsersHook={[selectedUsers, setSelectedUsers]}
                                    removedUsersHook={[removedUsers, setRemovedUsers]}
                                    user={user}
                                    disabled={loading}
                                />
                            ))
                        }
                    </form>
                    <div className='modal__controls'>
                        <button
                            type="submit"
                            form='share-form'
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                dispatchGlobalState({
                                    type: "close modal"
                                })
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    {error && <div>{error}</div>}
                </Modal>
            )}
        </>
    )
}

export default ShareButton