import { Routes } from '@angular/router';
import { Landing } from './landing';
import { Listing } from './components/listing';
import { Tracking } from './components/tracking';
import { ProductDetails } from './product-details';
import { Specific } from './components/specific';
import { Soft } from './components/soft';
import { ShoppingCart } from './components/shopping-cart';
import { CheckOut } from './components/check-out';
import { AboutUs } from './us-pages/about_us';
import { ContactUs } from "./us-pages/contact_us";
import { Support } from "./us-pages/support";
import { Location } from "./us-pages/location";


export default [
    {
        path: '',
        component: ProductDetails,
        children: [
            { path: 'motherboards', component: Listing, data: { extraParameter: '' } },
            { path: 'screens', component: Listing, data: { extraParameter: '' } },
            { path: 't-con', component: Listing, data: { extraParameter: '' } },
            { path: 'accessories', component: Listing, data: { extraParameter: '' } },
            { path: 'software', component: Listing, data: { extraParameter: '' } },
            { path: 'deals', component: Listing, data: { extraParameter: '' } },
            { path: 'cart', component: ShoppingCart, data: { extraParameter: '' } },
            { path: 'tracking', component: Tracking, data: { extraParameter: '' } },
            { path: 'product/:id', component: Specific, data: { extraParameter: '' }},
            { path: 'software/:id', component: Soft, data: { extraParameter: '' }},
            { path: 'checkout', component: CheckOut, data: { extraParameter: '' } },
            { path: 'about', component: AboutUs, data: { extraParameter: '' } },
            { path: 'contact', component: ContactUs, data: { extraParameter: '' } },
            { path: 'support', component: Support, data: { extraParameter: '' } },
            { path: 'location', component: Location, data: { extraParameter: '' } },
          ]
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
