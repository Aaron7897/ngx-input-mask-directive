import { inject } from "@angular/core";
import { InputHandlerService } from "./input-handler.service";
import { INPUT_MASK_CONFIG, InputMaskConfig } from "./input-mask.config";

export class NumericInputHandler implements InputHandlerService {
    
    private readonly config: InputMaskConfig = inject(INPUT_MASK_CONFIG);

    private rawValue: number = 0;
    private formattedValue: string = '';

    constructor() {

    }

    onChange: ((value: string | number) => void | undefined) | undefined;
    onTouched: (() => void | undefined) | undefined;

    public onPaste(event: ClipboardEvent): void {

        const clipboardData: DataTransfer = event.clipboardData || (window as any).clipboardData;
        let pastedText = clipboardData.getData('text');
    
        // Remove separator from the pasted text
        pastedText = pastedText.replace(this.config.separator, '');
        pastedText = pastedText.replace(this.config.prefix, '');
        pastedText = pastedText.replace(this.config.suffix, '');
    
        // Prevent the default paste action
        event.preventDefault();
    
        // if pasted text is still not a number, do nothing
        if(isNaN(+pastedText)) {
          return;
        };
    
        const decimalPoint = this.config.decimalPoint;
        const decimalPlaces = this.config.decimalPlaces;

        if(pastedText.includes(decimalPoint)) {
            // if more than specified digits after decimal point, remove the rest
            const rawString = pastedText.split(decimalPoint)[0] + decimalPoint + pastedText.split(decimalPoint)[1].slice(0, decimalPlaces);
            this.rawValue = +rawString;
        } else {
            this.rawValue = +pastedText;
        }
        
        this.formattedValue = this.formatCallback(pastedText);
        
        // Set the cleaned value to the input
        const input = event.target as HTMLInputElement;
        input.value = this.formattedValue
    
        // Trigger the change event
        if(this.onChange) {
          this.onChange(this.rawValue);
        }    
    }

    onKeyPress(event: KeyboardEvent): void {
        
        const charCode = event.key.charCodeAt(0);
        
        const decimalPoint = this.config.decimalPoint;
        const decimalPointCode = decimalPoint.charCodeAt(0);
        const separatorCode = this.config.separator.charCodeAt(0);
    
    
        const isNumber = charCode >= 48 && charCode <= 57;
    
        const isDecimalPoint = charCode === decimalPointCode;
        const isSeparator = charCode === separatorCode;
    
        // Allow only numbers and decimal point
        if (!(isNumber || isDecimalPoint || isSeparator)) {
          event.preventDefault();
        }
    
        const cursorPosition = this.el.nativeElement.selectionStart;
        const hasDecimalPoint = this.rawValue.includes(decimalPoint);
        
        // if cursor is after the decimal point, prevent more than 2 decimal characters
        const isCursorAfterDecimal = hasDecimalPoint && cursorPosition > this.rawValue.indexOf(decimalPoint);
        const hasMoreThanSpecifiedDecimalPlaces = this.rawValue.split(decimalPoint)[1]?.length >= this.config.decimalPlaces;
    
        if (isCursorAfterDecimal && hasMoreThanSpecifiedDecimalPlaces) {
          event.preventDefault();
        }
    
        // Prevent more than one decimal points
        if (charCode === decimalPointCode && this.rawValue.includes(decimalPoint)) {
          event.preventDefault();
        }    }
    onInput(event: Event): void {
        throw new Error("Method not implemented.");
    }
    writeValue(value: string | number): void {
        throw new Error("Method not implemented.");
    }
    registerOnChange(fn: (value: string | number) => void): void {
        throw new Error("Method not implemented.");
    }
    registerOnTouched(fn: () => void): void {
        throw new Error("Method not implemented.");
    }
    setDisabledState(isDisabled: boolean): void {
        throw new Error("Method not implemented.");
    }
    
    private formatCallback: (value: string) => string = (value: string) => {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) {
          return '$0.00';
        }
    
        const separator = this.config.separator;
        const prefix = this.config.prefix;
        const suffix = this.config.suffix;

        // Format number with commas
        const formattedNumber = numberValue
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

        return `${prefix}${formattedNumber}${suffix}`;
    }




}