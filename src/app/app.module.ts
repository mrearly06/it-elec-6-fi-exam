import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { HeaderComponent } from './header/header.component';
import {PostListComponent} from './post/post-list/post-list.component';
import { PostEditService } from './post/post-edit.service'; // Adjust the import path as necessary
import { AuthComponent } from './auth/auth.component';

import { CommonModule } from '@angular/common';


import {MatInputModule} from '@angular/material/input';
import{MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import{MatToolbarModule} from '@angular/material/toolbar';
import{MatIconModule} from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';



import {MatExpansionModule} from '@angular/material/expansion';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';





@NgModule({
  declarations: [
    AppComponent,
    PostCreateComponent,
    HeaderComponent,
    PostListComponent,
    AuthComponent,
    

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSnackBarModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule


  

  ],
  providers: 
  [PostEditService,
   AuthService
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
