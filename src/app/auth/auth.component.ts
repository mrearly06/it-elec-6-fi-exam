import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service'; // Adjust the import path as necessary
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'; // Import Router
import { PostsService } from '../post/post.service';
import { FormGroup, FormControl, Validators,FormBuilder } from '@angular/forms';





@Component({
 selector: 'app-auth',
 templateUrl: './auth.component.html',
 styleUrls: ['./auth.component.css']
})
export class AuthComponent {
 isSigningUp = false;
 authForm!: FormGroup;



 constructor(private authService: AuthService, private snackBar:MatSnackBar,  private router: Router,  private postsService: PostsService, private fb: FormBuilder) {}


 ngOnInit() {
  this.initForm();

}
 

initForm(): void {
  this.authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$%*?&.])[a-zA-Z\d@$%*?&.]{8,}$/)
    ]],
    username: ['', [Validators.required]],
  });
}

 login(form: NgForm) {
  if (form.valid) {
     const email = form.value.email;
     const password = form.value.password;
     this.authService.login(email, password).subscribe({
       next: (response) => {
         console.log(response);
         // Assuming the token is set in the response
         localStorage.setItem('authToken', response.token);
         localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
         console.log('authToken set in localStorage:', localStorage.getItem('authToken'));
         console.log('User ID:', localStorage.getItem('userId'));
         console.log('Username:', localStorage.getItem('username'));
 
         // Handle successful login, e.g., navigate to a different page
         this.postsService.getPostsCount().subscribe({
           next: (count) => {
             console.log(`Number of posts: ${count}`);
 
             // Use the count directly in your logic
             if (count > 0) {
               this.router.navigate(['/create-posts/1']); // Navigate to '/create-posts/1' if there are posts
             } else {
               this.router.navigate(['/create-posts/0']); // Navigate to '/create-posts' if there are no posts
             }
           },
           error: (error) => {
             console.error('Failed to get posts count:', error);
             // Handle error, e.g., show an error message
           }
         });
       },
       error: (error) => {
        console.error('Login failed:', error);
        // Check the error message and display an alert accordingly
        if (error.error.message === 'User not found') {
          alert('The email is not registered. Please sign up.');
        } else if (error.error.message === 'Invalid credentials') {
          alert('The password does not match. Please try again.');
        } else {
          alert('Login failed. Please try again.');
        }
     }
    });
  }
 }

 // Method to handle user registration
 register():void {
  if (this.authForm.valid) {
    const email = this.authForm.get('email')!.value;
    const password = this.authForm.get('password')!.value;
    const username = this.authForm.get('username')!.value;

    console.log('Submitting registration with email:', email, 'and password:', password, 'username:', username);

    this.authService.register(email, password,username).subscribe(
      (response) => {
        console.log(response);
        // Handle successful registration, e.g., navigate to a different page
        this.isSigningUp = false;
        this.snackBar.open('Registration successful!', 'Close', {
          duration: 10000, // Duration in milliseconds
        });
      },
      (error) => {
        console.error('Registration failed:', error);
        // Handle registration failure, e.g., show an error message
        if (error.error && error.error.message === 'Username already exists. Please choose a different username.') {
          this.snackBar.open('Username already exists. Please choose a different username.', 'Close', {
            duration: 10000, // Duration in milliseconds
          });
        } else {
        this.snackBar.open('Registration failed. Please try again.', 'Close', {
          duration: 10000, // Duration in milliseconds
        });
      }
    }
    );
  } else {
    // Optionally, trigger validation manually
    this.authForm.markAllAsTouched();
  }
}


get password() {
  return this.authForm.get('password');
}


}
 