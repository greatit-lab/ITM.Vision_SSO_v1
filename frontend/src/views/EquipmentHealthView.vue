<!-- frontend/src/views/EquipmentHealthView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-3 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i
          class="text-lg text-rose-500 pi pi-heart-fill dark:text-rose-400"
        ></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          ITM Health
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Predictive maintenance & condition scoring.
        </span>
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
    >
      <div class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1">
        <div class="min-w-[120px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filter.site }"
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filter.sdwt }"
            @change="onSdwtChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.eqpId"
            :options="eqpIds"
            :loading="isEqpIdLoading"
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            showClear
            filter
            resetFilterOnHide
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filter.eqpId }"
            @change="onEqpIdChange"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          label="Analyze"
          class="!px-4 !py-1.5 !text-xs !font-bold !rounded-lg !bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 hover:!opacity-90 transition-opacity"
          :loading="isLoading"
          :disabled="!filter.site"
          @click="fetchData"
        />
      </div>
    </div>

    <div
      v-if="filteredHealthData.length > 0"
      class="flex flex-col flex-1 min-h-0 gap-4 overflow-hidden animate-fade-in"
    >
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4 shrink-0">
        <div
          class="relative flex items-center justify-between p-3 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="absolute top-0 right-0 w-16 h-16 -mr-2 -mt-2 transition-transform bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full group-hover:scale-110"
          ></div>
          <div>
            <p
              class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Avg Health Score
            </p>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-2xl font-black text-slate-800 dark:text-white"
                >{{ avgScore }}</span
              >
              <span class="text-[10px] font-bold text-slate-400">/ 100</span>
            </div>
          </div>
          <div
            class="flex items-center justify-center w-10 h-10 text-indigo-500 rounded-full bg-indigo-50 dark:bg-indigo-900/30"
          >
            <i class="text-lg pi pi-chart-bar"></i>
          </div>
        </div>

        <div
          class="relative flex items-center justify-between p-3 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="absolute top-0 right-0 w-16 h-16 -mr-2 -mt-2 transition-transform bg-rose-500/5 rounded-bl-full group-hover:scale-110"
          ></div>
          <div>
            <p
              class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Critical Units
            </p>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-2xl font-black text-rose-500">{{
                criticalCount
              }}</span>
              <span class="text-[10px] font-bold text-slate-400">Assets</span>
            </div>
          </div>
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 animate-pulse"
          >
            <i class="text-lg pi pi-exclamation-triangle"></i>
          </div>
        </div>

        <div
          class="relative flex items-center justify-between p-3 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="absolute top-0 right-0 w-16 h-16 -mr-2 -mt-2 transition-transform bg-amber-500/5 rounded-bl-full group-hover:scale-110"
          ></div>
          <div>
            <p
              class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Warnings
            </p>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-2xl font-black text-amber-500">{{
                warningCount
              }}</span>
              <span class="text-[10px] font-bold text-slate-400">Assets</span>
            </div>
          </div>
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500"
          >
            <i class="text-lg pi pi-exclamation-circle"></i>
          </div>
        </div>

        <div
          class="relative flex items-center justify-between p-3 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="absolute top-0 right-0 w-16 h-16 -mr-2 -mt-2 transition-transform bg-emerald-500/5 rounded-bl-full group-hover:scale-110"
          ></div>
          <div>
            <p
              class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Healthy
            </p>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-2xl font-black text-emerald-500">{{
                goodCount
              }}</span>
              <span class="text-[10px] font-bold text-slate-400">Assets</span>
            </div>
          </div>
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500"
          >
            <i class="text-lg pi pi-check-circle"></i>
          </div>
        </div>
      </div>

      <div class="flex flex-1 gap-3 overflow-hidden min-h-0">
        <div
          class="flex flex-col overflow-hidden bg-white border shadow-sm w-72 dark:bg-[#111111] border-slate-200 dark:border-zinc-800 rounded-xl shrink-0"
        >
          <div
            class="sticky top-0 z-10 p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 backdrop-blur-sm"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-200"
              >
                Assets Ranking
              </h3>
              <i class="text-xs pi pi-sort-amount-down text-slate-400"></i>
            </div>
          </div>
          <div class="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
            <div
              v-for="item in filteredHealthData"
              :key="item.eqpId"
              @click="selectedEqp = item"
              class="relative flex items-center justify-between p-3 transition-all duration-200 border rounded-lg cursor-pointer group"
              :class="
                selectedEqp?.eqpId === item.eqpId
                  ? 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'
              "
            >
              <div
                class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                :class="getStatusColor(item.status)"
              ></div>

              <div class="flex items-center gap-3 pl-2">
                <div
                  class="flex items-center justify-center w-8 h-8 text-xs font-bold text-white border shadow-sm rounded-lg"
                  :class="getScoreBadgeClass(item.totalScore)"
                >
                  {{ item.totalScore }}
                </div>
                <div>
                  <p
                    class="text-xs font-bold transition-colors text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  >
                    {{ item.eqpId }}
                  </p>
                  <p class="text-[10px] font-medium text-slate-400">
                    {{ item.status }} Condition
                  </p>
                </div>
              </div>
              <i
                class="pi pi-chevron-right text-[10px] text-slate-300 group-hover:text-slate-500 transition-colors"
              ></i>
            </div>
            
            <div v-if="filteredHealthData.length === 0" class="p-4 text-center">
               <p class="text-xs text-slate-400">No matching equipment found.</p>
            </div>
          </div>
        </div>

        <div
          v-if="selectedEqp"
          class="flex flex-col flex-1 min-w-0 gap-3 pr-1 overflow-y-auto custom-scrollbar"
        >
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[320px] shrink-0">
            <div
              class="relative flex flex-col items-center justify-center col-span-1 p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800"
            >
              <div class="absolute flex items-center gap-2 top-4 left-4">
                <div
                  class="w-1 h-3 rounded-full"
                  :class="getStatusColor(selectedEqp.status)"
                ></div>
                <h3
                  class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide"
                >
                  Total Health Score
                </h3>
              </div>
              <div class="relative w-full h-full">
                <EChart :option="gaugeOption" class="w-full h-full" />
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center mt-8 pointer-events-none"
                >
                  <h2
                    class="text-4xl font-black tracking-tighter"
                    :class="getStatusTextColor(selectedEqp.status)"
                  >
                    {{ selectedEqp.totalScore }}
                  </h2>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1"
                    :class="getStatusBadgeClass(selectedEqp.status)"
                  >
                    {{ selectedEqp.status }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="col-span-1 lg:col-span-2 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 relative"
            >
              <div class="absolute flex items-center gap-2 top-4 left-4">
                <div class="w-1 h-3 bg-indigo-500 rounded-full"></div>
                <h3
                  class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide"
                >
                  Factor Balance Analysis (5-Axis)
                </h3>
              </div>
              <EChart :option="radarOption" class="w-full h-full" />
            </div>
          </div>

          <h3
            class="mt-2 mb-1 pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
          >
            Diagnostic Factors
          </h3>
          <div
            class="grid grid-cols-1 gap-3 pb-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            <div
              class="relative group p-4 transition-all bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800 hover:shadow-md overflow-hidden"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Reliability
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">Error frequency</p>
                </div>
                <div
                  class="flex items-center justify-center w-8 h-8 text-indigo-500 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"
                >
                  <i class="pi pi-shield"></i>
                </div>
              </div>
              <div class="flex items-baseline justify-between mb-2">
                <span
                  class="text-2xl font-black text-slate-800 dark:text-white"
                  >{{ selectedEqp.factors.reliability
                  }}<span class="text-sm font-medium text-slate-400"
                    >/30</span
                  ></span
                >
                <span class="text-xs font-bold text-slate-500"
                  >{{ selectedEqp.details.errorCount }} Errors</span
                >
              </div>
              <div
                class="w-full h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
              >
                <div
                  class="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000"
                  :style="{
                    width:
                      (selectedEqp.factors.reliability / 30) * 100 + '%',
                  }"
                ></div>
              </div>
              <div
                class="absolute inset-0 z-10 hidden items-center justify-center p-4 text-center bg-black/80 group-hover:flex animate-fade-in"
              >
                <p class="text-xs font-bold leading-relaxed text-white">
                  에러 빈도 기반의<br />신뢰성 점수입니다.
                </p>
              </div>
            </div>

            <div
              class="relative group p-4 transition-all bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800 hover:shadow-md overflow-hidden"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Performance
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">
                    System resource load
                  </p>
                </div>
                <div
                  class="flex items-center justify-center w-8 h-8 text-teal-500 rounded-lg bg-teal-50 dark:bg-teal-900/20"
                >
                  <i class="pi pi-bolt"></i>
                </div>
              </div>
              <div class="flex items-baseline justify-between mb-2">
                <span
                  class="text-2xl font-black text-slate-800 dark:text-white"
                  >{{ selectedEqp.factors.performance
                  }}<span class="text-sm font-medium text-slate-400"
                    >/20</span
                  ></span
                >
                <span class="text-xs font-bold text-slate-500"
                  >{{
                    selectedEqp.details.avgResourceUsage.toFixed(1)
                  }}% Load</span
                >
              </div>
              <div
                class="w-full h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
              >
                <div
                  class="bg-teal-500 h-1.5 rounded-full transition-all duration-1000"
                  :style="{
                    width:
                      (selectedEqp.factors.performance / 20) * 100 + '%',
                  }"
                ></div>
              </div>
              <div
                class="absolute inset-0 z-10 hidden items-center justify-center p-4 text-center bg-black/80 group-hover:flex animate-fade-in"
              >
                <p class="text-xs font-bold leading-relaxed text-white">
                  시스템 리소스(CPU/메모리)<br />부하 상태입니다.
                </p>
              </div>
            </div>

            <div
              class="relative group p-4 transition-all bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800 hover:shadow-md overflow-hidden"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Component
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">Lamp life usage</p>
                </div>
                <div
                  class="flex items-center justify-center w-8 h-8 text-amber-500 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                >
                  <i class="pi pi-sun"></i>
                </div>
              </div>
              <div class="flex items-baseline justify-between mb-2">
                <span
                  class="text-2xl font-black text-slate-800 dark:text-white"
                  >{{ selectedEqp.factors.component
                  }}<span class="text-sm font-medium text-slate-400"
                    >/20</span
                  ></span
                >
                <span class="text-xs font-bold text-slate-500"
                  >{{
                    selectedEqp.details.lampUsageRatio.toFixed(1)
                  }}% Used</span
                >
              </div>
              <div
                class="w-full h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
              >
                <div
                  class="bg-amber-500 h-1.5 rounded-full transition-all duration-1000"
                  :style="{
                    width: (selectedEqp.factors.component / 20) * 100 + '%',
                  }"
                ></div>
              </div>
              <div
                class="absolute inset-0 z-10 hidden items-center justify-center p-4 text-center bg-black/80 group-hover:flex animate-fade-in"
              >
                <p class="text-xs font-bold leading-relaxed text-white">
                  주요 부품(램프)의<br />수명 상태입니다.
                </p>
              </div>
            </div>

            <div
              class="relative group p-4 transition-all bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800 hover:shadow-md overflow-hidden"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Stability
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">Temp volatility</p>
                </div>
                <div
                  class="flex items-center justify-center w-8 h-8 text-rose-500 rounded-lg bg-rose-50 dark:bg-rose-900/20"
                >
                  <i class="pi pi-chart-line"></i>
                </div>
              </div>
              <div class="flex items-baseline justify-between mb-2">
                <span
                  class="text-2xl font-black text-slate-800 dark:text-white"
                  >{{ selectedEqp.factors.stability
                  }}<span class="text-sm font-medium text-slate-400"
                    >/10</span
                  ></span
                >
                <span class="text-xs font-bold text-slate-500"
                  >±{{
                    selectedEqp.details.tempVolatility.toFixed(1)
                  }}°C</span
                >
              </div>
              <div
                class="w-full h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
              >
                <div
                  class="bg-rose-500 h-1.5 rounded-full transition-all duration-1000"
                  :style="{
                    width: (selectedEqp.factors.stability / 10) * 100 + '%',
                  }"
                ></div>
              </div>
              <div
                class="absolute inset-0 z-10 hidden items-center justify-center p-4 text-center bg-black/80 group-hover:flex animate-fade-in"
              >
                <p class="text-xs font-bold leading-relaxed text-white">
                  온도 변동성에 따른<br />장비 안정성입니다.
                </p>
              </div>
            </div>

            <div
              class="relative group p-4 transition-all bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800 hover:shadow-md overflow-hidden"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    Optical
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Intensity health
                  </p>
                </div>
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-500"
                >
                  <i class="pi pi-eye"></i>
                </div>
              </div>
              <div class="flex items-baseline justify-between mb-2">
                <span
                  class="text-2xl font-black text-slate-800 dark:text-white"
                >
                  {{ selectedEqp.factors.optical }}<span class="text-sm font-medium text-slate-400"
                    >/20</span
                  >
                </span>
                <span class="text-xs font-bold text-slate-500">
                  Avg {{ selectedEqp.details.avgIntensity }}
                </span>
              </div>
              <div
                class="w-full h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
              >
                <div
                  class="h-1.5 rounded-full transition-all duration-1000 bg-violet-500"
                  :style="{
                    width:
                      (selectedEqp.factors.optical / 20) * 100 +
                      '%',
                  }"
                ></div>
              </div>
              <div
                class="absolute inset-0 z-10 hidden items-center justify-center p-4 text-center bg-black/80 group-hover:flex animate-fade-in"
              >
                <p class="text-xs font-bold leading-relaxed text-white">
                  광학계 조도(Intensity)<br />건전성입니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm text-slate-300 select-none"
        >
          <i class="mb-4 text-5xl opacity-50 pi pi-search"></i>
          <p class="text-sm font-bold">Select an equipment from the list</p>
        </div>
      </div>
    </div>

    <div
      v-else-if="isLoading"
      class="flex flex-col items-center justify-center flex-1 space-y-4"
    >
      <div class="relative">
        <div
          class="w-12 h-12 border-4 rounded-full border-slate-100 dark:border-zinc-800"
        ></div>
        <div
          class="absolute top-0 left-0 w-12 h-12 border-4 rounded-full border-rose-500 border-t-transparent animate-spin"
        ></div>
      </div>
      <p class="text-xs font-bold text-slate-400 animate-pulse">
        Analyzing System Health...
      </p>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i
          class="text-4xl pi pi-heart text-slate-300 dark:text-zinc-600"
        ></i>
      </div>
      <p class="text-sm font-bold text-slate-500">
        System Health Diagnosis
      </p>
      <p class="text-xs">Select Site and click Analyze to start.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, reactive, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { healthApi, type EquipmentHealthDto } from "@/api/health";
