import { Component } from '@angular/core';
import { AwsCognitoService } from '../aws-cognito.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  birthdate: string = '';

  constructor(private awsCognitoService: AwsCognitoService) {}

  register() {
    this.awsCognitoService.register(this.username, this.password, this.email, this.firstName, this.lastName, this.birthdate)
      .then(result => console.log('User registered:', result))
      .catch(error => console.error('Error registering user:', error));
  }
}
