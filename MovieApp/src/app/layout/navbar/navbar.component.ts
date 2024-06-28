import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AwsCognitoService } from '../../auth/aws-cognito.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // use styleUrls instead of styleUrl
})
export class NavbarComponent implements OnInit {
  adminIs: boolean = false;

  constructor(
    private awsCognitoService: AwsCognitoService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isAdmin();
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

  async isAdmin() {
    try {
      let groups = await this.awsCognitoService.getUserGroups();
      console.log(groups);
      this.adminIs = groups.includes("admin");
      console.log(this.adminIs ? "User is an admin." : "User is not an admin.");
      this.cdr.detectChanges(); // Trigger change detection
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }
}
