import * as Watchdog from '@watchdog-bsa/watchdog-js';
import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { AccessTokenDto } from '../models/token/access-token-dto';
import { map, tap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { UserRegisterDto } from '../models/auth/user-register-dto';
import { AuthUser } from '../models/auth/auth-user';
import { UserLoginDto } from '../models/auth/user-login-dto';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';
import { UserService } from './user.service';
import { EventService } from './event.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private user: User;

    constructor(private httpService: HttpInternalService, private userService: UserService, private eventService: EventService) {}

    public getUser() {
        return this.user
            ? of(this.user)
            : this.userService.getUserFromToken().pipe(
                  map((resp) => {
                      this.user = resp.body;
                      this.eventService.userChanged(this.user);
                      return this.user;
                  })
              );
    }

    public setUser(user: User) {
        this.user = user;
        this.eventService.userChanged(user);
    }

    public register(user: UserRegisterDto) {
        return this._handleAuthResponse(this.httpService.postFullRequest<AuthUser>(`register`, user));
    }

    public login(user: UserLoginDto) {
        return this._handleAuthResponse(this.httpService.postFullRequest<AuthUser>(`auth/login`, user));
    }

    public logout() {
        this.revokeRefreshToken();
        this.removeTokensFromStorage();
        this.user = undefined;
        this.eventService.userChanged(undefined);
        this.setWatchdogUser(undefined);
    }

    public areTokensExist() {
        return localStorage.getItem('accessToken') && localStorage.getItem('refreshToken');
    }

    public revokeRefreshToken() {
        return this.httpService.postFullRequest<AccessTokenDto>(`token/revoke`, {
            refreshToken: localStorage.getItem('refreshToken')
        });
    }

    public removeTokensFromStorage() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    public refreshTokens() {
        return this.httpService
            .postFullRequest<AccessTokenDto>(`token/refresh`, {
                accessToken: JSON.parse(localStorage.getItem('accessToken')),
                refreshToken: JSON.parse(localStorage.getItem('refreshToken'))
            })
            .pipe(
                map((resp) => {
                    this._setTokens(resp.body);
                    return resp.body;
                })
            );
    }

    public getWatchdogApiKey() {
        return localStorage.getItem('watchdogApiKey');
    }

    public setWatchdogApiKey(apiKey: string) {
        const previousKey = this.getWatchdogApiKey();
        localStorage.setItem('watchdogApiKey', apiKey);

        if (!previousKey) {
            return Watchdog.init(apiKey, false);
        }

        location.reload();
    }

    public watchdogEnabled() {
        return !!this.getWatchdogApiKey();
    }

    public initWatchdog() {
        const apiKey = this.getWatchdogApiKey();
        if (apiKey) {
            Watchdog.init(apiKey, false);
        }
    }

    public setWatchdogUser(user: User) {
        if (!user) {
            return Watchdog.setUserInfo({ isAnonymous: true });
        }

        return Watchdog.setUserInfo({
            identifier: user.email,
            email: user.email,
            fullName: user.userName
        });
    }

    private _handleAuthResponse(observable: Observable<HttpResponse<AuthUser>>) {
        return observable.pipe(
            tap(resp => this._setAuthUser(resp.body)),
            map((resp) => resp.body.user)
        );
    }

    private _setAuthUser(authUser: AuthUser) {
        this._setTokens(authUser.token);
        this.user = authUser.user;
        if (this.watchdogEnabled()) {
            Watchdog.setUserInfo({
                identifier: this.user.email,
                email: this.user.email,
                fullName: this.user.userName
            });
        }
        this.eventService.userChanged(authUser.user);
    }

    private _setTokens(tokens: AccessTokenDto) {
        if (tokens && tokens.accessToken && tokens.refreshToken) {
            localStorage.setItem('accessToken', JSON.stringify(tokens.accessToken.token));
            localStorage.setItem('refreshToken', JSON.stringify(tokens.refreshToken));
            this.getUser();
        }
    }
}
