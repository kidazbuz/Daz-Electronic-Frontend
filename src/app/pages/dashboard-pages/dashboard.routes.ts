import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { authenticityGuard } from '../../shared/guard/authenticity-guard'
import { Categories } from './pages/categories';
import { Specifications } from './pages/specifications';
import { PurchasingOrder } from './pages/purchasing-order';
import { Sales } from './pages/sales';
import { Products } from './pages/products';
import { Stock } from './pages/stock';
import { Software } from './pages/software';
import { SalesView } from './pages/sales-view';
import { Users } from './pages/users';
import { Profile } from './pages/profile';
import { ProfileSettings } from "./pages/profile-settings";
import { CatalogMain } from './pages/catalog-main';
import { FeaturesWidget } from '../welcome-pages/components/featureswidget';
import { Specific } from '../welcome-pages/components/specific';
import { Tracking } from '../welcome-pages/components/tracking';
import { Carts } from './pages/carts';
import { Expenses } from './pages/expenses';
import { AgentSummary } from './pages/agent_summary';


export default [
    { path: 'main', component: Dashboard },
    {
      path: '',
      component: CatalogMain,
      canActivate: [authenticityGuard],
      data: { allowedRoles: ['Customer']},
      children: [
        { path: 'catalog', component: FeaturesWidget },
        { path: 'catalog/:id', component: Specific },
      ]
    },

    // --- Shared Routes ---
    {
        path: 'profile/me',
        component: Profile,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)', 'Sales Representative', 'Customer'] }
    },
    {
        path: 'profile/settings',
        component: ProfileSettings,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)', 'Sales Representative', 'Customer'] }
    },
    {
        path: 'categories',
        component: Categories,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)'] }
    },
    {
        path: 'specifications',
        component: Specifications,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)'] }
    },
    {
        path: 'products',
        component: Products,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)'] }
    },
    {
        path: 'purchasing',
        component: PurchasingOrder,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)'] }
    },
    {
        path: 'sales',
        component: Sales,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['Sales Representative', 'Chief Executive Officer (CEO)'] }
    },
    {
        path: 'stock',
        component: Stock,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['Chief Executive Officer (CEO)'] }
    },
    {
        path: 'software-products',
        component: Software,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['Chief Executive Officer (CEO)'] }
    },
    {
        path: 'view-sales',
        component: SalesView,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['Chief Executive Officer (CEO)', 'Sales Representative'] }
    },
    {
        path: 'sales-summary',
        component: AgentSummary,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['Sales Representative', 'Chief Executive Officer (CEO)'] }
    },

    // {
    //     path: 'sales-orders',
    //     component: SalesOrdersComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)', 'Sales Representative'])]
    // },
    {
        path: 'expenses',
        component: Expenses,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['Chief Executive Officer (CEO)', 'Sales Representative', 'System Administrator', 'Manager'] }
    },
    // // --- System Administrator Only ---
    {
        path: 'admin/users',
        component: Users,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator'] }
    },
    //
    // // --- CEO Only ---
    // {
    //     path: 'products',
    //     component: ProductsComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    // {
    //     path: 'software-products',
    //     component: SoftwareComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    // {
    //     path: 'stock',
    //     component: StockComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    // {
    //     path: 'purchasing',
    //     component: PurchasingComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    // {
    //     path: 'reports',
    //     component: ReportsComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    // {
    //     path: 'performance',
    //     component: PerformanceComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    //
    // // --- CEO Fulfillment Sub-routes ---
    // {
    //     path: 'fulfillment/requests',
    //     component: FulfillmentRequestsComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    // {
    //     path: 'fulfillment/shipments',
    //     component: ShipmentsComponent,
    //     canActivate: [roleGuard(['Chief Executive Officer (CEO)'])]
    // },
    //
    // // --- Customer Only ---
    {
        path: 'order-tracking',
        component: Tracking,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['System Administrator', 'Chief Executive Officer (CEO)', 'Sales Representative', 'Customer'] }
    },
    {
        path: 'cart',
        component: Carts,
        canActivate: [authenticityGuard],
        data: { allowedRoles: ['Customer']},
    },
] as Routes;
