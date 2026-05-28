// frontend/src/router/index.ts
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMenuStore } from "@/stores/menu";
import type { MenuNode } from "@/api/menu";
import { adminApi } from "@/api/admin";

import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import AppLayout from "@/layout/AppLayout.vue";

import GlobalDashboardView from "../views/GlobalDashboardView.vue";

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
import UsageAnalyticsView from "../views/UsageAnalyticsView.vue";

import AdminLayout from "../views/admin/AdminLayout.vue";
import MenuManagementView from "../views/admin/MenuManagementView.vue";
import UserManagementView from "../views/admin/UserManagementView.vue";
import InfraManagementView from "../views/admin/InfraManagementView.vue";
import SystemConfigView from "../views/admin/SystemConfigView.vue";
import StorageUsageView from "../views/admin/StorageUsageView.vue";
import ServerMonitoringView from "../views/admin/ServerMonitoringView.vue";

const QnaLayout = () => import("../views/support/QnaLayout.vue");
const QnaBoardView = () => import("../views/support/QnaBoardView.vue");
const QnaWriteView = () => import("../views/support/QnaWriteView.vue");
const QnaDetailView = () => import("../views/support/QnaDetailView.vue");
const ManualView = () => import("../views/support/ManualView.vue");
const AgentDownloadView = () =>
  import("../views/support/AgentDownloadView.vue");

