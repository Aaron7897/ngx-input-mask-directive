import { Directive, ElementRef, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DEFAULT_NUMERIC_INPUT_MASK_CONFIG, NumericInputMaskConfig } from './input-mask.config';


type FormatCallback = (value: string | null) => string;

@Directive({
  selector: 'input[inputMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumericInputMaskDirective),
      multi: true
    }
  ]
})
export class NumericInputMaskDirective implements ControlValueAccessor {

  private readonly config: NumericInputMaskConfig = DEFAULT_NUMERIC_INPUT_MASK_CONFIG;
  private readonly zeroString = '0';

  private rawValue: string | null = null;
  private formattedValue: string = '';

  private onChange: ((value: string | number | null) => void | undefined) | undefined;
  private onTouched: (() => void | undefined) | undefined;

  constructor(private el: ElementRef) {

  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
          
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

    const rawValue = this.rawValue ?? '';

    const cursorPosition = this.el.nativeElement.selectionStart;
    const hasDecimalPoint = rawValue.includes(decimalPoint);
    
    const isCursorAfterDecimal = hasDecimalPoint && cursorPosition > rawValue.indexOf(decimalPoint);
    const hasMoreThanSpecifiedDecimalPlaces = rawValue.split(decimalPoint)[1]?.length >= this.config.decimalPlaces;

    // if cursor is after the decimal point, prevent more than specified decimal characters
    if (isCursorAfterDecimal && hasMoreThanSpecifiedDecimalPlaces) {
      event.preventDefault();
    }

    // Prevent more than one decimal points
    if (isDecimalPoint && rawValue.includes(decimalPoint)) {
      event.preventDefault();
    }
    
    
  }


  @HostListener('input', ['$event'])
  onInput(event: Event) {
    
    const input = event.target as HTMLInputElement;

    if(isNaN(+input.value)) {
      input.value.replace(/[^\d.]/g, '');
      return;
    }

    // removes all leading zeros unless the input is all zeros
    const valueWithoutLeadingZeros =  input.value.replace(/^0+(?=\d)/, '');

    // if the input is blank, set the raw value to null
    this.rawValue = valueWithoutLeadingZeros == '' ? null : valueWithoutLeadingZeros;

    this.formattedValue = this.formatNumber(this.rawValue);

    const onChangeValue = this.rawValue === null ? null : +this.rawValue;

    if (this.onChange) {
      this.onChange(onChangeValue);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {

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

    if(pastedText.includes(decimalPoint)) {
      // if more than specified digits after decimal point, remove the rest
      const rawString = this.handleDecimalPlaces(pastedText);
      this.rawValue = rawString;
    } else {
      this.rawValue = pastedText;
    }
    
    this.formattedValue = this.formatNumber(pastedText);
    
    // Set the cleaned value to the input
    const input = event.target as HTMLInputElement;
    input.value = this.formattedValue

    // Trigger the change event
    if(this.onChange) {
      this.onChange(this.rawValue);
    }    
  }


  @HostListener('blur', ['$event'])
  onBlur(event: Event) {

    const input = event.target as HTMLInputElement;
    input.value = this.formattedValue;

    if (this.onTouched) {
      this.onTouched();
    }

  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event) {
    const input = event.target as HTMLInputElement;

    console.log(this.rawValue);

    input.value = this.rawValue ?? '';
  }

  writeValue(value: string |  null): void {

    if(value !== null && isNaN(+value)) {
      throw new Error('Value must be a number');
    }

    this.rawValue = value;
    this.formattedValue = this.formatNumber(this.rawValue);
    this.el.nativeElement.value = this.formattedValue; 

  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  private formatNumber: FormatCallback = (value: string | null) => {
    
    const prefix = this.config.prefix;
    const decimalPoint = this.config.decimalPoint;
    const suffix = this.config.suffix;
    const separator = this.config.separator;

    if(value === null) return '';

    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
      return this.formatNumber(this.zeroString);
    }

    // remove extra decimal places
    value = this.handleDecimalPlaces(value);
    console.log("🐬 -- NumericInputMaskDirective -- value22:", value)


    value = this.addSeparators(value);

    const formattedNumber = `${prefix}${value}${suffix}`
      
    console.log("🐬 -- NumericInputMaskDirective -- formattedNumber:", formattedNumber)
    
    return formattedNumber;

  }

  private addSeparators(value: string): string {
    
    const separator = this.config.separator;
    const parts = value.split(this.config.decimalPoint);
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const integerPartWithSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    return decimalPart ? `${integerPartWithSeparator}${this.config.decimalPoint}${decimalPart}` : integerPartWithSeparator;
  }

  private handleDecimalPlaces(value: string): string {
    const decimalPoint = this.config.decimalPoint;
    const decimalPlaces = this.config.decimalPlaces;

    // remove only if there are more than specified decimal places
    const parts = value.split(decimalPoint);
    if(parts[1]?.length > decimalPlaces) {
      parts[1] = parts[1].substring(0, decimalPlaces);
    }

    if(!parts[1] || parts[1].length < decimalPlaces) {
      parts[1] = parts[1] ?? '';
      const missingZeros = decimalPlaces - parts[1].length;
      parts[1] = parts[1] + this.zeroString.repeat(missingZeros);
    }

    return parts.join(decimalPoint);
  }
}
