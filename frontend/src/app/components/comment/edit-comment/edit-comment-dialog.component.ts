import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DialogData } from "../comment.component";

@Component({
    templateUrl: 'edit-comment-dialog.component.html',
    styleUrls: ['edit-comment-dialog.component.sass']
})
export class EditCommentDialogComponent {
    constructor(public dialogRef: MatDialogRef<EditCommentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onBackClick(): void {
        this.dialogRef.close();
    }
}