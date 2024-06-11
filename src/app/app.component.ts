
import { Post } from './post/post.model'; 
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
 selector: 'app-root',
 templateUrl: './app.component.html',
 styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
 isEditMode: boolean = false;
 title: string = "bigote";
 storedPosts: Post[] = [];

 constructor(public router:Router, private authService: AuthService){}

 ngOnInit() {
   // Check token expiration every minute

 }

 onPostAdded(post: Post){
    this.storedPosts.push(post);
 }
}