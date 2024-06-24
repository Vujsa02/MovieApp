import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // use styleUrls instead of styleUrl
})
export class NavbarComponent {

  constructor(private router: Router) { }

  navigateToHome() {
    this.router.navigate(['']);
  }
}