const MaintenanceView = () => import("../views/MaintenanceView.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/maintenance",
    name: "Maintenance",
    component: MaintenanceView,
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
        meta: { title: "Site Overview" },
      },
      {
        path: "global-dashboard",
        name: "global-dashboard",
        component: GlobalDashboardView,
        meta: { title: "Global Dashboard" },
      },
      {
        path: "support",
        children: [
          {
            path: "manual",
            name: "manual",
            component: ManualView,
            meta: { title: "User Manual" },
          },
          {
            path: "agent-download",
            name: "agent-download",
            component: AgentDownloadView,
            meta: { title: "Agent Download" },
          },
          {
            path: "qna",
            component: QnaLayout,
            children: [
              {
                path: "",
                name: "qna-list",
                component: QnaBoardView,
                meta: { title: "Q&A Board" },
              },
              {
                path: "write",
                name: "qna-write",
                component: QnaWriteView,
                meta: { title: "Write Question" },
              },
              {
                path: ":id",
                name: "qna-detail",
                component: QnaDetailView,
                meta: { title: "Q&A Detail" },
              },
            ],
          },
        ],
      },
      {
        path: "/waferflatdata",
        name: "wafer",
        component: WaferFlatDataView,
        meta: { title: "Wafer Flat Data" },
      },
      {
        path: "/lot-uniformity-trend",
        name: "lot-uniformity",
        component: LotUniformityTrendView,
        meta: { title: "Lot Uniformity Trend" },
      },
      {
        path: "/spectrum-analytics",
        name: "spectrum",
        component: SpectrumAnalysisView,
        meta: { title: "Spectrum Analytics" },
      },
      {
        path: "/process-matching",
        name: "process-matching",
        component: ProcessMatchingAnalyticsView,
        meta: { title: "Process Matching" },
      },
      {
        path: "/equipment-explorer",
        name: "equipment",
        component: EquipmentExplorerView,
        meta: { title: "Equipment Explorer" },
      },
      {
        path: "/performance-trend",
        name: "performance",
        component: PerformanceTrendView,
        meta: { title: "Performance Trend" },
      },
      {
        path: "/process-memory",
        name: "process-memory",
        component: ProcessMemoryView,
        meta: { title: "Process Memory" },
      },
      {
        path: "/lamp-life",
        name: "lamp",
        component: LampLifeView,
        meta: { title: "Lamp Life" },
      },
      {
        path: "/prealign-analytics",
        name: "prealign",
        component: PreAlignAnalyticsView,
        meta: { title: "Pre-Align Analytics" },
      },
      {
        path: "/error-analytics",
        name: "error",
        component: ErrorAnalyticsView,
        meta: { title: "Error Analytics" },
      },
      {
        path: "/health",
        name: "health",
        component: EquipmentHealthView,
        meta: { title: "Equipment Health" },
      },
      {
        path: "/optical-trend",
        name: "optical-trend",
        component: OpticalTrendView,
        meta: { title: "Optical Trend" },
      },

      {
        path: "/agent-memory",
        name: "agent-memory",
        component: ItmAgentMemoryView,
        meta: { title: "ITM Agent Memory", roles: ["ADMIN", "MANAGER"] },
      },
      {
        path: "/usage-analytics",
        name: "usage-analytics",
        component: UsageAnalyticsView,
        meta: { title: "Usage Analytics", roles: ["ADMIN", "MANAGER"] },
      },
      {
        path: '/equipment-agent-status',
        name: 'equipment-agent-status',
        component: () => import('@/views/EquipmentAgentStatusView.vue'),
        meta: { title: "Equipment Agent Status", requiresAuth: true }
      },

      {
        path: "/admin",
        component: AdminLayout,
        children: [
          {
            path: "",
            redirect: () => {
              const authStore = useAuthStore();
              return authStore.user?.role === "ADMIN"
                ? { name: "admin-menus" }
                : { name: "admin-users" };
            },
          },
          {
            path: "menus",
            name: "admin-menus",
            component: MenuManagementView,
            meta: { title: "Menu Management", roles: ["ADMIN"] },
          },
          {
            path: "users",
            name: "admin-users",
            component: UserManagementView,
            meta: { title: "User Management", roles: ["ADMIN", "MANAGER"] },
          },
          {
            path: "infra",
            name: "admin-infra",
            component: InfraManagementView,
            meta: {
              title: "Infra Management",
              roles: ["ADMIN", "MANAGER", "ENGINEER"],
            },
          },
          {
            path: "storage",
            name: "admin-storage",
            component: StorageUsageView,
            meta: { title: "Storage Analytics", roles: ["ADMIN", "MANAGER"] },
          },
          {
            path: "monitoring",
            name: "admin-monitoring",
            component: ServerMonitoringView,
            meta: { title: "Server Monitoring", roles: ["ADMIN", "MANAGER", "ENGINEER"] },
          },
          {
            path: "system",
            name: "admin-system",
            component: SystemConfigView,
            meta: { title: "System Config", roles: ["ADMIN"] },
          },
        ],
      },
    ],
  },
  { path: "/:pathMatch(.*)*", name: "not-found", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

function checkRoutePermission(targetPath: string, menus: MenuNode[]): boolean {
  const normalizedTarget =
    targetPath.endsWith("/") && targetPath.length > 1
      ? targetPath.slice(0, -1)
      : targetPath;
  for (const menu of menus) {
    if (menu.routerPath) {
      const menuPath =
        menu.routerPath.endsWith("/") && menu.routerPath.length > 1
          ? menu.routerPath.slice(0, -1)
          : menu.routerPath;
      if (menuPath === normalizedTarget) return true;
      if (normalizedTarget.startsWith(menuPath + "/")) return true;
    }
    if (menu.children && menu.children.length > 0) {
      if (checkRoutePermission(targetPath, menu.children)) return true;
    }
  }
  return false;
}

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const isAdmin = authStore.user?.role === "ADMIN";

  // 1. 서비스 점검 모드(Maintenance Mode) 전역 체크
  let isMaintenance = false;
  try {
    const statusObj = await adminApi.getMaintenanceStatus();
    isMaintenance = statusObj?.isMaintenance || false;

    if (isMaintenance) {
      if (isAdmin) {
        if (to.name === 'Maintenance') {
          return next({ path: '/' });
        }
      } else {
        if (to.name !== 'Maintenance' && to.name !== 'login') {
          return next({ name: 'Maintenance' });
        }
      }
    } else {
      if (to.name === 'Maintenance') {
        return next({ path: '/' });
      }
    }
  } catch (error) {
    // API 장애 방지용
  }

  // 2. 인증 및 권한 체크
  const menuStore = useMenuStore();
  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated)
    return next({ name: "login", query: { redirect: to.fullPath } });

  if (to.path === "/login" && isAuthenticated) {
    // 👨‍💻 [핵심 수정] URL 백도어: 점검 중인데 권한이 없는 유저가 직접 '/login'을 주소창에 쳤을 때
    if (isMaintenance && !isAdmin) {
      // 강제 세션 파기 및 로그아웃 처리 후 로그인 페이지 노출
      if (typeof authStore.logout === 'function') {
        authStore.logout();
      }
      localStorage.clear();
      sessionStorage.clear();
      return next(); // 튕겨내지 않고 로그인 화면으로 허용
    }
    return next({ name: "home" });
  }

  if (isAuthenticated) {
    if (to.meta.roles) {
      const allowedRoles = to.meta.roles as string[];
      const userRole = authStore.user?.role || "GUEST";
      if (!allowedRoles.includes(userRole)) {
        alert("접근 권한이 없습니다.");
        return next({ name: "home" });
      }
    }
    if (menuStore.menus.length === 0) {
      try {
        await menuStore.loadMenus();
      } catch (e) {}
    }
    const isExceptionPath =
      to.path === "/" ||
      to.path === "/global-dashboard" ||
      to.path.startsWith("/admin") ||
      to.path.startsWith("/support") ||
      to.name === "not-found" ||
      to.name === "Maintenance";
      
    if (!isExceptionPath) {
      const hasPermission = checkRoutePermission(to.path, menuStore.menus);
      if (!hasPermission && !isAdmin) return next({ name: "home" });
    }
  }
  next();
});

router.afterEach((to) => {
  const authStore = useAuthStore();
  
  if (authStore.isAuthenticated && authStore.user?.userId) {
    const userRole = authStore.user?.role || 'GUEST';
    
    if (!['ADMIN', 'MANAGER'].includes(userRole)) {
      const ignoreList = ["login", "not-found", "Maintenance"];

      if (!ignoreList.includes(to.name as string)) {
        const menuName =
          (to.meta.title as string) || (to.name as string) || to.path;
        adminApi
          .logAccess({
            loginId: authStore.user.userId,
            menuName: menuName,
            accessUrl: to.fullPath,
          })
          .catch((e) => {
            console.error("Usage Analytics Logging Failed:", e);
          });
      }
    }
  }
});

export default router;
