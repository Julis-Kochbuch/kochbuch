export interface Category {
    id: number | undefined;
    name: string;
};

interface RecipeSimplified {
    id: number;
    name: string;
}

export interface RecipeListByCategory {
    category_name?: string;
    recipes: RecipeSimplified[];
}