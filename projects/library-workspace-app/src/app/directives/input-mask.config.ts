import { InjectionToken } from "@angular/core";

export type NumericInputMaskConfig = {

    prefix: string;
    suffix: string;
    decimalPoint: string;
    decimalPlaces: number;
    separator: string;
  
}

export const DEFAULT_NUMERIC_INPUT_MASK_CONFIG: NumericInputMaskConfig = {
    prefix: "$",
    suffix: "",
    decimalPoint: ".",
    decimalPlaces: 5,
    separator: ","
  
}

// injection token
export const NUMERIC_INPUT_MASK_CONFIG = new InjectionToken<NumericInputMaskConfig>('NUMERIC_INPUT_MASK_CONFIG');