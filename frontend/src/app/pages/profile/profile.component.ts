import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { User } from 'src/app/models/user';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [BackButtonComponent, UserInputComponent, CommonModule, ButtonComponent, FormsModule]
})
export class ProfileComponent implements OnInit {
  @ViewChildren(UserInputComponent) userInputs!: QueryList<UserInputComponent>;

  public user?: User;
  public displayUser?: User;

  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.getUser().subscribe({
      next: (val) => {
        this.user = { ...val };
        this.displayUser = { ...val };
      },
      error: () => {
        this.user = undefined;
        this.displayUser = undefined;
      }
    });
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['login']);
  }

  onCancel(): void {
    this.router.navigate(['/settings']);
    console.log('Changes canceled');
  }

  onSave(): void {
    let allValid = true;

    this.userInputs.forEach(input => {
      if (!input.isValid()) {
        allValid = false;
      }
    });

    if (!allValid) {
      console.error('Validation failed');
      return;
    }

    
    if (this.user) {
      console.log('Saving user data:', this.user);
      this.loginService.updateUser(this.user).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.loginService.getUser().subscribe({
            next: (updatedUser) => {
              this.user = { ...updatedUser };
              this.displayUser = { ...updatedUser };
              console.log('Updated user data:', this.user);
              this.router.navigate(['/settings']);
            },
            error: (err) => {
              console.error('Error fetching updated user:', err);
            }
          });
        },
        error: (err) => {
          console.error('Error updating user:', err);
        }
      });
    }
  }
}
