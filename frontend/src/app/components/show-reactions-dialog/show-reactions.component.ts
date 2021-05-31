import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ReactionsData } from "src/app/models/reactions/reactionsData";

@Component({
    selector: 'show-reactions',
    templateUrl: 'show-reactions.component.html',
})
export class ShowReactionsDialogComponent {
    constructor(public dialogRef: MatDialogRef<ShowReactionsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ReactionsData) { }

    onCloseClick(): void {
        this.dialogRef.close();
    }
}