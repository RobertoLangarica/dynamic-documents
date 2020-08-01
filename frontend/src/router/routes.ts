import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/ExternalLayout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/Index.vue') },
      { name: 'login', path: 'login', component: () => import('pages/Login.vue') },
      { name: 'documents-old', path: 'documents-old', component: () => import('pages/DocumentsOld.vue') },
      { name: 'documents', path: 'documents', component: () => import('pages/Documents.vue') },
      { name: 'embed-document', path: 'document/:id', component: () => import('pages/Document.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
