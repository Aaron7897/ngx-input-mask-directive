import { Component, forwardRef } from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { InputMaskDirective } from '../directives/input-mask.directive';

@Component({
  selector: 'custom-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule,
    InputMaskDirective,
    ReactiveFormsModule
  ],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss'
})
export class CustomInputComponent {

  testCtrl: FormControl = new FormControl();

  constructor() { 

    this.testCtrl.valueChanges.subscribe((value) => console.log(typeof value, value));
  }

  boop() {
    console.log("test", typeof this.testCtrl.value, this.testCtrl.value);
  }

  testFn(value: string): string {
  console.log("🚀 ~ CustomInputComponent ~ testFn ~ value:", value)

    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? '$0.00' : `$${numberValue.toFixed(2)}`;
  }
}


