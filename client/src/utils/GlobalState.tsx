import { createContext, useContext, useReducer, useEffect, type ActionDispatch, type JSX, type RefObject } from 'react';

import { type Theme, type UserFull } from '@kochbuch/common';
import backendAddress from './BackendAddress';

type GlobalState = {
    authStatus: "loading" | "authenticated" | "unauthenticated";
    user: {
        id?: number;
        name?: string;
        role?: number;
    }
    settings: {
        theme?: Theme | string;
        advancedOptions?: boolean
    };
    refs: {
        headerMain?: RefObject<HTMLElement | null>;
        headerMenu?: RefObject<HTMLElement | null>;
    }
    modalsOpen: number;
    loadingTasks: string[];
};

type GlobalStateReducerAction =
    | {
        type: "set user data",
        id?: number,
        name?: string,
        role?: number,
        settingTheme?: Theme | string,
        settingAdvancedOptions?: boolean
    }
    | {
        type: "change user name",
        name: string,
    }
    | { type: "reset user data" }
    | {
        type: "set auth status",
        authStatus: "loading" | "authenticated" | "unauthenticated"
    }
    | { type: "open modal" }
    | { type: "close modal" }
    | {
        type: "set header refs",
        headerMainRef: RefObject<HTMLElement | null>,
        headerMenuRef: RefObject<HTMLElement | null>
    }
    | {
        type: "set theme",
        theme: Theme | string
    }
    | {
        type: "add loading tasks",
        task: string | string[]
    }
    | {
        type: "remove loading tasks",
        task: string | string[]
    }


export function globalStateReducer(state: GlobalState, action: GlobalStateReducerAction) {
    switch (action.type) {
        case "set user data": {
            return {
                ...state,
                user: {
                    ...state.user,
                    id: action.id ?? state.user.id,
                    name: action.name ?? state.user.name,
                    role: action.role ?? state.user.role
                },
                settings: {
                    ...state.settings,
                    theme: action.settingTheme ?? state.settings.theme,
                    advancedOptions: action.settingAdvancedOptions
                }
            } satisfies GlobalState;
        }
        case "reset user data": {
            return {
                ...state,
                user: {
                    ...state.user,
                    id: undefined,
                    name: undefined,
                    role: undefined
                },
                settings: {
                    ...state.settings,
                    theme: "default",
                    advancedOptions: undefined
                }
            };
        }
        case "set auth status": {
            return {
                ...state,
                authStatus: action.authStatus,
            };
        }
        case "open modal": {
            return {
                ...state,
                modalsOpen: state.modalsOpen + 1,
            };
        }
        case "close modal": {
            return {
                ...state,
                modalsOpen: Math.max(state.modalsOpen - 1, 0),
            };
        }
        case "set header refs": {
            return {
                ...state,
                refs: {
                    headerMain: action.headerMainRef,
                    headerMenu: action.headerMenuRef
                }
            };
        }
        case "set theme": {
            return {
                ...state,
                settings: {
                    ...state.user,
                    theme: action.theme ?? state.settings.theme,
                }
            }
        };
        case "change user name": {
            return {
                ...state,
                user: {
                    ...state.user,
                    name: action.name ?? state.user.name,
                },
            };
        };
        case "add loading tasks": {
            return {
                ...state,
                loadingTasks: state.loadingTasks.concat(action.task),
            };
        };
        case "remove loading tasks": {
            const tasksSet = new Set(Array.isArray(action.task) ? action.task : [action.task]);

            return {
                ...state,
                loadingTasks: state.loadingTasks.filter(task => !tasksSet.has(task)),
            };
        }
    }
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);
const GlobalStateDispatchContext = createContext<ActionDispatch<[action: GlobalStateReducerAction]> | undefined>(undefined);


type GlobalStateProviderProps = {
    children?: string | JSX.Element | JSX.Element[] | React.ReactNode;
};

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
    const [globalState, dispatchGlobalState] = useReducer(globalStateReducer, {
        authStatus: "loading",
        user: {},
        settings: {},
        refs: {},
        modalsOpen: 0,
        loadingTasks: []
    } as GlobalState);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                dispatchGlobalState({
                    type: "set auth status",
                    authStatus: "loading"
                });

                dispatchGlobalState({
                    type: "add loading tasks",
                    task: "Checking authentification"
                });

                const response = await fetch(`${backendAddress}/user/me`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                dispatchGlobalState({
                    type: "remove loading tasks",
                    task: "Checking authentification"
                });

                if (!response.ok) {
                    dispatchGlobalState({
                        type: "set auth status",
                        authStatus: "unauthenticated"
                    });
                    dispatchGlobalState({
                        type: "set theme",
                        theme: "default"
                    });
                    throw new Error(data.error || data.message || "Fetching user data failed");
                }

                dispatchGlobalState({
                    type: "set auth status",
                    authStatus: "authenticated"
                });

                const userData = data as UserFull;

                dispatchGlobalState({
                    type: "set user data",
                    id: userData.id,
                    name: userData.name,
                    role: userData.role,
                    settingTheme: userData.setting_theme ?? "default",
                    settingAdvancedOptions: userData.setting_advanced_options
                });
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error";
                console.error(message);
            }
        };
        fetchUserData();
    }, []);

    return (
        <GlobalStateContext value={globalState}>
            <GlobalStateDispatchContext value={dispatchGlobalState}>
                {children}
            </GlobalStateDispatchContext>
        </GlobalStateContext>
    )
}

export function useGlobalState() {
    const state = useContext(GlobalStateContext);

    if (state === undefined) {
        throw new Error("GlobalState is undefined");
    }

    return state;
}

export function useGlobalStateDispatch() {
    const state = useContext(GlobalStateDispatchContext);

    if (state === undefined) {
        throw new Error("GlobalStateDispatch is undefined");
    }

    return state;
}