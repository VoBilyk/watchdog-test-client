import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { empty, Observable, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { UpdateComment } from 'src/app/models/comment/update-comment';
import { User } from 'src/app/models/user';
import { CommentService } from 'src/app/services/comment.service';
import { Comment } from '../../models/comment/comment';
import { EditCommentDialogComponent } from './edit-comment/edit-comment-dialog.component';
import { SnackBarService } from "src/app/services/snack-bar.service";
import { Post } from 'src/app/models/post/post';
import { DeleteCommentDialogComponent } from './delete-comment/delete-comment-dialog.component';
import { DoCheck } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth.service';
import { AuthDialogService } from 'src/app/services/auth-dialog.service';
import { DialogType } from 'src/app/models/common/auth-dialog-type';
import { ReactionType } from 'src/app/models/reactions/reactionType';
import { LikeService } from 'src/app/services/like.service';
import { ShowReactionsDialogComponent } from '../show-reactions-dialog/show-reactions.component';

export interface DialogData {
    comment: string;
}

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.sass']
})
export class CommentComponent implements OnDestroy, DoCheck {
    @Input() public comment: Comment;
    @Input() public currentUser: User;
    @Input() public currentPost: Post;

    @Output() public onDeleteComment: EventEmitter<Comment> = new EventEmitter<Comment>();

    public updateComment = {} as UpdateComment;
    private unsubscribe$ = new Subject<void>();
    public loading = false;
    public likeCount: number;
    public dislikeCount: number;

    constructor(
        public dialog: MatDialog,
        private commentService: CommentService,
        private authService: AuthenticationService,
        private authDialogService: AuthDialogService,
        private snackBarService: SnackBarService,
        private likeService: LikeService,) { }

    public ngDoCheck(): void {
        this.likeCount = this.comment.reactions.filter(r => r.isLike).length;
        this.dislikeCount = this.comment.reactions.filter(r => !r.isLike).length;
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public displayWhoLiked(): void {
        this.dialog.open(ShowReactionsDialogComponent, {
            width: '350px',
            data: { reactions: this.comment.reactions.filter(r => r.isLike) }
        });
    }

    public displayWhoDisliked(): void {
        this.dialog.open(ShowReactionsDialogComponent, {
            width: '350px',
            data: { reactions: this.comment.reactions.filter(r => !r.isLike) }
        });
    }

    public likeComment(): void {
        this.reactOnComment(ReactionType.Like);
    }

    public dislikeComment(): void {
        this.reactOnComment(ReactionType.Dislike);
    }

    private reactOnComment(reactionType: ReactionType): void {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.likeService.reactOnComment(this.comment, userResp, reactionType)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((comment) => (this.comment = comment));
            return;
        }

        this.likeService
            .reactOnComment(this.comment, this.currentUser, reactionType)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((comment) => (this.comment = comment));
    }

    public editComment(): void {
        const dialogRef = this.dialog.open(EditCommentDialogComponent, {
            width: '250px',
            data: { comment: this.comment.body }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === undefined) {
                return;
            }
            if (result === this.comment.body) {
                this.snackBarService.showUsualMessage("Nothing not changed.");
                this.loading = false;
                return;
            }
            this.comment.body = result;
            this.saveChanges();
        });
    }

    private saveChanges(): void {
        this.updateComment.authorId = this.comment.author.id;
        this.updateComment.id = this.comment.id;
        this.updateComment.body = this.comment.body;

        const commentSubscription = this.commentService.updateComment(this.updateComment);

        this.loading = true;

        commentSubscription.pipe(
            takeUntil(this.unsubscribe$))
            .subscribe(
                (updatedComment) => {
                    this.comment.body = updatedComment.body.body;
                    this.loading = false;
                    this.snackBarService.showSuccessMessage("Successfully updated!");
                },
                (error) => this.snackBarService.showErrorMessage(error)
            );
    }

    public deleteComment(): void {
        const dialogRef = this.dialog.open(DeleteCommentDialogComponent, {
            width: '300px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.onDeleteComment.emit(this.comment);
            }
        });
    }

    public openAuthDialog(): void {
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
}