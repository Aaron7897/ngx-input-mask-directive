export interface InputHandlerService { 
    
    onChange: ((value: string | number) => void | undefined) | undefined;
    onTouched: (() => void | undefined) | undefined;

    onPaste(event: ClipboardEvent): void;
    onKeyPress(event: KeyboardEvent): void;
    onInput(event: Event): void;
    writeValue(value: string | number): void;
    registerOnChange(fn: (value: string | number) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;

}

type FormatCallback = (value: string) => string;
