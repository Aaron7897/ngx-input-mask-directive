import { InjectionToken } from "@angular/core";

export type InputMaskConfig = {

    prefix: string;
    suffix: string;
    decimalPoint: string;
    decimalPlaces: number;
    separator: string;
  
}

export const DEFAULT_INPUT_MASK_CONFIG: InputMaskConfig = {
    prefix: "$",
    suffix: "",
    decimalPoint: ".",
    decimalPlaces: 2,
    separator: ","
  
}

// injection token
export const INPUT_MASK_CONFIG = new InjectionToken<InputMaskConfig>('INPUT_MASK_CONFIG');