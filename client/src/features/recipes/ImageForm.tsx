import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { FieldsetFormProps } from '../../utils/FieldsetFormProps';
import AddButton from '../../components/AddButton';

type ImageFormProps =
    Omit<FieldsetFormProps<ImageWithFile>,
        "value"> & {
            value?: ImageWithFile;
            slot: number;
        }

export type ImageWithFile = {
    id: number;
    apiId?: number;
    slot: number;
    url?: string;
    file?: File;
    caption?: string;
    fileWasChanged: boolean;
};

const ImageForm = ({ value, slot, index, setAction }: ImageFormProps) => {
    const { t } = useTranslation("common");
    const { t: tErrors } = useTranslation("errors");
    const { t: tRecipe } = useTranslation("recipe");

    const [addingCaption, setAddingCaption] = useState<boolean>(false);

    const [error, setError] = useState("");

    useEffect(() => {
        setAddingCaption(value?.caption ? true : false);
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");

        try {
            const file = e.target.files?.[0];

            if (!file) {
                setAction(prev => {
                    const next = [...prev];

                    next.splice(index, 1);

                    return next;
                });
                return;
            }

            if (!file.type.startsWith("image/")) {
                throw new Error(t(tErrors("please_select_an_image")));
            }

            setAction(prev => {
                const next = [...prev];

                next[index] = {
                    ...next[index],
                    url: URL.createObjectURL(file),
                    file: file,
                    fileWasChanged: true
                };

                return next;
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t(tErrors("unexpected_error"));
            setError(message);
        }
    }

    return (
        (value === undefined) ?
            <div className={'input-recipe-image__wrapper recipe-image image-' + slot}>
                <AddButton
                    className='recipe-image__add'
                    createItem={(): ImageWithFile => ({
                        id: Date.now(),
                        slot: slot,
                        fileWasChanged: false
                    })}
                    setAction={setAction}
                    aria-label={t(tRecipe("add_image"))}
                    title={t(tRecipe("add_image"))}
                />
            </div>
            :
            <div className={'input-recipe-image__wrapper recipe-image image-' + slot}>
                <div className='input-recipe-image__inner'>
                    <label className='input-recipe-image__image' htmlFor={"image-" + index}>
                        <input
                            type="file"
                            accept='image/png, image/jpeg, image/webp'
                            id={"image-" + index}
                            onChange={handleFileChange}
                        />
                        {value.url && <img src={value.url} />}
                    </label>
                    <div className='input-recipe-image__controls'>
                        <button
                            type='button'
                            aria-label={(addingCaption) ? t(tRecipe("remove_caption")) : t(tRecipe("add_caption"))}
                            onClick={() => {
                                if (addingCaption) {
                                    setAction(prev => {
                                        const next = [...prev];

                                        next[index] = {
                                            ...next[index],
                                            caption: undefined,
                                        };

                                        return next;
                                    });
                                }
                                setAddingCaption(!addingCaption);
                            }}
                        ></button>
                        <button
                            type='button'
                            aria-label={t(tRecipe("remove_image"))}
                            onClick={() => {
                                setAction(prev => {
                                    const next = [...prev];

                                    next.splice(index, 1);

                                    return next;
                                });
                            }}
                        ></button>
                    </div>
                </div>
                {error && <div>{error}</div>}
                {(addingCaption) &&
                    <>
                        <label htmlFor={"image-caption-" + index} id={"image-caption-label-" + index}>{t(tRecipe("caption"))}:</label>
                        <input
                            type='text'
                            autoComplete="off"
                            aria-labelledby={"image-caption-label-" + index}
                            className='recipe-image__text'
                            value={value.caption ?? undefined}
                            onChange={(e) => {
                                setAction(prev => {
                                    const next = [...prev];

                                    next[index] = {
                                        ...next[index],
                                        caption: e.target.value,
                                    };
                                    console.log(next[index]);
                                    return next;
                                });
                            }}
                        />
                    </>
                }
            </div>
    )
}

export default ImageForm