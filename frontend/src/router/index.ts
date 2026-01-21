// frontend/src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMenuStore } from "@/stores/menu";
import type { MenuNode } from "@/api/menu";

// --- View Components ---
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import AppLayout from "@/layout/AppLayout.vue";

// [Analysis Views]
import WaferFlatDataView from "../views/WaferFlatDataView.vue";
import LotUniformityTrendView from "../views/LotUniformityTrendView.vue";
import SpectrumAnalysisView from "../views/SpectrumAnalysisView.vue";
import ProcessMatchingAnalyticsView from "../views/ProcessMatchingAnalyticsView.vue";
import EquipmentExplorerView from "../views/EquipmentExplorerView.vue";
import PerformanceTrendView from "../views/PerformanceTrendView.vue";
import ProcessMemoryView from "../views/ProcessMemoryView.vue";
import LampLifeView from "../views/LampLifeView.vue";
import PreAlignAnalyticsView from "../views/PreAlignAnalyticsView.vue";
import ErrorAnalyticsView from "../views/ErrorAnalyticsView.vue";
import EquipmentHealthView from "../views/EquipmentHealthView.vue";
import ItmAgentMemoryView from "../views/ItmAgentMemoryView.vue";
import OpticalTrendView from "../views/OpticalTrendView.vue";

// [Admin Views]
import AdminLayout from "../views/admin/AdminLayout.vue";
import MenuManagementView from "../views/admin/MenuManagementView.vue";
import UserManagementView from "../views/admin/UserManagementView.vue";
import InfraManagementView from "../views/admin/InfraManagementView.vue";
import SystemConfigView from "../views/admin/SystemConfigView.vue";

// [Support Views]
const QnaLayout = () => import('../views/support/QnaLayout.vue'); // [New] Layout
const QnaBoardView = () => import('../views/support/QnaBoardView.vue');
const QnaWriteView = () => import('../views/support/QnaWriteView.vue');
const QnaDetailView = () => import('../views/support/QnaDetailView.vue');
const ManualView = () => import('../views/support/ManualView.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "home",
        component: HomeView,
      },
      
      // =============================================
      // [Support Group] Q&A Layout 적용
      // =============================================
      {
        path: "support",
        children: [
          {
            path: "manual",
            name: "manual",
            component: ManualView,
            meta: { title: 'User Manual' }
          },
          {
            path: "qna",
            component: QnaLayout, // [중요] 부모 레이아웃 설정
            children: [
              {
                path: "", // /support/qna
                name: "qna-list",
                component: QnaBoardView,
                meta: { title: 'Q&A Board' }
              },
              {
                path: "write", // /support/qna/write
                name: "qna-write",
                component: QnaWriteView,
                meta: { title: 'Write Question' }
              },
              {
                path: ":id", // /support/qna/:id
                name: "qna-detail",
                component: QnaDetailView,
                meta: { title: 'Q&A Detail' }
              }
            ]
          }
        ]
      },

      // ... (Analysis Modules: 기존과 동일) ...
      { path: "/waferflatdata", name: "wafer", component: WaferFlatDataView },
      { path: "/lot-uniformity-trend", name: "lot-uniformity", component: LotUniformityTrendView },
      { path: "/spectrum-analytics", name: "spectrum", component: SpectrumAnalysisView },
      { path: "/process-matching", name: "process-matching", component: ProcessMatchingAnalyticsView },
      { path: "/equipment-explorer", name: "equipment", component: EquipmentExplorerView },
      { path: "/performance-trend", name: "performance", component: PerformanceTrendView },
      { path: "/process-memory", name: "process-memory", component: ProcessMemoryView },
      { path: "/lamp-life", name: "lamp", component: LampLifeView },
      { path: "/prealign-analytics", name: "prealign", component: PreAlignAnalyticsView },
      { path: "/error-analytics", name: "error", component: ErrorAnalyticsView },
      { path: "/health", name: "health", component: EquipmentHealthView },
      { path: "/agent-memory", name: "agent-memory", component: ItmAgentMemoryView },
      { path: "/optical-trend", name: "optical-trend", component: OpticalTrendView },

      // ... (Admin Modules: 기존과 동일) ...
      {
        path: "/admin",
        component: AdminLayout,
        children: [
          {
            path: "",
            redirect: () => {
              const authStore = useAuthStore();
              if (authStore.user?.role === 'ADMIN') return { name: "admin-menus" };
              return { name: "admin-users" };
            },
          },
          { path: "menus", name: "admin-menus", component: MenuManagementView, meta: { roles: ['ADMIN'] } },
          { path: "users", name: "admin-users", component: UserManagementView, meta: { roles: ['ADMIN', 'MANAGER'] } },
          { path: "infra", name: "admin-infra", component: InfraManagementView, meta: { roles: ['ADMIN', 'MANAGER', 'ENGINEER'] } },
          { path: "system", name: "admin-system", component: SystemConfigView, meta: { roles: ['ADMIN'] } },
        ],
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// [Helper] 라우트 권한 체크 함수 (기존 로직 유지)
function checkRoutePermission(targetPath: string, menus: MenuNode[]): boolean {
  const normalizedTarget = targetPath.endsWith('/') && targetPath.length > 1 ? targetPath.slice(0, -1) : targetPath;
  for (const menu of menus) {
    if (menu.routerPath) {
      const menuPath = menu.routerPath.endsWith('/') && menu.routerPath.length > 1 ? menu.routerPath.slice(0, -1) : menu.routerPath;
      if (menuPath === normalizedTarget) return true;
      if (normalizedTarget.startsWith(menuPath + '/')) return true;
    }
    if (menu.children && menu.children.length > 0) {
      if (checkRoutePermission(targetPath, menu.children)) return true;
    }
  }
  return false;
}

// Navigation Guard (기존 로직 유지)
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const menuStore = useMenuStore();

  if (import.meta.env.VITE_AUTH_SKIP === 'true' && !authStore.isAuthenticated) authStore.loginAsDemoUser();

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) return next({ name: "login", query: { redirect: to.fullPath } });
  if (to.path === "/login" && isAuthenticated) return next({ name: "home" });

  if (isAuthenticated) {
    if (to.meta.roles) {
      const allowedRoles = to.meta.roles as string[];
      const userRole = authStore.user?.role || 'GUEST';
      if (!allowedRoles.includes(userRole)) {
        alert("접근 권한이 없습니다.");
        return next({ name: "home" });
      }
    }
    if (menuStore.menus.length === 0) {
      try { await menuStore.loadMenus(); } catch (e) {}
    }
    const isExceptionPath = to.path === "/" || to.path.startsWith("/admin") || to.path.startsWith("/support") || to.name === "not-found";
    if (!isExceptionPath) {
      const hasPermission = checkRoutePermission(to.path, menuStore.menus);
      const isAdmin = authStore.user?.role === 'ADMIN';
      if (!hasPermission && !isAdmin) return next({ name: "home" });
    }
  }
  next();
});

export default router;
