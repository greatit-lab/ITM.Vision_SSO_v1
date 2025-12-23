<!-- frontend/src/views/admin/SystemConfigView.vue -->
<template>
  <div class="h-full flex flex-col gap-4">
    <div class="shrink-0">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white">시스템 설정 (Server Config)</h2>
      <p class="text-xs text-slate-500">데이터베이스 이관 및 Agent 서버 접속 정보를 관리합니다.</p>
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0">
      <div class="flex-1 flex flex-col p-4 gap-4 min-h-0 h-full">
        
        <div class="shrink-0 bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-zinc-700">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="pi pi-database text-blue-500"></i>
              신규 서버 설정 (Migration Target)
            </h3>
            <Button label="저장 (Save Config)" icon="pi pi-check" size="small" class="!py-1 !text-xs" @click="saveNewServerConfig" :loading="savingNew" />
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <div class="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <i class="pi pi-server text-[10px]"></i> Database
              </div>
              <div class="flex gap-2">
                <div class="flex items-center gap-2" style="flex: 7;">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">Host</label>
                  <InputText v-model="newServer.newDbHost" class="w-full !text-xs !py-1 !h-7" placeholder="DB Host IP" />
                </div>
                <div class="flex items-center gap-2" style="flex: 3;">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">Port</label>
                  <InputNumber v-model="newServer.newDbPort" class="w-full !text-xs !h-7" :useGrouping="false" inputClass="!py-1 !text-xs !h-7" />
                </div>
              </div>
              <div class="flex gap-2">
                <div class="flex-1 flex items-center gap-2">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">User</label>
                  <InputText v-model="newServer.newDbUser" class="w-full !text-xs !py-1 !h-7" />
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">PW</label>
                  <InputText v-model="newServer.newDbPw" type="password" class="w-full !text-xs !py-1 !h-7" />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-zinc-700 pt-3 lg:pt-0 lg:pl-6">
              <div class="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                <i class="pi pi-folder text-[10px]"></i> FTP
              </div>
              <div class="flex gap-2">
                <div class="flex items-center gap-2" style="flex: 7;">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">Host</label>
                  <InputText v-model="newServer.newFtpHost" class="w-full !text-xs !py-1 !h-7" placeholder="FTP Host IP" />
                </div>
                <div class="flex items-center gap-2" style="flex: 3;">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">Port</label>
                  <InputNumber v-model="newServer.newFtpPort" class="w-full !text-xs !h-7" :useGrouping="false" inputClass="!py-1 !text-xs !h-7" />
                </div>
              </div>
              <div class="flex gap-2">
                <div class="flex-1 flex items-center gap-2">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">User</label>
                  <InputText v-model="newServer.newFtpUser" class="w-full !text-xs !py-1 !h-7" />
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">PW</label>
                  <InputText v-model="newServer.newFtpPw" type="password" class="w-full !text-xs !py-1 !h-7" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2">
             <label class="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right shrink-0">Memo</label>
             <InputText v-model="newServer.description" class="flex-1 !text-xs !py-1 !h-7" placeholder="설명 입력..." />
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-2 shrink-0">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="pi pi-server text-indigo-500"></i>
              Agent 서버 목록 (cfg_server)
            </h3>
            <Button label="서버 추가" icon="pi pi-plus" size="small" outlined class="!py-1 !text-xs" @click="openServerDialog()" />
          </div>
          
          <div class="flex-1 border rounded-lg border-slate-200 dark:border-zinc-800 overflow-hidden relative">
            <div class="absolute inset-0">
              <DataTable 
                :value="cfgServers" 
                class="h-full text-xs p-datatable-sm" 
                scrollable 
                scrollHeight="100%" 
                stripedRows 
                :loading="loadingServers"
              >
                <Column field="eqpid" header="EQP ID" sortable style="width: 20%; font-weight: bold"></Column>
                
                <Column field="agentDbHost" header="Agent DB Host" sortable style="width: 25%"></Column>
                <Column field="agentFtpHost" header="Agent FTP Host" sortable style="width: 25%"></Column>
                
                <Column field="updateFlag" header="Update Flag" sortable style="width: 10%">
                  <template #body="{ data }">
                    <span :class="data.updateFlag === 'yes' ? 'text-green-600 font-bold' : 'text-slate-400'">
                      {{ data.updateFlag }}
                    </span>
                  </template>
                </Column>
                
                <Column field="update" header="Updated" sortable style="width: 10%">
                  <template #body="{ data }">
                    {{ data.update ? new Date(data.update).toLocaleString() : '-' }}
                  </template>
                </Column>
                
                <Column header="Action" style="width: 100px; min-width: 100px;" align="center">
                  <template #body="{ data }">
                    <div class="flex justify-center gap-2">
                      <Button icon="pi pi-pencil" text rounded severity="info" size="small" class="!w-6 !h-6" @click="openServerDialog(data)" />
                      <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="!w-6 !h-6" @click="deleteServer(data.eqpid)" />
                    </div>
                  </template>
                </Column>
                <template #empty>
                  <div class="p-4 text-center text-slate-400">등록된 서버가 없습니다.</div>
                </template>
              </DataTable>
            </div>
          </div>
        </div>

      </div>
    </div>

    <Dialog v-model:visible="serverDialog.visible" modal :header="serverDialog.isEdit ? '서버 수정' : '서버 추가'" :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">EQP ID</label>
          <InputText v-model="serverForm.eqpid" :disabled="serverDialog.isEdit" class="!text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Agent DB Host</label>
          <InputText v-model="serverForm.agentDbHost" class="!text-sm" placeholder="e.g. 192.168.x.x" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Agent FTP Host</label>
          <InputText v-model="serverForm.agentFtpHost" class="!text-sm" placeholder="e.g. 192.168.x.x" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Update Flag</label>
          <div class="flex gap-4 mt-1">
            <div class="flex items-center">
              <RadioButton v-model="serverForm.updateFlag" inputId="flagNo" name="flag" value="no" />
              <label for="flagNo" class="ml-2 text-sm">no</label>
            </div>
            <div class="flex items-center">
              <RadioButton v-model="serverForm.updateFlag" inputId="flagYes" name="flag" value="yes" />
              <label for="flagYes" class="ml-2 text-sm">yes</label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="serverDialog.visible = false" />
        <Button label="저장" @click="saveServer" />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import RadioButton from 'primevue/radiobutton'; // [추가]
