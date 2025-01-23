import {
  HttpInterceptorFn,
  HttpContextToken,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  throwError,
  catchError,
  switchMap,
  filter,
  take,
} from 'rxjs';
import { AuthService } from './services/auth.service';

export const NOT_RETRY_AUTH_REQUEST = new HttpContextToken<boolean>(
  () => false
);

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const addTokenHeader = (
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> => {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });
};

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Skip adding token if marked with NOT_RETRY_AUTH_REQUEST
  if (accessToken && !req.context.get(NOT_RETRY_AUTH_REQUEST)) {
    req = addTokenHeader(req, accessToken);
  }

  return next(req).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        !req.context.get(NOT_RETRY_AUTH_REQUEST) &&
        error.status === 401
      ) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const handle401Error = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshAccessToken().pipe(
      switchMap((tokens: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.access);
        return next(addTokenHeader(req, tokens.access));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((accessToken) => {
      return next(addTokenHeader(req, accessToken!));
    })
  );
};
