<template>
  <div
    class="min-h-full bg-[#F8FAFC] dark:bg-[#09090B] font-sans transition-colors duration-500 flex flex-col"
  >
    <div class="flex flex-col gap-4 mb-5 px-1">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-slate-100 dark:border-zinc-800"
        >
          <i
            class="pi pi-chart-pie text-2xl text-teal-600 dark:text-teal-400"
          ></i>
        </div>
        <div>
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Wafer Flat Data
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-xs">
            Detailed metrology data analysis.
          </p>
        </div>
      </div>
    </div>

    <div
      class="mb-6 bg-white dark:bg-[#111111] p-2 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-2 shadow-sm transition-colors duration-300"
    >
      <div class="flex items-center justify-between gap-2">
        <div
          class="flex gap-2 flex-1 overflow-x-auto items-center scrollbar-hide px-1 py-1"
        >
          <div class="min-w-[150px] shrink-0">
            <Select
              v-model="filterStore.selectedSite"
              :options="sites"
              placeholder="Site"
              class="w-full custom-input"
              @change="onSiteChange"
            />
          </div>
          <div class="min-w-[150px] shrink-0">
            <Select
              v-model="filterStore.selectedSdwt"
              :options="sdwts"
              placeholder="SDWT"
              :disabled="!filterStore.selectedSite"
              class="w-full custom-input"
              @change="onSdwtChange"
            />
          </div>
          <div class="min-w-[180px] shrink-0">
            <AutoComplete
              v-model="filters.eqpId"
              :suggestions="filteredEqpIds"
              @complete="searchEqp"
              placeholder="EQP ID"
              :disabled="!filterStore.selectedSdwt"
              dropdown
              class="w-full custom-input"
              @item-select="onEqpSelect"
            />
          </div>
          <div class="min-w-[180px] shrink-0">
            <AutoComplete
              v-model="filters.lotId"
              :suggestions="filteredLotIds"
              @complete="searchLot"
              placeholder="Lot ID"
              :disabled="!filters.eqpId"
              dropdown
              class="w-full custom-input"
            />
          </div>
          <div class="min-w-[150px] shrink-0">
            <AutoComplete
              v-model="filters.waferId"
              :suggestions="filteredWaferIds"
              @complete="searchWafer"
              placeholder="Wafer ID"
              :disabled="!filters.eqpId"
              dropdown
              class="w-full custom-input"
            />
          </div>

          <div class="min-w-[150px] shrink-0">
            <DatePicker
              v-model="filters.startDate"
              showIcon
              dateFormat="yy-mm-dd"
              placeholder="Start"
              class="w-full custom-input"
              :disabled="!filters.eqpId"
            />
          </div>
          <div class="min-w-[150px] shrink-0">
            <DatePicker
              v-model="filters.endDate"
              showIcon
              dateFormat="yy-mm-dd"
              placeholder="End"
              class="w-full custom-input"
              :disabled="!filters.eqpId"
            />
          </div>
        </div>

        <div
          class="flex items-center gap-1 pl-2 border-l border-slate-100 dark:border-zinc-800 shrink-0"
        >
          <Button
            :icon="showAdvanced ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Advanced Filters'"
            @click="showAdvanced = !showAdvanced"
          />
          <Button
            icon="pi pi-refresh"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Reset'"
            @click="resetFilters"
          />
          <Button
            icon="pi pi-search"
            rounded
            class="!bg-teal-600 !border-teal-600 hover:!bg-teal-700 !w-9 !h-9"
            @click="searchData"
            :loading="isLoading"
            :disabled="!filters.eqpId"
          />
        </div>
      </div>

      <div
        v-show="showAdvanced"
        class="grid grid-cols-4 gap-2 px-1 pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800 animate-fade-in"
      >
        <Select
          v-model="filters.cassetteRcp"
          :options="cassetteRcps"
          placeholder="Cassette RCP"
          showClear
          class="w-full custom-input small"
        />
        <Select
          v-model="filters.stageRcp"
          :options="stageRcps"
          placeholder="Stage RCP"
          showClear
          class="w-full custom-input small"
        />
        <Select
          v-model="filters.stageGroup"
          :options="stageGroups"
          placeholder="Stage Group"
          showClear
          class="w-full custom-input small"
        />
        <Select
          v-model="filters.film"
          :options="films"
          placeholder="Film"
          showClear
          class="w-full custom-input small"
        />
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 overflow-hidden fade-in pb-4"
    >
      <div class="flex-[3] flex flex-col gap-3 min-w-[600px] overflow-hidden">
        <div
          class="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col shrink-0"
          style="height: 500px"
        >
          <div
            class="p-2 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900"
          >
            <div class="flex items-center gap-2 pl-2">
              <div class="w-1 h-3 bg-teal-500 rounded-full"></div>
              <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200">
                Data Results
              </h3>
            </div>

            <div
              class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pr-2"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium">Rows:</span>
                <select
                  v-model="rowsPerPage"
                  @change="onRowsChange"
                  class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
              </div>
              <span class="font-medium min-w-[60px] text-right">
                {{ totalRecords === 0 ? 0 : first + 1 }} -
                {{ Math.min(first + rowsPerPage, totalRecords) }} /
                {{ totalRecords }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  @click="
                    first = 0;
                    loadDataGrid();
                  "
                  :disabled="first === 0"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <i class="pi pi-angle-double-left text-[10px]"></i>
                </button>
                <button
                  @click="prevPage"
                  :disabled="first === 0"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <i class="pi pi-angle-left text-[10px]"></i>
                </button>
                <button
                  @click="nextPage"
                  :disabled="first + rowsPerPage >= totalRecords"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <i class="pi pi-angle-right text-[10px]"></i>
                </button>
                <button
                  @click="lastPage"
                  :disabled="first + rowsPerPage >= totalRecords"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <i class="pi pi-angle-double-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1 relative overflow-auto">
            <DataTable
              :value="flatData"
              v-model:selection="selectedRow"
              selectionMode="single"
              :metaKeySelection="false"
              dataKey="servTs"
              @rowSelect="onRowSelect"
              :loading="isLoading"
              class="p-datatable-sm text-sm absolute inset-0 custom-datatable"
              stripedRows
            >
              <template #empty>
                <div
                  class="flex flex-col items-center justify-center h-full text-slate-400"
                >
                  <i class="pi pi-filter-slash text-3xl mb-2 opacity-30"></i>
                  <p class="font-medium">No data found.</p>
                </div>
              </template>

              <Column
                field="servTs"
                header="DATE TIME"
                style="min-width: 160px"
                frozen
                class="font-semibold"
                :bodyStyle="{ paddingLeft: '16px' }"
                headerStyle="padding-left: 16px"
              >
                <template #body="{ data }">{{
                  formatDate(data.servTs)
                }}</template>
              </Column>
              <Column field="lotId" header="LOT ID" style="min-width: 130px">
                <template #body="{ data }"
                  ><span class="font-bold text-slate-600 dark:text-slate-300">{{
                    data.lotId
                  }}</span></template
                >
              </Column>
              <Column field="waferId" header="WAFER" style="min-width: 80px">
                <template #body="{ data }">
                  <span
                    class="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-xs font-mono font-bold border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300"
                    >#{{ data.waferId }}</span
                  >
                </template>
              </Column>
              <Column
                field="cassetteRcp"
                header="CASSETTE RCP"
                style="min-width: 140px"
              ></Column>
              <Column
                field="stageRcp"
                header="STAGE RCP"
                style="min-width: 140px"
              ></Column>
              <Column
                field="stageGroup"
                header="STAGE GROUP"
                style="min-width: 120px"
              ></Column>

              <Column field="film" header="FILM" style="min-width: 80px">
                <template #body="{ data }">
                  <span class="text-slate-600 dark:text-slate-300">{{
                    data.film
                  }}</span>
                </template>
              </Column>

              <Column field="servTs" header="EQP TIME" style="min-width: 160px">
                <template #body="{ data }"
                  ><span
                    class="text-slate-500 dark:text-slate-400 font-mono text-sm"
                    >{{ formatDate(data.servTs) }}</span
                  ></template
                >
              </Column>
            </DataTable>
          </div>
        </div>

        <div
          class="flex-none bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[160px]"
        >
          <div
            class="p-2 border-b border-slate-100 dark:border-zinc-800 font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <i class="pi pi-chart-bar text-teal-500 text-sm"></i> Statistics
          </div>
          <div class="flex-1 overflow-auto relative">
            <div
              v-if="!selectedRow"
              class="flex h-full items-center justify-center text-slate-400 text-sm"
            >
              Select a row to view statistics
            </div>
            <div
              v-else-if="isStatsLoading"
              class="absolute inset-0 flex justify-center items-center"
            >
              <ProgressSpinner style="width: 25px; height: 25px" />
            </div>

            <table
              v-else-if="statistics && statistics.t1"
              class="w-full text-sm border-collapse"
            >
              <thead
                class="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 sticky top-0 text-xs uppercase"
              >
                <tr>
                  <th class="p-2 text-left pl-4">Metric</th>
                  <th class="p-2 text-right">T1</th>
                  <th class="p-2 text-right">GOF</th>
                  <th class="p-2 text-right pr-4">Z</th>
                </tr>
              </thead>
              <tbody
                class="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-slate-300"
              >
                <tr>
                  <td class="p-2 pl-4 font-bold text-slate-500">Mean</td>
                  <td class="text-right">{{ fmt(statistics.t1.mean) }}</td>
                  <td class="text-right">{{ fmt(statistics.gof.mean) }}</td>
                  <td class="text-right pr-4">{{ fmt(statistics.z.mean) }}</td>
                </tr>
                <tr>
                  <td class="p-2 pl-4 font-bold text-slate-500">Range</td>
                  <td class="text-right">{{ fmt(statistics.t1.range) }}</td>
                  <td class="text-right">{{ fmt(statistics.gof.range) }}</td>
                  <td class="text-right pr-4">{{ fmt(statistics.z.range) }}</td>
                </tr>
                <tr>
                  <td class="p-2 pl-4 font-bold text-slate-500">StdDev</td>
                  <td class="text-right">{{ fmt(statistics.t1.stdDev) }}</td>
                  <td class="text-right">{{ fmt(statistics.gof.stdDev) }}</td>
                  <td class="text-right pr-4">
                    {{ fmt(statistics.z.stdDev) }}
                  </td>
                </tr>
                <tr>
                  <td class="p-2 pl-4 font-bold text-slate-500">%Unif</td>
                  <td class="text-right font-bold text-blue-500">
                    {{ fmt(statistics.t1.percentNonU) }}%
                  </td>
                  <td class="text-right">-</td>
                  <td class="text-right pr-4">-</td>
                </tr>
              </tbody>
            </table>
            <div
              v-else
              class="flex h-full items-center justify-center text-slate-400 text-sm"
            >
              No statistics available
            </div>
          </div>
        </div>

        <div
          class="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col min-h-[180px]"
        >
          <div
            class="p-2 border-b border-slate-100 dark:border-zinc-800 font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <i class="pi pi-list text-teal-500 text-sm"></i> Wafer Point Data
          </div>
          <div class="flex-1 overflow-auto relative">
            <div
              v-if="!selectedRow"
              class="flex h-full items-center justify-center text-slate-400 text-sm"
            >
              Select a row to view point data
            </div>
            <div
              v-else-if="isPointsLoading"
              class="absolute inset-0 flex justify-center items-center"
            >
              <ProgressSpinner style="width: 25px; height: 25px" />
            </div>

            <table
              v-else-if="
                pointData && pointData.data && pointData.data.length > 0
              "
              class="w-full text-sm text-center border-collapse"
            >
              <thead
                class="sticky top-0 z-10 bg-slate-100 dark:bg-zinc-800 text-slate-500 font-bold shadow-sm text-xs uppercase"
              >
                <tr>
                  <th
                    v-for="h in pointData.headers"
                    :key="h"
                    class="py-2 px-2 whitespace-nowrap border-b dark:border-zinc-700"
                  >
                    {{ h }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
                <tr
                  v-for="(row, idx) in pointData.data"
                  :key="idx"
                  class="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                  :class="{
                    'bg-blue-100 dark:bg-blue-900/40': idx === selectedPointIdx,
                  }"
                  @click="onPointClick(idx)"
                >
                  <td v-for="(cell, ci) in row" :key="ci" class="py-1.5 px-2">
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-else
              class="flex h-full items-center justify-center text-slate-400 text-sm"
            >
              No point data available
            </div>
          </div>
        </div>
      </div>

      <div class="flex-[2] flex flex-col gap-3 min-w-[400px] h-full">
        <div
          class="flex-[3] bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col items-center justify-center relative bg-slate-50/30 dark:bg-zinc-900/30 min-h-[350px]"
        >
          <div
            v-if="!selectedRow"
            class="flex flex-col items-center text-slate-300 dark:text-zinc-700"
          >
            <i class="pi pi-arrow-left text-3xl mb-2"></i>
            <span class="text-sm font-medium">Select a wafer row</span>
          </div>
          <div
            v-else-if="isImageLoading"
            class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-10"
          >
            <ProgressSpinner style="width: 30px; height: 30px" />
            <span class="text-xs text-slate-400 mt-2">Loading Map...</span>
          </div>
          <div
            v-else-if="!pdfExists"
            class="text-slate-400 flex flex-col items-center gap-2 opacity-50"
          >
            <i class="pi pi-image text-3xl"></i
            ><span class="text-xs">No Map Image Available</span>
          </div>
          <div
            v-else
            class="relative w-full h-full p-4 flex items-center justify-center"
          >
            <img
              v-if="pdfImageUrl"
              :src="pdfImageUrl"
              class="max-w-full max-h-full object-contain rounded-full border-4 border-white dark:border-zinc-700 shadow-xl bg-black"
            />
            <div class="absolute inset-0 pointer-events-none">
              <div
                class="absolute top-0 bottom-0 left-1/2 w-px bg-red-500/30 transform -translate-x-1/2"
              ></div>
              <div
                class="absolute left-0 right-0 top-1/2 h-px bg-red-500/30 transform -translate-y-1/2"
              ></div>
            </div>
          </div>
          <div
            v-if="selectedRow && pdfExists"
            class="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-mono"
          >
            {{ selectedRow.lotId }}_#{{ selectedRow.waferId }} (PT:
            {{ selectedPointIdx + 1 }})
          </div>
        </div>

        <div
          class="flex-[2] bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col min-h-[200px]"
        >
          <div
            class="p-2 border-b border-slate-100 dark:border-zinc-800 font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <i class="pi pi-wave-pulse text-teal-500 text-sm"></i> Wave Spectrum
          </div>
          <div
            class="flex-1 overflow-auto p-0 flex flex-col items-center justify-center text-slate-400"
          >
            <div v-if="!selectedRow" class="opacity-50 text-sm">
              No selection
            </div>
            <div
              v-else-if="selectedPointIdx === -1"
              class="flex flex-col items-center opacity-50"
            >
              <i class="pi pi-chart-line text-xl mb-1"></i>
              <span class="text-sm">Select a point to view spectrum</span>
            </div>
            <div v-else class="w-full h-full p-0 overflow-auto">
              <table class="w-full text-sm text-center border-collapse">
                <thead
                  class="bg-slate-50 dark:bg-zinc-800 text-slate-500 sticky top-0 text-xs uppercase"
                >
                  <tr>
                    <th class="p-2 border-b dark:border-zinc-700">
                      Wavelength
                    </th>
                    <th class="p-2 border-b dark:border-zinc-700">Intensity</th>
                    <th class="p-2 border-b dark:border-zinc-700">
                      Reflectance
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
                  <tr
                    v-for="i in 8"
                    :key="i"
                    class="hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                  >
                    <td class="p-2 text-slate-600 dark:text-slate-400">
                      {{ 400 + i * 50 }}
                    </td>
                    <td class="p-2 text-slate-600 dark:text-slate-400">
                      {{ Math.random().toFixed(4) }}
                    </td>
                    <td class="p-2 text-slate-600 dark:text-slate-400">
                      {{ (Math.random() * 100).toFixed(2) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50 min-h-[400px]"
    >
      <div
        class="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 shadow-inner"
      >
        <i class="pi pi-search text-3xl text-slate-300 dark:text-zinc-600"></i>
      </div>
      <p class="font-medium text-sm">Please select filters and search.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import {
  waferApi,
  type WaferFlatDataDto,
  type StatisticsDto,
  type PointDataResponseDto,
} from "@/api/wafer";
import { equipmentApi } from "@/api/equipment";

// PrimeVue Components
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";

const filterStore = useFilterStore();
const showAdvanced = ref(false);
const isLoading = ref(false);
const hasSearched = ref(false);

// Filter State
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const filters = reactive({
  eqpId: "",
  lotId: "",
  waferId: "",
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  cassetteRcp: "",
  stageRcp: "",
  stageGroup: "",
  film: "",
});

// Options
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);
const lotIds = ref<string[]>([]);
const filteredLotIds = ref<string[]>([]);
const waferIds = ref<string[]>([]);
const filteredWaferIds = ref<string[]>([]);
const cassetteRcps = ref<string[]>([]);
const stageRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const films = ref<string[]>([]);

// Data
const flatData = ref<WaferFlatDataDto[]>([]);
const totalRecords = ref(0);
const selectedRow = ref<WaferFlatDataDto | null>(null);
const first = ref(0);
const rowsPerPage = ref(10);

// Detail
const isStatsLoading = ref(false);
const isPointsLoading = ref(false);
const isImageLoading = ref(false);
const statistics = ref<StatisticsDto | null>(null);
const pointData = ref<PointDataResponseDto>({ headers: [], data: [] });
const selectedPointIdx = ref(-1);
const pdfExists = ref(false);
const pdfImageUrl = ref<string | null>(null);

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  if (filterStore.selectedSite) {
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
    if (filterStore.selectedSdwt) loadEqpIds();
  }
});

