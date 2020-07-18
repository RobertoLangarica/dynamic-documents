
/* eslint-disable */

const routes = [
  {
    path: '/',
    component: () => import('layouts/InternalLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'login', name: "login", component: () => import('pages/Login.vue') },
      { path: 'secrets', name: "secrets", component: () => import('pages/Secrets.vue') },
      { path: 'documents', name: "documents", component: () => import('pages/Documents.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
