import { type RecipeImage } from "@kochbuch/common";

type RecipeImageProps = {
    slot: number;
    recipeId: number | undefined;
    images: RecipeImage[] | undefined;
}

const RecipeImage = ({ slot, recipeId, images }: RecipeImageProps) => {
    const image = images?.find(image => image.slot === slot);

    return (
        <div className={'recipe-image image-' + slot + ((image && recipeId) ? '' : ' empty')}>
            {(image && recipeId) &&
                <>
                    <img src={"/api/uploads/recipe/" + recipeId + "/" + slot + ".webp"} />
                    <div className="recipe-image__text">{image.caption}</div>
                </>
            }
        </div>
    )
}

export default RecipeImage