const onSiteChange = async () => {
  if (filterStore.selectedSite)
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  else sdwts.value = [];
  filterStore.selectedSdwt = "";
  filters.eqpId = "";
};

const onSdwtChange = () => {
  filters.eqpId = "";
  loadEqpIds();
};

const loadEqpIds = async () => {
  if (filterStore.selectedSdwt)
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filterStore.selectedSdwt
    );
};

const onEqpSelect = async (event: any) => {
  const selectedEqp = event.value;
  filters.eqpId = selectedEqp;

  if (!selectedEqp) return;

  const [lots, wafers, cRcps, sRcps, sGrps, filmsList] = await Promise.all([
    waferApi.getDistinctValues("lotids", { eqpId: filters.eqpId }),
    waferApi.getDistinctValues("waferids", { eqpId: filters.eqpId }),
    waferApi.getDistinctValues("cassettercps", { eqpId: filters.eqpId }),
    waferApi.getDistinctValues("stagercps", { eqpId: filters.eqpId }),
    waferApi.getDistinctValues("stagegroups", { eqpId: filters.eqpId }),
    waferApi.getDistinctValues("films", { eqpId: filters.eqpId }),
  ]);
  lotIds.value = lots;
  filteredLotIds.value = lots;
  waferIds.value = wafers;
  filteredWaferIds.value = wafers;
  cassetteRcps.value = cRcps;
  stageRcps.value = sRcps;
  stageGroups.value = sGrps;
  films.value = filmsList;
};

