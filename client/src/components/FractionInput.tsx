import Fraction from '../utils/Fraction'

type FractionInputProps =
    Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "type" | "pattern" | "onChange" | "value"
    > & {
        value?: Fraction
        onValueChange?: React.ChangeEventHandler<HTMLInputElement>;
    }

const FractionInput = ({ value, onValueChange, ...props }: FractionInputProps) => {
    return (
        <input
            {...props}
            type="text"
            pattern={[
                "^$",
                "^\\d+(\\.\\d+)?$",
                "^\\d+\\s*\\/\\s*\\d+$",
                "^\\d+\\s+\\d+\\s*\\/\\s*\\d+$"
            ].join("|")}
            value={value?.valueAsString}
            onChange={onValueChange}
        />
    )
}

export default FractionInput