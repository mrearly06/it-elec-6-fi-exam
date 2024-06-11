import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';




@Injectable({
 providedIn: 'root'
})
export class AuthService {
 private loginUrl = 'http://localhost:3500/api/login'; // Adjust the URL as necessary
 private registerUrl = 'http://localhost:3500/api/register'; // Adjust the URL as necessary


 constructor(private http: HttpClient, public router:Router) {}

 login(email: string, password: string): Observable<any> {
  return this.http.post<any>(this.loginUrl, { email, password });

 }


 register(email: string, password: string, username:string): Observable<any> {
    return this.http.post<any>(this.registerUrl, { email, password, username });
 }


 canActivate(
   next: ActivatedRouteSnapshot,
   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
   console.log('Checking authentication state...');
   const url = state.url; // Get the current URL
   if (this.isLoggedIn()) {
     console.log('User is logged in.');
     // Check if the user is trying to access the authentication route
     if (url.includes('/authentication')) {
       console.log('User is logged in. Redirecting to /home or another appropriate route.');
       // Redirect to home or another appropriate route if the user is already logged in
       this.router.navigate(['/create-posts/:page']); // Adjust the path as necessary
       return false;
     }
     return true; // Allow access to other routes
   } else {
     console.log('User is not logged in. Redirecting to /authentication.');
     // Check if the user is trying to access a protected route
     if (url.includes('/create-posts')) {
       this.router.navigate(['/authentication']);
       return false;
     }
     return true; // Allow access to other routes
   }
 }
 
 isLoggedIn(): boolean {
   console.log('Checking localStorage for authToken...');
   const token = localStorage.getItem('authToken');
   console.log('authToken:', token);
   return!!token;
 }

 public logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  this.router.navigate(['/login'])
  
 }
// Add a new method to fetch the username


}

