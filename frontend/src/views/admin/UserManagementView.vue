<!-- frontend/src/views/admin/UserManagementView.vue -->
<template>
  <div class="absolute inset-0 flex flex-col w-full p-2 overflow-hidden font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B]">
    <div class="flex items-center justify-between px-1 mb-2 shrink-0">
      <div>
        <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
          <i class="text-blue-500 pi pi-users"></i> 사용자 및 게스트 관리
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          시스템 사용자 현황 및 예외/게스트 접근 권한 관리
        </p>
      </div>
      <Button icon="pi pi-refresh" label="새로고침" size="small" outlined class="!text-xs" @click="fetchAllData" />
    </div>

    <div class="flex flex-1 min-h-0 gap-3 overflow-hidden">
      
      <div class="flex flex-col flex-1 h-full overflow-hidden bg-white border rounded-lg shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800">
        <div class="flex flex-col border-b shrink-0 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
          <div class="flex items-center justify-between px-3 py-2">
            <div class="flex items-center gap-2">
              <i class="text-xs text-slate-500 pi pi-user"></i>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200">시스템 사용자 (Employees)</span>
              <Tag :value="filteredUsers.length" severity="secondary" class="!h-4 !text-[9px] !px-1" />
            </div>
            <Button v-if="filterUserId || filterSite || filterSdwt" icon="pi pi-filter-slash" text severity="secondary" size="small" class="!w-6 !h-6" v-tooltip.top="'필터 초기화'" @click="clearFilters" />
          </div>
          
          <div class="flex gap-2 px-3 pb-2">
            <div class="flex-1">
              <IconField iconPosition="left" class="w-full">
                <InputIcon class="pi pi-search !text-[10px]" />
                <InputText v-model="filterUserId" placeholder="User ID" class="!h-7 !text-[11px] w-full" />
              </IconField>
            </div>
            <div class="flex-1">
              <InputText v-model="filterSite" placeholder="Site" class="!h-7 !text-[11px] w-full" />
            </div>
            <div class="flex-1">
              <InputText v-model="filterSdwt" placeholder="SDWT" class="!h-7 !text-[11px] w-full" />
            </div>
          </div>
        </div>

        <div class="relative flex-1 w-full min-h-0 overflow-hidden">
          <DataTable :value="filteredUsers" scrollable scrollHeight="flex" class="absolute inset-0 w-full h-full text-xs border-none p-datatable-sm" stripedRows>
            <template #empty>
              <div class="p-4 text-center text-slate-400">데이터가 없습니다.</div>
            </template>
            <Column field="loginId" header="User ID" sortable style="width: 15%; font-weight: bold">
              <template #body="slotProps">
                 <span v-html="highlightText(slotProps.data.loginId, filterUserId)"></span>
              </template>
            </Column>
            <Column field="role" header="권한" sortable align="center" style="width: 15%">
              <template #body="slotProps">
                <span :class="['inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[9px] font-bold leading-none uppercase', getRoleTagClass(slotProps.data.role)]">
                  {{ slotProps.data.role }}
                </span>
              </template>
            </Column>
            <Column header="즐겨찾기(소속)" style="width: 25%">
              <template #body="slotProps">
                <div v-if="slotProps.data.context?.sdwtInfo" class="flex items-center gap-2">
                  <Tag severity="info" class="!text-[9px] !h-4 !px-1">{{ slotProps.data.context.sdwtInfo.site }}</Tag>
                  <span class="font-medium truncate text-slate-600 dark:text-slate-300" v-html="highlightText(slotProps.data.context.sdwtInfo.sdwt, filterSdwt)"></span>
                </div>
                <span v-else class="text-slate-400 text-[10px] italic">- 설정 없음 -</span>
              </template>
            </Column>
            <Column field="loginCount" header="접속 횟수" sortable align="center" style="width: 15%">
              <template #body="slotProps">
                <Badge :value="slotProps.data.loginCount" severity="secondary" class="!min-w-[1.5rem]" />
              </template>
            </Column>
            <Column field="createdAt" header="최초 접속" sortable style="width: 15%">
              <template #body="slotProps">
                <span class="text-slate-500 dark:text-slate-400">{{ formatDateFull(slotProps.data.createdAt) }}</span>
              </template>
            </Column>
            <Column field="lastLoginAt" header="최근 접속" sortable style="width: 15%">
              <template #body="slotProps">
                <span class="font-semibold text-blue-600 dark:text-blue-400">{{ formatDateFull(slotProps.data.lastLoginAt) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="flex flex-col flex-1 h-full overflow-hidden bg-white border rounded-lg shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800">
        <div class="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto">
          <button
            v-for="tab in ['Active Guests', 'Requests', '예외 접근 허용 (User)']"
            :key="tab"
            @click="activeTab = tab"
            class="px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap"
            :class="
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
            "
          >
            <div class="flex items-center gap-2">
              <i :class="tab === 'Requests' ? 'pi pi-inbox' : (tab === '예외 접근 허용 (User)' ? 'pi pi-key' : 'pi pi-shield')"></i>
              {{ tab === "Requests" ? "접근 신청 관리" : (tab === "Active Guests" ? "등록된 게스트 (Active)" : tab) }}
              <Badge v-if="tab === 'Requests' && pendingCount > 0" :value="pendingCount" severity="danger" class="!min-w-[1rem] !h-4 !text-[9px] !px-1" />
            </div>
          </button>
        </div>

        <div v-if="activeTab === 'Active Guests'" class="relative flex-1 w-full min-h-0 overflow-hidden bg-slate-50/30 dark:bg-zinc-900/10">
          <div class="flex justify-end px-2 py-1 border-b border-slate-100 dark:border-zinc-800">
            <Button label="수동 등록" icon="pi pi-plus" text size="small" class="!text-[10px] !h-6 !px-2 text-indigo-600" @click="openManualGuestDialog" />
          </div>
          <DataTable :value="guests" scrollable scrollHeight="flex" class="absolute inset-0 w-full h-full text-xs border-none p-datatable-sm" stripedRows>
            <template #empty><div class="p-4 text-center text-slate-400">등록된 게스트가 없습니다.</div></template>
            <Column field="loginId" header="Guest ID" style="width: 15%; font-weight: bold"></Column>
            <Column field="grantedRole" header="부여 권한" style="width: 15%">
              <template #body="slotProps">
                <span :class="['inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[9px] font-bold leading-none uppercase', getRoleTagClass(slotProps.data.grantedRole)]">
                  {{ slotProps.data.grantedRole }}
                </span>
              </template>
            </Column>
            <Column field="deptName" header="부서명" style="width: 20%"></Column>
            <Column field="reason" header="사유" style="width: 25%"></Column>
            <Column field="validUntil" header="유효 기간" sortable style="width: 15%">
              <template #body="slotProps">
                <span :class="isExpired(slotProps.data.validUntil) ? 'text-red-500 line-through' : 'text-green-600 font-medium'">
                  {{ formatDateFull(slotProps.data.validUntil) }}
                </span>
              </template>
            </Column>
            <Column header="ACTION" style="width: 10%" align="center">
              <template #body="slotProps">
                <i class="pi pi-trash text-slate-300 hover:text-red-500 cursor-pointer text-[10px]" @click="removeGuest(slotProps.data.loginId)"></i>
              </template>
            </Column>
          </DataTable>
        </div>

        <div v-if="activeTab === '예외 접근 허용 (User)'" class="relative flex-1 w-full min-h-0 overflow-hidden bg-slate-50/30 dark:bg-zinc-900/10">
          <div class="flex justify-between items-center px-3 py-1 border-b border-slate-100 dark:border-zinc-800">
            <span class="text-[11px] text-slate-500">부서 접근제한과 무관하게 <b>일반 User 권한</b>이 부여됩니다.</span>
            <Button label="예외 사용자 등록" icon="pi pi-plus" text size="small" class="!text-[10px] !h-6 !px-2 text-indigo-600" @click="exceptionDialogVisible = true" />
          </div>
          <DataTable :value="exceptionUsers" scrollable scrollHeight="flex" class="absolute inset-0 w-full h-full text-xs border-none p-datatable-sm" stripedRows>
            <template #empty><div class="p-4 text-center text-slate-400">등록된 예외 사용자가 없습니다.</div></template>
            
            <Column field="loginId" header="User ID" style="width: 15%;">
              <template #body="{ data }">
                <span class="font-bold" :class="data.isActive === 'N' ? 'text-slate-400 line-through' : ''">{{ data.loginId }}</span>
              </template>
            </Column>
            <Column header="부서명" style="width: 20%">
               <template #body="{ data }">
                 <span :class="data.isActive === 'N' ? 'opacity-50 grayscale text-slate-400' : 'font-medium text-slate-700 dark:text-slate-200'">{{ data.deptName || '-' }}</span>
               </template>
            </Column>
            <Column header="부서코드" style="width: 10%">
               <template #body="{ data }">
                 <span :class="data.isActive === 'N' ? 'opacity-50 grayscale text-slate-400' : 'text-slate-500'">{{ data.deptCode || '-' }}</span>
               </template>
            </Column>
            <Column header="등록일자" style="width: 15%">
               <template #body="{ data }">
                 <span :class="data.isActive === 'N' ? 'opacity-50 grayscale text-slate-400' : 'text-slate-500'">{{ formatDateFull(data.createdAt) }}</span>
               </template>
            </Column>
            <Column header="등록자" style="width: 15%">
               <template #body="{ data }">
                 <span 
                   :class="data.isActive === 'N' ? 'opacity-50 grayscale text-slate-400' : 'font-bold text-indigo-600 dark:text-indigo-400'"
                   class="block w-full truncate cursor-help"
                   v-tooltip.top="data.registeredBy"
                 >
                   {{ data.registeredBy }}
                 </span>
               </template>
            </Column>
            <Column header="상태 (활성화)" align="center" style="width: 15%">
                <template #body="{ data }">
                    <ToggleSwitch :modelValue="data.isActive === 'Y'" @change="toggleExceptionStatus(data)" />
                </template>
            </Column>
            <Column header="ACTION" align="center" style="width: 10%">
               <template #body="{ data }">
                   <i class="pi pi-trash cursor-pointer hover:text-red-500 text-slate-300" @click="removeExceptionUser(data.loginId)"></i>
               </template>
            </Column>
          </DataTable>
        </div>

        <div v-if="activeTab === 'Requests'" class="relative flex-1 w-full min-h-0 overflow-hidden">
          <DataTable :value="requests" scrollable scrollHeight="flex" class="absolute inset-0 w-full h-full text-xs border-none p-datatable-sm" stripedRows>
            <template #empty>
              <div class="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <i class="text-2xl pi pi-check-circle opacity-20"></i>
                <span>대기 중인 요청이 없습니다.</span>
              </div>
            </template>
            <Column field="loginId" header="신청 ID" style="width: 10%; font-weight: bold"></Column>
            <Column field="deptCode" header="부서코드" style="width: 15%"></Column>
            <Column field="deptName" header="부서명" style="width: 20%"></Column>
            <Column field="reason" header="신청사유" style="width: 30%"></Column>
            <Column field="status" header="상태" align="center" style="width: 10%">
              <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" class="!text-[9px] !px-1" />
              </template>
            </Column>
            <Column header="ACTION" style="width: 15%" align="center">
              <template #body="slotProps">
                <div v-if="slotProps.data.status === 'PENDING'" class="flex justify-center gap-2">
                  <Button icon="pi pi-check" severity="success" text rounded size="small" class="!w-6 !h-6" v-tooltip.top="'승인'" @click="openApproveDialog(slotProps.data)" />
                  <Button icon="pi pi-times" severity="danger" text rounded size="small" class="!w-6 !h-6" v-tooltip.top="'반려'" @click="rejectRequest(slotProps.data.reqId)" />
                </div>
                <span v-else class="text-[9px] text-slate-400 whitespace-nowrap">
                  {{ formatDateFull(slotProps.data.processedAt) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="approveDialogVisible" modal header="계정 승인 설정" :style="{ width: '22rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="p-2 text-xs border rounded bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-slate-400">
          <p><b>ID:</b> {{ selectedRequest?.loginId }}</p>
          <p><b>Reason:</b> {{ selectedRequest?.reason }}</p>
        </div>
        
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">부여할 권한</label>
          <div class="flex gap-4 p-2 border rounded bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="approveGrantedRole" value="VIEWER" class="accent-indigo-500" />
              <span class="text-xs font-medium text-slate-700 dark:text-slate-300" v-tooltip.top="'대시보드 열람 가능, 데이터 수정 불가'">제한 권한 (VIEWER)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="approveGrantedRole" value="GUEST" class="accent-indigo-500" />
              <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Guest 권한</span>
            </label>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">유효 기간 설정</label>
          <DatePicker v-model="approveValidUntil" dateFormat="yy-mm-dd" class="!text-sm" showIcon fluid />
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="approveDialogVisible = false" />
        <Button label="승인 완료" @click="confirmApprove" autofocus />
      </template>
    </Dialog>

    <Dialog v-model:visible="manualDialogVisible" modal header="게스트 수동 등록" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">User ID</label>
          <InputText v-model="newManualGuest.loginId" class="!text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500">부서코드</label>
            <InputText v-model="newManualGuest.deptCode" class="!text-sm" placeholder="Code" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500">부서명</label>
            <InputText v-model="newManualGuest.deptName" class="!text-sm" placeholder="Name" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">부여할 권한</label>
          <div class="flex gap-4 p-2 border rounded bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="newManualGuest.grantedRole" value="VIEWER" class="accent-indigo-500" />
              <span class="text-xs font-medium text-slate-700 dark:text-slate-300">제한 권한 (VIEWER)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="newManualGuest.grantedRole" value="GUEST" class="accent-indigo-500" />
              <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Guest 권한</span>
            </label>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">유효 기간</label>
          <DatePicker v-model="newManualGuest.validUntil" dateFormat="yy-mm-dd" class="!text-sm" showIcon fluid />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">사유</label>
          <InputText v-model="newManualGuest.reason" class="!text-sm" />
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="manualDialogVisible = false" />
        <Button label="등록" @click="saveManualGuest" />
      </template>
    </Dialog>

    <Dialog v-model:visible="exceptionDialogVisible" modal header="예외 접근 사용자 추가" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="p-3 mb-2 text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
          <i class="pi pi-info-circle mr-1"></i> 부서 단위 접근이 차단되어 있어도 개별적으로 일반 User 권한을 부여합니다.
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">User ID</label>
          <InputText v-model="newException.loginId" class="!text-sm" placeholder="허용할 사용자의 UserID를 입력하세요" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500">소속 부서코드</label>
            <InputText v-model="newException.deptCode" class="!text-sm" placeholder="예: 2404..." />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500">부서명</label>
            <InputText v-model="newException.deptName" class="!text-sm" placeholder="예: 메모리CMP기술팀" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="exceptionDialogVisible = false" />
        <Button label="등록" @click="saveExceptionUser" />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Badge from "primevue/badge";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ToggleSwitch from "primevue/toggleswitch"; 

import { useAuthStore } from "@/stores/auth";
import * as AdminApi from "@/api/admin";

const authStore = useAuthStore();
const route = useRoute();
const activeTab = ref(
  route.query.tab === "Requests" ? "Requests" : "Active Guests",
);

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === "Requests") {
      activeTab.value = "Requests";
    }
  }
);
  
// State
const users = ref<any[]>([]);
const guests = ref<any[]>([]);
const requests = ref<any[]>([]);
const exceptionUsers = ref<any[]>([]);

// 필터 상태 변수
const filterUserId = ref("");
const filterSite = ref("");
const filterSdwt = ref("");

// 필터링된 유저 목록 computed 속성
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchId =
      !filterUserId.value ||
      (user.loginId &&
        user.loginId
          .toLowerCase()
          .includes(filterUserId.value.toLowerCase()));

    const site = user.context?.sdwtInfo?.site || "";
    const matchSite =
      !filterSite.value ||
      site.toLowerCase().includes(filterSite.value.toLowerCase());

    const sdwt = user.context?.sdwtInfo?.sdwt || "";
    const matchSdwt =
      !filterSdwt.value ||
      sdwt.toLowerCase().includes(filterSdwt.value.toLowerCase());

    return matchId && matchSite && matchSdwt;
  });
});

