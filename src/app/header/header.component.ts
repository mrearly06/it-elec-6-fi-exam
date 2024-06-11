import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  username: string;

  constructor(private router: Router) {
    this.username = localStorage.getItem('username') || '';

  } // Inject Router


  logout(event: Event) {
    event.preventDefault(); // Prevent the default action
    localStorage.removeItem('authToken');
    console.log('User logged out.');
    this.router.navigate(['/authentication']);
   }

}

