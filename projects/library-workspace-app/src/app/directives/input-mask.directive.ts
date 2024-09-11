import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


type FormatCallback = (value: string) => string;

type InputMaskConfig = {

  prefix: string;
  suffix: string;
  decimalPoint: string;
  decimalPlaces: number;
  separator: string;

}
const DEFAULT_INPUT_MASK_CONFIG: InputMaskConfig = {
  prefix: "$",
  suffix: "",
  decimalPoint: ".",
  decimalPlaces: 2,
  separator: ","

}

@Directive({
  selector: 'input[inputMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputMaskDirective),
      multi: true
    }
  ]
})
export class InputMaskDirective implements ControlValueAccessor {

  @Input() formatCallback: FormatCallback = (value) => value;
  @Input('numericOnly') isNumericOnly: boolean = false;

  config: InputMaskConfig = DEFAULT_INPUT_MASK_CONFIG;

  private rawValue: string = '';
  private formattedValue: string = '';

  private onChange: ((value: string | number) => void | undefined) | undefined;
  private onTouched: (() => void | undefined) | undefined;

  constructor(private el: ElementRef) {

  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    
    if (!this.isNumericOnly) return;
      
    const charCode = event.key.charCodeAt(0);
    console.log("🚀 ~ InputMaskDirective ~ onKeyPress ~ charCode:", charCode)
    
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
    }
    
  }


  @HostListener('input', ['$event'])
  onInput(event: Event) {
    console.log('Inputting...', (event.target as any).value);

    const input = event.target as HTMLInputElement;

    if(this.isNumericOnly) {

      if(isNaN(+input.value)) {
        input.value.replace(/[^\d.]/g, '');
        return;
      }

      this.rawValue = input.value.replace(/[^\d.]/g, '');

    } else {
      this.rawValue = input.value;
    }

    this.formattedValue = this.formatCallback(this.rawValue);

    if (this.onChange) {
      this.onChange(this.isNumericOnly ? +this.rawValue : this.rawValue);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    
    // If the input is not numeric, do nothing
    if(!this.isNumericOnly) return;

    const clipboardData = event.clipboardData || (window as any).clipboardData;
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

    // if more than specified digits after decimal point, remove the rest
    const decimalPoint = this.config.decimalPoint;
    const decimalPlaces = this.config.decimalPlaces;
    if(pastedText.includes(decimalPoint)) {
      this.rawValue = pastedText.split(decimalPoint)[0] + '.' + pastedText.split(decimalPoint)[1].slice(0, decimalPlaces);
    } else {
      this.rawValue = pastedText;
    }
    
    this.formattedValue = this.formatCallback(pastedText);
    
    // Set the cleaned value to the input
    const input = event.target as HTMLInputElement;
    input.value = this.formattedValue

    // Trigger the change event
    if(this.onChange) {
      this.onChange(+this.rawValue);
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
    input.value = this.rawValue;
  }

  writeValue(value: string): void {
    if(this.isNumericOnly && isNaN(+value)) {
      throw new Error('Value must be a number');
    }

    this.rawValue = value || '';
    this.formattedValue = this.formatCallback(this.rawValue);
    this.el.nativeElement.value = this.formattedValue; 
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }


  
}
