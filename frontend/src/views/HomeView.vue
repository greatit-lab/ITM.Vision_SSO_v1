<!-- frontend/src/views/HomeView.vue -->
<template>
  <div
    ref="siteOverviewWrapper"
    class="absolute inset-0 flex flex-col overflow-hidden transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans"
    :class="{ 'p-4': isFullscreen }"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0 pt-2">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i class="text-lg text-indigo-500 pi pi-objects-column"></i>
        </div>

        <div class="flex items-baseline gap-2">
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Site Overview
          </h1>
          <span
            class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >
            System performance summary.
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <div 
          v-if="isFullscreen" 
          class="flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111111] rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-all animate-fade-in"
        >
          <i class="text-[11px] text-indigo-500 dark:text-indigo-400 pi pi-clock animate-pulse"></i>
          <span class="text-[11px] font-mono font-bold text-slate-600 dark:text-zinc-300">
            {{ currentTime }}
          </span>
        </div>

        <div
          v-if="hasSearched && !isSummaryLoading"
          class="flex items-center gap-2 px-3 py-1 transition-all border rounded-full bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/50 animate-pulse"
        >
          <span class="relative flex w-1.5 h-1.5">
            <span
              class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-rose-400"
            ></span>
            <span
              class="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"
            ></span>
          </span>
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400"
          >
            LIVE
          </span>
        </div>
      </div>
    </div>

    <div
      class="mb-4 shrink-0 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm transition-colors duration-300"
    >
      <div
        class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filterStore.selectedSite"
            :options="sites"
            placeholder="Select Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSite }"
            showClear
            @change="onSiteChanged"
            :disabled="isSummaryLoading || isRefreshing"
          ></Select>
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filterStore.selectedSdwt"
            :options="sdwts"
            placeholder="Select SDWT"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSdwt }"
            :disabled="!filterStore.selectedSite || isSummaryLoading || isRefreshing"
            showClear
            @change="onSdwtChange"
          ></Select>
        </div>
      </div>

      <div class="flex items-center">
        <button 
          @click="toggleFullscreen" 
          class="flex items-center gap-1.5 px-2.5 py-1.5 mr-2 bg-slate-50 dark:bg-zinc-800/80 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-all z-20"
          title="현황판 모드 (단축키: Ctrl + I)"
        >
          <i :class="isFullscreen ? 'pi pi-window-minimize text-rose-500' : 'pi pi-window-maximize text-indigo-500'"></i>
          <span class="hidden md:inline">{{ isFullscreen ? '현황판 종료' : '현황판 모드' }}</span>
        </button>

        <div
          class="flex items-center gap-1 pl-2 pr-1 border-l border-slate-100 dark:border-zinc-800"
        >
          <div v-if="hasSearched && !isSummaryLoading" class="flex items-center justify-center w-8">
            <span
              class="text-[10px] font-bold font-mono text-center inline-block w-full transition-colors"
              :class="isRefreshing ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'"
              >{{ isRefreshing ? '...' : refreshCount + 's' }}</span>
          </div>
          <Button
            icon="pi pi-sync"
            rounded
            text
            severity="secondary"
            @click="manualRefresh"
            :disabled="!hasSearched || isSummaryLoading || isRefreshing"
            v-tooltip.left="'Refresh Now'"
            class="!w-7 !h-7 transition-colors"
            :class="isRefreshing ? '!text-indigo-500 dark:!text-indigo-400 animate-spin' : '!text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300'"
          ></Button>
        </div>
      </div>
    </div>

    <div
      v-if="!hasSearched"
      class="flex flex-col items-center justify-center flex-1 border-2 border-dashed fade-in border-slate-200 dark:border-zinc-800 rounded-3xl min-h-[300px] mb-4 mx-1"
    >
      <div
        class="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"
      >
        <i class="text-lg pi pi-search"></i>
      </div>
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
        Ready to Analyze
      </h3>
      <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
        Please select a <b>Site</b> and <b>SDWT</b> to view the dashboard.
      </p>
    </div>

    <div v-else-if="isSummaryLoading" class="flex flex-col flex-1 relative fade-in overflow-hidden">
      <div class="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
        <div class="flex flex-col items-center justify-center p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-900/30 mb-20 transform scale-105 transition-all">
          <ProgressSpinner style="width: 45px; height: 45px" strokeWidth="4" animationDuration="1s"></ProgressSpinner>
          <h3 class="mt-5 text-[15px] font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            데이터를 조회하는 중입니다
          </h3>
          <p class="mt-1.5 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
            Loading Dashboard Data
          </p>
        </div>
      </div>

      <div class="flex flex-col flex-1 opacity-40 pointer-events-none select-none transition-opacity duration-300 overflow-hidden">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5 shrink-0 mb-4 p-1">
          <div v-for="i in 5" :key="i" class="h-20 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 p-3 flex justify-between items-center relative overflow-hidden shadow-sm">
             <div class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-zinc-800/50 to-transparent"></div>
             <div class="space-y-2 z-10">
               <div class="w-20 h-2.5 rounded bg-slate-200 dark:bg-zinc-700/80"></div>
               <div class="w-12 h-6 rounded bg-slate-200 dark:bg-zinc-700/80"></div>
             </div>
             <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800/80 z-10"></div>
          </div>
        </div>
        
        <div class="flex flex-col items-center justify-between px-2 md:flex-row gap-3 shrink-0 mb-3">
          <div class="w-48 h-5 rounded bg-slate-200 dark:bg-zinc-800/80 relative overflow-hidden">
             <div class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-zinc-700/30 to-transparent"></div>
          </div>
          <div class="w-64 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800/80 relative overflow-hidden">
             <div class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-zinc-700/30 to-transparent"></div>
          </div>
        </div>
        
        <div class="flex-1 overflow-hidden pl-1 pr-2 pt-1 pb-4">
          <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
            <div v-for="i in rowsPerPage" :key="i" class="h-[148px] rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 p-2 relative overflow-hidden flex flex-col shadow-sm">
                <div class="absolute top-0 left-0 w-full h-2 bg-slate-200 dark:bg-zinc-700"></div>
                <div class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-zinc-800/50 to-transparent"></div>
                
                <div class="flex justify-between items-start mt-2.5 px-1 z-10">
                  <div class="w-16 h-4 rounded bg-slate-200 dark:bg-zinc-700/80"></div>
                  <div class="w-12 h-4 rounded-full bg-slate-200 dark:bg-zinc-700/80"></div>
                </div>
                <div class="w-24 h-2 rounded bg-slate-100 dark:bg-zinc-800 mt-2 mx-1 z-10"></div>
                <div class="w-full h-[38px] rounded bg-slate-50 dark:bg-zinc-800/50 mt-2 z-10 border border-slate-100 dark:border-zinc-800"></div>
                <div class="w-full h-2 rounded bg-slate-200 dark:bg-zinc-700/80 mt-auto mx-1 z-10 max-w-[80%]"></div>
                <div class="w-full h-2 rounded bg-slate-200 dark:bg-zinc-700/80 mt-2 mb-1 mx-1 z-10 max-w-[60%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col flex-1 overflow-hidden fade-in">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5 shrink-0 mb-4 p-1">
        <div
          @click="setActiveFilter('All')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'All'
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-indigo-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'All'
                    ? 'text-indigo-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Total Agents
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="
                  activeFilter === 'All'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                "
              >
                {{ summary.totalEqpCount }}
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'All'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-indigo-500'
              "
            >
              <i class="text-xl pi pi-server"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Online')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'Online'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-emerald-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Online'
                    ? 'text-emerald-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Online Agents ({{ summary.serverHealth }}%)
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="
                  activeFilter === 'Online'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                "
              >
                {{ summary.onlineAgentCount }}
                <span class="text-xs font-medium opacity-70"
                  >/ {{ summary.totalEqpCount }}</span
                >
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'Online'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-emerald-500'
              "
            >
              <i class="text-xl pi pi-wifi"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Offline')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'Offline'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 ring-2 ring-offset-2 ring-rose-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-rose-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Offline'
                    ? 'text-rose-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Offline Agents
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="[
                  activeFilter === 'Offline'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white',
                  activeFilter !== 'Offline' && summary.inactiveAgentCount > 0
                    ? '!text-rose-500'
                    : '',
                ]"
              >
                {{ summary.inactiveAgentCount }}
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'Offline'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-rose-500'
              "
            >
              <i class="text-xl pi pi-ban"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Alarm')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'Alarm'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-amber-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Alarm'
                    ? 'text-amber-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                TODAY ERRORS
              </p>
              <div class="flex items-baseline gap-1.5">
                <p
                  class="text-2xl font-black tracking-tight"
                  :class="
                    activeFilter === 'Alarm'
                      ? 'text-white'
                      : 'text-slate-700 dark:text-white'
                  "
                >
                  {{ summary.todayErrorCount }}
                  <span
                    class="text-[10px] font-medium opacity-80"
                    v-if="summary.todayErrorTotalCount > 0"
                  >
                    (Total: {{ summary.todayErrorTotalCount }})
                  </span>
                </p>
                <span
                  v-if="summary.newAlarmCount > 0"
                  class="px-1 py-0.5 text-[9px] font-bold rounded"
                  :class="
                    activeFilter === 'Alarm'
                      ? 'bg-white/30 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  "
                  >+{{ summary.newAlarmCount }}</span
                >
              </div>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'Alarm'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-amber-500'
              "
            >
              <i class="text-xl pi pi-bell"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('TimeSync')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'TimeSync'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 ring-2 ring-offset-2 ring-pink-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-pink-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'TimeSync'
                    ? 'text-pink-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Time Sync Err
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="[
                  activeFilter === 'TimeSync'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white',
                  activeFilter !== 'TimeSync' && timeSyncErrorCount > 0
                    ? '!text-pink-500'
                    : '',
                ]"
              >
                {{ timeSyncErrorCount }}
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'TimeSync'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-pink-500'
              "
            >
              <i class="text-xl pi pi-clock"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-between px-2 md:flex-row shrink-0 mb-3">
        <div class="flex items-center gap-2 mb-2 md:mb-0">
          <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
          <h3 class="text-base font-bold text-slate-800 dark:text-white">
            Agent Status Monitoring
          </h3>
          <span
            class="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500"
          >
            ({{ totalRecords }} Machines)
          </span>
        </div>

        <div
          class="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-500 bg-white border rounded-lg shadow-sm dark:text-slate-400 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
        >
          <div class="flex items-center gap-2">
            <span class="font-medium">Rows:</span>
            <select
              v-model="rowsPerPage"
              class="px-1 py-0.5 font-medium border rounded cursor-pointer bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              @change="first = 0"
            >
              <option :value="30">30</option>
              <option :value="60">60</option>
              <option :value="90">90</option>
              <option :value="120">120</option>
            </select>
          </div>
          <div class="w-px h-3 mx-1 bg-slate-200 dark:bg-zinc-700"></div>
          <span class="font-medium min-w-[60px] text-right">
            {{ totalRecords === 0 ? 0 : first + 1 }} -
            {{ Math.min(first + rowsPerPage, totalRecords) }}
          </span>
          <div class="flex items-center gap-1 ml-1">
            <button
              @click="first = 0"
              :disabled="first === 0"
              class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <i class="pi pi-angle-double-left"></i>
            </button>
            <button
              @click="prevPage"
              :disabled="first === 0"
              class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <i class="pi pi-angle-left"></i>
            </button>
            <button
              @click="nextPage"
              :disabled="first + rowsPerPage >= totalRecords"
              class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <i class="pi pi-angle-right"></i>
            </button>
            <button
              @click="lastPage"
              :disabled="first + rowsPerPage >= totalRecords"
              class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <i class="pi pi-angle-double-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 pl-1 pt-1">
        <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(210px,1fr))] content-start">
          <div
            v-for="agent in displayedAgents"
            :key="agent.eqpId"
            class="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800 rounded-xl hover:shadow-lg group hover:-translate-y-1"
          >
            <div
              class="absolute top-0 left-0 w-full h-2 transition-colors duration-300"
              :class="getStatusBarClass(agent)"
            ></div>

            <div class="flex flex-col h-full gap-1 p-1.5 pt-2.5">
              <div class="flex items-start justify-between">
                
                <div class="min-w-0 pr-1 flex-1">
                  <h4 class="flex items-center gap-1.5 text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 min-w-0">
                    <span class="truncate">{{ agent.eqpId }}</span>
                    <img
                      v-if="isImageType(agent.type)"
                      :src="getTypeLogoUrl(agent.type)"
                      :alt="agent.type || ''"
                      class="object-contain w-auto h-3 drop-shadow-sm shrink-0"
                      :title="agent.type || ''"
                    />
                    <span
                      v-else
                      class="px-1 py-[1px] rounded text-[10px] scale-90 origin-left font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-zinc-700 shrink-0"
                    >
                      {{ agent.type || "Unknown" }}
                    </span>
                  </h4>
                  
                  <div
                    class="flex items-center mt-1 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 w-full origin-left scale-[0.88]"
                    title="Click to copy IP"
                    @click="copyToClipboard(agent)"
                  >
                    <i 
                      class="text-[8px] shrink-0 mr-1 transition-colors duration-300"
                      :class="copiedAgentId === agent.eqpId ? 'pi pi-check text-emerald-500' : 'pi pi-globe text-slate-400'"
                    ></i>

                    <span
                      class="text-[8.5px] font-mono whitespace-nowrap tracking-tight transition-all duration-300"
                      :class="copiedAgentId === agent.eqpId ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'"
                    >
                      {{ agent.ipAddress }}
                    </span>

                    <span 
                      v-if="copiedAgentId === agent.eqpId" 
                      class="ml-1 text-[8.5px] font-bold text-emerald-500 animate-pulse"
                    >
                      Copied!
                    </span>

                    <span
                      v-if="agent.useProxy === 'Y' && copiedAgentId !== agent.eqpId"
                      class="ml-1 px-1 py-[0.5px] text-[6.5px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-sm dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800 shadow-sm leading-none shrink-0"
                    >
                      PROXY
                    </span>
                  </div>
                </div>

                <div class="flex flex-col items-end gap-0.5 shrink-0">
                  <span
                    class="px-1.5 py-[1px] text-[10px] scale-90 origin-right font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border shadow-sm whitespace-nowrap"
                    :class="getStatusBadgeClass(agent)"
                    @click.stop="openErrorPopup(agent)"
                  >
                    <i :class="getStatusIcon(agent)" class="text-[9px]"></i>
                    {{ getStatusLabel(agent) }}
                  </span>
                  <span
                    class="text-[10px] scale-90 origin-right font-mono font-bold flex items-center gap-1 transition-colors whitespace-nowrap"
                    :class="getAgentVerStyle(agent.appVersion)"
                  >
                    {{ agent.appVersion }}
                  </span>
                </div>
              </div>

              <div
                class="grid grid-cols-5 gap-1 text-[10px] scale-95 origin-left w-[105%]"
              >
                <div
                  class="flex items-center justify-between col-span-5 p-1 border rounded bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800"
                >
                  <span
                    class="flex items-center gap-1 font-semibold text-slate-400 shrink-0"
                    ><i class="text-[9px] pi pi-microsoft"></i> OS</span
                  >
                  <span
                    class="ml-1 font-medium truncate text-slate-600 dark:text-slate-300 w-0 flex-1 text-right"
                    :class="getOsStyle(agent.os).text"
                  >
                    {{ formatOperatingSystem(agent.os, agent.systemType) }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between col-span-3 p-1 overflow-hidden border rounded bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800"
                >
                  <span
                    class="font-semibold text-slate-400 text-[9px] whitespace-nowrap flex items-center gap-1 shrink-0"
                  >
                    <i class="pi pi-desktop text-[9px]"></i> PC
                  </span>
                  <span
                    class="ml-1 font-medium text-right truncate text-slate-600 dark:text-slate-300 w-0 flex-1"
                    :title="agent.pcName"
                    >{{ agent.pcName }}</span
                  >
                </div>

                <div
                  class="flex items-center justify-between col-span-2 p-1 overflow-hidden border rounded bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800"
                >
                  <span
                    v-tooltip.top="'+: Agent Fast, -: Agent Slow'"
                    class="flex items-center gap-1 font-semibold text-slate-400 text-[9px] whitespace-nowrap cursor-help hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
                  >
                    <i class="text-[9px] pi pi-clock"></i>
                  </span>
                  <span
                    class="ml-1 font-mono font-bold text-right truncate w-0 flex-1"
                    :class="getClockDriftColor(agent.clockDrift)"
                  >
                    {{ formatTimeDifference(agent.clockDrift) }}
                  </span>
                </div>
              </div>

              <div
                class="pt-1.5 mt-auto border-t border-dashed border-slate-200 dark:border-zinc-800 cursor-pointer group/chart scale-95 origin-left w-[105%]"
                @click="openChart(agent)"
              >
                <div class="flex items-center gap-1 mb-1">
                  <span class="text-[9px] font-bold text-slate-400 w-6 shrink-0"
                    >CPU</span
                  >
                  <div
                    class="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                  >
                    <div
                      class="h-full transition-all duration-500 bg-blue-500 rounded-full"
                      :style="{ width: `${Math.min(agent.cpuUsage, 100)}%` }"
                    ></div>
                  </div>
                  <span
                    class="text-[9px] font-mono text-right text-slate-500 w-8 shrink-0"
                    >{{ agent.cpuUsage.toFixed(0) }}%</span
                  >
                </div>

                <div class="flex items-center gap-1">
                  <span class="text-[9px] font-bold text-slate-400 w-6 shrink-0"
                    >MEM</span
                  >
                  <div
                    class="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                  >
                    <div
                      class="h-full transition-all duration-500 bg-teal-500 rounded-full"
                      :style="{
                        width: `${Math.min(agent.memoryUsage, 100)}%`,
                      }"
                    ></div>
                  </div>
                  <span
                    class="text-[9px] font-mono text-right text-slate-500 w-8 shrink-0"
                    >{{ agent.memoryUsage.toFixed(0) }}%</span
                  >
                </div>
              </div>

              <div
                class="flex items-center justify-between pt-1 text-[9px] scale-95 origin-left w-[105%]"
              >
                <span class="text-slate-400 shrink-0">Last Contact</span>
                <span
                  class="font-mono font-medium truncate ml-1 text-right"
                  :class="
                    agent.isOnline
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-rose-500'
                  "
                >
                  {{ formatLastContact(agent.lastContact) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showChart"
      modal
      :header="(selectedAgentId || '') + ' 호기 Performance Trend (Last 24 Hours)'"
      :style="{ width: '80vw' }"
      class="backdrop-blur-xl"
      :dismissableMask="true"
    >
      <div
        class="h-[500px] w-full bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 relative"
      >
        <div
          v-if="isChartLoading"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/80 dark:bg-zinc-950/80"
        >
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4"></ProgressSpinner>
          <p class="mt-4 text-sm font-medium text-slate-500 animate-pulse">
            데이터를 불러오는 중입니다...
          </p>
        </div>

        <EChart
          v-if="!isChartLoading && chartData && chartData.length > 0"
          :option="chartOption"
        ></EChart>

        <div
          v-else-if="!isChartLoading && (!chartData || chartData.length === 0)"
          class="flex flex-col items-center justify-center h-full select-none text-slate-400"
        >
          <div
            class="flex items-center justify-center w-24 h-24 mb-4 rounded-full shadow-inner bg-slate-50 dark:bg-zinc-900"
          >
            <i
              class="text-4xl pi pi-chart-bar text-slate-300 dark:text-zinc-700"
            ></i>
          </div>
          <h3 class="mb-1 text-lg font-bold text-slate-600 dark:text-slate-300">
            데이터가 없습니다
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-500">
            선택된 장비의 최근 24시간 성능 로그가 존재하지 않습니다.
          </p>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showErrorPopup"
      modal
      :style="{ width: '40vw', minWidth: '400px' }"
      class="backdrop-blur-xl"
      :dismissableMask="true"
    >
      <template #header>
        <div class="flex items-center justify-between flex-1 pr-3">
          <span class="font-bold text-[1.125rem] text-slate-800 dark:text-white">
            {{ selectedErrorAgentId || '' }} 호기 최근 ERROR 상세 내역
          </span>
          <div class="px-2.5 py-1.5 text-[11px] font-black tracking-widest text-amber-800 bg-amber-100 border border-amber-300 rounded-md dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700 shadow-sm uppercase whitespace-nowrap flex items-baseline gap-1">
            <span>TODAY :</span>
            <span class="text-[15px] leading-none text-amber-900 dark:text-amber-300">{{ selectedErrorAgentCount }}</span>
            <span>건</span>
          </div>
        </div>
      </template>

      <div class="w-full bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 relative min-h-[300px] max-h-[60vh] overflow-y-auto">
        <div v-if="isErrorLogLoading" class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/80 dark:bg-zinc-950/80">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4"></ProgressSpinner>
          <p class="mt-4 text-sm font-medium text-slate-500 animate-pulse">
            에러 데이터를 불러오는 중입니다...
          </p>
        </div>

        <div v-else-if="errorLogs.length === 0" class="flex flex-col items-center justify-center h-[200px] text-slate-400">
          <div class="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-50 dark:bg-zinc-900">
            <i class="text-3xl pi pi-check-circle text-slate-300 dark:text-zinc-700"></i>
          </div>
          <h3 class="mb-1 text-base font-bold text-slate-600 dark:text-slate-300">발견된 알람이 없습니다</h3>
          <p class="text-xs text-slate-500">선택한 날짜에 조회된 에러 내역이 없습니다.</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="(log, idx) in errorLogs" :key="idx" class="p-3 border rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 transition-all hover:shadow-sm">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-[10px] font-bold text-white bg-amber-500 rounded-md">
                  {{ log.errorId }}
                </span>
                <span class="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {{ log.errorLabel }}
                </span>
              </div>
              <span class="text-[11px] font-mono font-medium text-slate-500 shrink-0">
                {{ log.timeStamp }}
              </span>
            </div>
            <p class="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ log.errorDesc }}</p>
            
            <div v-if="log.extraMessage1 || log.extraMessage2" class="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <p v-if="log.extraMessage1"><span class="font-semibold mr-1">Extra 1:</span> {{ log.extraMessage1 }}</p>
              <p v-if="log.extraMessage2"><span class="font-semibold mr-1">Extra 2:</span> {{ log.extraMessage2 }}</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { useAuthStore } from "@/stores/auth";
import {
  dashboardApi,
  type DashboardSummaryDto,
  type AgentStatusDto,
} from "@/api/dashboard";
import { performanceApi } from "@/api/performance";
import { getErrorLogs, type ErrorLogItem } from "@/api/error";

// 명확한 날짜 제어 및 타임존 동기화를 위해 dayjs 임포트
import dayjs from "dayjs";

import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";

const filterStore = useFilterStore();
const authStore = useAuthStore();

// ============================================================================
// 현황판 모드(전체화면) 및 실시간 디지털 시계, 키보드 단축키 제어 로직
// ============================================================================
const siteOverviewWrapper = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const currentTime = ref("");
let clockTimer: number | null = null;

const updateClock = () => {
  currentTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
};

const toggleFullscreen = async () => {
  if (!siteOverviewWrapper.value) return;
  if (!document.fullscreenElement) {
    try {
      await siteOverviewWrapper.value.requestFullscreen();
    } catch (err) {
      console.error("현황판 모드 진입 오류:", err);
    }
  } else {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
  if (isFullscreen.value) {
    updateClock();
    if (!clockTimer) {
      clockTimer = window.setInterval(updateClock, 1000);
    }
  } else {
    if (clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  }
};

// 키보드 단축키(Ctrl+I / Cmd+I) 이벤트 핸들러
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
    e.preventDefault(); // 브라우저 기본 동작 방지
    toggleFullscreen();
  }
};
// ============================================================================

const isSummaryLoading = ref(false); 
const isTableLoading = ref(false);
const isChartLoading = ref(false);
const isRefreshing = ref(false);
const hasSearched = ref(false);

const activeFilter = ref<"All" | "Online" | "Offline" | "Alarm" | "TimeSync">("All");

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);

const defaultSummary = {
  totalEqpCount: 0,
  onlineAgentCount: 0,
  todayErrorCount: 0,
  todayErrorTotalCount: 0,
  newAlarmCount: 0,
  latestAgentVersion: "",
  totalServers: 0,
  inactiveAgentCount: 0,
  totalSdwts: 0,
  serverHealth: 0,
};

const summary = ref<
  DashboardSummaryDto & {
    totalServers: number;
    inactiveAgentCount: number;
    totalSdwts: number;
    serverHealth: number;
  }
>({ ...defaultSummary });

const agentList = ref<AgentStatusDto[]>([]);
const showChart = ref(false);
const selectedAgentId = ref<string | null>(null);
const chartData = ref<any[]>([]);

const showErrorPopup = ref(false);
const selectedErrorAgentId = ref<string | null>(null);
const selectedErrorAgentCount = ref<number>(0);

const errorLogs = ref<ErrorLogItem[]>([]);
const isErrorLogLoading = ref(false);

const copiedAgentId = ref<string | null>(null);
let copyTimeout: number | null = null;

const refreshCount = ref(30);
let refreshTimer: number | null = null;

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const formatLastContact = (dateStr: string | null | undefined) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("YY-MM-DD HH:mm:ss");
};

