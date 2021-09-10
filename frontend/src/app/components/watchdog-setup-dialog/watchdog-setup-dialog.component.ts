import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from '../../services/auth.service';

@Component({
    templateUrl: './watchdog-setup-dialog.component.html',
    styleUrls: ['./watchdog-setup-dialog.component.sass']
})
export class WatchdogSetupDialogComponent implements OnInit {
    public apiKey: string;

    constructor(
        private dialogRef: MatDialogRef<WatchdogSetupDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private authService: AuthenticationService
    ) { }

    public ngOnInit() {
        this.apiKey = this.authService.getWatchdogApiKey();
    }

    public close() {
        this.dialogRef.close(false);
    }

    public apply() {
        this.authService.setWatchdogApiKey(this.apiKey)
        this.dialogRef.close(true);
    }
}
