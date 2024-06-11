import { Component, Output, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { Post } from '../post.model';
import { NgForm } from '@angular/forms';
import { PostsService } from "../post.service";
import { PostEditService } from '../post-edit.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
    @Output() postCreated = new EventEmitter<Post>();
    isEditMode = false;
    postToEdit: Post | null = null;
    originalPostValues: Post | null = null; // Store the original post values for comparison
    isOkButtonClicked = false; // Add this property
    existingImagePath: string | ArrayBuffer | null = null;
    imagePreview: string | ArrayBuffer | null = null;
    post = {
        imagePath: '' // Initialize with an empty string or any default value
     };

    @ViewChild('postForm') postForm!: NgForm;
    imagePath: string | undefined;

    constructor(public postService: PostsService, public postEditService: PostEditService,private cdr: ChangeDetectorRef) {

        this.postEditService.postToEdit$.subscribe(post => {
            if (post) {
                this.postToEdit = post;
                this.imagePreview = this.getImageUrl(post.imagePath);
                this.cdr.detectChanges(); // Trigger change detection
            }
        });
        this.postEditService.isEditMode$.subscribe(isEditMode => {
            this.isEditMode = isEditMode;
        });

        this.postEditService.postToEdit$.subscribe(post => {
            this.postToEdit = post;
        });
      
        this.postEditService.postToEdit$.subscribe(post => {
            if (post) {
                console.log('Post to edit:', post);
                this.postToEdit = post;
                // Store the original post values for comparison
                this.originalPostValues = {
                    _id: post._id,
                    title: post.title,
                    content: post.content,
                    imagePath: post.imagePath || '' // Include the imagePath property
                };
                console.log('Original post values:', this.originalPostValues);
                // Populate the form with the current post's data
                this.postForm.setValue({
                    title: post.title,
                    content: post.content,
                   
                });
                console.log('Form values after setting:', this.postForm.value);
            }
        });
    }

    

    // Adjust your constructor or ngOnInit to set the existing image path when editing a post
    ngOnInit(): void {
        this.postEditService.postToEdit$.subscribe(post => {
            if (post) {
                this.existingImagePath = post.imagePath;
                // Other logic for setting up the form...
            }
        });
    }
    onEditPost(post: Post) {
        console.log('Entering edit mode');
        this.isEditMode = true;
        this.isExpanded = true

        this.postEditService.setEditMode(true);
        this.postEditService.setPostToEdit(post);
    }

    onAddPost(form: NgForm) {
        if (form.invalid  || !this.isOkButtonClicked) {
            return;
        }
    
        // Create a FormData object to send both text and file data
        const postData = new FormData();
        postData.append('title', form.value.title);
        postData.append('content', form.value.content);
        
        const author = localStorage.getItem('username');
        if (author) {
            postData.append('author', author);
        } 
        
        // Check if an image is selected
        if (this.imagePreview) {
            // Convert the base64 image data to Blob
            const base64Image = this.imagePreview as string;
            const byteString = atob(base64Image.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'image/jpeg' });
    
            // Append the image file to FormData
            postData.append('image', blob, this.selectedFileName || 'image.jpg');
        }
    
        this.postService.addPostWithImage(postData).subscribe(post => {
            console.log('Image Path from response:', post.imagePath);

            this.postCreated.emit(post);
            
            form.resetForm();
            // Reset image preview and file name after successful submission
            this.removeImage();
        });
    }
    
    onUpdatePost(form: NgForm) {
        if (form.invalid || !this.postToEdit) {
            return;
        }
        // Check if the form values have changed
        if (this.originalPostValues && (form.value.title !== this.originalPostValues.title || form.value.content !== this.originalPostValues.content)) {
            // If changes are detected, update the post
            this.postService.updatePost(this.postToEdit._id, form.value.title, form.value.content).subscribe(response => {
                console.log(response.message);
                this.isEditMode = false;
                this.postToEdit = null;
                this.originalPostValues = null;
                form.resetForm();
            }, error => {
                console.error('Error updating post:', error);
            });
        } else {
            // If no changes are detected, simply reset the form and exit
            console.log('No changes detected. Resetting form.');
            form.resetForm();
            this.isEditMode = false;
            this.postToEdit = null;
            this.originalPostValues = null;
        }
    }
    
    onCancel() {
        this.postForm.resetForm();
        this.isEditMode = false;
        this.postToEdit = null;
        this.originalPostValues = null;
    }

    isExpanded = false;
    

    toggleExpand(event: Event) {
        event.stopPropagation(); // Prevent event from bubbling up
        this.isExpanded = !this.isExpanded;
        console.log(this.existingImagePath)
    }

    // Add a new property to store the file name
selectedFileName: string | null = null;
// Add a new property to control the visibility of the file name display
showFileName = false;
fileTypeError: string | null = null; // Add this property

onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const fileType = file.type;
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (!allowedImageTypes.includes(fileType)) {
            this.fileTypeError = 'Only image files are allowed!';
            return; // Exit the method if the file is not an image
        }

        this.fileTypeError = null;
        this.isOkButtonClicked = false;
        this.createImageFromBlob(file);
        // Convert the file to Base64
        const reader = new FileReader();
        reader.onload = () => {
            this.selectedFileName = file.name;
            this.imagePreview = reader.result; // This is the Base64 string
            this.existingImagePath = reader.result;
            this.showFileName = false;
        };
        reader.readAsDataURL(file);
    }
}


onOkButtonClick() {
   // Reset the error message
    this.showFileName = true;
    this.isOkButtonClicked = true;
    // Perform any actions needed when the OK button is clicked
    // For example, save the file or update the UI
    console.log('OK button clicked');
}
    createImageFromBlob(image: Blob) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            this.imagePreview = reader.result;
        }, false);
        if (image) {
            reader.readAsDataURL(image);
        }
    }
    removeImage() {
            // Reset the image preview
            this.imagePreview = null;
            // Reset the file name display
            this.showFileName = false;
            // Reset the selected file name
            this.selectedFileName = null;
        }

        getImageUrl(imagePath: string): string {
            if (!imagePath) {
                // Handle the case where imagePath is undefined or null
                return ''; // or return a default image URL if applicable
            }
            
            // Add a leading slash if it's missing
            const adjustedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
            // Construct the full URL
            const fullUrl = `http://localhost:3500${adjustedPath}`;
            console.log(fullUrl); // Log the full URL for debugging
            
            return fullUrl;
        }
    }
  
    
    
    
    
    
