// frontend/src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMenuStore } from "@/stores/menu";
import type { MenuNode } from "@/api/menu";

// View Components
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import WaferFlatDataView from "../views/WaferFlatDataView.vue";
import PerformanceTrendView from "../views/PerformanceTrendView.vue";
import EquipmentExplorerView from "../views/EquipmentExplorerView.vue";
import ErrorAnalyticsView from "../views/ErrorAnalyticsView.vue";
import LampLifeView from "../views/LampLifeView.vue";
import PreAlignAnalyticsView from "../views/PreAlignAnalyticsView.vue";
import ProcessMemoryView from "../views/ProcessMemoryView.vue";
import SpectrumAnalysisView from "../views/SpectrumAnalysisView.vue";
import LotUniformityTrendView from "../views/LotUniformityTrendView.vue";
import EquipmentHealthView from "../views/EquipmentHealthView.vue";
import ProcessMatchingAnalyticsView from "../views/ProcessMatchingAnalyticsView.vue";
import ItmAgentMemoryView from "../views/ItmAgentMemoryView.vue";
import OpticalTrendView from "../views/OpticalTrendView.vue";

// Admin Components
import AdminLayout from "../views/admin/AdminLayout.vue";
import MenuManagementView from "../views/admin/MenuManagementView.vue";
import UserManagementView from "../views/admin/UserManagementView.vue";
import InfraManagementView from "../views/admin/InfraManagementView.vue";
import SystemConfigView from "../views/admin/SystemConfigView.vue";

// Routes Definition
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/waferflatdata",
    name: "wafer",
    component: WaferFlatDataView,
    meta: { requiresAuth: true },
  },
  {
    path: "/performance-trend",
    name: "performance",
    component: PerformanceTrendView,
    meta: { requiresAuth: true },
  },
  {
    path: "/equipment-explorer",
    name: "equipment",
    component: EquipmentExplorerView,
    meta: { requiresAuth: true },
  },
  {
    path: "/error-analytics",
    name: "error",
    component: ErrorAnalyticsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/lamp-life",
    name: "lamp",
    component: LampLifeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/prealign-analytics",
    name: "prealign",
    component: PreAlignAnalyticsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/process-memory",
    name: "process",
    component: ProcessMemoryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/spectrum-analytics",
    name: "spectrum",
    component: SpectrumAnalysisView,
    meta: { requiresAuth: true },
  },
  {
    path: "/optical-trend",
    name: "optical-trend",
    component: OpticalTrendView,
    meta: { requiresAuth: true },
  },
  {
    path: "/lot-uniformity-trend",
    name: "lot-uniformity",
    component: LotUniformityTrendView,
    meta: { requiresAuth: true },
  },
  {
    path: "/health",
    name: "health",
    component: EquipmentHealthView,
    meta: { requiresAuth: true },
  },
  {
    path: "/process-matching",
    name: "process-matching",
    component: ProcessMatchingAnalyticsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/agent-memory",
    name: "agent-memory",
    component: ItmAgentMemoryView,
    meta: { requiresAuth: true },
  },
  
  // [관리자 섹션]
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: () => {
          const authStore = useAuthStore();
          if (authStore.user?.role === 'ADMIN') return { name: "admin-menus" };
          return { name: "admin-users" };
        }, 
      },
      {
        path: "menus",
        name: "admin-menus",
        component: MenuManagementView,
        meta: { roles: ['ADMIN'] }, 
      },
      {
        path: "users",
        name: "admin-users",
        component: UserManagementView, 
        meta: { roles: ['ADMIN', 'MANAGER'] },
      },
      {
        path: "infra",
        name: "admin-infra",
        component: InfraManagementView,
        meta: { roles: ['ADMIN', 'MANAGER'] },
      },
      {
        path: "system",
        name: "admin-system",
        component: SystemConfigView,
        meta: { roles: ['ADMIN'] },
      },
    ],
  },
  // 404 Not Found
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: "/",
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

function checkRoutePermission(targetPath: string, menus: MenuNode[]): boolean {
  const normalizedTarget = targetPath.endsWith('/') && targetPath.length > 1 
    ? targetPath.slice(0, -1) 
    : targetPath;

  for (const menu of menus) {
    if (menu.routerPath) {
      const menuPath = menu.routerPath.endsWith('/') && menu.routerPath.length > 1
        ? menu.routerPath.slice(0, -1)
        : menu.routerPath;

      if (menuPath === normalizedTarget) return true;
      if (normalizedTarget.startsWith(menuPath + '/')) {
        return true;
      }
    }
    
    if (menu.children && menu.children.length > 0) {
      if (checkRoutePermission(targetPath, menu.children)) return true;
    }
  }
  return false;
}

// --- Navigation Guard ---
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const menuStore = useMenuStore();

  // [수정] 0. Demo Mode Check (환경변수 기반 자동 로그인 처리)
  // .env에 VITE_AUTH_SKIP=true 설정 시 작동
  if (import.meta.env.VITE_AUTH_SKIP === 'true' && !authStore.isAuthenticated) {
    console.log("[Router] Demo Mode Activated: Logging in as Demo User.");
    authStore.loginAsDemoUser();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // 1. 비로그인 접근 차단
  if (requiresAuth && !isAuthenticated) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  // 2. 로그인 상태에서 로그인 페이지 접근 시 홈으로 (데모 모드 포함)
  if (to.path === "/login" && isAuthenticated) {
    return next({ name: "home" });
  }

  // 3. 권한 체크
  if (isAuthenticated) {
    // 3-1. RBAC (Role Based Access Control) 체크
    if (to.meta.roles) {
      const allowedRoles = to.meta.roles as string[];
      const userRole = authStore.user?.role || 'GUEST';

      if (!allowedRoles.includes(userRole)) {
        alert("접근 권한이 없습니다.");
        return next({ name: "home" });
      }
    }

    // 3-2. 동적 메뉴 권한 체크
    if (menuStore.menus.length === 0) {
      try {
        await menuStore.loadMenus();
      } catch (e) {
        console.error("Failed to load menus during navigation guard.", e);
      }
    }

    const isExceptionPath = 
      to.path === "/" || 
      to.path.startsWith("/admin") || 
      to.name === "not-found";

    if (!isExceptionPath) {
      const hasPermission = checkRoutePermission(to.path, menuStore.menus);
      if (!hasPermission) {
        console.warn(`[Router Guard] Unauthorized access or menu not linked: ${to.path}`);
        return next({ name: "home" });
      }
    }
  }

  next();
});

export default router;