import { equipmentApi } from "@/api/equipment";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import Button from "primevue/button";

const authStore = useAuthStore();
const LS_KEYS = {
  SITE: "health-view-site",
  SDWT: "health-view-sdwt",
  EQPID: "health-view-eqpid", 
};

const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "", 
});

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]); 
const isEqpIdLoading = ref(false); 

const healthData = ref<EquipmentHealthDto[]>([]);
const selectedEqp = ref<EquipmentHealthDto | null>(null);
const isLoading = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver;

// Computed - EQP ID 필터링
const filteredHealthData = computed(() => {
  if (!filter.eqpId) return healthData.value;
  return healthData.value.filter((item) => item.eqpId === filter.eqpId);
});

const avgScore = computed(() => {
  if (healthData.value.length === 0) return 0;
  const total = healthData.value.reduce(
    (sum, item) => sum + item.totalScore,
    0
  );
  return Math.round(total / healthData.value.length);
});
const criticalCount = computed(
  () => healthData.value.filter((i) => i.status === "Critical").length
);
const warningCount = computed(
  () => healthData.value.filter((i) => i.status === "Warning").length
);
const goodCount = computed(
  () => healthData.value.filter((i) => i.status === "Good").length
);

onMounted(async () => {
  sites.value = await dashboardApi.getSites();

  let targetSite = localStorage.getItem(LS_KEYS.SITE) || "";
  let targetSdwt = "";

  if (targetSite) {
    targetSdwt = localStorage.getItem(LS_KEYS.SDWT) || "";
  } else {
    targetSite = authStore.user?.site || "";
    targetSdwt = authStore.user?.sdwt || "";
  }

  if (targetSite && sites.value.includes(targetSite)) {
    filter.site = targetSite;
    try {
      sdwts.value = await dashboardApi.getSdwts(targetSite);
      
      if (targetSdwt && sdwts.value.includes(targetSdwt)) {
        filter.sdwt = targetSdwt;
        await loadEqpIds();
        const savedEqpId = localStorage.getItem(LS_KEYS.EQPID) || "";
        if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
            filter.eqpId = savedEqpId;
        }

        fetchData();
      } else {
        filter.sdwt = "";
        filter.eqpId = "";
      }
    } catch (e) {
      console.error("Failed to restore filter state:", e);
    }
  }

  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => {
      if (mu.attributeName === "class")
        isDarkMode.value =
          document.documentElement.classList.contains("dark");
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});

