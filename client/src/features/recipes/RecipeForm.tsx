import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router'

import CategorySelector from './CategorySelector';
import IngredientForm, { type Ingredient } from './IngredientForm';
import StepForm, { type Step } from './StepForm';
import AddButton from '../../components/AddButton';
import DeleteButton from '../../components/DeleteButton';
import SortableFieldset from '../../components/SortableFieldset';
import SortableFieldsetContext from '../../components/SortableFieldsetContext';
import { type Recipe, type RecipeImage, type RecipeIngredient, type RecipeStep } from '@kochbuch/common';
import Fraction from '../../utils/Fraction';
import { type RecipeOutletContext } from '../../views/RecipeView.js';
import { useGlobalState } from '../../utils/GlobalState.js';
import { type Category } from './CategorySelector';
import BackButton from '../../components/BackButton.js';
import ImageForm, { type ImageWithFile } from './ImageForm.js';
import backendAddress from '../../utils/BackendAddress.js';

import '../../assets/css/recipe.css';

const RecipeForm = () => {
    const { recipe, disabled, onFormSubmit } = useOutletContext<RecipeOutletContext>();
    const globalState = useGlobalState();

    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<Category>();
    const [servings, setServings] = useState<string>();
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [steps, setSteps] = useState<Step[]>([]);
    const [images, setImages] = useState<ImageWithFile[]>([]);

    useEffect(() => {
        if (recipe) {
            setName(recipe.name);
            setCategory({ id: recipe.category_id ? recipe.category_id : undefined, name: recipe.category_name ? recipe.category_name : "" });
            setServings(recipe.servings ? recipe.servings.toString() : undefined);
            setIngredients(recipe.ingredients.map((ingredient): Ingredient => ({
                id: ingredient.id ?? Date.now(),
                apiId: ingredient.id,
                amount: ingredient.amount ? new Fraction(ingredient.amount) : undefined,
                unit: ingredient.unit,
                text: ingredient.text,
                comment: ingredient.comment
            })));
            setSteps(recipe.steps.map((step): Step => ({
                id: step.id ?? Date.now(),
                apiId: step.id,
                text: step.text,
            })));
            setImages(recipe.images.map((image): ImageWithFile => ({
                id: image.id ?? Date.now(),
                apiId: image.id,
                slot: image.slot,
                url: recipe.id ? `/api/uploads/recipe/${recipe.id}/${image.slot}.webp` : undefined,
                caption: image.caption,
                fileWasChanged: false
            })));
        }
    }, [recipe]);

    const newRecipe = (): Recipe => {
        return {
            id: recipe?.id,
            name: name,
            category_id: category?.id,
            category_name: category?.name,
            role: recipe?.role ?? 0,
            servings: servings ? parseInt(servings) : undefined,
            author: recipe?.author,

            images:
                images.filter(image => { return image.url ? true : false }).map((image): RecipeImage => ({
                    id: image.apiId,
                    slot: image.slot,
                    caption: image.caption,
                })),
            ingredients:
                ingredients.map((ingredient, index): RecipeIngredient => ({
                    id: ingredient.apiId,
                    index_number: index,
                    amount: ingredient.amount?.valueAsNumber,
                    unit: ingredient.unit,
                    text: ingredient.text,
                    comment: ingredient.comment
                })),
            steps:
                steps.map((step, index): RecipeStep => ({
                    id: step.apiId,
                    index_number: index,
                    text: step.text,
                }))
        }
    }

    const handleImagesSubmit = async (recipeId: string) => {
        try {
            if (images.length === 0) return;

            const formData = new FormData();

            images.forEach(image => {
                if (!(image.file && image.fileWasChanged)) return;

                formData.append("images", image.file);

                formData.append("slots", image.slot.toString())
            })

            const response = await fetch(`${backendAddress}/uploads/recipe/${recipeId}`, {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Uploading images failed");
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Unexpected error";
            throw new Error(message)
        }
    }

    return (
        <form
            onSubmit={(e) => {
                onFormSubmit?.(e, newRecipe())
                    .then(id => {
                        if (id === "-1") return;

                        handleImagesSubmit(id);
                    });
            }}
            aria-disabled={disabled || (globalState.modalsOpen > 0)}
        >
            <fieldset className='form form-recipe recipe' disabled={disabled || (globalState.modalsOpen > 0)}>
                <div className='input-recipe-group-head recipe-group-head'>
                    <div className='recipe-name'>
                        <label className='input-recipe-name-label' id='recipe-name-label' htmlFor='recipe-name'>Name:</label>
                        <input
                            type="text"
                            className="input-recipe-name"
                            id="recipe-name"
                            maxLength={64}
                            placeholder="New recipe"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            aria-labelledby='recipe-name-label'
                            required
                        />
                    </div>
                    <ImageForm
                        index={images.findIndex(image => { return image.slot === 0 })}
                        slot={0}
                        value={images[images.findIndex(image => { return image.slot === 0 })]}
                        setAction={setImages}
                    />
                    <div className='recipe-category'>
                        <CategorySelector
                            setAction={setCategory}
                            value={category}
                        />
                    </div>
                    <div className='recipe-servings'>
                        <input
                            type="number"
                            className='input-recipe-servings'
                            id="recipe-servings"
                            min={1}
                            onChange={(e) => setServings(e.target.value)}
                            value={servings}
                            aria-labelledby='servings-label'
                            required
                        />
                        <label className='input-recipe-servings-label recipe-servings-label' id='recipe-servings-label' htmlFor='recipe-servings'>Servings</label>
                    </div>
                    <div className={'recipe-author' + (recipe?.author ? '' : ' empty')}>
                        {recipe?.author}
                        <div className='recipe-author__title'>Author</div>
                    </div>
                </div>
                <div className='input-recipe-group-ingredients recipe-group-ingredients'>
                    <h2>Ingredients</h2>
                    <SortableFieldsetContext
                        value={ingredients}
                        setAction={setIngredients}
                    >
                        {ingredients.map((ingredient, index) => (
                            <SortableFieldset
                                key={ingredient.id}
                                id={ingredient.id}
                                className='input-recipe-ingredient__wrapper recipe-ingredient__wrapper'
                            >
                                <IngredientForm
                                    index={index}
                                    value={ingredient}
                                    setAction={setIngredients}
                                />
                                <DeleteButton
                                    index={index}
                                    setAction={setIngredients}
                                    aria-label='Delete this ingredient'
                                />
                            </SortableFieldset>
                        ))}
                    </SortableFieldsetContext>
                    <AddButton
                        createItem={() => ({
                            id: Date.now(),
                            text: "",
                        })}
                        setAction={setIngredients}
                        aria-label='Add an ingredient'
                        title='Add an ingredient'
                    />
                </div>
                <div className='input-recipe-group-steps recipe-group-steps'>
                    <h2>Directions</h2>
                    <SortableFieldsetContext
                        value={steps}
                        setAction={setSteps}
                    >
                        {steps.map((step, index) => (
                            <SortableFieldset
                                key={step.id}
                                id={step.id}
                                className='input-recipe-step__wrapper recipe-step__wrapper'
                            >
                                <StepForm
                                    index={index}
                                    value={step}
                                    setAction={setSteps}
                                />
                                <DeleteButton
                                    index={index}
                                    setAction={setSteps}
                                    aria-label='Delete this step'
                                />
                            </SortableFieldset>
                        ))}
                    </SortableFieldsetContext>
                    <AddButton
                        createItem={() => ({
                            id: Date.now(),
                            text: "",
                        })}
                        setAction={setSteps}
                        aria-label='Add a step'
                        title='Add a step'
                    />
                </div>
                <ImageForm
                    index={images.findIndex(image => { return image.slot === 1 })}
                    slot={1}
                    value={images[images.findIndex(image => { return image.slot === 1 })]}
                    setAction={setImages}
                />
                <ImageForm
                    index={images.findIndex(image => { return image.slot === 2 })}
                    slot={2}
                    value={images[images.findIndex(image => { return image.slot === 2 })]}
                    setAction={setImages}
                />
                <div className='input-recipe-group-footer'>
                    <BackButton>
                        Back
                    </BackButton>
                    <button
                        type="submit"
                        disabled={disabled}
                    >
                        Save
                    </button>
                </div>
            </fieldset>
        </form>
    )
}

export default RecipeForm