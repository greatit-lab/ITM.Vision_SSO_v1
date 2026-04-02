<!-- frontend/src/views/admin/InfraManagementView.vue -->
<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex items-end justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">
          인프라 관리
        </h2>
        <p class="text-xs text-slate-500">
          장비(Equipment), SDWT, 에러 정책 및 분석 지표를 관리합니다.
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        size="small"
        outlined
        @click="refreshCurrentTab"
      />
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0 relative">
      <Tabs v-model:value="activeTab" class="flex flex-col h-full">
        <TabList class="shrink-0 border-b bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <Tab value="0" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-desktop"></i>장비 목록</Tab>
          
          <Tab v-if="isManagerOrAdmin" value="1" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-sitemap"></i>SDWT 구성</Tab>
          
          <Tab value="2" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-cog"></i>설정 관리 (심각도/지표)</Tab>
        </TabList>
        
        <TabPanels class="!p-0 flex-1 overflow-hidden h-full flex flex-col min-h-0">
          
          <TabPanel value="0" class="h-full flex flex-col overflow-hidden min-h-0">
             <div class="flex flex-col h-full gap-3 p-4 min-h-0">
                <div class="flex flex-wrap items-center justify-between gap-3 p-2 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#111111] shrink-0">
                  <div class="flex items-center gap-2 flex-1 max-w-2xl">
                    <div class="flex-1"><InputText v-model="filters.eqpId" placeholder="EQP ID" class="!py-1.5 w-full text-xs" /></div>
                    <div class="flex-1"><InputText v-model="filters.indexLine" placeholder="Index Line" class="!py-1.5 w-full text-xs" /></div>
                    <div class="flex-1"><InputText v-model="filters.sdwt" placeholder="SDWT" class="!py-1.5 w-full text-xs" /></div>
                    <Button icon="pi pi-filter-slash" severity="secondary" outlined size="small" class="!py-1.5 !px-3" @click="resetFilter" />
                  </div>
                  
                  <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div class="flex items-center gap-2">
                      <span class="font-bold hidden sm:inline">Rows:</span>
                      <select v-model="eqpRows" @change="eqpFirst = 0" class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-xs">
                        <option :value="10">10</option>
                        <option :value="20">20</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                      </select>
                    </div>
                    
                    <span class="font-bold min-w-[80px] text-right font-mono">
                      {{ filteredEquipments.length === 0 ? 0 : eqpFirst + 1 }} - {{ Math.min(eqpFirst + eqpRows, filteredEquipments.length) }} / {{ filteredEquipments.length }}
                    </span>
                    
                    <div class="flex items-center gap-1">
                      <button @click="eqpFirst = 0" :disabled="eqpFirst === 0" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-default" title="First Page">
                        <i class="pi pi-angle-double-left text-[10px] font-bold"></i>
                      </button>
                      <button @click="prevPage" :disabled="eqpFirst === 0" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-default" title="Previous Page">
                        <i class="pi pi-angle-left text-[10px] font-bold"></i>
                      </button>
                      <button @click="nextPage" :disabled="eqpFirst + eqpRows >= filteredEquipments.length" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-default" title="Next Page">
                        <i class="pi pi-angle-right text-[10px] font-bold"></i>
                      </button>
                      <button @click="lastPage" :disabled="eqpFirst + eqpRows >= filteredEquipments.length" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-default" title="Last Page">
                        <i class="pi pi-angle-double-right text-[10px] font-bold"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex-1 overflow-hidden border rounded-lg border-slate-200 dark:border-zinc-800 min-h-0 relative">
                  <div class="absolute inset-0">
                    <DataTable :value="filteredEquipments" paginator :rows="eqpRows" v-model:first="eqpFirst" scrollable scrollHeight="100%" class="h-full text-xs p-datatable-sm [&_.p-paginator]:hidden" stripedRows :loading="loading" tableStyle="min-width: 80rem" removableSort sortField="eqpId" :sortOrder="1">
                      <Column field="eqpId" header="EQP ID" sortable style="min-width: 120px; font-weight: bold"></Column>
                      <Column field="lineCode" header="Line Code" sortable style="min-width: 100px"></Column>
                      <Column field="indexLine" header="Index Line" sortable style="min-width: 100px"></Column>
                      <Column field="maker" header="Maker" sortable style="min-width: 100px"></Column>
                      <Column field="model" header="Model" sortable style="min-width: 120px"></Column>
                      <Column field="bay" header="Bay" style="min-width: 80px"></Column>
                      <Column field="sdwt" header="SDWT" sortable style="min-width: 100px; color: #2563eb"></Column>
                      <Column field="lastUpdate" header="Last Update" style="min-width: 130px">
                        <template #body="{ data }">{{ formatDateTime(data.lastUpdate) }}</template>
                      </Column>
                      <Column header="Action" align="center" style="width: 80px; min-width: 80px;">
                        <template #body="{ data }">
                           <Button 
                             v-if="isAdmin"
                             icon="pi pi-trash" 
                             text rounded severity="danger" 
                             size="small" 
                             class="!w-6 !h-6" 
                             @click="removeEquipment(data.eqpId)" 
                           />
                        </template>
                      </Column>
                    </DataTable>
                  </div>
                </div>
             </div>
          </TabPanel>

          <TabPanel v-if="isManagerOrAdmin" value="1" class="h-full flex flex-col overflow-hidden min-h-0">
             <div class="flex flex-col h-full gap-3 p-4 min-h-0">
               <div class="flex flex-wrap items-center justify-between gap-3 p-2 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#111111] shrink-0">
                  <div class="w-full flex justify-end">
                    <Button v-if="isAdmin" label="SDWT 추가" icon="pi pi-plus" size="small" class="!py-1.5 !text-xs" @click="openSdwtDialog" />
                  </div>
               </div>
               <div class="flex-1 overflow-hidden border rounded-lg border-slate-200 dark:border-zinc-800 min-h-0 relative">
                  <div class="absolute inset-0">
                    <DataTable :value="sdwts" scrollable scrollHeight="100%" class="h-full text
