<!-- frontend/src/views/admin/InfraManagementView.vue -->
<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex items-end justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">
          인프라 관리
        </h2>
        <p class="text-xs text-slate-500">
          장비(Equipment) 및 SDWT 정보를 관리합니다.
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        size="small"
        outlined
        @click="loadAllData"
      />
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      <Tabs value="0">
        <TabList class="border-b bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <Tab value="0"><i class="mr-2 pi pi-desktop"></i>장비 목록 (ref_equipment)</Tab>
          <Tab value="1"><i class="mr-2 pi pi-sitemap"></i>SDWT 구성 (ref_sdwt)</Tab>
        </TabList>
        
        <TabPanels class="!p-0 flex-1 overflow-auto">
          
          <TabPanel value="0" class="h-full">
            <div class="flex flex-col h-full gap-3 p-4">
              
              <div class="flex flex-wrap items-end justify-between gap-3 p-3 border rounded-lg bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <div class="flex items-end gap-2">
                  <div class="flex flex-col gap-1 w-[200px]">
                    <label class="text-xs font-semibold text-slate-500">검색어 (ID)</label>
                    <div class="relative">
                      <i class="absolute text-sm -translate-y-1/2 pi pi-search left-3 top-1/2 text-slate-400"></i>
                      <InputText
                        v-model="filters.keyword"
                        placeholder="EQP ID 검색"
                        class="!pl-9 !py-2 w-full text-sm"
                        @keydown.enter="applyFilter"
                      />
                    </div>
                  </div>
                  <Button
                    icon="pi pi-filter-slash"
                    label="초기화"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="resetFilter"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 font-semibold">Rows per page:</span>
                  <Select
                    v-model="eqpRows"
                    :options="rowOptions"
                    class="!h-9 text-xs w-20"
                  />
                </div>
              </div>

              <div class="flex-1 overflow-hidden border rounded-lg">
                <DataTable
                  :value="filteredEquipments"
                  scrollable
                  scrollHeight="flex"
                  class="h-full text-xs p-datatable-sm"
                  stripedRows
                  :loading="loading"
                  tableStyle="min-width: 100rem"
                  paginator
                  :rows="eqpRows"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                  currentPageReportTemplate="{first} - {last} of {totalRecords}"
                >
                  <Column field="eqpid" header="EQP ID" sortable style="min-width: 120px; font-weight: bold"></Column>
                  <Column field="lineCode" header="Line Code" sortable style="min-width: 100px"></Column>
                  <Column field="simaxLine" header="Simax Line" sortable style="min-width: 100px"></Column>
                  <Column field="indexLine" header="Index Line" sortable style="min-width: 100px"></Column>
                  <Column field="maker" header="Maker" sortable style="min-width: 100px"></Column>
                  <Column field="model" header="Model" sortable style="min-width: 120px"></Column>
                  <Column field="prcGroup" header="Prc Group" sortable style="min-width: 120px"></Column>
                  <Column field="bay" header="Bay" sortable style="min-width: 80px"></Column>
                  <Column field="sdwt" header="SDWT" sortable style="min-width: 100px; color: #2563eb"></Column>
                  <Column field="lastUpdate" header="Last Update" sortable style="min-width: 150px">
                    <template #body="{ data }">
                      {{ data.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : '-' }}
                    </template>
                  </Column>

                  <template #empty>
                    <div class="p-4 text-center text-slate-500">
                      데이터가 없거나 검색 결과가 없습니다.
                    </div>
                  </template>
                </DataTable>
              </div>
              
              <div class="text-xs text-right text-slate-500">
                총 <span class="font-bold text-slate-800">{{ filteredEquipments.length }}</span> 건
              </div>
            </div>
          </TabPanel>

          <TabPanel value="1" class="h-full">
            <div class="flex flex-col h-full gap-3 p-4">
              
              <div class="flex flex-wrap items-center justify-between gap-3 p-2">
                <Button 
                  label="SDWT 추가" 
                  icon="pi pi-plus" 
                  size="small" 
                  @click="openSdwtDialog" 
                />

                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 font-semibold">Rows per page:</span>
                  <Select
                    v-model="sdwtRows"
                    :options="rowOptions"
                    class="!h-9 text-xs w-20"
                  />
                </div>
              </div>

              <div class="flex-1 overflow-hidden border rounded-lg">
                <DataTable
                  :value="sdwts"
                  scrollable
                  scrollHeight="flex"
                  class="h-full text-xs p-datatable-sm"
                  stripedRows
                  :loading="loading"
                  paginator
                  :rows="sdwtRows"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                  currentPageReportTemplate="{first} - {last} of {totalRecords}"
                >
                  <Column field="id" header="ID (PK)" sortable style="width: 10%; font-weight: bold"></Column>
                  <Column field="sdwt" header="SDWT Name" sortable style="width: 15%; color: #2563eb"></Column>
                  <Column field="site" header="Site" sortable style="width: 10%"></Column>
                  <Column field="campus" header="Campus" style="width: 10%"></Column>
                  <Column field="desc" header="Description" style="width: 25%"></Column>
                  <Column field="isUse" header="Use" align="center" style="width: 10%">
                    <template #body="{ data }">
                      <span :class="data.isUse === 'Y' ? 'text-green-600 font-bold' : 'text-slate-400'">
                        {{ data.isUse }}
                      </span>
                    </template>
                  </Column>
                  <Column field="update" header="Updated" style="width: 10%">
                    <template #body="{ data }">
                      {{ new Date(data.update).toLocaleDateString() }}
                    </template>
                  </Column>
                  
                  <Column header="Action" align="center" style="width: 10%">
                    <template #body="{ data }">
                      <div class="flex justify-center gap-2">
                        <Button 
                          icon="pi pi-pencil" 
                          text 
                          rounded
                          severity="info" 
                          size="small" 
                          class="!p-0 !w-6 !h-6"
                          @click="editSdwt(data)" 
                        />
                        <Button 
                          icon="pi pi-trash" 
                          text 
                          rounded
                          severity="danger" 
                          size="small" 
                          class="!p-0 !w-6 !h-6"
                          @click="removeSdwt(data.id)" 
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </div>

    <Dialog 
      v-model:visible="sdwtDialogVisible" 
      modal 
      :header="isEditMode ? 'SDWT 수정' : 'SDWT 추가'" 
      :style="{ width: '30rem' }"
    >
      <div class="flex flex-col gap-4 mb-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">ID (7자리)</label>
          <InputText v-model="sdwtForm.id" :disabled="isEditMode" placeholder="e.g. S000001" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">SDWT Name</label>
          <InputText v-model="sdwtForm.sdwt" placeholder="e.g. SDWT_NAME" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Site</label>
            <InputText v-model="sdwtForm.site" placeholder="e.g. KR" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Campus</label>
            <InputText v-model="sdwtForm.campus" placeholder="e.g. A-Campus" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">Description</label>
          <InputText v-model="sdwtForm.desc" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="sdwtForm.isUse" binary inputId="isUseCheck" />
          <label for="isUseCheck" class="text-sm">사용 여부 (Use)</label>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button label="취소" severity="secondary" @click="sdwtDialogVisible = false" />
        <Button label="저장" @click="saveSdwt" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Checkbox from "primevue/checkbox";
