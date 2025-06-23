import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Dashboard Routes
const Analytics = lazy(() => import('@/app/(admin)/dashboard/analytics/page'));
const Categories = lazy(() => import('@/app/(admin)/categories/page'));
const SubCategories = lazy(() => import('@/app/(admin)/subcategories/page'));
const Config = lazy(() => import('@/app/(admin)/config/page'));
const Banners = lazy(() => import('@/app/(admin)/banners/page'));
const Colors = lazy(() => import('@/app/(admin)/colors/page'));
const Advertisements = lazy(() => import('@/app/(admin)/advertisements/page'));
const Contents = lazy(() => import('@/app/(admin)/content/page'));

// Stores
const StoresList= lazy(() => import('@/app/(admin)/stores/list'));
const StoresAdd= lazy(() => import('@/app/(admin)/stores/add'));
const StoresEdit= lazy(() => import('@/app/(admin)/stores/edit'));

const OrdersList= lazy(() => import('@/app/(admin)/orders/list'));
const OrdersDetails= lazy(() => import('@/app/(admin)/orders/details'));

// const Finance = lazy(() => import('@/app/(admin)/dashboard/finance/page'))
// const Sales = lazy(() => import('@/app/(admin)/dashboard/sales/page'))

// const Maintenance = lazy(() => import('@/app/(other)/maintenance/page'));
// const ComingSoon = lazy(() => import('@/app/(other)/coming-soon/page'));

// Auth Routes
const AuthSignIn2 = lazy(() => import('@/app/(other)/auth/sign-in-2/page'));
// const AuthSignUp2 = lazy(() => import('@/app/(other)/auth/sign-up-2/page'));

// Apps Routes
// const EcommerceProducts = lazy(() => import('@/app/(admin)/ecommerce/products/page'))
// const EcommerceProductDetails = lazy(() => import('@/app/(admin)/ecommerce/products/[productId]/page'))
// const EcommerceProductCreate = lazy(() => import('@/app/(admin)/ecommerce/products/create/page'))
// const EcommerceCustomers = lazy(() => import('@/app/(admin)/ecommerce/customers/page'))
// const EcommerceSellers = lazy(() => import('@/app/(admin)/ecommerce/sellers/page'))
// const EcommerceOrders = lazy(() => import('@/app/(admin)/ecommerce/orders/page'))
// const EcommerceOrderDetails = lazy(() => import('@/app/(admin)/ecommerce/orders/[orderId]/page'))
// const EcommerceInventory = lazy(() => import('@/app/(admin)/ecommerce/inventory/page'))

export const authRoutes = [{
  name: 'Sign In',
  path: '/auth/sign-in',
  element: <AuthSignIn2 />
}];

const initialRoutes = [{
  path: '/',
  name: 'root',
  element: <Navigate to="/dashboard" />
}];
const sellerRoutes = [{
  path: '/dashboard',
  name: 'Analytics',
  element: <Analytics />
},
{
  path: '/categories',
  name: 'Categories',
  element: <Categories />
},
{
  path: '/categories/subcategories/:categoryId',
  name: 'Sub Categories',
  element: <SubCategories />
},
{
  path: '/configs',
  name: 'Configs',
  element: <Config />
},
{
  path: '/banners',
  name: 'Banners',
  element: <Banners />
},
{
  path: '/colors',
  name: 'Colors',
  element: <Colors />
},
{
  path: '/advertisements',
  name: 'Advertisements',
  element: <Advertisements />
},
{
  path: '/contents',
  name: 'Contents',
  element: <Contents />
},
{
  path: '/stores-list',
  name: 'Stores',
  element: <StoresList />
},
{
  path: '/stores-add',
  name: 'Store Add',
  element: <StoresAdd />
},
{
  path: '/stores-edit/:id',
  name: 'Store Edit',
  element: <StoresEdit />
},
{
  path: '/orders-list',
  name: 'Orders',
  element: <OrdersList />
},
{
  path: '/order-details/:orderId',
  name: 'Order Details',
  element: <OrdersDetails />
},
];


// const appsRoutes = [];
// const customRoutes = [];
// const baseUIRoutes = [];
// const tableRoutes = [];
// const iconRoutes = [];
// const advancedUIRoutes = [];
// export const appRoutes = [...initialRoutes, ...generalRoutes, ...appsRoutes, ...customRoutes, ...baseUIRoutes, ...advancedUIRoutes, ...tableRoutes, ...iconRoutes, ...authRoutes];
export const appRoutes = [...initialRoutes, ...sellerRoutes,  ...authRoutes];