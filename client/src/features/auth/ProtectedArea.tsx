import { createPortal } from "react-dom";
import { Link, Outlet, Navigate, useMatch } from 'react-router';


import LogoutButton from './LogoutButton';
import { useGlobalState } from '../../utils/GlobalState'

const ProtectedArea = () => {
    const globalState = useGlobalState();
    
    const recipeEditMatch = useMatch('/recipe/:recipeId/edit');
    const recipeNewMatch = useMatch('/recipe/new');

    return (
        globalState.authStatus === "unauthenticated" ?
            <Navigate to="/login" replace />
        :
            <>
                {globalState.refs?.headerMenu?.current && createPortal(
                    <>
                        <LogoutButton>
                            Logout
                        </LogoutButton>
                        <Link to='/settings'>Settings</Link>
                    </>,
                globalState.refs.headerMenu.current)}
                <Outlet />
                {!(recipeEditMatch || recipeNewMatch) && (
                    <>
                        <Link relative="route" to="/recipe/new" tabIndex={-1} className="new-recipe-button__wrapper">
                            <button
                                type='button'
                                className="new-recipe-button"
                                aria-label="Create new recipe"
                                disabled={globalState.modalsOpen > 0}
                            />
                        </Link>
                    </>
                )}
            </>
    )
}

export default ProtectedArea