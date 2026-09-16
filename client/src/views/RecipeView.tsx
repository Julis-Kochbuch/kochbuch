import { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from "react-router";
import { createPortal } from "react-dom";

import { type RecipeApi } from '../utils/ApiTypes';
import BackButton from '../components/BackButton';
import { useGlobalState } from '../utils/GlobalState';
import Modal from '../components/Modal';
import backendAddress from '../utils/BackendAddress';

export type RecipeOutletContext = {
    recipe?: RecipeApi;
    disabled?: boolean;
    onFormSubmit?: (e: React.SyntheticEvent<HTMLFormElement>, recipe: RecipeApi) => Promise<string>;
};

const RecipeView = () => {
    let { recipeId } = useParams();

    const globalState = useGlobalState();

    const navigate = useNavigate();

    const [recipe, setRecipe] = useState<RecipeApi>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`${backendAddress}/recipe/${recipeId}`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || "Fetching recipe failed");
                }

                setRecipe(data as RecipeApi);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, []);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>, recipe: RecipeApi) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!recipeId) {
                throw new Error("Modifying recipe failed");
            }

            const response = await fetch(`${backendAddress}/recipe/${recipeId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(recipe)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Modifying recipe failed");
            }

            setRecipe(recipe);
            navigate(-1);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";
            setError(message);
        } finally {
            setLoading(false);
            return recipeId ?? "-1";
        }
    }

    return (
        <>
            {globalState.refs?.headerMain?.current && createPortal(
                <>
                    <BackButton />
                </>,
                globalState.refs.headerMain.current)}
            <Outlet context={{ recipe: recipe, disabled: loading, onFormSubmit: handleSubmit } satisfies RecipeOutletContext} />
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

export default RecipeView