const clearFilters = () => {
  filterUserId.value = "";
  filterSite.value = "";
  filterSdwt.value = "";
};

const highlightText = (text: string, query: string) => {
  if (!text) return "";
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<span class="bg-yellow-200 text-black">$1</span>');
};

const pendingCount = computed(
  () => requests.value.filter((r) => r.status === "PENDING").length
);

// 🌟 [수정된 부분] 권한별 시각적 가중치(Solid vs Soft)를 다르게 부여하여 절대 헷갈리지 않도록 디자인
const getRoleTagClass = (role: string) => {
  const r = role?.toUpperCase();
  
  // 1. 관리자 그룹 (Solid Background + White Text + Shadow)
  if (r === 'ADMIN') return 'bg-red-500 text-white border border-transparent shadow-sm dark:bg-red-600';
  if (r === 'MANAGER') return 'bg-purple-500 text-white border border-transparent shadow-sm dark:bg-purple-600';
  
  // 2. 일반/제한 그룹 (Soft Background + Colored Text + Border)
  if (r === 'USER') return 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30';
  if (r === 'VIEWER') return 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
  if (r === 'GUEST') return 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
  
  return 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30';
};

// API 호출 통합
const fetchAllData = async () => {
  try {
    const [u, g, r] = await Promise.all([
      AdminApi.getUsers(),
      AdminApi.getGuests(),
      AdminApi.getGuestRequests(),
    ]);
    users.value = u.data;
    guests.value = g.data;
    requests.value = r.data;

    try {
      const ex = await AdminApi.getExceptionUsers();
      exceptionUsers.value = ex.data;
    } catch (apiErr) {
      console.error("예외 사용자 조회 실패:", apiErr);
    }
  } catch (e) {
    console.error("Failed to fetch admin data", e);
  }
};

