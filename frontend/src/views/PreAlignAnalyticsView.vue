<!-- frontend/src/views/PreAlignAnalyticsView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B]"
  >
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i
          class="text-lg text-indigo-500 pi pi-compass dark:text-indigo-400"
        ></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          PreAlign Data
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Precision alignment trend analysis.
        </span>
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
    >
      <div
        class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSdwtChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.eqpId"
            :options="eqpIds"
            filter
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            :loading="isEqpLoading"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.endDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-indigo-500 !border-indigo-500 hover:!bg-indigo-600 !w-8 !h-8 !text-xs"
          @click="search"
          :loading="isLoading"
          :disabled="!filter.eqpId"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.left="'Reset'"
          @click="reset"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div
      class="flex flex-col h-[726px] shrink-0 overflow-hidden bg-white border shadow-
