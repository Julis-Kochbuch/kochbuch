import { useState } from 'react';
import { Outlet } from 'react-router';
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';

import { type Recipe } from '@kochbuch/common';
import { type RecipeOutletContext } from './RecipeView.js';
import BackButton from '../components/BackButton';
import { useGlobalState, useGlobalStateDispatch } from '../utils/GlobalState.js';
import Modal from '../components/Modal.js';
import backendAddress from '../utils/BackendAddress.js';

const NewRecipeView = () => {
    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    const { t: tRecipe } = useTranslation("recipe");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>, recipe: Recipe) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        dispatchGlobalState({
            type: "add loading tasks",
            task: t(tRecipe("creating_recipe"))
        });

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

            dispatchGlobalState({
                type: "remove loading tasks",
                task: t(tRecipe("creating_recipe"))
            });

            if (!response.ok) {
                throw new Error(data.error || data.message || t(tErrors("creating_recipe_failed")));
            }

            const newId: string = data.id.toString()

            return newId;
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
            <Outlet
                context={{
                    recipe: {
                        name: "",
                        role: 10,
                        servings: 1,
                        author: globalState.user?.name,
                        images: [],
                        ingredients: [{ index_number: 0, amount: Number(t(tRecipe("example_ingredient_amount"))), unit: t(tRecipe("example_ingredient_unit")), text: t(tRecipe("example_ingredient_text")) }],
                        steps: [{ index_number: 0, text: t(tRecipe("example_step")) }]
                    },
                    disabled: loading,
                    navigateTarget: ((id: string) => { return { to: { pathname: "/recipe/" + id }, options: { replace: true } } }),
                    onFormSubmit: handleSubmit
                } satisfies RecipeOutletContext}
            />
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

export default NewRecipeView