onMounted(() => {
  fetchAllData();
});

const convertToKstDB = (date: Date): Date => {
  const target = new Date(date);
  target.setHours(23, 59, 59, 0); 
  const offset = target.getTimezoneOffset() * 60000;
  return new Date(target.getTime() - offset);
};

// ------------------------------------------------------------------
// 예외 접근 사내 직원(Exception User) 관련 로직
// ------------------------------------------------------------------
const exceptionDialogVisible = ref(false);
const newException = ref({ loginId: "", deptCode: "", deptName: "" });

const saveExceptionUser = async () => {
  if (!newException.value.loginId) return alert("User ID는 필수입니다.");
  try {
    const userId = authStore.user?.loginId || authStore.user?.userId || "Admin";
    const rawRole = authStore.user?.role || "ADMIN";
    const roleName = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

    await AdminApi.addExceptionUser({
      ...newException.value,
      registeredBy: `${roleName} (${userId})`
    });
    
    exceptionDialogVisible.value = false;
    newException.value = { loginId: "", deptCode: "", deptName: "" };
    fetchAllData();
  } catch (e) {
    alert("예외 사용자 등록에 실패했습니다.");
  }
};

const toggleExceptionStatus = async (user: any) => {
  const newStatus = user.isActive === 'Y' ? 'N' : 'Y';
  try {
    await AdminApi.updateExceptionUserStatus(user.loginId, newStatus);
    user.isActive = newStatus; 
  } catch(e) {
    alert("상태 변경 중 오류가 발생했습니다.");
    fetchAllData(); 
  }
};

