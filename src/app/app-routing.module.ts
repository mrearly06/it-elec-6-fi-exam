import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { AuthService } from './auth.service';


const routes: Routes = [
  { path: '', redirectTo: '/authentication', pathMatch: 'full' }, // Redirect to '/login' if the path is empty
  { path: 'authentication', component: AuthComponent, canActivate: [AuthService] },
  { path: "create-posts/:page", component: PostCreateComponent, canActivate: [AuthService] }, // Route for creating posts// Route for creating posts
  { path: 'create-posts/:page', component: PostListComponent, canActivate: [AuthService] }, // Route for listing posts
  
 ];

 

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule]
})
export class AppRoutingModule { }