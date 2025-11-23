import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { LoginService } from './services/login.service';
import { LoginComponent } from './pages/login/login.component';
import { AboutComponent } from './pages/about/about.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { MapComponent } from './pages/map/map.component';
import { RegisterComponent } from './pages/register/register.component';
import { Observable, map, of } from 'rxjs';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProductComponent } from './pages/products/products.component';
import { BookingComponent } from './pages/booking/booking.component';
import { OptionsComponent } from './pages/options/options.component';
import { PaymentMethodsComponent } from './pages/payment-methods/payment-methods.component';
import { PaymentAdditionComponent } from './pages/payment-add/payment-add.component';
import { BookingConfirmationComponent } from './pages/booking-confirmation/booking.confirmation';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';

/**
 *  Hier definieren wir eine Funktion, die wir später (Zeile 43ff) dem Router übergeben.
 *  Damit fangen wir ab, falls ein Benutzer nicht eingeloggt ist,
 *      if (!inject(LoginService).isLoggedIn()) {
 *  leiten den Benutzer an die Startseite weiter
 *      inject(Router).navigate(['/login']);
 *  und sagen dem Angular Router, dass die Route geblockt ist
 *      return false;
 *
 *  (Siehe 'canActivate' Attribut bei den 'routes')
 */
const loginGuard = (): Observable<boolean> => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.authChecked) {
    if (!loginService.isLoggedIn()) {
      router.navigate(['/login']);
      return of(false);
    }
    return of(true);
  }
  //Wenn authChecked noch nicht true ist rufen wir checkAuth() Methode auf
  //Diese ruft das backend auf, um Authentifizierungsstatus zu überprüfen (durch Sessions)
  //Wenn Cookie mit sessionId gesetzt ist, wird isAuthenticated auf true gesetzt
  return loginService.checkAuth().pipe(
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};

const mapGuard = (): Observable<boolean> => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.authChecked) {
    if (loginService.isLoggedIn()) {
      router.navigate(['/search']);
      return of(false);
    }
    return of(true);
  }
  //Wenn authChecked noch nicht true ist, rufen wir checkAuth() Methode auf
  return loginService.checkAuth().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        router.navigate(['/search']);
        return false;
      }
      return true;
    })
  );
};

/**
 *  Hier können die verschiedenen Routen definiert werden.
 *  Jeder Eintrag ist eine URL, die von Angular selbst kontrolliert wird.
 *  Dazu wird die angebene Komponente in das "<router-outlet>" der "root" Komponente geladen.
 *
 *  Dokumentation: https://angular.io/guide/router
 */
export const routes: Routes = [
  // Jede Route, die wir festlegen wollen, braucht eine Komponente,
  // die beim Laden der Route instanziiert und angezeigt wird.
  // Die hier angegebenen Routen sind ein Beispiel; die "TodoComponent"
  // sollten über den Lauf des Projektes ausgetauscht werden
  { path: 'login', component: LoginComponent, canActivate: [mapGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [mapGuard] },
  { path: 'about', component: AboutComponent },

  // Durch 'canActive' können wir festlegen, ob eine Route aktiviert werden kann - z.B. können wir
  // die Route sperren, falls der Benutzer nicht eingeloggt ist.
  { path: 'search', component: MapComponent, canActivate: [loginGuard] },
  { path: 'booking/:id', component: BookingComponent, canActivate: [loginGuard] },
  { path: 'booking/:id/booking-confirmation', component: BookingConfirmationComponent, canActivate: [loginGuard]},
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [loginGuard] },
  { path: 'scooters/:id', component: ProductComponent, canActivate: [loginGuard],},

  { path: '', redirectTo: '/scooters', pathMatch: 'full' },
  // Routen können auch geschachtelt werden, indem der "Child" Eigenschaft der
  // Route nochmals ein paar Routen übergeben werden.
  // Falls Routen geschachtelt werden muss die "Hauptkomponente" der Schachtelung
  // auch eine <router-outlet> Komponente anbieten, in die "Unterkomponenten" hereingeladen
  // werden können (siehe auch RootComponent)
  {
    path: 'settings',
    canActivate: [loginGuard],
    children: [
      // Falls kein Pfad angegeben ist, wird diese Komponente automatisch geladen
      // (z.B. bei Aufruf von /profile/ )
      { path: '', component: SettingsComponent },
      // Ansonsten werden die Pfade geschachtelt - folgende Komponente wird über den Pfad
      // "/settings/profil" geladen.
      { path: 'profile', component: ProfileComponent },
      
    {    path: 'payment-methods', component: PaymentMethodsComponent,  
      },
      { path: 'addition', component: PaymentAdditionComponent },
      // Alternativ können die Seiten (Komponenten) auch wiederverwendet werden auf mehreren Routen
      { path: 'about', component: AboutComponent },
      { path: 'options', component: OptionsComponent },
      { path: 'statistics', component: StatisticsComponent },
    ],
  },

  // Je nach Konfiguration können wir auf eine andere Route weiterleiten
  // z.B. wollen wir bei Seitenaufruf (wenn keine 'route' festgelegt ist)
  // sofort auf die Login Route weiterleiten
  { path: '**', redirectTo: '/login' },
];
