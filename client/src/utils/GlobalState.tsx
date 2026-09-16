import { createContext, useContext, useReducer, useEffect, type ActionDispatch, type JSX, type RefObject } from 'react';

import backendAddress from './BackendAddress';

type GlobalState = {
    authStatus: "loading" | "authenticated" | "unauthenticated";
    user: {
        id?: number;
        name?: string;
        role?: number;
    }
    settings: {
        themeSlug?: string;
        advancedOptions?: boolean
    };
    refs: {
        headerMain?: RefObject<HTMLElement | null>;
        headerMenu?: RefObject<HTMLElement | null>;
    }
    modalsOpen: number;
};

type GlobalStateReducerAction =
    | {
        type: "set user data",
        id?: number,
        name?: string,
        role?: number,
        settingThemeSlug?: string,
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
        themeSlug: string
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
                    themeSlug: action.settingThemeSlug,
                    advancedOptions: action.settingAdvancedOptions
                }
            };
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
                    themeSlug: undefined,
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
                    themeSlug: action.themeSlug ?? state.settings.themeSlug,
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
        }
    }
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);
const GlobalStateDispatchContext = createContext<ActionDispatch<[action: GlobalStateReducerAction]> | undefined>(undefined);


type GlobalStateProviderProps = {
    children?: string | JSX.Element | JSX.Element[] | React.ReactNode;
};

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
    const [globalState, dispatchGlobalState] = useReducer(globalStateReducer, { authStatus: "loading", modalsOpen: 0 } as GlobalState);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                dispatchGlobalState({
                    type: "set auth status",
                    authStatus: "loading"
                });

                const response = await fetch(`${backendAddress}/user/me`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    dispatchGlobalState({
                        type: "set auth status",
                        authStatus: "unauthenticated"
                    });
                    dispatchGlobalState({
                        type: "set theme",
                        themeSlug: "default"
                    });
                    throw new Error(data.error || data.message || "User data failed");
                }

                dispatchGlobalState({
                    type: "set auth status",
                    authStatus: "authenticated"
                });

                const userData = data as {
                    name: string;
                    id: number;
                    role: number;
                    setting_theme_slug?: string;
                    setting_advanced_options: boolean;
                };

                dispatchGlobalState({
                    type: "set user data",
                    id: userData.id,
                    name: userData.name,
                    role: userData.role,
                    settingThemeSlug: userData.setting_theme_slug ?? "default",
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