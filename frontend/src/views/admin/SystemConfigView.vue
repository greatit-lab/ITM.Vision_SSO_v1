<!-- frontend/src/views/admin/SystemConfigView.vue -->
<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex items-end justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">시스템 설정 (System Config)</h2>
        <p class="text-xs text-slate-500">DB/FTP 연결 정보 및 장비별 에이전트 서버 설정을 관리합니다.</p>
      </div>
      <Button icon="pi pi-refresh" label="새로고침" size="small" outlined @click="loadAllData" />
    </div>

    <div class="flex flex-col lg:flex-row gap-4 h-full min-h-0">
      
      <div class="w-full lg:w-1/3 flex flex-col bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex justify-between items-center">
          <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200"><i class="pi pi-server mr-2 text-indigo-500"></i>공통 서버 설정</h3>
          <Button label="저장" icon="pi pi-check" size="small" @click="saveGlobalConfig" :loading="savingGlobal" />
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          <div class="flex flex-col gap-3">
            <h4 class="text-xs font-bold text-slate-400 uppercase border-b pb-1">Database Connection</h4>
            <div class="grid grid-cols-1 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold">DB Host</label>
                <InputText v-model="globalConfig.newDbHost" class="!text-sm" placeholder="127.0.0.1" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold">Port</label>
                  <InputNumber v-model="globalConfig.newDbPort" class="!text-sm w-full" :useGrouping="false" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold">User</label>
                  <InputText v-model="globalConfig.newDbUser" class="!text-sm" />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold">Password</label>
                <Password v-model="globalConfig.newDbPw" :feedback="false" toggleMask class="!text-sm w-full" inputClass="!w-full !text-sm" />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <h4 class="text-xs font-bold text-slate-400 uppercase border-b pb-1">FTP Connection</h4>
            <div class="grid grid-cols-1 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold">FTP Host</label>
                <InputText v-model="globalConfig.newFtpHost" class="!text-sm" placeholder="127.0.0.1" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold">Port</label>
                  <InputNumber v-model="globalConfig.newFtpPort" class="!text-sm w-full" :useGrouping="false" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold">User</label>
                  <InputText v-model="globalConfig.newFtpUser" class="!text-sm" />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold">Password</label>
                <Password v-model="globalConfig.newFtpPw" :feedback="false" toggleMask class="!text-sm w-full" inputClass="!w-full !text-sm" />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold">Description</label>
            <Textarea v-model="globalConfig.description" rows="2" class="!text-sm" />
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-0">
        <div class="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex justify-between items-center shrink-0">
          <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200"><i class="pi pi-desktop mr-2 text-teal-500"></i>장비별 에이전트 설정</h3>
          <Button label="추가" icon="pi pi-plus" size="small" outlined @click="openDialog()" />
        </div>

        <div class="flex-1 overflow-hidden relative">
          <DataTable 
            :value="agentServers" 
            scrollable 
            scrollHeight="100%" 
            class="absolute inset-0 p-datatable-sm text-xs" 
            stripedRows
            :loading="loadingTable"
            paginator :rows="15"
          >
            <Column field="eqpid" header="EQP ID" sortable style="min-width: 120px; font-weight:bold"></Column>
            <Column field="agentDbHost" header="Agent DB Host" sortable style="min-width: 150px"></Column>
            <Column field="agentFtpHost" header="Agent FTP Host" sortable style="min-width: 150px"></Column>
            <Column field="updateFlag" header="Update Flag" sortable align="center" style="width: 100px">
              <template #body="{ data }">
                <span :class="data.updateFlag === 'yes' ? 'text-green-600 font-bold' : 'text-slate-400'">
                  {{ data.updateFlag.toUpperCase() }}
                </span>
              </template>
            </Column>
            <Column field="update" header="Last Updated" style="min-width: 140px">
              <template #body="{ data }">{{ formatDate(data.update) }}</template>
            </Column>
            <Column header="Action" align="center" style="width: 100px">
              <template #body="{ data }">
                <div class="flex justify-center gap-2">
                  <Button icon="pi pi-pencil" text rounded severity="info" size="small" class="!w-7 !h-7" @click="openDialog(data)" />
                  <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="!w-7 !h-7" @click="deleteItem(data.eqpid)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :header="isEditMode ? '에이전트 설정 수정' : '에이전트 설정 추가'" :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">EQP ID</label>
          <InputText v-model="form.eqpid" :disabled="isEditMode" class="!text-sm" placeholder="EQP-001" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Agent DB Host</label>
          <InputText v-model="form.agentDbHost" class="!text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Agent FTP Host</label>
          <InputText v-model="form.agentFtpHost" class="!text-sm" />
        </div>
        <div class="flex items-center gap-2 mt-2">
          <Checkbox v-model="formUpdateFlagBool" binary inputId="uFlag" />
          <label for="uFlag" class="text-sm select-none cursor-pointer">Update Flag (Yes/No)</label>
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="dialogVisible = false" />
        <Button label="저장" @click="saveAgentServer" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { 
  getNewServerConfig, updateNewServerConfig,
  getAgentServers, createAgentServer, updateAgentServer, deleteAgentServer,
  type NewServerConfig, type AgentServerConfig
} from '@/api/admin';

// Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';

// --- State: Global Config ---
const globalConfig = reactive<NewServerConfig>({
  id: 1,
  newDbHost: '', newDbPort: 5432, newDbUser: '', newDbPw: '',
  newFtpHost: '', newFtpPort: 21, newFtpUser: '', newFtpPw: '',
  description: ''
});
const savingGlobal = ref(false);

// --- State: Agent Servers ---
const agentServers = ref<AgentServerConfig[]>([]);
const loadingTable = ref(false);

// --- State: Dialog ---
const dialogVisible = ref(false);
const isEditMode = ref(false);
const form = reactive<AgentServerConfig>({
  eqpid: '',
  agentDbHost: '',
  agentFtpHost: '',
  updateFlag: 'no'
});

// Helper for checkbox binding
const formUpdateFlagBool = computed({
  get: () => form.updateFlag === 'yes',
  set: (val) => { form.updateFlag = val ? 'yes' : 'no'; }
});

// --- Actions ---
const loadAllData = async () => {
  loadingTable.value = true;
  try {
    const [globalData, agentsData] = await Promise.all([
      getNewServerConfig(),
      getAgentServers()
    ]);
    
    // Global Config 매핑
    if (globalData) Object.assign(globalConfig, globalData);
    
    // Agent Servers 매핑
    agentServers.value = agentsData || [];
  } catch (e) {
    console.error("Failed to load system config:", e);
  } finally {
    loadingTable.value = false;
  }
};

const saveGlobalConfig = async () => {
  savingGlobal.value = true;
  try {
    await updateNewServerConfig(globalConfig);
    alert('공통 설정이 저장되었습니다.');
  } catch (e) {
    console.error(e);
    alert('저장 실패');
  } finally {
    savingGlobal.value = false;
  }
};

// --- Dialog Actions ---
const openDialog = (item?: AgentServerConfig) => {
  dialogVisible.value = true;
  if (item) {
    isEditMode.value = true;
    Object.assign(form, item);
  } else {
    isEditMode.value = false;
    form.eqpid = '';
    form.agentDbHost = globalConfig.newDbHost; // 기본값 자동 채움
    form.agentFtpHost = globalConfig.newFtpHost;
    form.updateFlag = 'no';
  }
};

const saveAgentServer = async () => {
  try {
    if (isEditMode.value) {
      await updateAgentServer(form.eqpid, form);
    } else {
      await createAgentServer(form);
    }
    dialogVisible.value = false;
    loadAllData(); // Refresh list
  } catch (e) {
    console.error(e);
    alert('저장 중 오류가 발생했습니다.');
  }
};

const deleteItem = async (eqpId: string) => {
  if (!confirm(`[${eqpId}] 설정을 삭제하시겠습니까?`)) return;
  try {
    await deleteAgentServer(eqpId);
    loadAllData();
  } catch (e) {
    console.error(e);
    alert('삭제 실패');
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
/* Table Header Style Override */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase;
}
</style>
