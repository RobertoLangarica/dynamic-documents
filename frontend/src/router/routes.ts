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
        props: route => ({ isTemplate: true, need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, download_auth: route.query.download_auth || '', invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
      },
      {
        name: 'template_edition',
        path: 'template/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: true, id: route.params.id, need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, download_auth: route.query.download_auth || '', invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
      },
      {
        name: 'document_edition',
        path: 'document/edition/:id',
        component: () => import('pages/embeds/Edition.vue'),
        props: route => ({ isTemplate: false, id: route.params.id, need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, download_auth: route.query.download_auth || '', invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
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
        path: 'capture/map',
        component: () => import('pages/embeds/FillmapManager.vue'),
        props: route => ({ need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
      },
      {
        name: 'field_type_selection',
        path: 'field/type/selection',
        component: () => import('components/dd/FieldTypeSelection/FieldTypeSelection.vue'),
        props: route => ({ need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
      },
      {
        name: 'field_config',
        path: 'field/config',
        component: () => import('components/dd/FieldConfig/FieldConfig.vue'),
        props: route => ({ need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
      },
      {
        name: 'field_selector',
        path: 'field/selector',
        component: () => import('components/dd/FieldSelector/FieldSelector.vue'),
        props: route => ({ need_auth: route.query.need_auth ? route.query.need_auth === 'true' : false, invisibleDialogs: route.query.invisibleDialogs ? route.query.invisibleDialogs === 'true' : false })
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
