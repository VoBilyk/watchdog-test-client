import { Component, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { EventEmitter } from '@angular/core';
import { Subject } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { NewPost } from "src/app/models/post/new-post";
import { Post } from "src/app/models/post/post";
import { UpdatePost } from "src/app/models/post/update-post";
import { GyazoService } from "src/app/services/gyazo.service";
import { PostService } from "src/app/services/post.service";
import { SnackBarService } from "src/app/services/snack-bar.service";

@Component({
    selector: 'app-add-update-post',
    templateUrl: './add-update-post.component.html',
    styleUrls: ['./add-update-post.component.sass']
})
export class AddUpdatePostComponent implements OnInit, OnDestroy {
    @Input() isUpdating: boolean = false;
    @Input() postToUpdate: Post;

    @Output() onAddPost: EventEmitter<Post> = new EventEmitter<Post>();
    @Output() onSavePost: EventEmitter<Post> = new EventEmitter<Post>();

    public imageUrl: string;
    public imageFile: File;

    public post = {} as NewPost;
    public updatePost = {} as UpdatePost;

    public loading = false;

    private unsubscribe$ = new Subject<void>();

    public constructor(
        private postService: PostService,
        private gyazoService: GyazoService,
        private snackBarService: SnackBarService,) {
    }

    public ngOnInit() {
        if (this.isUpdating) {
            this.updatePost.authorId = this.postToUpdate.author.id;
            this.updatePost.id = this.postToUpdate.id;
            this.updatePost.body = this.postToUpdate.body;
            this.updatePost.previewImage = this.postToUpdate.previewImage;
            this.imageUrl = this.postToUpdate.previewImage;
        }
    }

    public createPost() {
        const postSubscription = !this.imageFile
            ? this.postService.createPost(this.post)
            : this.gyazoService.uploadImage(this.imageFile).pipe(
                switchMap((imageData) => {
                    this.post.previewImage = imageData.url;
                    return this.postService.createPost(this.post);
                })
            );

        this.loading = true;

        postSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (newPost) => {
                this.onAddPost.emit(newPost.body);
                this.removeImage();
                this.post.body = undefined;
                this.post.previewImage = undefined;
                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );
    }

    public editPost() {
        const postSubscription = !this.imageFile
            ? this.postService.updatePost(this.updatePost)
            : this.gyazoService.uploadImage(this.imageFile).pipe(
                switchMap((imageData) => {
                    this.post.previewImage = imageData.url;
                    return this.postService.updatePost(this.updatePost);
                })
            );

        this.loading = true;

        postSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (editedPost) => {
                this.onSavePost.emit(editedPost.body);
                this.removeImage();
                this.post.body = undefined;
                this.post.previewImage = undefined;
                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );
    }

    public loadImage(target: any) {
        this.imageFile = target.files[0];

        if (!this.imageFile) {
            target.value = '';
            return;
        }

        if (this.imageFile.size / 1000000 > 5) {
            target.value = '';
            this.snackBarService.showErrorMessage(`Image can't be heavier than ~5MB`);
            return;
        }

        const reader = new FileReader();
        if (this.isUpdating) {
            reader.addEventListener('load', () => (this.updatePost.previewImage = reader.result as string));
        } else {
            reader.addEventListener('load', () => (this.imageUrl = reader.result as string));
        }
        reader.readAsDataURL(this.imageFile);
    }

    public removeImage() {
        this.imageUrl = undefined;
        this.imageFile = undefined;
        this.updatePost.previewImage = undefined;
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}