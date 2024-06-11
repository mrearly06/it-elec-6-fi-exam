import { Injectable } from "@angular/core";
import { Observable, Subject, tap, of, map, catchError, throwError } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { Post } from "./post.model";
import { Router } from '@angular/router';
import { Comment } from "./comment.model";

@Injectable({
    providedIn:'root',
})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    private commentsUrl = 'http://localhost:3500/api/comments'; // URL to your backend endpoint




    constructor(private http: HttpClient, private router: Router) {}

    getPosts(){
        return [...this.posts];
    }

    getPostUpdateListener(){
        return this.postsUpdated.asObservable();
    }

    fetchPosts(){
        this.http.get<{message: string, posts: Post[]}>('http://localhost:3500/api/posts').subscribe(data => {
            this.posts = data.posts;
            this.postsUpdated.next([...this.posts]);
        });
    }

    addPost(title: string, content: string): Observable<any>{
        const post: Post = { _id: 'temp-id', title: title, content: content,  imagePath: '' };
        return this.http.post<{message: string}>('http://localhost:3500/api/posts', post).pipe(
            tap((responseData)=>{
                console.log(responseData.message);
                this.fetchPosts();
            })
        );
    }

    addPostWithImage(formData: FormData): Observable<any> {
        return this.http.post<{ message: string }>('http://localhost:3500/api/posts/image', formData).pipe(
            tap(responseData => {
                console.log(responseData.message);
                this.fetchPosts();
            })
        );
    }

    deletePost(postId: string): Observable<{ message: string }> {
        console.log(`Deleting post with ID: ${postId}`);
        return this.http.delete<{ message: string }>(`http://localhost:3500/api/posts/${postId}`).pipe(
            tap(response => {
                console.log(response.message);
                this.posts = this.posts.filter(post => post._id !== postId);
                this.postsUpdated.next([...this.posts]);
                this.fetchPosts();
            })
        );
    }

    updatePost(postId: string, title: string, content: string): Observable<{ message: string }> {
        console.log(`Updating post with ID: ${postId}`);
        const updatedPost = { title, content };
        return this.http.put<{ message: string }>(`http://localhost:3500/api/posts/${postId}`, updatedPost).pipe(
            tap(response => {
                console.log(response.message);
                this.posts = this.posts.map(post => post._id === postId ? { ...post, title, content } : post);
                this.postsUpdated.next([...this.posts]);
            })
        );
    }
    getPostsCount(): Observable<number> {
        return this.http.get<{ count: number }>('http://localhost:3500/api/posts/count').pipe(
          map(data => data.count)
        );
     }

     addComment(postId: string, userId: string, comment: string, userName: string): Observable<Comment> {
        const body = { postId, userId, comment, userName };
        return this.http.post<Comment>(`${this.commentsUrl}`, body).pipe(
          catchError(this.handleError) // This is correct if handleError is adjusted as shown above
        );
      }
      
      private handleError(error: any): Observable<any> {
        // Log the error or handle it as needed
        console.error('An error occurred', error);
        // You can return an empty observable, an error observable, or some fallback value
        return throwError(error);
      }

      getCommentsByPostId(postId: string): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.commentsUrl}/${postId}`);
      }
    }


