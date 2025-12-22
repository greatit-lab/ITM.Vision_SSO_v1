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
  
  // [관리자 섹션] AdminLayout을 적용하여 하위 탭 구조로 변경
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        redirect: { name: "admin-menus" }, // 기본 진입 시 메뉴 관리 탭으로 이동
      },
      // 1. 메뉴 및 권한 (Menu & Roles)
      {
        path: "menus",
        name: "admin-menus",
        component: MenuManagementView,
        meta: { title: "Menu Management" },
      },
      // 2. 사용자 및 보안 (User & Security)
      {
        path: "users",
        name: "admin-users",
        component: UserManagementView, 
        meta: { title: "User & Security" },
      },
      // 3. 인프라 관리 (Infrastructure)
      {
        path: "infra",
        name: "admin-infra",
        component: InfraManagementView,
        meta: { title: "Infrastructure" },
      },
      // 4. 시스템 설정 (System Config)
      {
        path: "system",
        name: "admin-system",
        component: SystemConfigView,
        meta: { title: "System Config" },
      },
    ],
  },
  // [추가] 404 Not Found (옵션)
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

/**
 * [Helper] 재귀적으로 메뉴 트리에서 경로 권한을 확인하는 함수 (개선됨)
 * - 정확한 일치뿐만 아니라, 하위 경로(StartWith)도 허용하여 상세 페이지 접근 지원
 * @param targetPath 이동하려는 경로
 * @param menus 현재 사용자의 메뉴 리스트
 * @returns 권한 존재 여부 (boolean)
 */
function checkRoutePermission(targetPath: string, menus: MenuNode[]): boolean {
  // 정규화: Trailing Slash 제거 (단, 루트 '/' 제외)
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

      // 2. 하위 경로인지 체크 (예: /equipment 권한으로 /equipment/detail/1 접근 허용)
      // 단, 단순 접두사가 아니라 '/'로 구분된 경로여야 함 (예: /users가 /users-log를 허용하면 안됨)
      if (normalizedTarget.startsWith(menuPath + '/')) {
        return true;
      }
    }
    
    // 3. 자식 재귀 탐색
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

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

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
    // 3-1. 관리자 전용 페이지 체크
    if (requiresAdmin && !authStore.isAdmin) {
      console.warn(`[Access Denied] Admin privileges required for ${to.path}`);
      // 권한 없음 페이지가 있다면 그곳으로 리다이렉트 권장
      return next({ name: "home" }); 
    }

    // 3-2. 동적 메뉴 권한 체크
    // 메뉴가 로드되지 않았다면 먼저 로드
    if (menuStore.menus.length === 0) {
      try {
        await menuStore.loadMenus();
      } catch (e) {
        console.error("Failed to load menus during navigation guard.", e);
      }
    }

    // 예외 경로: 홈(/), 관리자(/admin 하위), 404 등은 메뉴 권한 체크 건너뜀
    // (관리자 페이지는 위에서 requiresAdmin으로 이미 1차 방어됨)
    const isExceptionPath = 
      to.path === "/" || 
      to.path.startsWith("/admin") || 
      to.name === "not-found";

    if (!isExceptionPath) {
      const hasPermission = checkRoutePermission(to.path, menuStore.menus);

      if (!hasPermission) {
        // [UX 개선] 메뉴에 없지만 접근 가능한 공통 페이지(예: 프로필)가 있다면 여기서 허용 로직 추가
        console.warn(`[Router Guard] Unauthorized access or menu not linked: ${to.path}`);
        // Toast 메시지 등을 띄워줄 수 있음 (App.vue 레벨에서 감지 필요)
        return next({ name: "home" });
      }
    }
  }

  next();
});

export default router;