const searchEqp = (e: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(e.query.toLowerCase())
  );
};
const searchLot = (e: any) => {
  const query = e.query.toLowerCase();
  filteredLotIds.value = query
    ? lotIds.value.filter((id) => id.toLowerCase().includes(query))
    : lotIds.value;
};
const searchWafer = (e: any) => {
  const query = e.query.toLowerCase();
  filteredWaferIds.value = query
    ? waferIds.value.filter((id) => id.toLowerCase().includes(query))
    : waferIds.value;
};

const searchData = async () => {
  first.value = 0;
  await loadDataGrid();
};

const loadDataGrid = async () => {
  isLoading.value = true;
  hasSearched.value = true;
  selectedRow.value = null;

  try {
    const res = await waferApi.getFlatData({
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      waferId: filters.waferId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      cassetteRcp: filters.cassetteRcp,
      stageRcp: filters.stageRcp,
      stageGroup: filters.stageGroup,
      film: filters.film,
      page: first.value / rowsPerPage.value,
      pageSize: rowsPerPage.value,
    });
    flatData.value = res.items;
    totalRecords.value = res.totalItems;
  } finally {
    isLoading.value = false;
  }
};

const onRowsChange = () => {
  first.value = 0;
  loadDataGrid();
};
const prevPage = () => {
  if (first.value > 0) {
    first.value -= rowsPerPage.value;
    loadDataGrid();
  }
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value) {
    first.value += rowsPerPage.value;
    loadDataGrid();
  }
};
const lastPage = () => {
  first.value =
    Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) *
    rowsPerPage.value;
  loadDataGrid();
};

