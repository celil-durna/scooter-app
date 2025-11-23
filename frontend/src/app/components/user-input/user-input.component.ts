import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';

@Component({
  selector: 'app-user-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserInputComponent),
      multi: true,
    },
  ],
})
export class UserInputComponent implements ControlValueAccessor {
  isValidInput = true;
  errormessage = '';
  @Input() readonly = false;

  value = '';

  @Input() label = '';
  @Input() containerHeight = 60; // Standardhöhe
  @Input() containerOverflow = 'visible'; //Standardoverflow
  @Input() disablePasswordValidation = false;

  constructor() {}
  /**
   *  Anstatt einer Variable können diesen "@Input" Properties auch direkt Daten gegeben werden, indem die [eckigen Klammern]
   *  bei der Verwendung weggelassen werden:
   *
   *  <app-user-input type="password"></app-user-input>
   *                    ↑       ↑
   *   +----------------+       +--------------+
   *   |                                       |
   *  Wenn wir hier nicht [type]          Password ist in diesem
   *  sondern nur type schreiben,         Fall keine Variable,
   *  können wir einen String oder        sondern wird als
   *  anderen Wert statt einer            String 'password'
   *  Variable übergeben                  weitergereicht
   *
   *
   *  Spezifisch für diese Variable wollen wir nicht nur *irgendeinen* String, sondern ein Wert der von dem <input> HTML Element
   *  als Typ akzeptiert wird. Damit wir also ein gescheites Autocomplete bekommen, schränken wir den Wert hier beispielsweise
   *  auf drei verschiedene String-Werte ein: Entweder 'text', oder 'number', oder 'password'.
   */
  @Input()
  type:
    | 'email'
    | 'text'
    | 'plz'
    | 'streetNumber'
    | 'number'
    | 'password'
    | 'masked'
    | 'anything'
    | 'expirationDate'
    | 'fullName'
    | 'securityCode'
    | 'cardnumber' = 'text';

  /**
   *  Da wir die 'text' Property an eine <input> Komponente weitergeben, wollen wir Änderungen, die der Nutzer eingibt,
   *  auch wieder in unsere 'text' Property zurückerhalten. Dazu ist ein "Two-Way Data Binding" notwendig, d.h. dass *sowohl*
   *  Änderungen die der Komponente gegegeben werden reflektiert, *als auch* Änderungen die die Komponente an der Property
   *  vornimmt wieder zurückgegeben werden.
   *  Damit das realisiert wird, brauchen wir sowohl eine Property, die mit "@Input" markiert wird, und eine
   *  "EventEmitter" Property, der mit "@Output" markiert wird. Dieser "EventEmitter" muss dem Namensschema "<property>Change"
   *  folgen: wenn z.B. unsere "@Input" variable myInput heißt, *muss* der EventEmiiter "myInputChange" heißen.
   *
   *  Um das "Two-Way Data Binding" zu verwenden, muss man sowohl eckige als auch normale Klammern im HTML Code verwenden:
   *  <app-user-input [(text)]="myTextVariable"></app-user-input>
   *                    ↑
   *  Hiermit markieren wir dass wir Änderungen, die von <app-
   *  user-input> gemacht werden auch wieder zurück erhalten wollen.
   *  ("Two-Way Data Binding")
   */
  @Input()
  text = '';
  @Output()
  textChange = new EventEmitter<string>();

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value;
    this.text = value;
    this.onTextChange();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onBlur(): void {
    this.onTouched();
  }

  handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.text = input.value;
    this.onChange(this.value);
    this.onTouched();
  }

  onTextChange(): void {
    this.validateInput();
    this.textChange.emit(this.text);
    this.onChange(this.text);
  }

  private validateInput(): void {
    switch (this.type) {
      case 'text':
        this.handleTextInput();
        break;
      case 'plz':
        this.handlePostalCodeInput();
        break;
      case 'streetNumber':
        this.handleHouseNumberInput();
        break;
      case 'password':
        if(!this.disablePasswordValidation)
        this.handlePasswordInput();
        break;
      case 'email':
        this.handleEmailInput();
        break;
      case 'cardnumber':
        this.handleCardNumberInput();
        break;
      case 'securityCode':
        this.handleSecurityCodeInput();
        break;
      case 'expirationDate':
        this.handleExpirationDateInput();
        break;
      case 'fullName':
        this.handleFullName();
        break;
      default:
        break;
    }
  }

  private handleFullName(): void {
    const words = this.text.trim().split(/\s+/);
    if (words.length === 2) {
      this.isValidInput = true;
      this.errormessage = '';
    } else {
      this.isValidInput = false;
      this.errormessage = 'Bitte geben Sie ihren ganzen Namen an';
    }
  }

  private handleTextInput(): void {
    const regex = /^\s*[A-Za-zÄÖÜäöüß]+(?:[- ][A-Za-zÄÖÜäöüß]+)*\s*$/;
    this.isValidInput = regex.test(this.text);
    this.errormessage = this.isValidInput ? '' : 'Keine gültige Eingabe';
  }

  private handleHouseNumberInput(): void {
    const houseNumberRegex = /^\d+[A-Za-z]?\/?\d*$/;
    this.isValidInput = houseNumberRegex.test(this.text);
    this.errormessage = this.isValidInput ? '' : 'Nr. ungültig';
  }

  private handlePostalCodeInput(): void {
    const postalCodeRegex = /^\d{5}$/;
    this.isValidInput = postalCodeRegex.test(this.text);
    this.errormessage = this.isValidInput ? '' : 'Keine gültige Postleitzahl';
  }

  private handlePasswordInput(): void {
    this.isValidInput = this.text.length >= 8;
    this.errormessage = this.isValidInput
      ? ''
      : 'Passwort muss mindestens 8 Zeichen lang sein';
  }

  private handleEmailInput(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isValidInput = emailRegex.test(this.text);
    this.errormessage = this.isValidInput ? '' : 'Kein gültiges E-Mail Format';
  }

  public isValid(): boolean {
    return this.isValidInput;
  }

  private handleCardNumberInput(): void {
    const cardNumberRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/; // 16 Ziffern mit Bindestrich zwischen 4er Gruppen
    this.isValidInput = cardNumberRegex.test(this.text);
    this.errormessage = this.isValidInput ? '' : '0000-0000-0000-0000';
  }

  private handleSecurityCodeInput(): void {
    const securityCodeRegex = /^\d{3,4}$/; // 3-4 Ziffern
    this.isValidInput = securityCodeRegex.test(this.text);
    this.errormessage = this.isValidInput
      ? ''
      : 'Ungültiges Sicherheitscodeformat';
  }

  private handleExpirationDateInput(): void {
    const expirationDateRegex = /^(0[1-9]|1[0-2]|[1-9])\/(\d{2})$/; // MM/YY oder M/YY
    this.isValidInput = expirationDateRegex.test(this.text);
    this.errormessage = this.isValidInput ? '' : '(MM/YY)';
  }
}