onMounted(async () => {
  // 현황판 모드(전체화면) 관련 이벤트 리스너 등록
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  window.addEventListener("keydown", handleKeydown);

  try {
    sites.value = await dashboardApi.getSites();

    let targetSite = filterStore.selectedSite;
    let targetSdwt = filterStore.selectedSdwt;

    if (!targetSite) {
      if (authStore.user?.site) {
        targetSite = authStore.user.site;
        targetSdwt = authStore.user.sdwt || "";
      } else {
        targetSite = localStorage.getItem("dashboard_site") || "";
        targetSdwt = localStorage.getItem("dashboard_sdwt") || "";
      }
    }

    if (targetSite && sites.value.includes(targetSite)) {
      filterStore.selectedSite = targetSite;
      sdwts.value = await dashboardApi.getSdwts(targetSite);

      if (targetSdwt && sdwts.value.includes(targetSdwt)) {
        filterStore.selectedSdwt = targetSdwt;
        await loadData(true);
      } else {
        filterStore.selectedSdwt = "";
      }
    } else {
      filterStore.selectedSite = "";
      filterStore.selectedSdwt = "";
    }

    themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          isDarkMode.value =
            document.documentElement.classList.contains("dark");
        }
      });
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  } catch (e) {
    console.error(e);
  }
});

