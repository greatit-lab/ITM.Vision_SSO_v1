// frontend/src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMenuStore } from "@/stores/menu";
import type { MenuNode } from "@/api/menu";

// --- View Components ---
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import AppLayout from "@/layout/AppLayout.vue"; // 레이아웃

// [Analysis Views - DB 데이터 기준]
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

// [Admin Views - 신규 관리자 기능]
import AdminLayout from "../views/admin/AdminLayout.vue";
import MenuManagementView from "../views/admin/MenuManagementView.vue";
import UserManagementView from "../views/admin/UserManagementView.vue";
import InfraManagementView from "../views/admin/InfraManagementView.vue";
import SystemConfigView from "../views/admin/SystemConfigView.vue";

const routes: Array<RouteRecordRaw> = [
  // 1. 로그인 (Public)
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },

  // 2. 메인 앱 (로그인 필요)
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "", // Path: '/'
        name: "home",
        component: HomeView,
      },

      // =============================================
      // [Analysis Modules] - DB 데이터와 경로 100% 일치
      // =============================================
      
      // Wafer Metrology Group
      {
        path: "/waferflatdata", // Menu ID: 11
        name: "wafer",
        component: WaferFlatDataView,
      },
      {
        path: "/lot-uniformity-trend", // Menu ID: 12
        name: "lot-uniformity",
        component: LotUniformityTrendView,
      },
      {
        path: "/spectrum-analytics", // Menu ID: 13
        name: "spectrum",
        component: SpectrumAnalysisView,
      },
      {
        path: "/process-matching", // Menu ID: 14
        name: "process-matching",
        component: ProcessMatchingAnalyticsView,
      },

      // ITM Monitoring Group
      {
        path: "/equipment-explorer", // Menu ID: 21
        name: "equipment",
        component: EquipmentExplorerView,
      },
      {
        path: "/performance-trend", // Menu ID: 22
        name: "performance",
        component: PerformanceTrendView,
      },
      {
        path: "/process-memory", // Menu ID: 23
        name: "process-memory",
        component: ProcessMemoryView,
      },
      {
        path: "/lamp-life", // Menu ID: 24
        name: "lamp",
        component: LampLifeView,
      },

      // Advanced Analytics Group
      {
        path: "/prealign-analytics", // Menu ID: 31
        name: "prealign",
        component: PreAlignAnalyticsView,
      },
      {
        path: "/error-analytics", // Menu ID: 32
        name: "error",
        component: ErrorAnalyticsView,
      },

      // Develop Progress Group
      {
        path: "/health", // Menu ID: 41
        name: "health",
        component: EquipmentHealthView,
      },
      {
        path: "/agent-memory", // Menu ID: 42
        name: "agent-memory",
        component: ItmAgentMemoryView,
      },
      {
        path: "/optical-trend", // Menu ID: 43
        name: "optical-trend",
        component: OpticalTrendView,
      },

      // =============================================
      // [Admin Modules] - 관리자 전용 (DB에 추가 필요)
      // =============================================
      {
        path: "/admin",
        component: AdminLayout,
        // AdminLayout 내부에 router-view가 있어야 하위 경로가 렌더링됨
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
            path: "menus", // 실제 경로: /admin/menus
            name: "admin-menus",
            component: MenuManagementView,
            meta: { roles: ['ADMIN'] },
          },
          {
            path: "users", // 실제 경로: /admin/users
            name: "admin-users",
            component: UserManagementView,
            meta: { roles: ['ADMIN', 'MANAGER'] },
          },
          {
            path: "infra", // 실제 경로: /admin/infra
            name: "admin-infra",
            component: InfraManagementView,
            meta: { roles: ['ADMIN', 'MANAGER', 'ENGINEER'] },
          },
          {
            path: "system", // 실제 경로: /admin/system
            name: "admin-system",
            component: SystemConfigView,
            meta: { roles: ['ADMIN'] },
          },
        ],
      },
    ],
  },

  // 404 Not Found
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

// [Helper] 라우트 권한 체크 함수
function checkRoutePermission(targetPath: string, menus: MenuNode[]): boolean {
  // 끝에 붙은 슬래시 제거 (Normalization)
  const normalizedTarget = targetPath.endsWith('/') && targetPath.length > 1
    ? targetPath.slice(0, -1)
    : targetPath;

  for (const menu of menus) {
    if (menu.routerPath) {
      const menuPath = menu.routerPath.endsWith('/') && menu.routerPath.length > 1
        ? menu.routerPath.slice(0, -1)
        : menu.routerPath;

      // 1. 정확히 일치하거나
      if (menuPath === normalizedTarget) return true;
      // 2. 하위 경로인 경우 (예: /admin/users -> /admin)
      // *주의: DB에 /admin 이라는 상위 메뉴 path가 있거나, 개별 하위 path가 등록되어 있어야 함
      if (normalizedTarget.startsWith(menuPath + '/')) {
        return true;
      }
    }
    
    // 자식 메뉴 재귀 체크
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

  // 0. Demo Mode Check
  if (import.meta.env.VITE_AUTH_SKIP === 'true' && !authStore.isAuthenticated) {
    console.log("[Router] Demo Mode Activated.");
    authStore.loginAsDemoUser();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // 1. 비로그인 접근 차단
  if (requiresAuth && !isAuthenticated) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  // 2. 로그인 상태에서 로그인 페이지 접근 시 홈으로
  if (to.path === "/login" && isAuthenticated) {
    return next({ name: "home" });
  }

  // 3. 권한 체크
  if (isAuthenticated) {
    // 3-1. 정적 Role 체크 (Admin 페이지 등 코드 레벨 방어)
    if (to.meta.roles) {
      const allowedRoles = to.meta.roles as string[];
      const userRole = authStore.user?.role || 'GUEST';

      if (!allowedRoles.includes(userRole)) {
        alert("접근 권한이 없습니다.");
        return next({ name: "home" });
      }
    }

    // 3-2. 동적 메뉴 권한 체크 (DB 기반 방어)
    if (menuStore.menus.length === 0) {
      try {
        await menuStore.loadMenus();
      } catch (e) {
        console.error("Failed to load menus during navigation guard.", e);
      }
    }

    // 예외 경로: 홈, 404, 그리고 /admin 하위는 별도 Role 체크하므로 패스
    // (만약 DB에 /admin/menus 등도 등록한다면 이 예외를 제거해도 됨)
    const isExceptionPath = 
      to.path === "/" || 
      to.path.startsWith("/admin") ||
      to.name === "not-found";

    if (!isExceptionPath) {
      const hasPermission = checkRoutePermission(to.path, menuStore.menus);
      
      // ADMIN은 만능 (DB에 메뉴가 없어도 URL 입력 접근 허용)
      const isAdmin = authStore.user?.role === 'ADMIN';

      if (!hasPermission && !isAdmin) {
        console.warn(`[Router Guard] Unauthorized access or menu not linked: ${to.path}`);
        return next({ name: "home" });
      }
    }
  }

  next();
});

export default router;
