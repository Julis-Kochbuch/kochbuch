import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { type RecipeListByCategory } from '@kochbuch/common';
import Modal from '../components/Modal';
import backendAddress from '../utils/BackendAddress';
import { useGlobalStateDispatch } from '../utils/GlobalState.js';

import '../assets/css/recipe-list.css';

const RecipeView = () => {
    const dispatchGlobalState = useGlobalStateDispatch();

    const [categories, setCategories] = useState<RecipeListByCategory[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            setError("");

            dispatchGlobalState({
                type: "add loading tasks",
                task: "Fetching recipes"
            });

            try {
                const response = await fetch(`${backendAddress}/recipe/`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                dispatchGlobalState({
                    type: "remove loading tasks",
                    task: "Fetching recipes"
                });

                if (!response.ok) {
                    throw new Error(data.error || data.message || "Fetching recipes failed");
                }

                setCategories(data as RecipeListByCategory[]);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    return (
        <div className={loading ? 'loading' : undefined}>
            <h1>Recipes</h1>
            {error &&
                <Modal onCloseButtonClick={() => setError("")}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button type='button' onClick={() => setError("")}>OK</button>
                </Modal>
            }
            <ul className='recipe-list__wrapper'>
                {categories?.map((category) => (
                    <>
                        {category.category_name && <h2 className='recipe-list-category'>{category.category_name}</h2>}
                        {category.recipes.map((recipe) => (
                            <li className='recipe-list-item'>
                                <Link to={`/recipe/${recipe.id}`}>
                                    {recipe.name}
                                </Link>
                            </li>
                        ))}
                    </>
                ))}
            </ul>
        </div>
    )
}

export default RecipeView