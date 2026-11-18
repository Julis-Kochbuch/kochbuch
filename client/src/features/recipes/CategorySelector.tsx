import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '../../components/Modal';
import { useGlobalState, useGlobalStateDispatch } from '../../utils/GlobalState';
import AddButton from '../../components/AddButton';
import backendAddress from '../../utils/BackendAddress';

import '../../assets/css/category-selector.css';

export type Category = {
    id: number | undefined;
    name: string;
};

type CategorySelectorProps = {
    value?: Category;
    setAction: React.Dispatch<React.SetStateAction<Category | undefined>>;
};

const CategorySelector = ({ value, setAction }: CategorySelectorProps) => {
    const globalState = useGlobalState();
    const globalStateDispatch = useGlobalStateDispatch();

    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    const { t: tRecipe } = useTranslation("recipe");

    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState<string>("");
    const [edittingCategories, setEdittingCategories] = useState(false);
    const [currentlyEditting, setCurrentlyEditting] = useState<number>();


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${backendAddress}/recipe/categories`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.message || t(tErrors("fetching_categories_failed")));
                }

                setCategories(data as Category[]);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : t(tErrors("unexpected_error"));

                throw new Error(message);
            }
        };
        fetchCategories();
    }, []);

    const handleCategorySubmit = async (e: React.SyntheticEvent<HTMLFormElement>, categoryId: number | undefined, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setError("");

        try {
            setCurrentlyEditting(undefined);

            let requestInfo = "" as RequestInfo;

            if (categoryId === undefined) {
                requestInfo = `${backendAddress}/recipe/categories` as RequestInfo;
            } else {
                requestInfo = `${backendAddress}/recipe/categories/${categoryId}` as RequestInfo;
            }

            const response = await fetch(requestInfo, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    name: newCategory
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (categoryId === undefined) {
                    throw new Error(data.error || data.message || t(tErrors("creating_category_failed")));
                } else {
                    throw new Error(data.error || data.message || t(tErrors("editting_category_failed")));
                }
            }

            setCategories(prev => {
                const next = [...prev];

                next[index].id = next[index].id ?? data.id;
                next[index].name = newCategory;

                return next;
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));

            setCurrentlyEditting(index);
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (categoryId: number | undefined, index: number) => {
        setLoading(true);
        setError("");

        setCurrentlyEditting(undefined);

        try {
            if (categoryId === undefined) {
                throw new Error(t(tErrors("error_occured_while_selecting_category_to_be_deleted")));
            }

            const response = await fetch(`${backendAddress}/recipe/categories/` + categoryId, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || t(tErrors("deleting_category_failed")));
            }

            setCategories(items =>
                items.filter((_, i) => i !== index)
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <label className='recipe-category-label' htmlFor="recipe-category" id='recipe-category-label'>{t(tRecipe("category"))}:</label>
            <select
                id="recipe-category"
                className='input-recipe-category'
                onChange={(e => {
                    setAction(categories.filter((category) => category.id === parseInt(e.target.value))[0])
                })}
                value={value?.id?.toString()}
                aria-labelledby='recipe-category-label'
                disabled={loading || globalState.modalsOpen > 0}
            >
                <option value={""}>{t("none")}</option>
                {
                    categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))
                }
            </select>
            <button
                type='button'
                aria-label={t(tRecipe("edit_categories"))}
                onClick={() => {
                    setEdittingCategories(true);
                    globalStateDispatch({ type: 'open modal' })
                }}></button>
            {error && <div>{error}</div>}
            {edittingCategories && (
                <Modal
                    onCloseButtonClick={() => {
                        setEdittingCategories(false);
                        setCurrentlyEditting(undefined);
                        setNewCategory("");
                        globalStateDispatch({ type: 'close modal' })
                    }}
                >
                    <h2>{t(tRecipe("edit_categories"))}</h2>
                    <ul className='categories'>
                        {categories.map((category, index) => (
                            <li className='category'>
                                {currentlyEditting === index ?
                                    <form id='category-form' onSubmit={(e) => handleCategorySubmit(e, category.id, index)}>
                                        <input
                                            type='text'
                                            autoComplete="off"
                                            className='category__name'
                                            maxLength={32}
                                            value={newCategory}
                                            onChange={(e) => {
                                                setNewCategory(e.target.value);
                                            }}
                                            required
                                        />
                                        <div className='category__controls'>
                                            <button
                                                type='button'
                                                aria-label={t("cancel")}
                                                onClick={() => {
                                                    setCurrentlyEditting(undefined);
                                                    setNewCategory("");
                                                }}
                                            ></button>
                                            <button type='submit' form='category-form' aria-label={t("save")}></button>
                                        </div>
                                    </form>
                                    :
                                    <>
                                        <div className='category__name'>{category.name}</div>
                                        <div className='category__controls'>
                                            <button
                                                type='button'
                                                aria-label={t("edit")}
                                                onClick={() => {
                                                    setCurrentlyEditting(index);
                                                    setNewCategory(category.name);
                                                }}
                                            ></button>
                                            <button
                                                type='button'
                                                className='delete-button'
                                                aria-label={t("delete")}
                                                onClick={() => {
                                                    handleDelete(category.id, index)
                                                }}
                                            ></button>
                                        </div>
                                    </>
                                }
                            </li>
                        ))}
                    </ul>
                    <AddButton
                        createItem={() => ({ id: undefined, name: "" } as Category)}
                        setAction={setCategories}
                        aria-label={t(tRecipe("add_category"))}
                        title={t(tRecipe("add_category"))}
                        onClick={() => {
                            setCurrentlyEditting(categories.length);
                            setNewCategory(categories[categories.length].name);
                        }}
                    />
                    {error && <div>{error}</div>}
                    <div className='modal__controls'>
                        <button
                            type='button'
                            aria-label={t("close")}
                            onClick={() => {
                                setCurrentlyEditting(undefined);
                                setNewCategory("");
                                setEdittingCategories(false);
                                globalStateDispatch({ type: 'close modal' })
                            }}
                        ></button>
                    </div>
                </Modal>
            )}
        </>
    )
}

export default CategorySelector