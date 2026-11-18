import { useTranslation } from 'react-i18next';

import type { FieldsetFormProps } from '../../utils/FieldsetFormProps';
import Fraction from '../../utils/Fraction';
import FractionInput from '../../components/FractionInput';

export type Ingredient = {
    id: number;
    apiId?: number;
    amount?: Fraction;
    unit?: string;
    text: string;
    comment?: string;
};

const IngredientForm = ({ value, index, ref, setAction }: FieldsetFormProps<Ingredient, HTMLInputElement>) => {
    const { t } = useTranslation("recipe");

    return (
        <div className='input-recipe-ingredient__content recipe-ingredient__content'>
            <FractionInput
                id="amount"
                ref={ref}
                placeholder={t("amount")}
                title={t("amount")}
                onValueChange={(e) => {
                    setAction(prev => {
                        const next = [...prev];

                        next[index] = {
                            ...next[index],
                            amount: new Fraction(e.target.value),
                        };

                        return next;
                    });
                }}
                value={value.amount}
                size={Math.max(1, value.amount?.valueAsString?.length ?? 0)}
            />
            <input
                type="text"
                id="unit"
                autoComplete="off"
                autoCapitalize="off"
                maxLength={16}
                placeholder={t("unit")}
                title={t("unit")}
                onChange={(e) => {
                    setAction(prev => {
                        const next = [...prev];

                        next[index].unit = e.target.value;

                        return next;
                    });
                }}
                value={value.unit}
                size={(value.unit) ? Math.max(value.unit.length, 1) : 1}
            />
            <input
                type="text"
                id="text"
                autoComplete="off"
                maxLength={64}
                placeholder={t("ingredient", {count: 1})}
                title={t("ingredient", {count: 1})}
                onChange={(e) => {
                    setAction(prev => {
                        const next = [...prev];

                        next[index].text = e.target.value;

                        return next;
                    });
                }}
                value={value.text}
                size={(value.text) ? Math.max(value.text.length, 4) : 4}
                required
            />
            <textarea
                id="comment"
                placeholder={t("comment")}
                autoComplete="off"
                autoCapitalize="off"
                title={t("comment")}
                onChange={(e) => {
                    setAction(prev => {
                        const next = [...prev];

                        next[index].comment = e.target.value;

                        return next;
                    });
                }}
                value={value.comment}
            />
        </div>
    )
}

export default IngredientForm