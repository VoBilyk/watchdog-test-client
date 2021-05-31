import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'delete-comment',
    templateUrl: 'delete-post-dialog.component.html',
})
export class DeletePostDialogComponent {
    constructor(public dialogRef: MatDialogRef<DeletePostDialogComponent>) { }

    onBackClick(): void {
        this.dialogRef.close();
    }
}