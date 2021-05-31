import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../../models/post/post';
import { User } from '../../models/user';
import { Subject } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AuthenticationService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { AuthDialogService } from '../../services/auth-dialog.service';
import { DialogType } from '../../models/common/auth-dialog-type';
import { EventService } from '../../services/event.service';
import { NewPost } from '../../models/post/new-post';
import { takeUntil } from 'rxjs/operators';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SnackBarService } from '../../services/snack-bar.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-main-thread',
    templateUrl: './main-thread.component.html',
    styleUrls: ['./main-thread.component.sass']
})
export class MainThreadComponent implements OnInit, OnDestroy {
    public posts: Post[] = [];
    public cachedPosts: Post[] = [];
    public isOnlyMine = false;
    public isOnlyLikedByCurrentUser = false;

    public currentUser: User;
    public post = {} as NewPost;
    public showPostContainer = false;
    public loadingPosts = false;

    public postHub: HubConnection;

    private unsubscribe$ = new Subject<void>();

    public constructor(
        private snackBarService: SnackBarService,
        private authService: AuthenticationService,
        private postService: PostService,
        private authDialogService: AuthDialogService,
        private eventService: EventService
    ) { }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.postHub.stop();
    }

    public ngOnInit() {
        this.registerHub();
        this.getPosts();
        this.getUser();

        this.eventService.userChangedEvent$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
            this.currentUser = user;
            this.post.authorId = this.currentUser ? this.currentUser.id : undefined;
        });
    }

    public getPosts() {
        this.loadingPosts = true;
        this.postService
            .getPosts()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    this.loadingPosts = false;
                    this.posts = this.cachedPosts = resp.body;
                },
                (error) => (this.loadingPosts = false)
            );
    }

    public sliderChanged(event: MatSlideToggleChange) {
        if (event.checked) {
            if (this.isOnlyLikedByCurrentUser) {
                this.isOnlyMine = true;
                this.posts = this.posts.filter((x) => x.author.id === this.currentUser.id);
                return;
            }
            this.isOnlyMine = true;
            this.posts = this.cachedPosts.filter((x) => x.author.id === this.currentUser.id);
        } else {
            if (this.isOnlyLikedByCurrentUser) {
                this.isOnlyMine = false;
                this.posts = this.cachedPosts.filter(post => post.reactions.some(reaction => (reaction.user.id === this.currentUser.id) && (reaction.isLike)));
                return;
            }
            this.isOnlyMine = false;
            this.posts = this.cachedPosts;
        }
    }

    public isOnlyLikedByMe(event: MatSlideToggleChange) {
        if (event.checked) {
            if (this.isOnlyMine) {
                this.isOnlyLikedByCurrentUser = true;
                this.posts = this.posts.filter(post => post.reactions.some(reaction => (reaction.user.id === this.currentUser.id) && (reaction.isLike)));
                return;
            }
            this.isOnlyLikedByCurrentUser = true;
            this.posts = this.cachedPosts.filter(post => post.reactions.some(reaction => (reaction.user.id === this.currentUser.id) && (!reaction.isLike)));
        } else {
            if (this.isOnlyMine) {
                this.isOnlyLikedByCurrentUser = false;
                this.posts = this.cachedPosts.filter((x) => x.author.id === this.currentUser.id);
                return;
            }
            this.isOnlyLikedByCurrentUser = false;
            this.posts = this.cachedPosts;
        }
    }

    public toggleNewPostContainer() {
        this.showPostContainer = !this.showPostContainer;
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    public registerHub() {
        this.postHub = new HubConnectionBuilder().withUrl(`${environment.apiUrl}/notifications/post`).build();
        this.postHub.start().catch((error) => this.snackBarService.showErrorMessage(error));

        this.postHub.on('NewPost', (newPost: Post) => {
            if (newPost) {
                this.addNewPost(newPost);
            }
        });
    }

    public addNewPost(newPost: Post) {
        if (!this.cachedPosts.some((x) => x.id === newPost.id)) {
            this.cachedPosts = this.sortPostArray(this.cachedPosts.concat(newPost));
            this.showPostContainer = !this.showPostContainer;
            this.snackBarService.showSuccessMessage('Successfully created new post!')
            if (!this.isOnlyMine || (this.isOnlyMine && newPost.author.id === this.currentUser.id)) {
                this.posts = this.sortPostArray(this.posts.concat(newPost));
            }
        }
    }

    public deletePost(post: Post) {
        const subscription = this.postService.deletePost(post.id);
        subscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            () => {
                this.posts = this.posts.filter(p => p.id !== post.id);
                this.snackBarService.showUsualMessage('Post deleted.');
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );
    }

    private getUser() {
        this.authService
            .getUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((user) => (this.currentUser = user));
    }

    private sortPostArray(array: Post[]): Post[] {
        return array.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
}