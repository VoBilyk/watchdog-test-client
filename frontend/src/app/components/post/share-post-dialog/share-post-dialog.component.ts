import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    templateUrl: 'share-post-dialog.component.html',
    styleUrls: ['share-post-dialog.component.sass']
})
export class SharePostDialogComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<SharePostDialogComponent>) { }

    public form: FormGroup;

    ngOnInit(): void {
        this.form = new FormGroup({
            email: new FormControl('', [
                Validators.email,
                Validators.required
            ])
        })
    }
}