import * as AdminApi from '@/api/admin';

// --- 1. New Server Config ---
const newServer = reactive<any>({});
const savingNew = ref(false);

const loadNewServerConfig = async () => {
  try {
    const res = await AdminApi.getNewServerConfig();
    Object.assign(newServer, res.data);
  } catch (e) { console.error(e); }
};

const saveNewServerConfig = async () => {
  savingNew.value = true;
  try {
    await AdminApi.updateNewServerConfig(newServer);
    alert("설정이 저장되었습니다.");
  } catch (e) {
    alert("저장 실패");
  } finally {
    savingNew.value = false;
  }
};

// --- 2. Cfg Server List ---
const cfgServers = ref([]);
const loadingServers = ref(false);
const serverDialog = reactive({ visible: false, isEdit: false });
// [수정] 폼 데이터 구조 변경
const serverForm = reactive({ eqpid: '', agentDbHost: '', agentFtpHost: '', updateFlag: 'no' });

const loadCfgServers = async () => {
  loadingServers.value = true;
  try {
    const res = await AdminApi.getCfgServers();
    cfgServers.value = res.data;
  } catch(e) { console.error(e); }
  finally { loadingServers.value = false; }
};

const openServerDialog = (item?: any) => {
  serverDialog.visible = true;
  serverDialog.isEdit = !!item;
  if(item) {
    Object.assign(serverForm, item);
  } else {
    // 초기값
    Object.assign(serverForm, { eqpid: '', agentDbHost: '', agentFtpHost: '', updateFlag: 'no' });
  }
};

const saveServer = async () => {
  try {
    if (serverDialog.isEdit) await AdminApi.updateCfgServer(serverForm.eqpid, serverForm);
    else await AdminApi.addCfgServer(serverForm);
    serverDialog.visible = false;
    loadCfgServers();
  } catch(e) { alert("저장 실패"); }
};

const deleteServer = async (eqpid: string) => {
  if(confirm("삭제하시겠습니까?")) {
    await AdminApi.deleteCfgServer(eqpid);
    loadCfgServers();
  }
};

onMounted(() => {
  loadNewServerConfig();
  loadCfgServers();
});
</script>

<style scoped>
/* 테이블 스타일 */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* InputNumber 내부 input 높이 조절 */
:deep(.p-inputnumber-input) {
  @apply !py-1 !text-xs !h-7;
}
</style>
