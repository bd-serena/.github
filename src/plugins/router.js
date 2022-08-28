import Vue from 'vue'
import Router from 'vue-router'
import Loading from '../views/Loading.vue'
import TenantSelect from '../views/TenantSelect.vue'
import Login from '../views/Login.vue'
import PreviewLoading from '../views/PreviewLoading.vue'
import { routerCommon } from 'ngbd-utils'
import { isPC } from '@/utils/comonFunc.js';

Vue.use(Router)

const router1 = new Router({
  mode: "hash",
  routes: [
    {
      path: '/view',
      name: 'view',
      component: Loading,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/index',
      name: 'index',
      component: () => import(/* webpackChunkName: "about" */ '../views/Index.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/portalView',
      name: 'portalView',
      component: () => import(/* webpackChunkName: "about" */ '../views/Portal.vue')
    },
    {
      path: '/portalDesign',
      name: 'portalDesign',
      component: () => import(/* webpackChunkName: "about" */ '../views/PortalDesign.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/design',
      name: 'design',
      component: () => import(/* webpackChunkName: "about" */ '../views/nDesignMain.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import(/* webpackChunkName: "about" */ '../views/PreView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/dataSetSql',
      name: 'dataSetSql',
      component: () => import(/* webpackChunkName: "about" */ '../views/DataSetSql.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/dataset',
      name: 'dataset',
      component: () => import(/* webpackChunkName: "about" */ '../views/DataSet.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/',
      name: 'Loading',
      component: Login
    },
    {
      path: '/report',
      name: 'report',
      component: () => import(/* webpackChunkName: "about" */ '../views/ReportForm.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/reportView',
      name: 'reportView',
      component: () => import(/* webpackChunkName: "about" */ '../views/ReportPreView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/pageDesign',
      name: 'pageDesign',
      component: () => import(/* webpackChunkName: "about" */ '../views/pageDesign.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/bigScreenDesign',
      name: 'bigScreenDesign',
      component: () => import('../views/bigScreenDesign.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/pageView',
      name: 'pageView',
      component: () => import('../views/PagePreView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/tenantSelect',
      name: 'tenantSelect',
      component: TenantSelect,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/mobilePageView',
      name: 'mobilePageView',
      component: () => import('../views/mobilePageView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/DimensionDesign',
      name: 'DimensionDesign',
      component: () => import('../views/DimensionDesign.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/ComptMgt',
      name: 'ComptMgt',
      component: () => import('../components/home/ComptMgt.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/AnalyMgt',
      name: 'AnalyMgt',
      component: () => import('../components/home/AnalyMgt.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/AnalyIndex',
      name: 'AnalyIndex',
      component: () => import('../components/home/AnalyIndex.vue'),
      meta: {
        requireAuth: true
      }
    }
  ]
});
const previewRouter = new Router({
  mode: "hash",
  routes: [
    {
      path: '/',
      name: 'PreviewLoading',
      component: PreviewLoading,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import(/* webpackChunkName: "about" */ '../views/PreView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/reportView',
      name: 'reportView',
      component: () => import(/* webpackChunkName: "about" */ '../views/ReportPreView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/pageView',
      name: 'pageView',
      component: () => import('../views/PagePreView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/mobilePageView',
      name: 'mobilePageView',
      component: () => import('../views/mobilePageView.vue'),
      meta: {
        requireAuth: true
      }
    },
    {
      path: '*',
      name: 'PreviewLoading',
      component: PreviewLoading,
      meta: {
        requireAuth: true
      }
    }
  ]
});
const mobileRouter = new Router({
  mode: "hash",
  routes: [
    {
      path: '/view',
      name: 'view',
      component: Loading,
      meta: {
        requireAuth: true
      }
    },
    {
      path: "/PortalIndex", 
      component: () =>
          import ("../views/mobile/SwiperFrame.vue"),
          meta: {
            requireAuth: true
          }
      }, {
        path: "/AnalysisIndex", 
        component: () =>
            import ("../views/mobile/SwiperFrame.vue"),
            meta: {
              requireAuth: true
            }
    }, {
      path: "/CollectIndex", 
      component: () =>
          import ("../views/mobile/SwiperFrame.vue"),
          meta: {
            requireAuth: true
          }
  }, {
    path: '/AnalysisPreview',
    name: 'AnalysisPreview',
    component: () => import('../views/mobile/AnalysisPreview.vue'),
    meta: {
      requireAuth: true
    }
  },{
    path: '/pageView',
    name: 'pageView',
    component: () => import('../views/PagePreView.vue'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/portalView',
    name: 'portalView',
    component: () => import(/* webpackChunkName: "about" */ '../views/Portal.vue'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/Setting',
    name: 'Setting',
    component: () => import(/* webpackChunkName: "about" */ '../views/mobile/Setting.vue'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/EditPassword',
    name: 'EditPassword',
    component: () => import(/* webpackChunkName: "about" */ '../views/mobile/EditPassword.vue'),
    meta: {
      requireAuth: true
    }
  },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/',
      name: 'Loading',
      component: Login
    },
    // {
    //   path: '/tenantSelect',
    //   name: 'tenantSelect',
    //   component: TenantSelect,
    //   meta: {
    //     requireAuth: true
    //   }
    // },
  ]
});

let router = router1;
switch (process.env.VUE_APP_TITLE) {
  case 'preview':
    router = previewRouter;
    break;
  case 'mobile':
    router = mobileRouter;
    break;
  default:
    break;
}
if (navigator.userAgent && !isPC()) {
  router = mobileRouter;
}
// const router = process.env.VUE_APP_TITLE === "preview"?previewRouter:(isPC()?router1:mobileRouter);
// const router = previewRouter;
routerCommon.bdRouterControl(router)
export default router
