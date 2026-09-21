class Fraction {
    private _valueAsNumber: number | undefined;
    get valueAsNumber() {
        return this._valueAsNumber
    }
    set valueAsNumber(value) {
        this._valueAsNumber = value;
        this._valueAsString = value?.toString();
    }

    private _valueAsString: string | undefined;
    get valueAsString() {
        return this._valueAsString
    }
    set valueAsString(value) {
        this._valueAsNumber = Fraction.parseFraction(value);
        this._valueAsString = value;
    }

    constructor();
    constructor(value: number);
    constructor(value: string);
    constructor(value: number | string | undefined = undefined) {
        if (value === undefined) {
            this._valueAsNumber = undefined;
            this._valueAsString = "";
        } else if (typeof value == "number") {
            this._valueAsNumber = value;
            this._valueAsString = value.toString();
        } else if (typeof value == "string") {
            this._valueAsNumber = Fraction.parseFraction(value);
            this._valueAsString = value;
        }
    }

    private static parseFraction(value: string | undefined): number | undefined {
        if (!value || value === "") return undefined;

        const str = value.trim();

        if (!str || str === "") return undefined;

        if (/^\d+(\.\d+)?$/.test(str)) {
            return parseFloat(str);
        }

        if (/^\d+\s*\/\s*\d+$/.test(str)) {
            const [num, den] = str.split("/").map((s) => parseFloat(s.trim()));

            if (den === 0) return undefined;

            return num / den;
        }

        if (/^-?\d+\s+\d+\s*\/\s*\d+$/.test(str)) {
            const parts = str.split(/\s+/);

            const whole = parseFloat(parts[0]);
            const [num, den] = parts[1].split("/").map((s) => parseFloat(s.trim()));

            if (den === 0) return undefined;

            return whole + (num / den);
        }
        return undefined;
    }
}

export default Fraction