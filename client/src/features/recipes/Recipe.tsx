import { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { Link, useOutletContext, useNavigate } from 'react-router'

import { type RecipeOutletContext } from '../../views/RecipeView.js';
import ShareButton from './ShareButton.js';
import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState.js';
import RecipeImage from './RecipeImage.js';
import backendAddress from '../../utils/BackendAddress.js';

const Recipe = () => {
    const formatter = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
    });

    const { recipe } = useOutletContext<RecipeOutletContext>()

    const globalState = useGlobalState();
    const dispatchGlobalState = useGlobalStateDispatch();

    const navigate = useNavigate();

    const [servings, setServings] = useState<number>(1);

    const handleDelete = async () => {
        try {
            dispatchGlobalState({
                type: "add loading tasks",
                task: "Deleting recipe"
            });

            const response = await fetch(`${backendAddress}/recipe/${recipe?.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await response.json();

            dispatchGlobalState({
                type: "remove loading tasks",
                task: "Deleting recipe"
            });

            if (!response.ok) {
                throw new Error(data.error || data.message || "Modifying recipe failed");
            }

            navigate("/overview", { replace: true });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";

            throw new Error(message);
        }
    }

    useEffect(() => {
        if (recipe) {
            setServings(recipe?.servings ?? 1)
        }
    }, [recipe]);

    return (
        <div className='recipe'>
            {globalState.refs?.headerMenu?.current && createPortal(
                <>
                    {(recipe?.id && recipe.role == 10) &&
                        <>
                            <ShareButton
                                recipeId={recipe.id}
                            />
                            <button
                                type='button'
                                aria-label='Delete'
                                onClick={handleDelete}
                            ></button>
                        </>
                    }
                    {(recipe?.role == 10) &&
                        <Link to="edit" tabIndex={-1}><button type='button' disabled={globalState.modalsOpen > 0}>Edit</button></Link>
                    }
                </>,
                globalState.refs.headerMenu.current)
            }
            <div className='recipe-group-head'>
                <h1 className='recipe-name'>
                    {recipe?.name}
                </h1>
                <RecipeImage slot={0} recipeId={recipe?.id} images={recipe?.images} />
                <div className={'recipe-category' + (recipe?.category_name ? '' : ' empty')}>
                    {recipe?.category_id && recipe?.category_name}
                </div>
                <div className='recipe-servings'>
                    <div className='input-recipe-servings'>
                        <button
                            className='subtract-button'
                            onClick={() => setServings(prev => Math.max(1, prev - 1))}
                        ></button>
                        <input
                            type='number'
                            id='servings'
                            min={0.5}
                            step={0.5}
                            value={servings}
                            onChange={(e) => setServings(Number(e.target.value))}
                            disabled={globalState.modalsOpen > 0}
                        />
                        <button
                            className='add-button'
                            onClick={() => setServings(prev => Math.max(0, prev + 1))}
                        ></button>
                    </div>
                    <label className='recipe-servings-label' htmlFor='servings'>Servings</label>
                </div>
                <div className={'recipe-author' + (recipe?.author ? '' : ' empty')}>
                    {recipe?.author}
                    <div className='recipe-author__title'>Author</div>
                </div>
            </div>
            <div className='recipe-group-ingredients'>
                <h2>Ingredients</h2>
                <ul>
                    {recipe?.ingredients.map((ingredient) => (
                        <li className='recipe-ingredient__wrapper recipe-ingredient__content'>
                            {ingredient.amount ? formatter.format(ingredient.amount * servings / (recipe.servings ?? 1)) : undefined} {ingredient.unit} {ingredient.text} {ingredient.comment && <em>{ingredient.comment}</em>}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='recipe-group-steps'>
                <h2>Directions</h2>
                <ol>
                    {recipe?.steps.map((step, index) => (
                        <div className='recipe-step__wrapper'>
                            <input
                                type='checkbox'
                                className='recipe-step-checkbox'
                                id={'step-' + step.id?.toString()}
                                disabled={globalState.modalsOpen > 0}
                            />
                            <li>
                                <label className='recipe-step__content' htmlFor={'step-' + step.id?.toString()}>
                                    <span className='checkbox'></span>
                                    <div className='recipe-step-index'>
                                        {index + 1}
                                    </div>
                                    {step.text}
                                </label>
                            </li>
                        </div>
                    ))}
                </ol>
            </div>
            <RecipeImage slot={1} recipeId={recipe?.id} images={recipe?.images} />
            <RecipeImage slot={2} recipeId={recipe?.id} images={recipe?.images} />
        </div>
    )
}

export default Recipe