const onRowSelect = async (event: any) => {
  const row = event.data;
  selectedRow.value = row;
  isStatsLoading.value = true;
  isPointsLoading.value = true;
  pdfExists.value = false;
  pdfImageUrl.value = null;
  selectedPointIdx.value = -1;
  statistics.value = null;
  pointData.value = { headers: [], data: [] };

  try {
    const params = { ...row, servTs: row.servTs };
    const [stats, pts, pdfCheck] = await Promise.all([
      waferApi.getStatistics(params),
      waferApi.getPointData(params),
      waferApi.checkPdf(row.eqpId, row.servTs),
    ]);
    statistics.value = stats;
    pointData.value = pts;
    pdfExists.value = pdfCheck;
  } finally {
    isStatsLoading.value = false;
    isPointsLoading.value = false;
  }
};

const onPointClick = (idx: number) => {
  selectedPointIdx.value = idx;
  if (pdfExists.value && selectedRow.value) {
    isImageLoading.value = true;
    pdfImageUrl.value = waferApi.getPdfImageUrl(
      selectedRow.value.eqpId,
      selectedRow.value.servTs,
      idx
    );
    setTimeout(() => {
      isImageLoading.value = false;
    }, 300);
  }
};

const resetFilters = () => {
  filters.eqpId = "";
  filters.lotId = "";
  filters.waferId = "";
  filters.cassetteRcp = "";
  filters.stageRcp = "";
  filters.stageGroup = "";
  filters.film = "";
  flatData.value = [];
  selectedRow.value = null;
  hasSearched.value = false;
  first.value = 0;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const yy = d.getFullYear().toString().slice(2);
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
};

const fmt = (num: number) => (num ? num.toFixed(3) : "0.000");
</script>

<style scoped>
/* [수정] HomeView와 동일하게 폰트 크기 상향 (text-sm) */
:deep(.p-datatable-thead > tr > th) {
  @apply font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-transparent uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-700;
}
:deep(.p-datatable-tbody > tr > td) {
  @apply p-3 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800/50;
}
:deep(.dark .p-datatable-tbody > tr:hover) {
  @apply !bg-[#27272a] !text-white;
}
/* [수정] 입력창 폰트 크기 text-sm (14px)로 변경 */
:deep(.custom-input) {
  @apply !bg-white dark:!bg-zinc-800 !border-slate-200 dark:!border-zinc-700 text-sm rounded-lg shadow-none hover:!border-teal-500 focus:!border-teal-500 h-10;
}
:deep(.p-select-label),
:deep(.p-autocomplete-input) {
  @apply !text-sm !p-2;
}
.animate-slide-left {
  animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
