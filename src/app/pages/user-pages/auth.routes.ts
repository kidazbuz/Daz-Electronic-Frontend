import { Routes } from '@angular/router';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register';
import { Otp } from './otp';
import { authenticityGuard } from '../../shared/guard/authenticity-guard';
import { completedGuard } from '../../shared/guard/completed-guard';
import { ProfileLayout } from './profile-layout';
import { CompleteRegistration } from './complete-registration';
import { ChangePassword } from './change-password';
import { ForgotPassword } from './forgot-password';
import { ConfirmReset } from './confirm-reset';
import { UserPagesLayout } from './user-pages-layout';

export default [

    {
      path: '',
      component: UserPagesLayout,
      children: [
        { path: 'error', component: Error },
        { path: 'login', component: Login },
        { path: 'register', component: Register },
        { path: 'otp-verification', component: Otp },
        { path: 'forgot-password', component: ForgotPassword },
        { path: 'confirm-password-reset/:uid/:token', component: ConfirmReset },
      ]
    },
    {
        path: 'profile',
        component: ProfileLayout,
        canActivate: [authenticityGuard],
        data: {
          allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)', 'Sales Representative', 'Customer']
        },
        children: [

            {
                path: 'complete-registration',
                component: CompleteRegistration,
                canActivate: [],
                data: {
                  allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)', 'Sales Representative']
                }
            },
            {
                path: 'change-password',
                component: ChangePassword,
                canActivate: [],
                data: {
                  allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)', 'Sales Representative']
                }
            },
            // {
            //     path: 'activity',
            //     component: ActivityLog,
            //     data: { title: 'Recent Activity' }
            // }
        ]
    },

] as Routes;
