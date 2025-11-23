import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router, RouterLink } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    BackButtonComponent,
    UserInputComponent,
    CommonModule,
    ButtonComponent,
    LoginComponent,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  /**
   *  Damit der Text in der HTML Komponente bereitsteht, legen wir den Text als 'public' fest.
   */
  // public text = 'Dieser Text wird zwischen zwei Komponenten synchronisiert!';

  @ViewChild('nameInput') nameInput!: UserInputComponent;
  @ViewChild('streetInput') streetInput!: UserInputComponent;
  @ViewChild('houseNrInput') houseNrInput!: UserInputComponent;
  @ViewChild('plzInput') plzInput!: UserInputComponent;
  @ViewChild('locationInput') locationInput!: UserInputComponent;
  @ViewChild('emailInput') emailInput!: UserInputComponent;
  @ViewChild('passInput') passInput!: UserInputComponent;
  /**
   *  Hier definieren wir ein Array von Objekten für Links. Damit das HTML Template (landingpage.component.html)
   *  auch Zugriff auf dieses Attribut hat, deklarieren wir es als public. Der Typ dieses Attributs definieren wir
   *  als Array [] von Objekten {}, die einen "name" String und einen "url" String haben.
   */
  public isComplete = false;
  public isValidForm = false;
  public errorMessage = '';

  public firstName = '';
  public lastName = '';
  public street = '';
  public numberAsText = '';
  public plzAsText = '';
  public location = '';
  public email = '';
  public passwort = '';
  public confirmPasswort = '';

  /**
   *  Wie bei den Services wird auch in den Komponenten der Konstruktor über Angular aufgerufen.
   *  D.h. wir können hier verschiedene Services spezifizieren, auf die wir Zugriff haben möchten, welche
   *  automatisch durch "Dependency injection" hier instanziiert werden.
   */
  constructor(
    private router: Router,
    private registerService: RegisterService
  ) {}

  // passwordMatchValidator(password: string, confirmPassword: string): boolean {
  //   return password === confirmPassword;
  // }

  /**
   *  Da unsere Komponente das "OnInit" Interface implementiert müssen wir eine "ngOnInit" Methhode implementieren.
   *  Diese Methode wird aufgerufen, sobald der HTML code dieser Komponente instanziiert und aufgebaut wurde
   *  (quasi wie ein zweiter Constructor, der von Angular automatisch aufgerufen wird).
   *  Weiterführende Infos gibt es hier: https://angular.io/guide/lifecycle-hooks
   */

  isEmpty(str: string): boolean {
    return str.trim() === '' || str.trim() === null;
  }

  isVald(): boolean {
    return !(!this.emailInput.isValidInput || !this.passInput.isValidInput);
  }

  registrieren(): void {
    this.isValidForm =
      this.nameInput.isValidInput &&
      this.streetInput.isValidInput &&
      this.houseNrInput.isValidInput &&
      this.plzInput.isValidInput &&
      this.locationInput.isValidInput &&
      this.emailInput.isValidInput &&
      this.passInput.isValidInput;

    this.isComplete = !(
      this.isEmpty(this.firstName) ||
      this.isEmpty(this.lastName) ||
      this.isEmpty(this.street) ||
      this.isEmpty(this.numberAsText) ||
      this.isEmpty(this.plzAsText) ||
      this.isEmpty(this.location) ||
      this.isEmpty(this.email) ||
      this.isEmpty(this.passwort) ||
      this.isEmpty(this.confirmPasswort)
    );

    if (!this.isComplete) {
      this.errorMessage = 'Bitte füllen sie alle Felder aus';
      return;
    }

    if (this.passwort !== this.confirmPasswort) {
      this.isComplete = false;
      this.errorMessage = 'Passwort stimmt nicht überein';
      return;
    }

    if (!this.isValidForm) {
      // Wenn kein gültiges Format besteht, wird überhaupt keine Backend-Verknüpfung erstellt
      return;
    }
    // Der eigentliche Vorgang bei registrieren findet hier statt.
    this.registerService
      .registrieren(
        this.firstName,
        this.lastName,
        this.street,
        this.numberAsText,
        this.plzAsText,
        this.location,
        this.email,
        this.passwort
      )
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.router.navigateByUrl('/search');
        },
        error: (err) => {
          this.isComplete = false;
          this.errorMessage = err.error.message;
          console.log(err);
        },
      });
  }
}
