import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { LoginService } from 'src/app/services/login.service';
import { GreenButtonComponent } from 'src/app/components/green-button/green-button.component';
import { GearSymbolComponent } from 'src/app/components/gear-symbol/gear-symbol.component';

@Component({
  standalone: true,
  imports: [ButtonComponent, RouterLink, GreenButtonComponent, GearSymbolComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  constructor(private router: Router, private loginService: LoginService) {}

  //für mehrere Tabs: leitet abgemeldete Benutzer auf Login Seite zurück wenn man
  //auf Einstellungen-Button klickt.
  //das kann man wahrscheinlich noch mit dem login Guard besser machen!
  ngOnInit(): void {
    this.loginService.checkAuth().subscribe({
      next: (isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  // Methode zum Ausloggen des Benutzers
  logout(): void {
    this.loginService.logout().subscribe({
      next: () => {
        //Nach erfolgreicher Abmeldung zur Login-Seite navigieren
        this.router.navigate(['login']);
      },
      error: (err) => {
        //bei Fehler trotzdem zur Login-Seite, aber Fehlermeldung wird gegeben
        this.router.navigate(['login']);
        console.error('Logout Error:', err);
      },
    });
  }

  navigateToProfile(): void {
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/settings/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  navigateToOptions(): void {
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/settings/options']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateToPayment(): void {
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/settings/payment-methods']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  navigateToStatistics(): void {
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/settings/statistics']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
