import { Component } from '@angular/core';
import { AwsCognitoService } from '../aws-cognito.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private awsCognitoService: AwsCognitoService) {}

  login() {
    this.awsCognitoService.login(this.username, this.password)
      .then(result => console.log('User logged in:', result))
      .catch(error => console.error('Error logging in:', error));
  }
}
