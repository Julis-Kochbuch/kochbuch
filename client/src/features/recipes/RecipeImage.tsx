import { type RecipeImage } from "@kochbuch/common";

type ImageRecipeProps = {
    slot: number;
    recipeId: number | undefined;
    images: RecipeImage[] | undefined;
}

const ImageRecipe = ({ slot, recipeId, images }: ImageRecipeProps) => {
    const image = images?.find(image => image.slot === slot);

    return (
        <div className={'recipe-image image-' + slot + ((image && recipeId) ? '' : ' empty')}>
            {(image && recipeId) &&
                <>
                    <img src={`/uploads/images/recipe-${recipeId}/${slot}.webp`} />
                    <div className="recipe-image__text">{image.caption}</div>
                </>
            }
        </div>
    )
}

export default ImageRecipe