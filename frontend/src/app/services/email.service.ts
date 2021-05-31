import { Injectable } from "@angular/core";
import { Email } from "../models/email/email";
import { HttpInternalService } from "./http-internal.service";

@Injectable({ providedIn: 'root' })
export class EmailService {
    public routePrefix = '/api/email';

    constructor(private httpService: HttpInternalService) { }

    public sendEmail(email: Email) {
        return this.httpService.postFullRequest<Email>(`${this.routePrefix}/sendEmail`, email);
    }
}