onUnmounted(() => {
  // 현황판 모드(전체화면) 이벤트 리스너 해제
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  window.removeEventListener("keydown", handleKeydown);
  if (clockTimer) clearInterval(clockTimer);
  
  stopAutoRefresh();
  if (themeObserver) themeObserver.disconnect();
  if (copyTimeout) clearTimeout(copyTimeout);
});

const onSiteChanged = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("dashboard_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("dashboard_site");
    sdwts.value = [];
  }
  filterStore.selectedSdwt = "";
  localStorage.removeItem("dashboard_sdwt");

  hasSearched.value = false;
  stopAutoRefresh();
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("dashboard_sdwt", filterStore.selectedSdwt);
    await loadData(true);
  } else {
    localStorage.removeItem("dashboard_sdwt");
    stopAutoRefresh();
  }
};

const loadData = async (isInitialLoad = true) => {
  if (!filterStore.selectedSite || !filterStore.selectedSdwt) return;

  if (isInitialLoad) {
    isSummaryLoading.value = true;
    isTableLoading.value = true;
    
    agentList.value = [];
    summary.value = { ...defaultSummary };
    first.value = 0; 
  } else {
    isRefreshing.value = true;
  }
  
  hasSearched.value = true;

  try {
    const [summaryRes, agentData] = await Promise.all([
      dashboardApi.getSummary(filterStore.selectedSite, filterStore.selectedSdwt).catch(e => {
        console.error("Summary load failed", e);
        return null;
      }),
      dashboardApi.getAgentStatus(filterStore.selectedSite, filterStore.selectedSdwt).catch(e => {
        console.error("Agent status load failed", e);
        return null;
      })
    ]);

    agentList.value = agentData || [];

    const total = agentList.value.length;
    const online = agentList.value.filter((a) => a.isOnline).length;
    const offline = total - online;

    let newSummary = { ...summary.value };
    if (summaryRes) {
      const fetchedData = ('data' in summaryRes) ? (summaryRes as any).data : summaryRes;
      newSummary = { ...newSummary, ...fetchedData };
    }

    summary.value = {
      ...newSummary,
      totalEqpCount: total,
      onlineAgentCount: online,
      inactiveAgentCount: offline,
      serverHealth: total > 0 ? Math.round((online / total) * 100) : 0,
    };

    if (isInitialLoad) startAutoRefresh();
  } catch (e) {
    console.error("Data load failed", e);
    if (isInitialLoad) {
      agentList.value = [];
      summary.value = { ...defaultSummary };
    }
  } finally {
    if (isInitialLoad) {
      isSummaryLoading.value = false;
      isTableLoading.value = false;
    } else {
      isRefreshing.value = false;
    }
  }
};

