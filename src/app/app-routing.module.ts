import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './auth/login-screen/login-screen.component';
import { TestEventComponent } from './auth/test-event/test-event.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginScreenComponent,
    },
    {
        path: 'test',
        component: TestEventComponent,
    },
    { path: '**', component: LoginScreenComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
