<!-- frontend/src/views/admin/SystemConfigView.vue -->
<template>
  <div class="absolute inset-0 flex flex-col w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden p-2">
    
    <div class="flex items-center justify-between px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
          <i class="text-lg text-blue-600 pi pi-server dark:text-blue-400"></i>
        </div>
        <div>
          <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            System Configuration
          </h1>
          <p class="text-slate-400 dark:text-slate-500 font-medium text-[10px]">
            공통 서버(DB/FTP) 설정 및 장비별 에이전트 연결 상태 관리
          </p>
        </div>
      </div>
      <Button 
        icon="pi pi-refresh" 
        label="Refresh"
        text 
        size="small"
        class="!text-slate-500 hover:!bg-slate-100 dark:hover:!bg-zinc-800 !text-xs"
        @click="loadAllData" 
      />
    </div>

    <div class="flex flex-1 min-h-0 gap-3 overflow-hidden">
      
      <div class="flex flex-col w-1/3 min-w-[350px] bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full">
        <div class="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-2 shrink-0">
          <i class="pi pi-database text-slate-500 text-xs"></i>
          <span class="font-bold text-xs text-slate-700 dark:text-slate-200">공통 서버 설정 (Common)</span>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-3">
               <div class="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-zinc-800">
                 <i class="pi pi-database text-blue-500 text-xs"></i>
                 <span class="text-xs font-bold text-slate-800 dark:text-slate-200">New Database Connection</span>
               </div>
               <div class="grid grid-cols-1 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Host IP</label>
                    <InputText v-model="globalConfig.newDbHost" class="!text-xs" placeholder="e.g. 10.10.10.10" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Port</label>
                      <InputNumber v-model="globalConfig.newDbPort" class="!text-xs" :useGrouping="false" placeholder="5432" />
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">User</label>
                      <InputText v-model="globalConfig.newDbUser" class="!text-xs" placeholder="postgres" />
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                    <Password v-model="globalConfig.newDbPw" toggleMask class="!text-xs w-full" inputClass="!text-xs !w-full" :feedback="false" />
                  </div>
               </div>
            </div>

            <div class="flex flex-col gap-3">
               <div class="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-zinc-800">
                 <i class="pi pi-cloud-upload text-orange-500 text-xs"></i>
                 <span class="text-xs font-bold text-slate-800 dark:text-slate-200">New FTP Connection</span>
               </div>
               <div class="grid grid-cols-1 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Host IP</label>
                    <InputText v-model="globalConfig.newFtpHost" class="!text-xs" placeholder="FTP Server IP" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Port</label>
                      <InputNumber v-model="globalConfig.newFtpPort" class="!text-xs" :useGrouping="false" placeholder="21" />
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">User</label>
                      <InputText v-model="globalConfig.newFtpUser" class="!text-xs" placeholder="ftpuser" />
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                    <Password v-model="globalConfig.newFtpPw" toggleMask class="!text-xs w-full" inputClass="!text-xs !w-full" :feedback="false" />
                  </div>
               </div>
            </div>

            <div class="flex flex-col gap-1">
               <label class="text-[10px] font-bold text-slate-500 uppercase">Description</label>
               <Textarea v-model="globalConfig.description" rows="2" class="!text-xs" placeholder="Configuration notes..." />
            </div>
          </div>
        </div>

        <div class="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-end">
           <Button label="Save Configuration" icon="pi pi-check" size="small" class="!text-xs !px-3" :loading="isSaving" @click="saveGlobalConfig" />
        </div>
      </div>

      <div class="flex flex-col w-2/3 bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full">
         
         <div class="px-2 py-1.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col gap-2 shrink-0">
            <div class="flex items-center justify-between px-1">
                <div class="flex items-center gap-2">
                  <i class="pi pi-desktop text-slate-500 text-xs"></i>
                  <span class="font-bold text-xs text-slate-700 dark:text-slate-200">장비별 에이전트 설정 (Agent Settings)</span>
                  <Tag :value="filteredAgentServers.length + ' Agents'" severity="info" class="!text-[9px] !h-4" />
                </div>
                <Button icon="pi pi-plus" text rounded size="small" class="!w-6 !h-6" @click="openDialog()" v-tooltip="'Add New Agent'" />
            </div>
            
            <div class="flex items-center gap-2 px-1 overflow-x-auto scrollbar-hide">
                <div class="min-w-[120px] shrink-0">
                    <Select 
                        v-model="selectedSite" 
                        :options="siteOptions" 
                        placeholder="Site" 
                        showClear 
                        class="w-full custom-dropdown small" 
                        overlayClass="custom-dropdown-panel small"
                        :class="{ '!text-slate-400': !selectedSite }"
                        @change="onSiteChange"
                    />
                </div>
                <div class="min-w-[140px] shrink-0">
                    <Select 
                        v-model="selectedSdwt" 
                        :options="sdwtOptions" 
                        placeholder="SDWT" 
                        showClear 
                        :disabled="!selectedSite && siteOptions.length > 0"
                        class="w-full custom-dropdown small" 
                        overlayClass="custom-dropdown-panel small"
                        :class="{ '!text-slate-400': !selectedSdwt }"
                        @change="onSdwtChange"
                    />
                </div>
                <div class="min-w-[140px] shrink-0">
                    <Select 
                        v-model="selectedEqp" 
                        :options="eqpOptions" 
                        placeholder="EQP ID" 
                        showClear 
                        filter
                        class="w-full custom-dropdown small" 
                        overlayClass="custom-dropdown-panel small"
                        :class="{ '!text-slate-400': !selectedEqp }"
                    />
                </div>
            </div>
         </div>

         <div class="flex-1 min-h-0 relative w-full">
             <DataTable
               :value="filteredAgentServers"
               :loading="isLoading"
               scrollable
               scrollHeight="flex"
               class="h-full w-full text-xs p-datatable-sm border-none absolute inset-0"
               stripedRows
               showGridlines
               dataKey="eqpid"
             >
               <template #empty>
                 <div class="p-8 text-center text-slate-400">데이터가 없습니다.</div>
               </template>

               <Column field="site" header="Site" sortable style="width: 10%; text-align:center"></Column>
               <Column field="sdwt" header="SDWT" sortable style="width: 10%; text-align:center"></Column>

               <Column field="eqpid" header="Equipment ID" sortable style="width: 15%; font-weight: bold"></Column>

               <Column field="agentDbHost" header="Agent DB Host" sortable style="width: 20%">
                  <template #body="slotProps">
                      <span class="text-slate-600 dark:text-slate-300 font-mono">{{ slotProps.data.agentDbHost }}</span>
                  </template>
               </Column>

               <Column field="agentFtpHost" header="Agent FTP Host" sortable style="width: 20%">
                  <template #body="slotProps">
                      <span class="text-slate-600 dark:text-slate-300 font-mono">{{ slotProps.data.agentFtpHost }}</span>
                  </template>
               </Column>

               <Column field="updateFlag" header="Update Flag" sortable style="width: 10%" align="center">
                  <template #body="slotProps">
                     <div class="flex justify-center items-center gap-2">
                        <ToggleSwitch 
                            v-model="slotProps.data.updateFlagBoolean" 
                            class="scale-75" 
                            @change="toggleUpdateFlag(slotProps.data)"
                        />
                        <span class="text-[9px] font-bold w-6 text-center" :class="slotProps.data.updateFlag === 'yes' ? 'text-green-600' : 'text-slate-400'">
                            {{ slotProps.data.updateFlag === 'yes' ? 'YES' : 'NO' }}
                        </span>
                     </div>
                  </template>
               </Column>

               <Column field="update" header="Last Updated" sortable style="width: 15%" align="center">
                  <template #body="slotProps">
                     {{ formatCustomDate(slotProps.data.update) }}
                  </template>
               </Column>

             </DataTable>
         </div>
      </div>

    </div>

    <Dialog v-model:visible="dialogVisible" modal header="Add New Agent" :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">EQP ID</label>
          <InputText v-model="form.eqpid" class="!text-sm" placeholder="EQP-001" />
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
        <Button label="Cancel" text severity="secondary" @click="dialogVisible = false" />
        <Button label="Save" @click="saveAgentServer" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { 
  getNewServerConfig, updateNewServerConfig,
  getAgentServers, createAgentServer, updateAgentServer,
  type NewServerConfig, type AgentServerConfig
} from '@/api/admin';
import { useToast } from "primevue/usetoast";

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
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';

