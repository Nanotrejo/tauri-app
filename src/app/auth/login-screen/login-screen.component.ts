import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFlowService } from 'src/swagger/auth/api/authFlow.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.css']
})
export class LoginScreenComponent implements OnInit {
  logInForm: FormGroup;
  rememberMe: boolean = false;
  firstLogIn = false;
  error = false;
  userCredentials = false;
  typePassword: string = 'password';
  message: string = ''

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private authService: AuthService,
      private authServiceSwagger: AuthFlowService,
  ) {
      this.logInForm = this.fb.group({
          username: ['', [Validators.required]],
          password: [
              '',
              Validators.compose([Validators.required]),
          ],
          newPassword: [
              '',
              Validators.compose([Validators.required]),
          ],
          confirmNewPassword: [
              '',
              Validators.compose([Validators.required]),
          ],
      });
  }

  ngOnInit(): void {
      this.checkIfToken();
  }

  /**
   * @description Check if the token is valid
   */
  async checkIfToken() {
      await this.authService.IsTokenValid().then((isTokenValid: boolean) => {
          isTokenValid && this.router.navigate(['/']);
      });
  }

  /**
   * @description Open the keyboard modal
   */
  openSimpleKeyboard(keyValue: string) {
      // const modalRef = this.modal.open(SimpleKeyboardComponent, {
      //     backdropClass: 'bg-transparent',
      //     windowClass: 'transition-none height-0',
      // });
      // modalRef.componentInstance.value = this.logInForm.value[`${keyValue}`];
      // modalRef.componentInstance.isPassword =
      //     keyValue === 'password' ||
      //     keyValue === 'confirmNewPassword' ||
      //     keyValue === 'newPassword';
      // modalRef.componentInstance.onValueEvent.subscribe((result: string) =>
      //     this.logInForm.controls[`${keyValue}`].setValue(result),
      // );
  }

  /**
   * @description Change the status of the remember me check
   */
  changeRememberMe($event: any) {
      this.rememberMe = $event.checked;
  }

  /**
   * @description Get the controls of the form
   */
  get logInFormControl(): any {
      return this.logInForm.controls;
  }

  /**
   * @description Do the login in the app and navigate to the dashboard
   */
  logIn() {
      this.authServiceSwagger
          .loginAuthflowLoginGet(
              'angular',
              this.logInForm.value['username'],
              this.logInForm.value['password'],
          )
          .subscribe(
              async (result: any) => {
                  if (!result.access_token) {
                     
                      return;
                  }
                  this.router.navigate(['/test']);
              },
              (err: any) => {
                this.message = err;
                  if (err.error_description == 'Invalid user credentials')
                      this.userCredentials = true;
                  this.firstLogIn = err.error_description === 'Account is not fully set up';
                  if (err.error_description === 'Account is not fully set up') return;
              },
          );
  }

}