const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshCount.value = 30;

  refreshTimer = window.setInterval(() => {
    if (!isRefreshing.value) {
      refreshCount.value--;
      if (refreshCount.value <= 0) {
        refreshCount.value = 30;
        loadData(false); 
      }
    }
  }, 1000);
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const manualRefresh = () => {
  if (isRefreshing.value || isSummaryLoading.value) return;
  refreshCount.value = 30;
  loadData(false); 
};

const openChart = async (agent: AgentStatusDto) => {
  selectedAgentId.value = agent.eqpId;
  showChart.value = true;
  chartData.value = [];
  isChartLoading.value = true;

  const endDate = dayjs().toDate();
  const startDate = dayjs().subtract(24, 'hour').toDate();

  try {
    const data = await performanceApi.getHistory(
      startDate.toISOString(),
      endDate.toISOString(),
      [agent.eqpId],
      300,
    );
    chartData.value = data || [];
  } catch (e) {
    console.error("Failed to load chart data", e);
    chartData.value = [];
  } finally {
    isChartLoading.value = false;
  }
};

const openErrorPopup = async (agent: AgentStatusDto) => {
  if (agent.todayAlarmCount <= 0) return;

  selectedErrorAgentId.value = agent.eqpId;
  selectedErrorAgentCount.value = agent.todayAlarmCount;
  
  showErrorPopup.value = true;
  isErrorLogLoading.value = true;
  errorLogs.value = [];

  try {
    const startDateStr = dayjs().startOf('day').toISOString();
    const endDateStr = dayjs().endOf('day').toISOString();

    const response = await getErrorLogs({
      eqpId: agent.eqpId,
      startDate: startDateStr,
      endDate: endDateStr,
      page: 0,
      limit: 50,
      pageSize: 50
    });

    const responseData = response?.data || response;
    
    if (responseData && responseData.items) {
       errorLogs.value = responseData.items;
    } else if (Array.isArray(responseData)) {
       errorLogs.value = responseData; 
    }
  } catch (error) {
    console.error("Failed to load error logs:", error);
  } finally {
    isErrorLogLoading.value = false;
  }
};

