import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model'; // Adjust the import path as necessary
import { PostsService } from '../post.service'; // Adjust the import path as necessary
import { PostEditService } from '../post-edit.service'; // Adjust the import path as necessary
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Comment } from '../comment.model'; // Adjust the import path as necessary


@Component({
 selector: 'app-post-list',
 templateUrl: './post-list.component.html',
 styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
[x: string]: any;
 posts: Post[] = []; // Example posts array
 private postsSub!: Subscription;
 isEditMode = false;
 postToEdit: Post | null = null;
 existingImagePath: string | null = null;
 imagePreview: string | ArrayBuffer | null = null;
 currentPage = 1;
 postsPerPage = 5;
 totalPages = 0;
 public pages: number[] = [];

 newComment: {[key: string]: string} = {}; // Object to hold new comment text for each post
 comments: {[postId: string]: Comment[]} = {}; // Assuming Comment is a type or interface you've defined


 constructor(public postsService: PostsService, public postEditService: PostEditService, public route:ActivatedRoute) {
 this.postEditService.isEditMode$.subscribe(isEditMode => {
   this.isEditMode = isEditMode;
 });

 this.postEditService.postToEdit$.subscribe(post => {
   this.postToEdit = post;
 });
 }

    ngOnInit() {
   

      this.route.params.subscribe(params => {
        this.currentPage = +params['page'] || 1; // Convert to number and default to 1 if not provided
      });
   
      this.postsService.fetchPosts();
    this.postsService.getPostUpdateListener().subscribe(posts => {
      console.log(posts);
      posts.forEach(post => this.fetchCommentsForPost(post._id));
      this.posts = posts;
      this.calculateTotalPages();

    });
    }

    onDeletePost(postId: string | undefined) {
        if (postId) {
           // Assuming you have a PostsService with a deletePost method that takes a postId
           this.postsService.deletePost(postId).subscribe(
             () => {
               // Handle successful deletion, e.g., remove the post from the local list
               this.posts = this.posts.filter(post => post._id !== postId);
               // Optionally, show a success message
               this.adjustCurrentPage();

               console.log('Post deleted successfully');
             },
             (error: unknown)  => {
               // Handle errors, e.g., show an error message
               console.error('Failed to delete post:', error);
             }
           );
        } else {
           // Handle the case where postId is undefined
           // This might involve logging an error or showing a message to the user
           console.error('Attempted to delete a post without an ID');
        }
       }
       onEditPost(post: Post) {
        console.log('Entering edit mode');
    
        this.postEditService.setEditMode(true);
        this.postEditService.setPostToEdit(post);
    
        // Set the existing image path
        this.existingImagePath = post.imagePath;
    
        // Update the image preview
        if (this.existingImagePath) {
            this.imagePreview = this.existingImagePath; // Or convert to a URL if necessary
        }
    }
     getImageUrl(imagePath: string): string {
      if (!imagePath) {
          // Handle the case where imagePath is undefined or null
          return ''; // or return a default image URL if applicable
      }
      
      // Add a leading slash if it's missing
      const adjustedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      const fullUrl = `http://localhost:3500${adjustedPath}`;
  
      return fullUrl;
  }
  
    
 calculateTotalPages() {
  this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);
  this.generatePageNumbers(); // Ensure this is called after calculating totalPages

}
generatePageNumbers() {
  this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}
onPostsPerPageChange() {
  // Recalculate total pages or fetch new posts
  this.calculateTotalPages();
  this.adjustCurrentPage(); 
}

adjustCurrentPage() {
  // Calculate the total number of pages based on the current postsPerPage value
  

  // If the current page is greater than the total number of pages, adjust it
  if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
  }

  // Optionally, recalculate the total pages and generate page numbers
  this.calculateTotalPages();
  this.generatePageNumbers();
}

addComment(postId: string, comment: string): void {
  // Retrieve user ID and username from local storage
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('username');

  // Check if both userId and userName are available
  if (!userId ||!userName) {
    console.error('User ID or username not found in local storage');
    return; // Exit the function if either is missing
  }
  
  
  this.postsService.addComment(postId, userId, comment, userName).subscribe(
    (newComment: Comment) => {
      console.log('Comment added successfully');

      // Check if comments array for the post exists
      if (!this.comments[postId]) {
        this.comments[postId] = [];
      }

      // Add the new comment to the local comments array
      this.comments[postId].push(newComment);

      // Optionally, clear the new comment input field for the post
      this.newComment[postId] = '';

    },
    error => {
      console.error('There was an error adding the comment', error);
    }
  );
}

fetchCommentsForPost(postId: string) {
  this.postsService.getCommentsByPostId(postId).subscribe({
    next: (comments: Comment[]) => {
      console.log(`Successfully fetched comments for post ID: ${postId}`);
      
      this.comments[postId] = comments;
      console.log(comments); 
      if (comments.length > 0) {
        console.log(`User ID of the first comment: ${comments[0].username}`);
      } else {
        console.log('No comments found for this post.');
      }
    },
    error: (err) => {
      console.error(`Error fetching comments for post ID ${postId}:`, err);
      // Optionally, handle the error more gracefully in your UI or retry logic
    },
    complete: () => console.log('Completed fetching comments for post ID:', postId)
  });
}
}