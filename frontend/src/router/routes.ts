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
        component: () => import('components/dd/Document.vue'),
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
        props: route => ({ isTemplate: true, auth: route.query.auth || '' })
      },
      {
        name: 'template_edition',
        path: 'template/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: true, id: route.params.id, auth: route.query.auth || '' })
      },
      {
        name: 'document_edition',
        path: 'document/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: false, id: route.params.id, auth: route.query.auth || '' })
      },
      {
        name: 'document_view',
        path: 'document/view/:id',
        component: () => import('pages/embeds/View.vue'),
        props: route => ({ isTemplate: false, id: route.params.id, auth: route.query.auth || '' })
      },
      {
        name: 'filtered_document',
        path: 'filter/capture/:id',
        component: () => import('pages/embeds/FilteredDoc.vue'),
        props: route => ({ id: route.params.id, readonly: false })
      },
      {
        name: 'filtered_document_view',
        path: 'filter/capture/:id/view',
        component: () => import('pages/embeds/FilteredDoc.vue'),
        props: route => ({ id: route.params.id, readonly: true })
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
