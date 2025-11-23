import { Component, OnInit} from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { User } from 'src/app/models/user';
import { OptionsService } from 'src/app/services/options.service';
import { Option } from 'src/app/models/option';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    UserInputComponent,
    BackButtonComponent,
    ButtonComponent,
  ],
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
})
export class OptionsComponent implements OnInit {
  public errorMessage = '';
  public speed = 'metric';
  public distance = 'metric';
  public currency = 'euro';

  public user?: User;
  public displayUser?: User;

  public option?: Option;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private optionsService: OptionsService
  ) {}

  ngOnInit(): void {
    this.loginService.getUser().subscribe({
      next: (val) => {
        this.user = { ...val };
        this.displayUser = { ...val };
      },
      error: () => {
        this.user = undefined;
        this.displayUser = undefined;
      },
    });

    this.optionsService.getOptions().subscribe({
      next: (val) => {
        this.option = { ...val };
        this.setInitialValues();
      },
      error: () => {
        this.option = undefined;
      },
    });
  }

  //diese werde sind zunächst auf der page geladen für die optionen
  setInitialValues(): void {
    if (this.option) {
      this.speed = this.option.speed;
      this.distance = this.option.distance;
      this.currency = this.option.currency;
    }
  }

  //logik des speicherns button
  onSave(): void {
    console.log('Switch 1:', this.speed);
    console.log('Switch 2:', this.distance);
    console.log('Switch 3:', this.currency);
    console.log('trying to save options for user: ', this.user);

    if (this.user) {
      if (this.option) {
        console.log('changing option data:', this.user.userId);
        this.userAlreadyHasOption(this.user.userId);
      } else {
        console.log('Saving option data:', this.user.userId);
        this.userHasNoOption();
      }
    }
    this.router.navigate(['/settings']);
  }

  //logik des abbrechen button
  onCancel(): void {
    console.log('Changes canceled');
    this.router.navigate(['/settings']);
  }

  //wird aufgerufen fall der user schon eine option hat dann wird keine neue erstellt.
  userAlreadyHasOption(userID: number): void {
    this.optionsService
      .updateOptions(
        userID,
        this.speed,
        this.distance,
        this.currency
      )
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.router.navigateByUrl('/settings');
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = err.error.message;
        },
      });
  }

  //wird aufgerufen fall der user noch keine option hat dann wird eine neue erstellt.
  userHasNoOption(): void {
    console.log('creating new option instance for user: ');
    this.optionsService
      .saveOptions(this.speed, this.distance, this.currency)
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.router.navigateByUrl('/settings');
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = err.error.message;
        },
      });
  }
}
