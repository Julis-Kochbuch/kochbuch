import { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Modal from '../../components/Modal';
import { type ShareableUser, type ShareableUserList } from '@kochbuch/common';
import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import backendAddress from '../../utils/BackendAddress';

type ShareButtonProps = {
    recipeId: number | string;
    children?: string | React.ReactNode;
};

type UserCheckboxProps = {
    selectedUsersHook: [Number[], React.Dispatch<React.SetStateAction<Number[]>>];
    removedUsersHook: [Number[], React.Dispatch<React.SetStateAction<Number[]>>];
    user: ShareableUser;
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

const ShareButton = ({ recipeId, ...props }: ShareButtonProps) => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    const { t: tRecipe } = useTranslation("recipe");

    const children = props.children ?? t(tRecipe("share"));

    const [selectedUsers, setSelectedUsers] = useState<Number[]>([]);
    const [removedUsers, setRemovedUsers] = useState<Number[]>([]);
    const [allUsers, setAllUsers] = useState<ShareableUserList>({ local: [], foreign: [] });

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
                    throw new Error(data.error || data.message || t(tErrors("fetching_users_failed")));
                }

                setAllUsers(data as ShareableUserList);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : t(tErrors("unexpected_error"));
                console.log(message);
                setError(t(tErrors("unable_to_load_users")));
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
                    throw new Error(data.error || data.message || t(tErrors("fetching_shared_users_failed")));
                }

                setSelectedUsers(data.map((user: { key_id: number }) => user.key_id))
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : t(tErrors("unexpected_error"));
                console.log(message);
                setError(t(tErrors("unable_to_load_shared_users")));
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
                throw new Error(data.error || data.message || t(tErrors("sharing_recipe_failed")));
            }
        } catch (err) {
            if (!open) {
                dispatchGlobalState({
                    type: "open modal"
                });
            }

            setOpen(true);
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));
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
                    <h2>{t(tRecipe("share_recipe"))}</h2>
                    <p>
                        <Trans
                            i18nKey="sharing"
                            ns="recipe"
                            count={selectedUsers.length}
                            values={{
                                user: allUsers.local.find((user) => selectedUsers.includes(user.key_id))?.name ?? allUsers.foreign.find((user) => selectedUsers.includes(user.key_id))?.name
                            }}
                            components={[
                                <em />
                            ]}
                        />
                    </p>
                    <p>{t(tRecipe("select_users_to_share_this_recipe_with"))}:</p>
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
                    <p>
                        {t(tRecipe("changes_must_be_saved_to_be_active"))}
                    </p>
                    <div className='modal__controls'>
                        <button
                            type="submit"
                            form='share-form'
                        >
                            {t("save")}
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
                            {t("cancel")}
                        </button>
                    </div>
                    {error && <div>{error}</div>}
                </Modal>
            )}
        </>
    )
}

export default ShareButton