const toast = useToast();

// --- State: Global Config ---
const globalConfig = reactive<NewServerConfig>({
  id: 1,
  newDbHost: '', newDbPort: 5432, newDbUser: '', newDbPw: '',
  newFtpHost: '', newFtpPort: 21, newFtpUser: '', newFtpPw: '',
  description: ''
});
const isSaving = ref(false);

// --- State: Agent Servers & Filters ---
interface AgentServerUI extends AgentServerConfig {
    updateFlagBoolean: boolean;
}

const agentServers = ref<AgentServerUI[]>([]);
const isLoading = ref(false);

// Filters
const selectedSite = ref<string | null>(null);
const selectedSdwt = ref<string | null>(null);
const selectedEqp = ref<string | null>(null);

// Options (Cascading)
const siteOptions = computed(() => {
    const sites = new Set(agentServers.value.map(s => s.site || '-'));
    return Array.from(sites).sort();
});

const sdwtOptions = computed(() => {
    let source = agentServers.value;
    if (selectedSite.value) {
        source = source.filter(s => s.site === selectedSite.value);
    }
    const sdwts = new Set(source.map(s => s.sdwt || '-'));
    return Array.from(sdwts).sort();
});

const eqpOptions = computed(() => {
    let source = agentServers.value;
    if (selectedSite.value) {
        source = source.filter(s => s.site === selectedSite.value);
    }
    if (selectedSdwt.value) {
        source = source.filter(s => s.sdwt === selectedSdwt.value);
    }
    const eqps = new Set(source.map(s => s.eqpid));
    return Array.from(eqps).sort();
});

