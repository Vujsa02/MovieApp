import { Component } from '@angular/core';
import { AwsCognitoService } from '../aws-cognito.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private awsCognitoService: AwsCognitoService,
    private router: Router,
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {}

  login() {
    this.awsCognitoService.login(this.username, this.password)
      .then(result => {
        console.log('User logged in:', result);
        // Show success message using MatSnackBar
        this.toastr.success('Login successful', 'Success', {
          timeOut: 5000
        });
        // Redirect to home or another page upon successful login
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.error('Error logging in:', error);
        // Show error message using MatSnackBar
        this.toastr.error('Failed to login', 'Error', {
          timeOut: 5000
        });
      });
  }
}