const chartOption = computed(() => {
  if (!chartData.value || chartData.value.length === 0) return {};

  const timestamps = chartData.value.map((d) => d.timestamp);
  const cpuValues = chartData.value.map((d) => d.cpuUsage);
  const memValues = chartData.value.map((d) => d.memoryUsage);

  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const tooltipBg = isDarkMode.value
    ? "rgba(24, 24, 27, 0.9)"
    : "rgba(255, 255, 255, 0.9)";
  const tooltipBorder = isDarkMode.value ? "#3f3f46" : "#e2e8f0";
  const tooltipText = isDarkMode.value ? "#fff" : "#1e293b";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: {
        color: tooltipText,
      },
      axisPointer: { type: "cross", label: { backgroundColor: "#6b7280" } },
      formatter: (params: any) => {
        if (!params || !params[0]) return "";
        let html = `<div class="mb-1 font-bold" style="color:${tooltipText}">${params[0].axisValueLabel}</div>`;
        params.forEach((p: any) => {
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
          const val = typeof p.value === "number" ? p.value.toFixed(2) : "-";
          html += `<div style="color:${tooltipText}">${colorDot} ${p.seriesName}: ${val}%</div>`;
        });
        return html;
      },
    },
    legend: {
      data: ["CPU Usage", "Memory Usage"],
      bottom: 0,
      textStyle: { color: textColor },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timestamps.map((t: string) => {
        if (!t) return "";
        return dayjs(t).format("YY-MM-DD HH:mm");
      }),
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: "Usage (%)",
      min: 0,
      max: 100,
      axisLabel: { color: textColor },
      nameTextStyle: { color: textColor, padding: [0, 0, 0, 20] },
      splitLine: { show: true, lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: "CPU Usage",
        type: "line",
        data: cpuValues,
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 4,
        sampling: "lttb",
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0)" },
            ],
          },
        },
      },
      {
        name: "Memory Usage",
        type: "line",
        data: memValues,
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 4,
        sampling: "lttb",
        itemStyle: { color: "#10b981" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" },
            ],
          },
        },
      },
    ],
  };
});

