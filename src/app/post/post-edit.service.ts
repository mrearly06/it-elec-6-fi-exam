// post-edit.service.ts
import { Injectable } from '@angular/core';
import { Post } from './post.model'; // Adjust the import path as necessary
import { BehaviorSubject } from 'rxjs';

@Injectable({
 providedIn: 'root'
})
export class PostEditService {
 private isEditModeSubject = new BehaviorSubject<boolean>(false);
 private postToEditSubject = new BehaviorSubject<Post | null>(null);

 isEditMode$ = this.isEditModeSubject.asObservable();
 postToEdit$ = this.postToEditSubject.asObservable();

 setEditMode(isEditMode: boolean): void {
    this.isEditModeSubject.next(isEditMode);
 }

 setPostToEdit(post: Post | null): void {
    this.postToEditSubject.next(post);
 }
}