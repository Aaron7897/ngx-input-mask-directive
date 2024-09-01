import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


type FormatCallback = (value: string) => string;

@Directive({
  selector: '[inputMask]',
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
    if (this.numericOnly) {
      const charCode = event.key.charCodeAt(0);
      if (charCode !== 46 && (charCode < 48 || charCode > 57)) {
        event.preventDefault();
      }

      // if raw value already has 2 decimals
      if (this.rawValue.includes('.') && this.rawValue.split('.')[1].length >= 2) {
        event.preventDefault();
      }
    }
  }


  @HostListener('input', ['$event'])
  onInput(event: Event) {
    console.log("🚀 ~ InputMaskDirective ~ onInput ~ event:", event)
    const input = event.target as HTMLInputElement;

    if(this.numericOnly && isNaN(+input.value)) {
      console.log("test")
      input.value.replace(/[^\d.]/g, '');
      return;
    }

    this.rawValue = input.value;

    this.formattedValue = this.formatCallback(this.rawValue);

    if (this.onChange) {
      this.onChange(this.numericOnly ? +this.rawValue : this.rawValue);
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event) {
    console.log("🚀 ~ InputMaskDirective ~ onBlur ~ event:", event)
    const input = event.target as HTMLInputElement;
    console.log("🚀 ~ InputMaskDirective ~ onBlur ~ input:", input.value)
    input.value = this.formattedValue;
    if (this.onTouched) {
      this.onTouched();
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event) {
    console.log("🚀 ~ InputMaskDirective ~ onFocus ~ event:", event)
    const input = event.target as HTMLInputElement;
    console.log("🚀 ~ InputMaskDirective ~ onFocus ~ input:", input.value)
    input.value = this.rawValue;
  }

  writeValue(value: string): void {
    console.log("🚀 ~ InputMaskDirective ~ writeValue ~ value:", value)
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
