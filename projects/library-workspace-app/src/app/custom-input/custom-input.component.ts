import { Component, forwardRef } from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NumericInputMaskDirective } from '../directives/input-mask.directive';

@Component({
  selector: 'custom-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule,
    NumericInputMaskDirective,
    ReactiveFormsModule
  ],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss'
})
export class CustomInputComponent {

  testCtrl: FormControl = new FormControl(null, [Validators.required]);

  constructor() { 

    this.testCtrl.valueChanges.subscribe((value) => console.log(typeof value, value));
  }

  boop() {
    console.log("test", typeof this.testCtrl.value, this.testCtrl.value);
  }

  testFn(value: string): string {

    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
      return '$0.00';
    }

    // Format number with commas
    const formattedNumber = numberValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${formattedNumber}`;
  }
}


