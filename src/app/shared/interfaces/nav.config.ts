export interface TableActionContext<T> {
    item: T;
    actionKey: string;
}


export const ROLE_MENU_MAP: { [key: string]: any[] } = {
    "System Administrator": [
        {
            label: 'System Management',
            items: [
                { label: 'Manage Specifications', icon: 'pi pi-sliders-h', routerLink: ['/dashboard/specifications'] },
                { label: 'Manage Categories', icon: 'pi pi-tags', routerLink: ['/dashboard/categories'] },
                { label: 'Manage Expenses', icon: 'pi pi-wallet', routerLink: ['/dashboard/expenses'] }
            ]
        },
        {
            label: 'Account & Permissions',
            items: [
                { label: 'Manage Users', icon: 'pi pi-user-edit', routerLink: ['/dashboard/admin/users'] },
                { label: 'Manage Groups', icon: 'pi pi-users', routerLink: ['/dashboard/admin/groups'] },
                { label: 'Manage Permissions', icon: 'pi pi-lock', routerLink: ['/dashboard/admin/permissions'] },
            ]
        },
        {
            label: 'Administration & Security',
            items: [
                { label: 'System Configuration', icon: 'pi pi-cog', routerLink: ['/dashboard/admin/settings'] },
                { label: 'Security & Audit Logs', icon: 'pi pi-shield', routerLink: ['/dashboard/admin/audit'] }
            ]
        }

    ],

    "Chief Executive Officer (CEO)": [
        {
            label: 'Specification settings',
            items: [
                { label: 'Manage Categories', icon: 'pi pi-tags', routerLink: ['/dashboard/categories'] },
                { label: 'Manage Specifications', icon: 'pi pi-sliders-h', routerLink: ['/dashboard/specifications'] }
            ]
        },
        {
            label: 'Sales and Orders',
            items: [
                { label: 'Add Sales', icon: 'pi pi-plus', routerLink: ['/dashboard/sales'] },
                { label: 'View Sales', icon: 'pi pi-eye', routerLink: ['/dashboard/view-sales'] },
                { label: 'Day Summary', icon: 'pi pi-calculator', routerLink: ['/dashboard/sales-summary'] }
                // { label: 'Manage Orders', icon: 'pi pi-shopping-cart', routerLink: ['/dashboard/sales-orders'] }
            ]
        },
        {
            label: 'Expenses & Savings',
            items: [
                { label: 'Manage Expenses', icon: 'pi pi-wallet', routerLink: ['/dashboard/expenses'] },
                { label: 'Add Savings', icon: 'pi pi-money-bill', routerLink: ['/der/dashboards/savings'] },
            ]
        },
        {
            label: 'Inventory & Operations',
            items: [
                { label: 'Purchase Orders', icon: 'pi pi-shopping-bag', routerLink: ['/dashboard/purchasing'] },
                { label: 'Manage Products', icon: 'pi pi-box', routerLink: ['/dashboard/products'] },
                { label: 'Manage Software', icon: 'pi pi-desktop', routerLink: ['/dashboard/software-products'] },
                { label: 'Stock Levels', icon: 'pi pi-chart-line', routerLink: ['/dashboard/stock'] }
            ]
        },
        {
            label: 'Hardware T&E: TV Components',
            items: [
                { label: 'Test and Evaluation', icon: 'pi pi-fw pi-check-square', routerLink: ['/dashboard/harware/test'] },
                { label: 'Test Summary', icon: 'pi pi-chart-bar', routerLink: ['/dashboard/test/summary'] }
            ]
        },

        // {
        //     label: 'Fulfillment & Shipping',
        //     items: [
        //         {
        //             label: 'Shipping Settings',
        //             icon: 'pi pi-truck',
        //             items: [
        //                 { label: 'Methods', routerLink: ['/der/dashboards/shipping/methods'] },
        //                 { label: 'Zones', routerLink: ['/der/dashboards/shipping/zones'] },
        //                 { label: 'Rates', routerLink: ['/der/dashboards/shipping/rates'] }
        //             ]
        //         },
        //         { label: 'Manage Requests', icon: 'pi pi-inbox', routerLink: ['/der/dashboards/fulfillment/requests'] },
        //         { label: 'Manage Shipments', icon: 'pi pi-send', routerLink: ['/der/dashboards/fulfillment/shipments'] }
        //     ]
        // },
        // {
        //     label: 'Finance & Performance',
        //     items: [
        //         { label: 'Reports', icon: 'pi pi-file-pdf', routerLink: ['/der/dashboards/reports'] },
        //         { label: 'Financial Summary', icon: 'pi pi-chart-bar', routerLink: ['/der/dashboards/transactions'] },
        //         { label: 'KPMs & Performance', icon: 'pi pi-percentage', routerLink: ['/der/dashboards/performance'] }
        //     ]
        // }
    ],

    "Sales Representative": [
        {
            label: 'Sales Activities',
            items: [
                { label: 'Add Sales', icon: 'pi pi-plus', routerLink: ['/dashboard/sales'] },
                { label: 'View Sales', icon: 'pi pi-eye', routerLink: ['/dashboard/view-sales'] },
                { label: 'Manage Orders', icon: 'pi pi-shopping-cart', routerLink: ['/dashboard/sales-orders'] },
                { label: 'Day Summary', icon: 'pi pi-calculator', routerLink: ['/dashboard/sales-summary'] }
            ]
        },
        {
            label: 'Personal Records',
            items: [
                { label: 'Add Expenses', icon: 'pi pi-wallet', routerLink: ['/dashboard/expenses'] },
                { label: 'Add Savings', icon: 'pi pi-money-bill', routerLink: ['/dashboard/savings'] }
            ]
        }
    ],

    "Customer": [
        {
            label: 'My Account',
            items: [
              { label: 'Order Tracking', icon: 'pi pi-truck', routerLink: ['/dashboard/order-tracking'] },
              { label: 'My Orders', icon: 'pi pi-briefcase', routerLink: ['/dashboard/orders'] },
              { label: 'My Cart', icon: 'pi pi-shopping-cart', routerLink: ['/dashboard/cart'] },
              { label: 'My Wishlist', icon: 'pi pi-heart', routerLink: ['/dashboard/wishlist'] },
              { label: 'My Purchased Content', icon: 'pi pi-cloud-download', routerLink: ['/dashboard/purchased-content'] },
              { label: 'Payment Methods', icon: 'pi pi-credit-card', routerLink: ['/dashboard/payments'] },
              { label: 'Addresses', icon: 'pi pi-map-marker', routerLink: ['/dashboard/addresses'] },
              { label: 'My Reviews', icon: 'pi pi-comment', routerLink: ['/dashboard/reviews'] },
              { label: 'Account Settings', icon: 'pi pi-cog', routerLink: ['/dashboard/profile/settings'] }
            ]

        }
    ]
};
