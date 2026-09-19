import { useState } from 'react';
import { Outlet } from 'react-router';
import { createPortal } from "react-dom";

import { type Recipe } from '@kochbuch/common';
import { type RecipeOutletContext } from './RecipeView.js';
import BackButton from '../components/BackButton';
import { useGlobalState } from '../utils/GlobalState.js';
import Modal from '../components/Modal.js';
import backendAddress from '../utils/BackendAddress.js';

const NewRecipeView = () => {
    const globalState = useGlobalState();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>, recipe: Recipe) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${backendAddress}/recipe/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(recipe)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Creating recipe failed");
            }

            const newId: string = data.id.toString()

            return newId;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";
            setError(message);
            return "-1";
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {globalState.refs?.headerMain?.current && createPortal(
                <>
                    <BackButton />
                </>,
                globalState.refs.headerMain.current)}
            <Outlet
                context={{
                    recipe: {
                        name: "",
                        role: 10,
                        servings: 1,
                        author: globalState.user?.name,
                        images: [],
                        ingredients: [{ index_number: 0, amount: 500, unit: "g", text: "Flour" }],
                        steps: [{ index_number: 0, text: "In a bowl, mix the flour and the salt" }]
                    },
                    disabled: loading,
                    navigateTarget: ((id: string) => { return { to: { pathname: "/recipe/" + id }, options: { replace: true } } }),
                    onFormSubmit: handleSubmit
                } satisfies RecipeOutletContext}
            />
            {error &&
                <Modal onCloseButtonClick={() => setError("")}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button type='button' onClick={() => setError("")}>OK</button>
                </Modal>
            }
        </>
    )
}

export default NewRecipeView