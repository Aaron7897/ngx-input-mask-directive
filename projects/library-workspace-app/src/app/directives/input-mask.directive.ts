import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


type FormatCallback = (value: string) => string;

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
  @Input() numericOnly: boolean = false;

  private rawValue: string = '';
  private formattedValue: string = '';

  private onChange: ((value: string | number) => void | undefined) | undefined;
  private onTouched: (() => void | undefined) | undefined;

  constructor(private el: ElementRef) {

  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    
    if (!this.numericOnly) return;
      
    const charCode = event.key.charCodeAt(0);
    
    if (charCode !== 46 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }

    // if raw value already has 2 decimals
    if (this.rawValue.includes('.') && this.rawValue.split('.')[1].length >= 2) {
      event.preventDefault();
    }

    // Prevent more than 2 decimal points
    if (charCode === 46 && this.rawValue.includes('.')) {
      event.preventDefault();
    }
    
    
  }


  @HostListener('input', ['$event'])
  onInput(event: Event) {
    
    const input = event.target as HTMLInputElement;

    if(this.numericOnly && isNaN(+input.value)) {
      input.value.replace(/[^\d.]/g, '');
      return;
    }

    this.rawValue = this.numericOnly ? input.value.replace(/^0+/, '') :  input.value;

    this.formattedValue = this.formatCallback(this.rawValue);

    if (this.onChange) {
      this.onChange(this.numericOnly ? +this.rawValue : this.rawValue);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {

    // If the input is not numeric, do nothing
    if(!this.numericOnly) return;

    const clipboardData = event.clipboardData || (window as any).clipboardData;
    let pastedText = clipboardData.getData('text');

    // Remove commas from the pasted text
    pastedText = pastedText.replace(/,/g, '');

    // Prevent the default paste action
    event.preventDefault();

    if(isNaN(+pastedText)) {
      return;
    };

    this.rawValue = pastedText;

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
    if(this.numericOnly && isNaN(+value)) {
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
