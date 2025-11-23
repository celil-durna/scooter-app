import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { LoginService } from 'src/app/services/login.service';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { CommonModule } from '@angular/common'; //für Fehlermeldung

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ButtonComponent,
    RouterLink,
    UserInputComponent,
    LoginComponent,
    CommonModule, //für Fehlermeldung
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  @ViewChild('emailInput') emailInput!: UserInputComponent;
  @ViewChild('passInput') passInput!: UserInputComponent;

  public isComplete = true;
  public isValidForm = false;
  public email = '';
  public password = '';
  public errorMessage = '';

  constructor(private router: Router, private loginService: LoginService) {}

  //Lebenszyklus-Hook 'ngOnInit' wird aufgerufen, nachdem die Komponente initialisiert wurde
  //stellt sicher, dass Authentifizierungsüberprüfung sofort erfolgt, wenn Login-Seite geladen wird
  ngOnInit(): void {
    this.loginService.checkAuth().subscribe({
      next: (val) => {
        if (val) {
          this.router.navigate(['/search']);
        }
      },
    });
  }

  //Methode zum Überprüfen ob ein String leer ist
  isEmpty(str: string): boolean {
    return str === '' || str === null;
  }

  //Methode zum Einlogen des Benutzers
  login(): void {
    this.isValidForm =
      this.emailInput.isValidInput && this.passInput.isValidInput;

    this.isComplete = !(
      this.isEmpty(this.email) || this.isEmpty(this.password)
    );

    if (!this.isComplete) {
      this.errorMessage = 'Bitte füllen sie alle Felder aus';
      return;
    }

    if (!this.isValidForm) {
      // Wenn kein gültiges Format besteht, wird überhaupt keine Backend-Verknüpfung erstellt
      // Error_message ist auch nicht nötig, da user erstmal ihre Eingabe überprüfen muss
      return;
    }

    this.loginService.login(this.email, this.password).subscribe({
      next: () => {
        //Erfolgreiches Login: Navigation zur Map
        this.errorMessage = '';
        this.router.navigateByUrl('/search');
      },
      error: (err) => {
        //Fehler beim Login
        this.isComplete = false;
        this.errorMessage = err.error.message;
        console.log(err);
      },
    });
    //this.loginService.loggedIn = true;
  }
}
