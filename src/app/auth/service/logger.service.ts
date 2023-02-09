import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class LoggerService implements HttpInterceptor {
    public uuid: string = '';
    public group: string = '';
    public url: string = '';

    constructor(
    ) {}

    /**
     * @description Interceptor to catch all the incoming petitions
     * @param req
     * @param next
     * @returns {Observable} Observable<HttpEvent<any>>
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let newHeaders = req.headers;
        // newHeaders = newHeaders.delete('serial number');
        // newHeaders = newHeaders.append('rejectUnauthorized', 'false');
        // newHeaders = newHeaders.append('withCredentials', 'false');
        // newHeaders = newHeaders.append('access-control-allow-credentials', 'true');
        // newHeaders = newHeaders.append("Access-Control-Allow-Headers", "*");
        // newHeaders = newHeaders.append("Access-Control-Allow-Methods", "*");
        // newHeaders = newHeaders.append("Access-Control-Allow-Origin", "*");
        // newHeaders = newHeaders.append("Control-Allow-Origin", "*");
        // newHeaders = newHeaders.append("www-authenticate", "Bearer");

          console.log(req)
          console.log(newHeaders)
        this.url = req.url;
        this.group = '';
        localStorage.setItem('url', this.url);

        const bcu_url = 'https://127001.bionet.local';

        const xhr = req.clone({
            headers: newHeaders,
            url: bcu_url + '/' + req.url,
        })

        return next.handle(xhr).pipe(catchError(this.handleError));
    }

    /**
     * @description Response for error in interceptor
     * @param error
     * @returns {string} error_message
     */
    handleError(error: HttpErrorResponse) {
      
      console.error("ERROR HANDLER: ", error);
      return throwError(JSON.stringify(error));
  }
}
