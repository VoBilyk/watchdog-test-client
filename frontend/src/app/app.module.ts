import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { RouterModule } from '@angular/router';
import { AppRoutes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainThreadComponent } from './components/main-thread/main-thread.component';
import { PostComponent } from './components/post/post.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { CommentComponent } from './components/comment/comment.component';
import { MaterialComponentsModule } from './components/common/material-components.module';
import { AddUpdatePostComponent } from './components/add-update-post/add-update-post.component';
import { EditCommentDialogComponent } from './components/comment/edit-comment/edit-comment-dialog.component';
import { DeleteCommentDialogComponent } from './components/comment/delete-comment/delete-comment-dialog.component';
import { DeletePostDialogComponent } from './components/post/delete-comment-dialog/delete-post-dialog.component';
import { ShowReactionsDialogComponent } from './components/show-reactions-dialog/show-reactions.component';
import { SharePostDialogComponent } from './components/post/share-post-dialog/share-post-dialog.component';
import { WatchDogErrorHandler } from './helpers/watchdog.interceptor';
import { WatchdogSetupDialogComponent } from './components/watchdog-setup-dialog/watchdog-setup-dialog.component';

@NgModule({
    declarations: [AppComponent, MainThreadComponent, PostComponent, HomeComponent, UserProfileComponent, AuthDialogComponent, CommentComponent, AddUpdatePostComponent, EditCommentDialogComponent, DeleteCommentDialogComponent, DeletePostDialogComponent, ShowReactionsDialogComponent, SharePostDialogComponent, WatchdogSetupDialogComponent],
    imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, MaterialComponentsModule, RouterModule.forRoot(AppRoutes), FormsModule, ReactiveFormsModule],
    exports: [MaterialComponentsModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: ErrorHandler, useClass: WatchDogErrorHandler },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