watch(
  () => filter.site,
  (newVal) => {
    if (newVal) localStorage.setItem(LS_KEYS.SITE, newVal);
    else localStorage.removeItem(LS_KEYS.SITE);
  }
);

watch(
  () => filter.sdwt,
  (newVal) => {
    if (newVal) localStorage.setItem(LS_KEYS.SDWT, newVal);
    else localStorage.removeItem(LS_KEYS.SDWT);
  }
);

watch(
  () => filter.eqpId,
  (newVal) => {
    if (newVal) localStorage.setItem(LS_KEYS.EQPID, newVal);
    else localStorage.removeItem(LS_KEYS.EQPID);
    
    if (newVal && healthData.value.length > 0) {
        const target = healthData.value.find(item => item.eqpId === newVal);
        if(target) selectedEqp.value = target;
    }
  }
);

const onSiteChange = async () => {
  if (filter.site) {
    sdwts.value = await dashboardApi.getSdwts(filter.site);
  } else {
    sdwts.value = [];
  }
  filter.sdwt = "";
  filter.eqpId = "";
  eqpIds.value = [];
};

const onSdwtChange = async () => {
    if (filter.sdwt) {
        await loadEqpIds();
    } else {
        eqpIds.value = [];
    }
    filter.eqpId = "";
};