const first = ref(0);
const rowsPerPage = ref(30);

const isImageType = (type: string | null) => {
  const lowerType = (type || "").toLowerCase();
  return lowerType === "onto" || lowerType === "nova";
};

const getTypeLogoUrl = (type: string | null) => {
  const lowerType = (type || "").toLowerCase();
  return `/images/${lowerType}.png`;
};

const filteredAgents = computed(() => {
  switch (activeFilter.value) {
    case "Online":
      return agentList.value.filter((a) => a.isOnline);
    case "Offline":
      return agentList.value.filter((a) => !a.isOnline);
    case "Alarm":
      return agentList.value.filter((a) => a.todayAlarmCount > 0);
    case "TimeSync":
      return agentList.value.filter((a) => Math.abs(a.clockDrift || 0) > 1800);
    default:
      return agentList.value;
  }
});

const displayedAgents = computed(() => {
  const start = first.value;
  const end = start + rowsPerPage.value;
  return filteredAgents.value.slice(start, end);
});

const timeSyncErrorCount = computed(() => {
  return agentList.value.filter((a) => Math.abs(a.clockDrift || 0) > 1800)
    .length;
});

const totalRecords = computed(() => filteredAgents.value.length);

const getAgentVerStyle = (ver: string | null) => {
  if (!ver) return "text-slate-400 dark:text-zinc-600";
  if (ver === summary.value.latestAgentVersion) {
    return "px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-300 shadow-sm";
  }
  return "text-slate-400 dark:text-zinc-500";
};

