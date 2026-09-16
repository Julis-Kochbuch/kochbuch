import { useEffect, useState } from 'react';

import { type RecipeListByCategory } from '@kochbuch/common';
import Modal from '../components/Modal';
import backendAddress from '../utils/BackendAddress';

import '../assets/css/recipe-list.css';

const RecipeView = () => {
    const [categories, setCategories] = useState<RecipeListByCategory[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`${backendAddress}/recipe/`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

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
        fetchRecipe();
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
                                <a href={'/recipe/' + recipe.id}>
                                    {recipe.name}
                                </a>
                            </li>
                        ))}
                    </>
                ))}
            </ul>
        </div>
    )
}

export default RecipeView