const removeExceptionUser = async (id: string) => {
  if (confirm(`User ID [${id}]의 예외 접근 허용을 완전히 삭제하시겠습니까?\n(잠시 중단하려면 상태 스위치를 꺼주세요.)`)) {
    await AdminApi.deleteExceptionUser(id);
    fetchAllData();
  }
};
// ------------------------------------------------------------------

const approveDialogVisible = ref(false);
const selectedRequest = ref<any>(null);
const approveValidUntil = ref<Date | null>(null);
const approveGrantedRole = ref("VIEWER"); 

const openApproveDialog = (req: any) => {
  selectedRequest.value = req;
  const d = new Date();
  d.setDate(d.getDate() + 30);
  approveValidUntil.value = d;
  approveGrantedRole.value = "VIEWER";
  approveDialogVisible.value = true;
};

const confirmApprove = async () => {
  if (!selectedRequest.value || !approveValidUntil.value) return;
  try {
    const validDate = convertToKstDB(approveValidUntil.value);

    await AdminApi.approveGuestRequest({
      reqId: selectedRequest.value.reqId,
      validUntil: validDate,
      approverId: authStore.user?.userId || "Admin",
      grantedRole: approveGrantedRole.value, 
    });
    approveDialogVisible.value = false;
    fetchAllData();
  } catch (e) {
    alert("승인 처리 중 오류 발생");
  }
};

