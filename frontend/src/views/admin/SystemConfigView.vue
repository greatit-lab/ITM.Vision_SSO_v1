<!-- frontend/src/views/admin/SystemConfigView.vue -->
<template>
  <div class="h-full flex flex-col gap-4">
    <div class="shrink-0">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white">시스템 설정 (Server Config)</h2>
      <p class="text-xs text-slate-500">데이터베이스 이관 및 Agent 서버 접속 정보를 관리합니다.</p>
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0">
      <div class="flex-1 overflow-auto p-6 space-y-8">
        
        <div class="bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 rounded-lg p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="pi pi-database text-blue-500"></i>
              신규 서버 설정 (Migration Target)
            </h3>
            <Button label="저장 (Save Config)" icon="pi pi-check" size="small" @click="saveNewServerConfig" :loading="savingNew" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <h4 class="text-xs font-bold text-slate-500 uppercase">Database Connection</h4>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Host</label>
                <InputText v-model="newServer.newDbHost" class="col-span-2 !text-xs !h-8" />
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">User</label>
                <InputText v-model="newServer.newDbUser" class="col-span-2 !text-xs !h-8" />
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Password</label>
                <InputText v-model="newServer.newDbPw" type="password" class="col-span-2 !text-xs !h-8" />
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Port</label>
                <InputNumber v-model="newServer.newDbPort" class="col-span-2 !text-xs !h-8" :useGrouping="false" />
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="text-xs font-bold text-slate-500 uppercase">FTP Connection</h4>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Host</label>
                <InputText v-model="newServer.newFtpHost" class="col-span-2 !text-xs !h-8" />
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">User</label>
                <InputText v-model="newServer.newFtpUser" class="col-span-2 !text-xs !h-8" />
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Password</label>
                <InputText v-model="newServer.newFtpPw" type="password" class="col-span-2 !text-xs !h-8" />
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Port</label>
                <InputNumber v-model="newServer.newFtpPort" class="col-span-2 !text-xs !h-8" :useGrouping="false" />
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800">
             <label class="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Description</label>
             <InputText v-model="newServer.description" class="w-full !text-xs !h-8" placeholder="설명 입력..." />
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="pi pi-server text-indigo-500"></i>
              Agent 서버 목록 (cfg_server)
            </h3>
            <Button label="서버 추가" icon="pi pi-plus" size="small" outlined @click="openServerDialog()" />
          </div>
          
          <div class="border rounded-lg border-slate-200 dark:border-zinc-800 overflow-hidden">
            <DataTable :value="cfgServers" class="text-xs p-datatable-sm" stripedRows :loading="loadingServers">
              <Column field="eqpid" header="EQP ID" style="width: 20%; font-weight: bold"></Column>
              <Column field="serverUrl" header="Server URL" style="width: 40%"></Column>
              <Column field="agentVer" header="Agent Ver" style="width: 20%"></Column>
              <Column field="lastCheck" header="Last Check" style="width: 20%">
                <template #body="{ data }">
                  {{ data.lastCheck ? new Date(data.lastCheck).toLocaleString() : '-' }}
                </template>
              </Column>
              <Column header="Action" style="width: 10%" align="center">
                <template #body="{ data }">
                  <div class="flex justify-center gap-2">
                    <Button icon="pi pi-pencil" text rounded severity="info" size="small" @click="openServerDialog(data)" />
                    <Button icon="pi pi-trash" text rounded severity="danger" size="small" @click="deleteServer(data.eqpid)" />
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

    <Dialog v-model:visible="serverDialog.visible" modal :header="serverDialog.isEdit ? '서버 수정' : '서버 추가'" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">EQP ID</label>
          <InputText v-model="serverForm.eqpid" :disabled="serverDialog.isEdit" class="!text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Server URL</label>
          <InputText v-model="serverForm.serverUrl" class="!text-sm" placeholder="http://..." />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Agent Version</label>
          <InputText v-model="serverForm.agentVer" class="!text-sm" />
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
const serverForm = reactive({ eqpid: '', serverUrl: '', agentVer: '' });

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
    Object.assign(serverForm, { eqpid: '', serverUrl: '', agentVer: '' });
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
