import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/ExternalLayout.vue'),
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('pages/Login.vue'),
        props: route => ({ redirect: route.query.redirect || null })
      },
      {
        name: 'index',
        path: '',
        component: () => import('pages/Index.vue'),
        meta: { protected: true }
      },
      {
        name: 'documents',
        path: 'documents',
        component: () => import('pages/Documents.vue'),
        meta: { protected: true }
      },
      {
        name: 'embed-document',
        props: true,
        path: 'document/:id',
        component: () => import('pages/Document.vue'),
        meta: { protected: true }
      }
    ]
  },
  {
    path: '/embed/',
    component: () => import('layouts/ExternalLayout.vue'),
    children: [
      {
        name: 'template_creation',
        path: 'template/creation',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: true })
      },
      {
        name: 'template_edition',
        path: 'template/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: true, id: route.params.id })
      },
      {
        name: 'document_edition',
        path: 'document/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: false, id: route.params.id })
      },
      {
        name: 'document_view',
        path: 'document/edition/:id/view',
        component: () => import('pages/embeds/View.vue'),
        props: route => ({ isTemplate: false, id: route.params.id })
      },
      { name: 'authorize', path: 'auth', component: () => import('pages/embeds/Authorize.vue') }
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
