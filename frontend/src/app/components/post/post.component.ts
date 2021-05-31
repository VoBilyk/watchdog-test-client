import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Post } from '../../models/post/post';
import { AuthenticationService } from '../../services/auth.service';
import { AuthDialogService } from '../../services/auth-dialog.service';
import { empty, Observable, Subject } from 'rxjs';
import { DialogType } from '../../models/common/auth-dialog-type';
import { LikeService } from '../../services/like.service';
import { NewComment } from '../../models/comment/new-comment';
import { CommentService } from '../../services/comment.service';
import { User } from '../../models/user';
import { Comment } from '../../models/comment/comment';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { SnackBarService } from '../../services/snack-bar.service';
import { ReactionType } from 'src/app/models/reactions/reactionType';
import { DoCheck } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { DeletePostDialogComponent } from './delete-comment-dialog/delete-post-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ShowReactionsDialogComponent } from '../show-reactions-dialog/show-reactions.component';
import { EmailService } from 'src/app/services/email.service';
import { Email } from 'src/app/models/email/email';
import { SharePostDialogComponent } from './share-post-dialog/share-post-dialog.component';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.sass']
})
export class PostComponent implements OnDestroy, DoCheck, OnInit {
    @Input() public post: Post;
    @Input() public currentUser: User;
    @Output() public onDeletePost: EventEmitter<Post> = new EventEmitter<Post>();

    public newComment = {} as NewComment;
    private email = {} as Email;

    private unsubscribe$ = new Subject<void>();

    public showComments = false;
    public editingPost = false;
    public likeCount: number = 0;
    public dislikeCount: number = 0;
    private isLiked: boolean;

    public constructor(
        public dialog: MatDialog,
        private authService: AuthenticationService,
        private authDialogService: AuthDialogService,
        private likeService: LikeService,
        private commentService: CommentService,
        private snackBarService: SnackBarService,
        private emailService: EmailService
    ) { }

    public ngOnInit(): void {
        this.isLiked = this.post.reactions.some(r => (r.isLike) && (r.user.id === this.currentUser.id));
    }

    public ngDoCheck(): void {
        this.likeCount = this.post.reactions.filter(r => r.isLike).length;
        this.dislikeCount = this.post.reactions.filter(r => !r.isLike).length;
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public toggleComments(): void {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((user) => {
                    if (user) {
                        this.currentUser = user;
                        this.showComments = !this.showComments;
                    }
                });
            return;
        }
        this.showComments = !this.showComments;
    }

    public displayWhoLiked(): void {
        console.log(this.post.reactions.filter(r => r.isLike))
        this.dialog.open(ShowReactionsDialogComponent, {
            width: '350px',
            data: { reactions: this.post.reactions.filter(r => r.isLike) }
        });
    }

    public displayWhoDisliked(): void {
        console.log(this.post.reactions.filter(r => !r.isLike))
        this.dialog.open(ShowReactionsDialogComponent, {
            width: '350px',
            data: { reactions: this.post.reactions.filter(r => !r.isLike) }
        });
    }

    public deleteComment(comment: Comment): void {
        const subscription = this.commentService.deleteComment(comment.id);
        subscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            () => {
                this.post.comments = this.post.comments.filter(c => c !== comment);
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );
    }

    public deletePost(): void {
        const dialogRef = this.dialog.open(DeletePostDialogComponent, {
            width: '300px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.onDeletePost.emit(this.post);
            }
        });
    }

    public likePost(): void {
        this.reactOnPost(ReactionType.Like);
        this.isLiked = !this.isLiked;

        if (this.isLiked) {
            this.email.subject = `Hello, ${this.post.author.userName}!`
            this.email.body = `<h3>Your post has just been liked by ${this.currentUser.userName}!</h3>`;
            this.email.recipientEmail = this.post.author.email;
            this.emailService.sendEmail(this.email)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    () => console.log('send email about like'),
                    (error) => this.snackBarService.showErrorMessage(error));
        }
    }

    public dislikePost(): void {
        this.reactOnPost(ReactionType.Dislike);
        if (this.isLiked === true) {
            this.isLiked = false;
        }
    }

    public editPost(): void {
        this.editingPost = !this.editingPost;
    }

    public savePost(post: Post): void {
        if (post.body === this.post.body && this.post.previewImage === post.previewImage) {
            this.snackBarService.showUsualMessage('Nothing not changed.');
            this.editingPost = !this.editingPost;
            return;
        }
        this.post.body = post.body;
        this.post.previewImage = post.previewImage;
        this.editingPost = !this.editingPost;
        this.snackBarService.showSuccessMessage("Successfully updated!")
    }

    public reactOnPost(reactionType: ReactionType) {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.likeService.reactOnPost(this.post, userResp, reactionType)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((post) => (this.post = post));
            return;
        }

        this.likeService
            .reactOnPost(this.post, this.currentUser, reactionType)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((post) => (this.post = post));
    }

    public sendComment(): void {
        this.newComment.authorId = this.currentUser.id;
        this.newComment.postId = this.post.id;

        this.commentService
            .createComment(this.newComment)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    if (resp) {
                        this.post.comments = this.sortCommentArray(this.post.comments.concat(resp.body));
                        this.newComment.body = undefined;
                        this.snackBarService.showSuccessMessage("Comment sent!");
                    }
                },
                (error) => this.snackBarService.showErrorMessage(error)
            );
    }

    public sharePost(): void {
        const dialogRef = this.dialog.open(SharePostDialogComponent, {
            width: '400px'
        });
        dialogRef.afterClosed().subscribe(form => {
            const formData = { ...form.value }
            this.email.subject = `${this.currentUser.userName} share you a post!`
            this.email.body = `
            <div style="border: 0.5px solid #EBEAEA; padding: 10px; border-radius: 6px; width: 600px">
            <div style="padding: 10px; margin: 10px 0 10px 0; width: 600px">
                <img style="width: 50px; height: 50px; border-radius: 50%; vertical-align:middle; object-fit: cover;"src="${this.post.author.avatar}" alt="AuthorAvatar">
                <span style="font-size: 24px; font-weight: 530;">${this.post.author.userName}</span>
            </div>
            <img style="width: 600px; border-radius: 4px" src="${this.post.previewImage}" alt="PostImage">
            <p>${this.post.body}</p>
            </div>`;
            this.email.recipientEmail = `${formData.email}`;
            this.emailService.sendEmail(this.email)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    () => this.snackBarService.showSuccessMessage('Email sent!'),
                    (error) => this.snackBarService.showErrorMessage(error));
        })
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    private catchErrorWrapper(obs: Observable<User>) {
        return obs.pipe(
            catchError(() => {
                this.openAuthDialog();
                return empty();
            })
        );
    }

    private sortCommentArray(array: Comment[]): Comment[] {
        return array.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
}
