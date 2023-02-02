import { LoginScreenComponent } from './login-screen/login-screen.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TestEventComponent } from './test-event/test-event.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CheckStatusComponent } from './check-status/check-status.component';



@NgModule({
  declarations: [
    LoginScreenComponent,
    TestEventComponent,
    CheckStatusComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BrowserModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class AuthModule { }
