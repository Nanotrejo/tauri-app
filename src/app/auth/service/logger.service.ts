import { Injectable } from "@angular/core";
import {
	HttpInterceptor,
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse,
	HttpResponse,
	HttpHeaders,
} from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { getClient, HttpOptions, ResponseType, Response, Body } from "@tauri-apps/api/http";

@Injectable({
	providedIn: "root",
})
export class LoggerService implements HttpInterceptor {
	public uuid: string = "";
	public group: string = "";
	public url: string = "";

	constructor() {}

	//return next.handle(xhr).pipe(catchError(this.handleError));

	/**
	 * @description Interceptor to catch all the incoming petitions
	 * @param req
	 * @param next
	 * @returns {Observable} Observable<HttpEvent<any>>
	 */
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		let newHeaders = req.headers;
		newHeaders = newHeaders.delete("serial number");
		newHeaders = newHeaders.append("Content-Type", "application/json; charset=utf-8");

		this.url = req.url;
		this.group = "";
		localStorage.setItem("url", this.url);

		const bcu_url = "https://rosita.bionet.local";

		const xhr = req.clone({
			headers: newHeaders,
			url: bcu_url + "/" + req.url,
		});

		return new Observable((observer) => {
			this.myRequest(xhr)
				.then((response) => {
					console.info(response);
					observer.next(response);
					observer.complete();
				})
				.catch((error) => observer.error(error));
		});
	}

	async myRequest(xhr: HttpRequest<any>): Promise<any> {
		const client = await getClient();

		const response = await client.request(this.convertHttpRequestToHttpOptions(xhr));
		return this.convertTauriResponseToHttpResponse(response);
	}

	convertTauriResponseToHttpResponse(response: Response<any>): HttpResponse<unknown> {
		const init = {
			url: response.url as any,
			body: response.data as any,
			headers: response.headers as any,
			status: response.status as any,
			statusText: response.ok as any,
		};
		const httpResponse = new HttpResponse<unknown>(init);
		return httpResponse;
	}

	convertHttpRequestToHttpOptions(request: HttpRequest<any>): HttpOptions {
		const httpOptions: HttpOptions = {
			method: request.method as any,
			url: request.url,
			headers: request.headers.keys().reduce((result: any, header) => {
				return { ...result, [header]: request.headers.get(header) };
			}, {}),
			query: request.params.keys().reduce((result, param) => {
				return { ...result, [param]: request.params.get(param) };
			}, {}),
			body: Body.json(
				request.body
			),
			timeout: 30,
			responseType: ResponseType.JSON,
		};
		console.info(httpOptions);
		return httpOptions;
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