const prevPage = () => {
  if (first.value > 0) first.value -= rowsPerPage.value;
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value)
    first.value += rowsPerPage.value;
};
const lastPage = () => {
  first.value =
    Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) *
    rowsPerPage.value;
};

const setActiveFilter = (
  filter: "All" | "Online" | "Offline" | "Alarm" | "TimeSync",
) => {
  activeFilter.value = filter;
  first.value = 0;
};

const getOsStyle = (os: string | null) => {
  const lowerOs = (os || "").toLowerCase();
  if (lowerOs.includes("11"))
    return {
      badge:
        "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30",
      text: "text-indigo-700 dark:text-indigo-200 font-medium",
    };
  if (lowerOs.includes("10"))
    return {
      badge:
        "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
      text: "text-slate-700 dark:text-slate-200",
    };
  if (lowerOs.includes("7"))
    return {
      badge:
        "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
      text: "text-blue-700 dark:text-blue-200",
    };
  if (lowerOs.includes("server"))
    return {
      badge:
        "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600",
      text: "text-slate-600 dark:text-slate-400",
    };
  return {
    badge:
      "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    text: "text-gray-500 dark:text-gray-500",
  };
};

const getStatusLabel = (data: AgentStatusDto) => {
  if (!data.isOnline) return "Off";
  if (data.todayAlarmCount > 0) return "ERROR";
  return "Run";
};

