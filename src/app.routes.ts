import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Landing } from './app/pages/welcome-pages/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { NotAvailable } from './app/pages/notavailable/notavailable';
import { Access } from './app/pages/user-pages/access';
import { authenticityGuard } from './app/shared/guard/authenticity-guard';


export const appRoutes: Routes = [

    { path: '', component: Landing, data: { extraParameter: '' } },
    { path: 'der', loadChildren: () => import('./app/pages/welcome-pages/welcome.routes') },
    { path: 'account', loadChildren: () => import('./app/pages/user-pages/auth.routes') },

    {
      path: 'dashboard',
      component: AppLayout,
      canActivate: [authenticityGuard],
      data: {
        allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)', 'Sales Representative', 'Customer']
      },
      loadChildren: () => import('./app/pages/dashboard-pages/dashboard.routes')
    },
    { path: 'access-denied', component: Access },
    { path: 'notfound', component: Notfound },
    { path: 'notavailable', component: NotAvailable },
    { path: '**', redirectTo: '/notfound' }
];