// Filter Handlers
const onSiteChange = () => {
    selectedSdwt.value = null;
    selectedEqp.value = null;
};

const onSdwtChange = () => {
    selectedEqp.value = null;
};

// Filtered Data
const filteredAgentServers = computed(() => {
    return agentServers.value.filter(s => {
        const matchSite = !selectedSite.value || s.site === selectedSite.value;
        const matchSdwt = !selectedSdwt.value || !selectedSdwt.value || s.sdwt === selectedSdwt.value; // Allow null for all
        const matchEqp = !selectedEqp.value || s.eqpid === selectedEqp.value;
        return matchSite && matchSdwt && matchEqp;
    });
});

// --- State: Dialog (Add Only) ---
const dialogVisible = ref(false);
const form = reactive<AgentServerConfig>({
  eqpid: '',
  agentDbHost: '',
  agentFtpHost: '',
  updateFlag: 'no'
});

const formUpdateFlagBool = computed({
  get: () => form.updateFlag === 'yes',
  set: (val) => { form.updateFlag = val ? 'yes' : 'no'; }
});

// --- Actions ---
const loadAllData = async () => {
  isLoading.value = true;
  try {
    const [globalData, agentsData] = await Promise.all([
      getNewServerConfig(),
      getAgentServers()
    ]);
    
    if (globalData) Object.assign(globalConfig, globalData);
    
    // 데이터 매핑 시 Boolean 플래그 초기화
    agentServers.value = (agentsData || []).map(s => ({
        ...s,
        updateFlagBoolean: s.updateFlag === 'yes'
    }));
  } catch (e) {
    console.error("Failed to load system config:", e);
    toast.add({ severity: 'error', summary: 'Load Error', detail: '데이터 로드 실패', life: 3000 });
  } finally {
    isLoading.value = false;
  }
};

const saveGlobalConfig = async () => {
  isSaving.value = true;
  try {
    await updateNewServerConfig(globalConfig);
    toast.add({ severity: 'success', summary: 'Saved', detail: '공통 설정이 저장되었습니다.', life: 2000 });
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Error', detail: '저장 실패', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

// Toggle Action (즉시 반영)
const toggleUpdateFlag = async (row: AgentServerUI) => {
    const newValue = row.updateFlagBoolean ? 'yes' : 'no';
    row.updateFlag = newValue;
    
    try {
        await updateAgentServer(row.eqpid, { ...row, updateFlag: newValue });
        toast.add({ severity: 'success', summary: 'Updated', detail: `[${row.eqpid}] Flag changed to ${newValue.toUpperCase()}`, life: 1500 });
    } catch (e) {
        // 실패 시 롤백
        row.updateFlagBoolean = !row.updateFlagBoolean;
        row.updateFlag = row.updateFlagBoolean ? 'yes' : 'no';
        toast.add({ severity: 'error', summary: 'Error', detail: '상태 변경 실패', life: 3000 });
    }
};

// Dialog Actions
const openDialog = () => {
  dialogVisible.value = true;
  form.eqpid = '';
  form.agentDbHost = globalConfig.newDbHost; 
  form.agentFtpHost = globalConfig.newFtpHost;
  form.updateFlag = 'no';
};

const saveAgentServer = async () => {
  if (!form.eqpid) return;
  try {
    await createAgentServer(form);
    dialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Created', detail: '새 에이전트가 추가되었습니다.', life: 2000 });
    loadAllData();
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Error', detail: '추가 실패', life: 3000 });
  }
};

// Date Format: YY-MM-DD HH:mm
const formatCustomDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${min}`;
};

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
/* Scrollbar Styling */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }

/* Filter Dropdown Styling (Copied from WaferFlatDataView) */
:deep(.p-select), :deep(.custom-dropdown) { @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors; }
:deep(.custom-dropdown .p-select-label) { @apply text-[13px] py-[5px] px-3; }
:deep(.p-select-clear-icon) { @apply text-[9px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300; }
:deep(.custom-dropdown.small) { @apply h-7; }
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.p-select-dropdown) { @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none; }
:deep(.p-select-dropdown svg) { @apply w-3 h-3; }

/* Table Header Style Override */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
