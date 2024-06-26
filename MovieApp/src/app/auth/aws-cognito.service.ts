import { Injectable } from '@angular/core';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import {environment} from "../../environment";

const poolData = {
  UserPoolId: environment.userPoolId,
  ClientId: environment.clientId,
};

const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})
export class AwsCognitoService {
  private userEmail: string = '';

  register(username: string, password: string, email: string, firstName: string, lastName: string, birthdate: string) {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
      new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
      new CognitoUserAttribute({ Name: 'birthdate', Value: birthdate }),
    ];

    return new Promise((resolve, reject) => {
      userPool.signUp(username, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  login(username: string, password: string) {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result);
          this.userEmail = result.getIdToken().payload['email'];
          localStorage.setItem('token', result.getIdToken().getJwtToken());
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  logout() {
    const user = userPool.getCurrentUser();
    if (user) {
      user.signOut();
    }
  }

  isLoggedIn(): boolean {
    const user = userPool.getCurrentUser();
    return user !== null;
  }

  // get current user email attribute
  getCurrentUserEmail(): string {
    return this.userEmail;
  }

  // get current username
  getCurrentUsername(): string {
    const user = userPool.getCurrentUser();
    return user?.getUsername() || '';
  }
}
