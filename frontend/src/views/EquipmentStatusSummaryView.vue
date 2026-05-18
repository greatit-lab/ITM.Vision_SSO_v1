<!-- frontend/src/views/EquipmentStatusSummaryView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden relative p-2 md:p-4">
    
    <div class="relative z-10 flex flex-col items-center justify-between gap-3 md:flex-row mb-3 shrink-0">
      <div class="flex items-center gap-2 px-1">
        <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
          <i class="text-lg text-emerald-500 pi pi-table dark:text-emerald-400"></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Equipment Status Summary
          </h1>
          <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
            Agent installed equipment counts by Maker & Model
          </span>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="loadData" 
          class="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          :disabled="isLoading"
        >
          <i class="pi pi-refresh" :class="{'pi-spin': isLoading}"></i> Refresh
        </button>
      </div>
    </div>

    <div class="relative z-10 flex-1 min-h-0 w-full overflow-hidden flex flex-col gap-3">
      
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full w-full bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-slate-200 dark:border-zinc-800">
        <i class="pi pi-spin pi-spinner text-4xl text-emerald-500 mb-4"></i>
        <p class="text-xs font-bold text-slate-500 animate-pulse mt-2">Aggregating Data by Site & SDWT...</p>
      </div>

      <div v-else-if="pivotRows.length === 0" class="flex flex-col items-center justify-center h-full w-full opacity-50 bg-white border rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <i class="pi pi-database text-4xl text-slate-300 dark:text-zinc-600 mb-4"></i>
        <p class="text-sm font-bold text-slate-500">No agent installed equipment found.</p>
      </div>

      <div v-else class="w-full shrink-0 overflow-auto custom-scrollbar bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 transition-all duration-300 ease-in-out"
           :style="{ maxHeight: selectedSelection ? '55%' : '100%' }">
        <table class="w-full text-left border-collapse min-w-max bg-white dark:bg-zinc-900">
          <thead class="sticky top-0 z-20">
            <tr>
              <th rowspan="2" class="border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-center align-middle w-[120px]">
                Maker
              </th>
              <th rowspan="2" class="border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-center align-middle w-[140px]">
                Model
              </th>
              <th 
                v-for="site in pivotColumns" 
                :key="site.name" 
                :colspan="site.sdwts.length"
                class="border border-slate-200 dark:border-zinc-700 bg-slate-200 dark:bg-zinc-700/80 p-2 text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-center"
              >
                {{ site.name }}
              </th>
              <th rowspan="2" class="border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-center align-middle">
                TOTAL
              </th>
            </tr>
            <tr>
              <template v-for="site in pivotColumns" :key="'sdwt_'+site.name">
                <th 
                  v-for="sdwt in site.sdwts" 
                  :key="site.name + '_' + sdwt"
                  class="border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 p-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 text-center whitespace-nowrap"
                >
                  {{ sdwt }}
                </th>
              </template>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(row, index) in pivotRows" :key="index" class="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td 
                v-if="row.isFirstModel" 
                :rowspan="row.rowspan" 
                class="border border-slate-200 dark:border-zinc-700 p-3 text-xs font-extrabold align-middle text-center"
                :class="getMakerRowClass(row.maker)"
              >
                {{ row.maker }}
              </td>
              <td class="border border-slate-200 dark:border-zinc-700 p-3 text-xs font-bold text-slate-600 dark:text-slate-300 align-middle text-center">
                {{ row.model }}
              </td>
              <template v-for="site in pivotColumns" :key="'data_site_'+site.name">
                <td 
                  v-for="sdwt in site.sdwts" 
                  :key="'data_'+site.name+'_'+sdwt"
                  @click="if ((row.counts[`${site.name}_${sdwt}`] || 0) > 0) { handleCellClick(site.name, sdwt, row.maker, row.model); }"
                  class="border border-slate-200 dark:border-zinc-700 p-3 text-xs font-medium text-center transition-colors"
                  :class="(row.counts[`${site.name}_${sdwt}`] || 0) > 0 ? 'text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:!text-emerald-600 dark:hover:!text-emerald-400 font-bold hover:shadow-inner' : 'text-slate-400 dark:text-zinc-600'"
                  :title="(row.counts[`${site.name}_${sdwt}`] || 0) > 0 ? 'Click to view specific equipment' : ''"
                >
                  {{ row.counts[`${site.name}_${sdwt}`] || '-' }}
                </td>
              </template>
              <td class="border border-slate-200 dark:border-zinc-700 bg-emerald-50/30 dark:bg-emerald-900/10 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center">
                {{ row.total }}
              </td>
            </tr>
          </tbody>

          <tfoot class="sticky bottom-0 z-20">
            <tr>
              <td colspan="2" class="border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 text-xs font-extrabold text-slate-800 dark:text-white text-center uppercase tracking-wider shadow-[0_-1px_0_0_rgba(0,0,0,0.1)]">
                Grand Total
              </td>
              <template v-for="site in pivotColumns" :key="'foot_site_'+site.name">
                <td 
                  v-for="sdwt in site.sdwts" 
                  :key="'foot_'+site.name+'_'+sdwt"
                  @click="if ((grandTotals[`${site.name}_${sdwt}`] || 0) > 0) { handleSdwtClick(site.name, sdwt); }"
                  class="border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/80 p-3 text-xs font-bold text-slate-800 dark:text-slate-200 text-center transition-colors shadow-[0_-1px_0_0_rgba(0,0,0,0.1)]"
                  :class="(grandTotals[`${site.name}_${sdwt}`] || 0) > 0 ? 'cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-500' : ''"
                  title="Click to view all equipment in this SDWT"
                >
                  {{ grandTotals[`${site.name}_${sdwt}`] || 0 }}
                </td>
              </template>
              <td 
                @click="if ((grandTotals['_all'] || 0) > 0) { handleAllClick(); }"
                class="border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 text-sm font-extrabold text-emerald-700 dark:text-emerald-400 text-center transition-colors shadow-[0_-1px_0_0_rgba(0,0,0,0.1)]"
                :class="(grandTotals['_all'] || 0) > 0 ? 'cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 underline underline-offset-2 decoration-emerald-500' : ''"
                title="Click to view all equipment"
              >
                {{ grandTotals['_all'] || 0 }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <transition name="slide-up">
        <div v-if="selectedSelection" class="w-full flex-1 min-h-0 flex flex-col bg-white dark:bg-zinc-900 border border-emerald-400 shadow-md rounded-xl dark:border-emerald-600 overflow-hidden transition-all duration-300">
          
          <div class="flex items-center justify-between p-3 border-b border-emerald-100 dark:border-zinc-800 bg-emerald-50/50 dark:bg-zinc-800/80 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <i class="pi pi-list text-emerald-600 dark:text-emerald-400 text-xs"></i>
              </div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ detailTitle }}</h3>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold tracking-widest shadow-sm">
                TOTAL: {{ detailData.length }}
              </span>
            </div>
            <button @click="selectedSelection = null" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors focus:outline-none">
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
          
          <div class="flex-1 overflow-auto custom-scrollbar p-4 bg-white dark:bg-zinc-900">
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-4 items-start">
              
              <table class="w-full text-left border-collapse bg-white dark:bg-zinc-900">
                <thead class="sticky top-0 bg-slate-100 dark:bg-zinc-800 shadow-sm">
                  <tr>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center w-12 uppercase">No.</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center uppercase">EQP ID</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center w-24 uppercase">Maker</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center uppercase">Model</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center w-20 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in leftDetailData" :key="item.eqpId" class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-medium text-slate-400 text-center">{{ idx + 1 }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-center">{{ item.eqpId }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-extrabold text-center" :class="getMakerTextColor(item.__maker)">{{ item.__maker }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-bold text-slate-600 dark:text-slate-300 text-center">{{ item.__model }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs text-center">
                      <span class="inline-flex items-center justify-center font-bold uppercase tracking-wider text-[10px]" :class="item.isOnline ? 'text-emerald-500' : 'text-slate-400'">
                        {{ item.isOnline ? 'On' : 'Off' }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="detailData.length === 0">
                    <td colspan="5" class="border border-slate-200 dark:border-zinc-700 p-6 text-center text-xs text-slate-500 dark:text-slate-400">선택된 장비 정보가 없습니다.</td>
                  </tr>
                </tbody>
              </table>

              <table v-if="rightDetailData.length > 0" class="w-full text-left border-collapse bg-white dark:bg-zinc-900">
                <thead class="sticky top-0 bg-slate-100 dark:bg-zinc-800 shadow-sm">
                  <tr>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center w-12 uppercase">No.</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center uppercase">EQP ID</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center w-24 uppercase">Maker</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center uppercase">Model</th>
                    <th class="border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 text-center w-20 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in rightDetailData" :key="item.eqpId" class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-medium text-slate-400 text-center">{{ idx + 1 + leftDetailData.length }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-center">{{ item.eqpId }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-extrabold text-center" :class="getMakerTextColor(item.__maker)">{{ item.__maker }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs font-bold text-slate-600 dark:text-slate-300 text-center">{{ item.__model }}</td>
                    <td class="border border-slate-200 dark:border-zinc-700 p-2 text-xs text-center">
                      <span class="inline-flex items-center justify-center font-bold uppercase tracking-wider text-[10px]" :class="item.isOnline ? 'text-emerald-500' : 'text-slate-400'">
                        {{ item.isOnline ? 'On' : 'Off' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              
            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { getEquipmentDetails, type EquipmentDto } from "@/api/equipment";

// ==========================================
// Types & State
// ==========================================

// 타입 강화를 위한 확장 인터페이스 선언
interface EnrichedEquipment extends EquipmentDto {
  __site: string;
  __sdwt: string;
  __maker: string;
  __model: string;
}

interface SiteColumn {
  name: string;
  sdwts: string[];
}

interface PivotRow {
  maker: string;
  model: string;
  isFirstModel: boolean;
  rowspan: number;
  counts: Record<string, number>;
  total: number;
}

const isLoading = ref(false);
const rawEquipmentList = ref<EnrichedEquipment[]>([]);

const pivotColumns = ref<SiteColumn[]>([]);
const pivotRows = ref<PivotRow[]>([]);

// Detail View State
const selectedSelection = ref<string | null>(null);
const detailTitle = ref("");
const detailData = ref<EnrichedEquipment[]>([]);

// ==========================================
// Lifecycle
// ==========================================
onMounted(() => {
  loadData();
});

// ==========================================
// Logic
// ==========================================
const loadData = async () => {
  isLoading.value = true;
  selectedSelection.value = null; 
  try {
    const sites = await dashboardApi.getSites();
    const fetchedSdwtsMap: Record<string, string[]> = {};
    const allEquipment: EnrichedEquipment[] = [];

    for (const site of sites) {
      const sdwts = await dashboardApi.getSdwts(site);
      fetchedSdwtsMap[site] = sdwts;
      
      const promises = sdwts.map(sdwt => 
        getEquipmentDetails({ site, sdwt })
          .then(eqList => {
            const mapped = eqList.map(eq => ({
              ...eq,
              __site: site,
              __sdwt: sdwt,
              __maker: '',
              __model: ''
            } as EnrichedEquipment));
            allEquipment.push(...mapped);
          })
          .catch(err => {
            console.error(`Failed to load equipment for ${site}/${sdwt}`, err);
          })
      );
      
      await Promise.all(promises);
    }

    rawEquipmentList.value = allEquipment;
    buildPivotData(sites, fetchedSdwtsMap);

  } catch (error) {
    console.error("Failed to load equipment data", error);
  } finally {
    isLoading.value = false;
  }
};

const buildPivotData = (sitesList: string[], sdwtsMap: Record<string, string[]>) => {
  const siteMap: Record<string, Set<string>> = {};
  sitesList.forEach(s => {
    const arr = sdwtsMap[s];
    siteMap[s] = new Set<string>(arr ? arr : []);
  });

  const makerModelMap: Record<string, Record<string, Record<string, number>>> = {};

  rawEquipmentList.value.forEach(eq => {
    const site = eq.__site || 'Unassigned Site';
    const sdwt = eq.__sdwt || 'Unassigned SDWT';
    
    let maker = eq.type ? eq.type.trim().toUpperCase() : 'UNKNOWN';
    let model = formatSystemModel(eq.systemModel, eq.version);

    if (!model || model === '-' || model.trim() === '') {
      model = 'Other';
    }

    // 마킹
    eq.__maker = maker;
    eq.__model = model;

    // Site > Sdwt 맵
    let sSet = siteMap[site];
    if (!sSet) {
      sSet = new Set<string>();
      siteMap[site] = sSet;
    }
    sSet.add(sdwt);

    // Maker > Model 맵 (안전한 객체 할당)
    let makerObj = makerModelMap[maker];
    if (!makerObj) {
      makerObj = {};
      makerModelMap[maker] = makerObj;
    }
    
    let modelObj = makerObj[model];
    if (!modelObj) {
      modelObj = { _total: 0 };
      makerObj[model] = modelObj;
    }

    const dataKey = `${site}_${sdwt}`;
    modelObj[dataKey] = (modelObj[dataKey] || 0) + 1;
    modelObj['_total'] = (modelObj['_total'] || 0) + 1;
  });

  const orderedSites = [...sitesList];
  Object.keys(siteMap).forEach(s => {
    if (!orderedSites.includes(s)) orderedSites.push(s);
  });

  pivotColumns.value = orderedSites.map(s => {
    const originalSdwts = sdwtsMap[s] || [];
    const actualSdwtsSet = siteMap[s] || new Set<string>();
    
    const finalSdwts: string[] = [];
    
    originalSdwts.forEach(sdwt => {
      if (actualSdwtsSet.has(sdwt)) {
        finalSdwts.push(sdwt);
        actualSdwtsSet.delete(sdwt);
      }
    });
    actualSdwtsSet.forEach(sdwt => finalSdwts.push(sdwt));
    
    return { name: s, sdwts: finalSdwts };
  }).filter(c => c.sdwts.length > 0);

  const rows: PivotRow[] = [];
  const orderedMakers = ['ONTO', 'NOVA']; 
  
  Object.keys(makerModelMap).forEach(m => {
    if (!orderedMakers.includes(m)) orderedMakers.push(m);
  });

  orderedMakers.forEach(maker => {
    const makerObj = makerModelMap[maker];
    if (!makerObj) return;

    const models = Object.keys(makerObj).sort();
    
    const otherIdx = models.indexOf('Other');
    if (otherIdx > -1) {
      models.splice(otherIdx, 1);
      models.push('Other');
    }

    models.forEach((model, index) => {
      const modelData = makerObj[model] ? makerObj[model] : undefined;
      const counts = modelData || { _total: 0 };
      rows.push({
        maker: maker,
        model: model,
        isFirstModel: index === 0,
        rowspan: models.length,
        counts: counts,
        total: counts['_total'] || 0
      });
    });
  });

  pivotRows.value = rows;
};

const grandTotals = computed(() => {
  const totals: Record<string, number> = { _all: 0 };
  
  pivotRows.value.forEach(row => {
    totals['_all'] = (totals['_all'] ?? 0) + row.total;
    pivotColumns.value.forEach(site => {
      site.sdwts.forEach(sdwt => {
        const key = `${site.name}_${sdwt}`;
        totals[key] = (totals[key] ?? 0) + (row.counts[key] ?? 0);
      });
    });
  });
  
  return totals;
});

// ==========================================
// Handlers (Detail View)
// ==========================================

const leftDetailData = computed(() => {
  if (detailData.value.length === 0) return [];
  const half = Math.ceil(detailData.value.length / 2);
  return detailData.value.slice(0, half);
});

const rightDetailData = computed(() => {
  if (detailData.value.length === 0) return [];
  const half = Math.ceil(detailData.value.length / 2);
  return detailData.value.slice(half);
});

const handleSdwtClick = (site: string, sdwt: string) => {
  selectedSelection.value = `SDWT_${site}_${sdwt}`;
  detailTitle.value = `[${site}] ${sdwt} - All Equipment`;
  detailData.value = rawEquipmentList.value.filter(eq => eq.__site === site && eq.__sdwt === sdwt);
};

const handleCellClick = (site: string, sdwt: string, maker: string, model: string) => {
  selectedSelection.value = `CELL_${site}_${sdwt}_${maker}_${model}`;
  detailTitle.value = `[${site}] ${sdwt} - ${maker} / ${model}`;
  detailData.value = rawEquipmentList.value.filter(eq => 
    eq.__site === site && 
    eq.__sdwt === sdwt && 
    eq.__maker === maker && 
    eq.__model === model
  );
};

const handleAllClick = () => {
  selectedSelection.value = `ALL`;
  detailTitle.value = `All Equipment (Grand Total)`;
  detailData.value = rawEquipmentList.value;
};

// ==========================================
// Utilities
// ==========================================
const formatSystemModel = (model?: string | null, version?: string | null) => {
  if (!model) return "-";
  if (model.toUpperCase() === "IMPULSE" && version) {
    const majorVersion = parseInt(version.split('.')[0] || "0", 10);
    if (!isNaN(majorVersion) && majorVersion >= 11) {
      return "IMPULSE+";
    }
  }
  return model;
};

const getMakerRowClass = (maker: string) => {
  const upper = maker.toUpperCase();
  if (upper === 'ONTO') return 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300';
  if (upper === 'NOVA') return 'bg-sky-50/50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300';
  return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400';
};

const getMakerTextColor = (maker: string) => {
  const upper = maker.toUpperCase();
  if (upper === 'ONTO') return 'text-indigo-600 dark:text-indigo-400';
  if (upper === 'NOVA') return 'text-sky-600 dark:text-sky-400';
  return 'text-slate-500 dark:text-slate-400';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 6px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }

/* Slide-up transition for Flex Layout Panel */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  max-height: 1000px;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}
</style>