const rejectRequest = async (reqId: number) => {
  if (!confirm("해당 요청을 반려하시겠습니까?")) return;
  try {
    await AdminApi.rejectGuestRequest({
      reqId,
      approverId: authStore.user?.userId || "Admin",
    });
    fetchAllData();
  } catch (e) {
    alert("반려 처리 중 오류 발생");
  }
};

const manualDialogVisible = ref(false);
const newManualGuest = ref<{
  loginId: string;
  deptName: string;
  deptCode: string;
  validUntil: Date | null;
  reason: string;
  grantedRole: string;
}>({
  loginId: "",
  deptName: "",
  deptCode: "",
  validUntil: null,
  reason: "",
  grantedRole: "VIEWER", 
});

const openManualGuestDialog = () => {
  newManualGuest.value = {
    loginId: "",
    deptName: "",
    deptCode: "",
    validUntil: null,
    reason: "",
    grantedRole: "VIEWER",
  };
  manualDialogVisible.value = true;
};

const saveManualGuest = async () => {
  if (!newManualGuest.value.loginId || !newManualGuest.value.validUntil)
    return alert("필수 입력 누락");
  try {
    const validDate = convertToKstDB(newManualGuest.value.validUntil);

    await AdminApi.addGuest({
      ...newManualGuest.value,
      validUntil: validDate 
    });
    manualDialogVisible.value = false;
    fetchAllData();
  } catch (e) {
    alert("등록 실패");
  }
};

const removeGuest = async (id: string) => {
  if (confirm("정말 삭제(권한 해제) 하시겠습니까?")) {
    await AdminApi.deleteGuest(id);
    fetchAllData();
  }
};

const formatDateFull = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const isExpired = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};
const getStatusSeverity = (status: string) => {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "warn";
};
</script>

<style scoped>
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
}

:deep(.p-toggleswitch) {
  transform: scale(0.85);
}
</style>