import Select from "primevue/select";

// API Import
import { 
  getInfraEquipment, 
  getInfraSdwt,
  createInfraSdwt,
  updateInfraSdwt,
  deleteInfraSdwt
} from "@/api/infra";

const loading = ref(false);
const equipments = ref([]);
const sdwts = ref([]);

// --- Pagination Controls ---
const rowOptions = [5, 10, 20, 50, 100];
const eqpRows = ref(10);  // 장비 목록 기본 행 수
const sdwtRows = ref(10); // SDWT 목록 기본 행 수

// --- 1. 검색 필터 로직 ---
const filters = reactive({
  keyword: "",
});

const filteredEquipments = computed(() => {
  if (!equipments.value) return [];
  return equipments.value.filter((item: any) => {
    // 키워드 검색: 오직 EQP ID만 검색
    const keyword = filters.keyword.toLowerCase();
    const matchKeyword =
      !keyword ||
      item.eqpid?.toLowerCase().includes(keyword);
      
    return matchKeyword;
  });
});

const applyFilter = () => {
  console.log("Filters applied:", filters);
};

const resetFilter = () => {
  filters.keyword = "";
};

// --- Data Fetching ---
const loadAllData = async () => {
  loading.value = true;
  try {
    const [eqRes, sdwtRes] = await Promise.all([
      getInfraEquipment(),
      getInfraSdwt(),
    ]);
    equipments.value = eqRes.data;
    sdwts.value = sdwtRes.data;
  } catch (e) {
    console.error("Failed to load infra data", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAllData();
});

// --- SDWT CRUD Logic ---
const sdwtDialogVisible = ref(false);
const isEditMode = ref(false);
const sdwtForm = reactive({
  id: "",
  sdwt: "",
  site: "",
  campus: "",
  desc: "",
  isUse: true, 
});

const openSdwtDialog = () => {
  isEditMode.value = false;
  sdwtForm.id = "";
  sdwtForm.sdwt = "";
  sdwtForm.site = "";
  sdwtForm.campus = "";
  sdwtForm.desc = "";
  sdwtForm.isUse = true;
  
  sdwtDialogVisible.value = true;
};

const editSdwt = (data: any) => {
  isEditMode.value = true;
  sdwtForm.id = data.id;
  sdwtForm.sdwt = data.sdwt;
  sdwtForm.site = data.site;
  sdwtForm.campus = data.campus;
  sdwtForm.desc = data.desc;
  sdwtForm.isUse = data.isUse === 'Y';
  
  sdwtDialogVisible.value = true;
};

const saveSdwt = async () => {
  if (!sdwtForm.id || !sdwtForm.sdwt) {
    alert("ID와 SDWT Name은 필수입니다.");
    return;
  }

  const payload = {
    ...sdwtForm,
    isUse: sdwtForm.isUse ? 'Y' : 'N'
  };

  try {
    if (isEditMode.value) {
      const { id, ...updateData } = payload;
      await updateInfraSdwt(id, updateData);
    } else {
      await createInfraSdwt(payload);
    }
    sdwtDialogVisible.value = false;
    loadAllData(); 
  } catch (e) {
    console.error(e);
    alert("저장에 실패했습니다.");
  }
};

const removeSdwt = async (id: string) => {
  if (!confirm(`SDWT(${id})를 삭제하시겠습니까?`)) return;
  try {
    await deleteInfraSdwt(id);
    loadAllData();
  } catch (e) {
    console.error(e);
    alert("삭제에 실패했습니다.");
  }
};
</script>
