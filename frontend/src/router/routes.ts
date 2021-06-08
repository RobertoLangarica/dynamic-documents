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
        name: 'template_edition',
        path: 'template/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: true, id: route.params.id, need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, download_auth: route.query.download_auth || '', invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false, initialView: route.query.initialView ? parseInt(route.query.initialView as string) : 0 })
      },
      {
        name: 'document_edition',
        path: 'document/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: false, id: route.params.id, need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, download_auth: route.query.download_auth || '', invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false, initialView: route.query.initialView ? parseInt(route.query.initialView as string) : 0 })
      },
      {
        name: 'document_view',
        path: 'document/view/:id',
        component: () => import('pages/embeds/View.vue'),
        props: route => ({ isTemplate: false, id: route.params.id, need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, download_auth: route.query.download_auth || '', invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
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
      {
        name: 'fillmap',
        path: 'capture/map/:document_id/:fillmap_type',
        component: () => import('src/pages/embeds/FillmapCapture.vue'),
        props: route => ({ document_id: route.params.document_id, fillmap_type: route.params.fillmap_type, need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
      }
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
