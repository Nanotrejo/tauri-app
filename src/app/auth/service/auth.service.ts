import { Injectable } from '@angular/core';
import { AuthFlowService } from 'src/swagger/auth/api/authFlow.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authFlowServiceSwagger: AuthFlowService) { }

   /**
     * @description Checks if the token is valid
     * @return promise boolean
     */
   IsTokenValid(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        this.authFlowServiceSwagger.isTokenValid2AuthflowIstokenvalidGet().subscribe(
            (resp) => {
                resolve(resp);
            },
            (err) => {
                reject(err);
            },
        );
    });
}
}