const onEqpIdChange = () => {
    // Watcher handles logic
};

const loadEqpIds = async () => {
    if (!filter.sdwt) return;
    isEqpIdLoading.value = true;
    try {
        eqpIds.value = await equipmentApi.getEqpIds({
            sdwt: filter.sdwt,
            type: "agent" 
        });
    } catch(e) {
        console.error("Failed to load Eqp IDs", e);
        eqpIds.value = [];
    } finally {
        isEqpIdLoading.value = false;
    }
}

const fetchData = async () => {
  if (!filter.site) return;
  isLoading.value = true;
  selectedEqp.value = null;
  try {
    const res = await healthApi.getSummary(filter.site, filter.sdwt);
    healthData.value = res;

    if (healthData.value.length > 0) {
        if (filter.eqpId) {
            const target = healthData.value.find(item => item.eqpId === filter.eqpId);
            selectedEqp.value = target ?? healthData.value[0] ?? null;
        } else {
            selectedEqp.value = healthData.value[0] ?? null;
        }
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const getStatusColor = (status: string) => {
  if (status === "Critical") return "bg-rose-500";
  if (status === "Warning") return "bg-amber-500";
  return "bg-emerald-500";
};
const getStatusTextColor = (status: string) => {
  if (status === "Critical") return "text-rose-500";
  if (status === "Warning") return "text-amber-500";
  return "text-emerald-500";
};
const getScoreBadgeClass = (score: number) => {
  if (score < 60) return "bg-rose-500 border-rose-600";
  if (score < 80) return "bg-amber-500 border-amber-600";
  return "bg-emerald-500 border-emerald-600";
};
const getStatusBadgeClass = (status: string) => {
  if (status === "Critical")
    return "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400";
  if (status === "Warning")
    return "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400";
  return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400";
};

// --- Chart Options ---
const gaugeOption = computed(() => {
  if (!selectedEqp.value) return {};
  const score = selectedEqp.value.totalScore;
  let color = "#10b981"; // emerald
  if (score < 60) color = "#f43f5e"; // rose
  else if (score < 80) color = "#f59e0b"; // amber

  return {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 4,
        radius: "100%",
        center: ["50%", "70%"],
        itemStyle: { color: color },
        progress: { show: true, width: 25, roundCap: true },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 25,
            color: [[1, isDarkMode.value ? "#27272a" : "#f1f5f9"]],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: score }] 
      },
    ],
  };
});

