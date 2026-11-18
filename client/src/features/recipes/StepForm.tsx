import { useTranslation } from 'react-i18next';

import type { FieldsetFormProps } from '../../utils/FieldsetFormProps';

export type Step = {
    id: number;
    apiId?: number;
    text: string;
};

const StepForm = ({ value, index, ref, setAction }: FieldsetFormProps<Step, HTMLTextAreaElement>) => {
    const { t } = useTranslation("recipe");

    return (
        <div className='input-recipe-step__content recipe-step__content'>
            <div className='recipe-step-index'>
                {index + 1}
            </div>
            <textarea
                id="text"
                ref={ref}
                autoComplete="off"
                onChange={(e) => {
                    setAction(prev => {
                        const next = [...prev];

                        prev[index].text = e.target.value;

                        return next;
                    });
                }}
                value={value.text}
                title={t("step", {count: 1})}
                required
            />
        </div>
    )
}

export default StepForm