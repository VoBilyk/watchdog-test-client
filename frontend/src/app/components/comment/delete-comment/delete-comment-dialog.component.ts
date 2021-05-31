import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    templateUrl: 'delete-comment-dialog.component.html',
})
export class DeleteCommentDialogComponent {
    constructor(public dialogRef: MatDialogRef<DeleteCommentDialogComponent>) { }

    onBackClick(): void {
        this.dialogRef.close();
    }
}