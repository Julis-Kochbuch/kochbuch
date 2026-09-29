import type { Ref } from 'react';
import Fraction from '../utils/Fraction'

type FractionInputProps =
    Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "type" | "pattern" | "onChange" | "value"
    > & {
        value?: Fraction;
        ref?: Ref<HTMLInputElement>;
        onValueChange?: React.ChangeEventHandler<HTMLInputElement>;
    }

const FractionInput = ({ value, ref, onValueChange, ...props }: FractionInputProps) => {
    return (
        <input
            {...props}
            type="text"
            ref={ref}
            pattern={[
                "^$",
                "^\\d+(\\.\\d+)?$",
                "^\\d+(,\\d+)?$",
                "^\\d+\\s*\\/\\s*\\d+$",
                "^\\d+\\s+\\d+\\s*\\/\\s*\\d+$"
            ].join("|")}
            inputMode="decimal"
            value={value?.valueAsString}
            onChange={onValueChange}
        />
    )
}

export default FractionInput