export type RecipeImage = {
    id?: number;
    slot: number;
    caption?: string;
    changed?: number;
}

export type RecipeIngredient = {
    id?: number;
    index_number: number;
    amount?: number;
    unit?: string;
    text: string;
    comment?: string;
}

export type RecipeStep = {
    id?: number;
    index_number: number;
    text: string;
}

export interface Recipe {
    id?: number;
    name: string;
    category_id?: number;
    category_name?: string;
    role: number;
    servings?: number;
    duration?: number;
    author?: string;

    images: RecipeImage[];
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
}