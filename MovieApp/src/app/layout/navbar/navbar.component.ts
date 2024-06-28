import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AwsCognitoService} from "../../auth/aws-cognito.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // use styleUrls instead of styleUrl
})
export class NavbarComponent  implements OnInit{
  public adminIs = false;
  constructor(
    private awsCognitoService: AwsCognitoService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  async ngOnInit() {
       await this.isAdmin();
    }

  isLoggedIn(): boolean {
    return this.awsCognitoService.isLoggedIn();
  }


  logout(): void {
    this.awsCognitoService.logout();
    this.router.navigate(['/login']);
    this.toastr.success('Logged out successfully', 'Success', {
      timeOut: 5000
    });

  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

async isAdmin(){
  try {
    let groups = await this.awsCognitoService.getUserGroups();
    console.log(groups);
    if (groups.includes("admin")) {
      console.log("User is an admin.");
      this.adminIs = true;
    } else {
      console.log("User is not an admin.");
      this.adminIs = false; // Ensure to set this to false if the user is not an admin
    }
  } catch (error) {
    console.error('Error fetching user groups:', error);
  }
}
}
