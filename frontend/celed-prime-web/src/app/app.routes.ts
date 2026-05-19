import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { HomeUserComponent } from './features/home-user/home-user.component';
import { NewReservationComponent } from './features/new-reservation/new-reservation.component';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { MyReservationsComponent } from './features/my-reservations/my-reservations.component';

export const routes: Routes = [
    {
        path: '', component: HomeComponent, title: 'Celed Prime | Home'
    },
    {
        path: 'login', component: LoginComponent, title: 'Celed Prime | Login'
    },
    {
        path: 'home', component: HomeUserComponent, title: 'Celed Prime | Home User'
    },
    { 
        path: 'reservas/nova', component: NewReservationComponent, title: 'Celed Prime | New Reserve'
    },
    {
        path: 'reset/senha', component: ForgotPasswordComponent, title: 'Celed Prime | Reset Password'
    },
    {
        path: 'minhas/reservas', component: MyReservationsComponent, title: 'Celed Prime | My Reserves'
    }
];
