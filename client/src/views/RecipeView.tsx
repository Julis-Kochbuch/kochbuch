import { useEffect, useState } from 'react';
import { Outlet, useParams, type To, type NavigateOptions } from "react-router";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';

import { type Recipe } from '@kochbuch/common';
import BackButton from '../components/BackButton';
import { useGlobalState, useGlobalStateDispatch } from '../utils/GlobalState';
import Modal from '../components/Modal';
import backendAddress from '../utils/BackendAddress';

type NavigateTarget =
    | number
    | {
        to: To;
        options?: NavigateOptions;
    }
    | ((params?: any) => {
        to: To;
        options?: NavigateOptions;
    });

export type RecipeOutletContext = {
    recipe?: Recipe;
    setRecipe?: React.Dispatch<React.SetStateAction<Recipe | undefined>>;
    disabled?: boolean;
    navigateTarget?: NavigateTarget;
    onFormSubmit?: (e: React.SyntheticEvent<HTMLFormElement>, recipe: Recipe) => Promise<string>;
};

const RecipeView = () => {
    let { recipeId } = useParams();

    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    const { t: tRecipe } = useTranslation("recipe");

    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const [recipe, setRecipe] = useState<Recipe>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            setError("");

            dispatchGlobalState({
                type: "add loading tasks",
                task: t(tRecipe("loading_recipe"))
            });

            try {
                const response = await fetch(`${backendAddress}/recipe/${recipeId}`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                dispatchGlobalState({
                    type: "remove loading tasks",
                    task: t(tRecipe("loading_recipe"))
                });

                if (!response.ok) {
                    throw new Error(data.error || data.message || t(tErrors("loading_recipe_failed")));
                }

                setRecipe(data as Recipe);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : t(tErrors("unexpected_error"));
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, []);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>, recipe: Recipe) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        dispatchGlobalState({
            type: "add loading tasks",
            task: t(tRecipe("saving_changes"))
        });

        try {
            if (!recipeId) {
                throw new Error(t(tErrors("modifying_recipe_failed")));
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

            dispatchGlobalState({
                type: "remove loading tasks",
                task: t(tRecipe("saving_changes"))
            });

            if (!response.ok) {
                throw new Error(data.error || data.message || t(tErrors("modifying_recipe_failed")));
            }

            setRecipe(recipe);
            return recipeId;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));
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
            <Outlet context={{ recipe: recipe, setRecipe: setRecipe, disabled: loading, navigateTarget: -1, onFormSubmit: handleSubmit } satisfies RecipeOutletContext} />
            {error &&
                <Modal onCloseButtonClick={() => setError("")}>
                    <h2>{t(tErrors("error"))}</h2>
                    <p>{error}</p>
                    <button type='button' onClick={() => setError("")}>{t("ok")}</button>
                </Modal>
            }
        </>
    )
}

export default RecipeView