import { throwError } from 'rxjs';
import { ErrorHandler, Injectable } from '@angular/core';
import * as Watchdog from '@watchdog-bsa/watchdog-js';
import { AuthenticationService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class WatchDogErrorHandler implements ErrorHandler {
    constructor(private authService: AuthenticationService) {}

    handleError(error: any) {
        if (this.authService.watchdogEnabled()) {
            Watchdog.handleError(error);
        }

        return throwError(error);
    }
}