const getStatusIcon = (data: AgentStatusDto) => {
  if (!data.isOnline) return "pi pi-question-circle";
  if (data.todayAlarmCount > 0) return "pi pi-exclamation-triangle";
  return "pi pi-shield";
};

const getStatusBadgeClass = (data: AgentStatusDto) => {
  if (!data.isOnline)
    return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
  if (data.todayAlarmCount > 0)
    return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:scale-105 transition-all";
  return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
};

const getStatusBarClass = (agent: AgentStatusDto) => {
  if (!agent.isOnline) return "bg-slate-300 dark:bg-zinc-700";
  if (agent.todayAlarmCount > 0) return "bg-amber-500"; 
  return "bg-emerald-500";
};

const copyToClipboard = async (agent: AgentStatusDto) => {
  if (!agent.ipAddress) return;
  try {
    await navigator.clipboard.writeText(agent.ipAddress);
    copiedAgentId.value = agent.eqpId;

    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = window.setTimeout(() => {
      copiedAgentId.value = null;
    }, 1500); 
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

const formatOperatingSystem = (os: string | null, sys: string | null) =>
  `${(os || "")
    .replace("Microsoft Windows", "Win")
    .replace("Professional", "Pro")
    .replace("Enterprise", "Ent")} ${(sys || "").replace(
    "-bit",
    "bit",
  )}`.trim();

const formatTimeDifference = (s: number | null | undefined) => {
  if (s == null) return "-";
  if (Math.abs(s) < 0.1) return "✔";

  const sign = s > 0 ? "-" : "+";
  const abs = Math.abs(s);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const sec = Math.floor(abs % 60);

  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");

  if (h > 0) {
    return `${sign}${h}:${mm}:${ss}`;
  } else {
    return `${sign}${m}:${ss}`;
  }
};

const getClockDriftColor = (s: number | null | undefined) => {
  if (s == null) return "text-slate-600 dark:text-slate-300";
  const absDrift = Math.abs(s);
  if (absDrift > 1800) return "text-red-500 dark:text-red-400 font-bold";
  if (absDrift > 600) return "text-orange-500 dark:text-orange-400 font-bold";
  return "text-slate-600 dark:text-slate-300";
};
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}

:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}

:deep(.custom-dropdown.small) {
  @apply h-7;
}

:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}

:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6;
}
:deep(.p-select-dropdown svg) {
  @apply w-3 h-3;
}

.fade-in {
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

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* 스크롤바 등 공통 스타일 복구 */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-zinc-700 rounded-full;
}
</style>

<style>
.custom-dropdown-panel .p-select-option {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
.custom-dropdown-panel .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
body .p-tooltip .p-tooltip-text {
  font-size: 10px !important;
  background-color: #64748b !important;
  white-space: nowrap !important;
  padding: 3px 6px !important;
}
body .p-tooltip .p-tooltip-arrow {
  border-top-color: #64748b !important;
  border-bottom-color: #64748b !important;
}

.custom-dropdown-panel.small .p-select-option {
  padding: 6px 10px !important;
  font-size: 12px !important;
}
.custom-dropdown-panel.small .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 12px !important;
}
</style>
