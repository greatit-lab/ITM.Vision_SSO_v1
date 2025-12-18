<!-- frontend/src/views/admin/MenuManagementView.vue -->
<template>
  <div class="min-h-screen p-6 space-y-6 animate-fade-in-up">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <i class="pi pi-shield mr-2 text-indigo-500"></i>Menu Permissions
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          역할(Role)별 메뉴 접근 권한을 관리합니다. 변경 사항은 저장 버튼을 눌러 반영하세요.
        </p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="handleSave"
          :disabled="isSaving"
          class="px-4 py-2 text-sm font-bold text-white transition-all bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
          <i v-else class="pi pi-save mr-2"></i>
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <div class="border rounded-2xl bg-white/60 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 backdrop-blur-md overflow-hidden shadow-sm">
      
      <div class="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/80 overflow-x-auto scrollbar-hide">
        <button 
          v-for="role in roles" 
          :key="role"
          @click="selectedRole = role"
          class="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap outline-none focus:outline-none"
          :class="selectedRole === role 
            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' 
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          {{ role }}
        </button>
      </div>

      <div class="p-4 relative min-h-[400px]">
        
        <div v-if="store.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          <i class="pi pi-spin pi-spinner text-4xl text-indigo-500"></i>
        </div>

        <TreeTable 
          :value="store.allMenus" 
          class="p-treetable-sm custom-treetable" 
          :autoLayout="true"
          :expandedKeys="expandedKeys"
        >
          <Column field="label" header="Menu Structure" expander>
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i :class="[slotProps.node.data.icon || 'pi pi-file', 'text-slate-400']"></i>
                <span class="font-medium text-slate-700 dark:text-slate-200">
                  {{ slotProps.node.data.label }}
                </span>
                <span v-if="slotProps.node.data.statusTag" 
                      class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {{ slotProps.node.data.statusTag }}
                </span>
              </div>
            </template>
          </Column>
          
          <Column field="routerPath" header="Route Path">
            <template #body="slotProps">
               <span v-if="slotProps.node.data.routerPath" class="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                 {{ slotProps.node.data.routerPath }}
               </span>
               <span v-else class="text-xs text-slate-300 dark:text-zinc-600 italic">Group Header</span>
            </template>
          </Column>

          <Column header="Access Allowed" class="w-32 text-center">
             <template #body="slotProps">
                <div @click="togglePermission(slotProps.node)" 
                     class="relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-300 ease-in-out border border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                     :class="hasPermission(slotProps.node) ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-zinc-700'"
                >
                  <span class="inline-block w-4 h-4 transform bg-white rounded-full transition duration-300 ease-in-out ml-1 shadow-sm"
                        :class="hasPermission(slotProps.node) ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </div>
             </template>
          </Column>
        </TreeTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import { useMenuManagementStore } from '@/stores/menuManagement';

const store = useMenuManagementStore();

// DB에 정의된 역할(Role) 목록 (필요시 API로 동적 로딩 가능)
const roles = ref(['USER', 'ENGINEER', 'MANAGER', 'ADMIN', 'GUEST']);
const selectedRole = ref('USER');
const isSaving = ref(false);

// TreeTable 모두 펼치기 위한 키 관리
const expandedKeys = ref<Record<string, boolean>>({});

// 권한 확인 함수
const hasPermission = (node: any) => {
  const menuId = node.data.menuId;
  const currentRolePerms = store.rolePermissions[selectedRole.value] || [];
  return currentRolePerms.includes(menuId);
};

// 권한 토글 함수 (로컬 상태만 변경, 저장은 Save 버튼)
const togglePermission = (node: any) => {
  const menuId = node.data.menuId;
  const currentRole = selectedRole.value;
  
  // 현재 Role의 권한 배열 복사 (Reactivity 보장)
  let perms = [...(store.rolePermissions[currentRole] || [])];
  
  const index = perms.indexOf(menuId);
  if (index === -1) {
    perms.push(menuId);
  } else {
    perms.splice(index, 1);
  }

  store.rolePermissions[currentRole] = perms;
};

// 저장 핸들러
const handleSave = async () => {
  isSaving.value = true;
  try {
    const currentRole = selectedRole.value;
    const menuIds = store.rolePermissions[currentRole] || [];
    
    await store.saveChanges(currentRole, menuIds);
    alert(`[${currentRole}] 권한 설정이 성공적으로 저장되었습니다.`);
  } catch (error) {
    console.error(error);
    alert('저장 중 오류가 발생했습니다.');
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  await store.loadManagementData();
  
  // 모든 노드 펼치기
  const expandAll = (nodes: any[]) => {
    for (const node of nodes) {
      expandedKeys.value[node.key] = true;
      if (node.children) expandAll(node.children);
    }
  };
  expandAll(store.allMenus);
});
</script>

<style scoped>
/* PrimeVue TreeTable Override for Glassmorphism & Clean Look */
:deep(.p-treetable) .p-treetable-tbody > tr > td {
  @apply border-b border-slate-100 dark:border-zinc-800 bg-transparent text-sm py-4 transition-colors duration-200;
}

:deep(.p-treetable) .p-treetable-thead > tr > th {
  @apply bg-slate-50/50 dark:bg-zinc-900/50 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-800 backdrop-blur-sm;
}

:deep(.p-treetable-toggler) {
  @apply text-slate-400 hover:text-indigo-500 w-8 h-8 mr-2 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800;
}

/* Row Hover Effect */
:deep(.p-treetable) .p-treetable-tbody > tr:hover > td {
  @apply bg-slate-50/50 dark:bg-zinc-800/30;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
