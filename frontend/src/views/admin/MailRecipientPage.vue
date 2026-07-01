<!-- frontend/src/views/admin/MailRecipientPage.vue -->
<template>
  <div
    class="flex flex-col w-full h-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden p-4"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 shrink-0">
      <div class="flex items-center gap-3">
        <div
          class="flex items-center justify-center w-10 h-10 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i
            class="text-xl text-blue-600 pi pi-envelope dark:text-blue-400"
          ></i>
        </div>
        <div>
          <h1
            class="text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white"
          >
            메일 알림 수신자 관리
          </h1>
          <p class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
            시스템 알림 메일을 받을 수신자를 등록하고 관리합니다
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          icon="pi pi-refresh"
          label="새로고침"
          text
          size="small"
          class="!text-slate-500 hover:!bg-slate-100 dark:hover:!bg-zinc-800 !text-xs"
          @click="loadData"
        />
        <Button
          icon="pi pi-plus"
          label="수신자 추가"
          size="small"
          class="!text-xs"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 min-h-0 gap-4">
      <!-- My Recipients -->
      <div
        class="flex flex-col flex-1 bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 shrink-0"
        >
          <i class="text-xs pi pi-user text-slate-500"></i>
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">
            내 등록 수신자
          </span>
          <span
            class="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            {{ myRecipients.length }}
          </span>
        </div>

        <div class="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <i class="text-2xl pi pi-spin pi-spinner text-slate-400"></i>
          </div>
          <div
            v-else-if="myRecipients.length === 0"
            class="flex flex-col items-center justify-center py-12 text-slate-400"
          >
            <i class="mb-2 text-3xl pi pi-envelope"></i>
            <p class="text-sm">등록된 수신자가 없습니다</p>
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="recipient in myRecipients"
              :key="recipient.id"
              class="flex items-center gap-3 p-3 transition-colors border rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50"
              :class="{ 'opacity-50': !recipient.isActive }"
            >
              <div
                class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900/30"
              >
                <i
                  class="text-sm text-blue-600 pi pi-user dark:text-blue-400"
                ></i>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium truncate text-slate-900 dark:text-white"
                >
                  {{ recipient.recipientName || recipient.recipientEmail }}
                </p>
                <p class="text-xs truncate text-slate-500">
                  {{ recipient.recipientEmail }}
                </p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <Button
                  icon="pi pi-pencil"
                  text
                  size="small"
                  @click="openEditDialog(recipient)"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDelete(recipient)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Recipients -->
      <div
        class="flex flex-col w-80 bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 shrink-0"
        >
          <i class="text-xs pi pi-globe text-slate-500"></i>
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">
            시스템 수신자
          </span>
          <span
            class="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400"
          >
            {{ systemRecipients.length }}
          </span>
        </div>

        <div class="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <div
            v-if="systemLoading"
            class="flex items-center justify-center py-12"
          >
            <i class="text-2xl pi pi-spin pi-spinner text-slate-400"></i>
          </div>
          <div
            v-else-if="systemRecipients.length === 0"
            class="flex flex-col items-center justify-center py-12 text-slate-400"
          >
            <i class="mb-2 text-3xl pi pi-globe"></i>
            <p class="text-sm">시스템 수신자가 없습니다</p>
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="recipient in systemRecipients"
              :key="recipient.id"
              class="flex items-center gap-3 p-3 border rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30"
              >
                <i
                  class="text-sm pi pi-globe text-emerald-600 dark:text-emerald-400"
                ></i>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium truncate text-slate-900 dark:text-white"
                >
                  {{ recipient.recipientName || recipient.recipientEmail }}
                </p>
                <p class="text-xs truncate text-slate-500">
                  {{ recipient.recipientEmail }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '수신자 수정' : '수신자 추가'"
      modal
      :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label
            class="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            이메일 주소 <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="form.recipientEmail"
            placeholder="abc123@samsung.com"
            :class="{ 'p-invalid': formErrors.email }"
          />
          <small v-if="formErrors.email" class="text-xs text-red-500">{{
            formErrors.email
          }}</small>
        </div>
        <div>
          <label
            class="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            이름
          </label>
          <InputText v-model="form.recipientName" placeholder="홍길동" />
        </div>
      </div>
      <template #footer>
        <Button label="취소" text @click="dialogVisible = false" />
        <Button
          :label="isEdit ? '수정' : '추가'"
          :disabled="!form.recipientEmail"
          @click="handleSubmit"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="수신자 삭제"
      modal
      :style="{ width: '400px' }"
    >
      <p class="text-slate-600 dark:text-slate-400">
        정말 이 수신자를 삭제하시겠습니까?
      </p>
      <p class="text-sm text-slate-500 dark:text-slate-500">
        {{ deleteTarget?.recipientEmail }}
      </p>
      <template #footer>
        <Button label="취소" text @click="deleteDialogVisible = false" />
        <Button label="삭제" severity="danger" @click="handleDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import { mailRecipientApi, type MailRecipient } from "../../api/mail-recipient";

// State
const loading = ref(false);
const systemLoading = ref(false);
const myRecipients = ref<MailRecipient[]>([]);
const systemRecipients = ref<MailRecipient[]>([]);

// Dialog State
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const form = ref({
  recipientEmail: "",
  recipientName: "",
});
const formErrors = ref({ email: "" });

// Delete Dialog State
const deleteDialogVisible = ref(false);
const deleteTarget = ref<MailRecipient | null>(null);

// Load Data
const loadData = async () => {
  loading.value = true;
  systemLoading.value = true;
  try {
    const [myRes, systemRes] = await Promise.all([
      mailRecipientApi.getMy(),
      mailRecipientApi.getSystem(),
    ]);
    myRecipients.value = myRes.data || [];
    systemRecipients.value = systemRes.data || [];
  } catch (error) {
    console.error("Failed to load recipients:", error);
  } finally {
    loading.value = false;
    systemLoading.value = false;
  }
};

// Dialog Handlers
const openAddDialog = () => {
  isEdit.value = false;
  editId.value = null;
  form.value = { recipientEmail: "", recipientName: "" };
  formErrors.value = { email: "" };
  dialogVisible.value = true;
};

const openEditDialog = (recipient: MailRecipient) => {
  isEdit.value = true;
  editId.value = recipient.id;
  form.value = {
    recipientEmail: recipient.recipientEmail,
    recipientName: recipient.recipientName || "",
  };
  formErrors.value = { email: "" };
  dialogVisible.value = true;
};

const confirmDelete = (recipient: MailRecipient) => {
  deleteTarget.value = recipient;
  deleteDialogVisible.value = true;
};

// Submit
const handleSubmit = async () => {
  formErrors.value = { email: "" };

  if (!form.value.recipientEmail) {
    formErrors.value.email = "이메일 주소를 입력해 주세요.";
    return;
  }

  try {
    if (isEdit.value && editId.value !== null) {
      await mailRecipientApi.update(editId.value, {
        recipientEmail: form.value.recipientEmail,
        recipientName: form.value.recipientName,
      });
    } else {
      await mailRecipientApi.create({
        recipientEmail: form.value.recipientEmail,
        recipientName: form.value.recipientName,
      });
    }
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    console.error("Failed to save recipient:", error);
  }
};

// Delete
const handleDelete = async () => {
  if (!deleteTarget.value) return;
  try {
    await mailRecipientApi.remove(deleteTarget.value.id);
    deleteDialogVisible.value = false;
    loadData();
  } catch (error) {
    console.error("Failed to delete recipient:", error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
</style>