const radarOption = computed(() => {
  if (!selectedEqp.value) return {};
  const textColor = isDarkMode.value ? "#a1a1aa" : "#64748b";
  const gridColor = isDarkMode.value ? "#3f3f46" : "#e2e8f0";

  const factors = selectedEqp.value.factors;
  const data = [
    (factors.reliability / 30) * 100, 
    (factors.performance / 20) * 100, 
    (factors.component / 20) * 100,   
    (factors.stability / 10) * 100,   
    (factors.optical / 20) * 100, 
  ];

  return {
    radar: {
      indicator: [
        { name: "신뢰성 (Reliability)", max: 100 },
        { name: "성능 (Performance)", max: 100 },
        { name: "부품 (Component)", max: 100 },
        { name: "안정성 (Stability)", max: 100 },
        { name: "광학 (Optical)", max: 100 },
      ],
      center: ["50%", "50%"],
      radius: "65%",
      splitNumber: 4,
      axisName: {
        color: textColor,
        fontSize: 10,
        fontWeight: "bold",
        fontFamily: "sans-serif",
      },
      splitLine: { lineStyle: { color: gridColor } },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDarkMode.value
            ? ["#18181b", "#111111"]
            : ["#f8fafc", "#ffffff"],
        },
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: data,
            name: "Factors",
            symbol: "circle",
            symbolSize: 6,
            itemStyle: { color: "#6366f1" },
            areaStyle: { color: "rgba(99, 102, 241, 0.2)" },
            lineStyle: { width: 2 },
          },
        ],
      },
    ],
  };
});
</script>

<style scoped>
/* [수정] 폰트 크기 13px로 통일 */
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3; /* Changed from 12px to 13px */
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
