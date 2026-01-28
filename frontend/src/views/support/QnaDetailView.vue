<!-- frontend/src/views/support/QnaDetailView.vue -->
<template>
  <div class="h-full flex flex-col w-full bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
    
    <div v-if="post" class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
      
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <button 
          @click="$router.push({ name: 'qna-list' })"
          class="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-indigo-600 transition-colors shadow-sm shrink-0"
          title="목록으로"
        >
          <i class="pi pi-arrow-left text-xs"></i>
        </button>

        <span 
          class="flex-shrink-0 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border"
          :class="getCategoryColor(post.category)"
        >
          {{ post.category }}
        </span>
        
        <h1 class="text-lg font-bold text-slate-800 dark:text-slate-100 truncate pr-4" :title="post.title">
          {{ post.title }}
        </h1>
        
        <span v-if="post.isSecret === 'Y'" class="flex-shrink-0 text-amber-500" title="비밀글">
          <i class="pi pi-lock text-xs"></i>
        </span>
      </div>

      <div class="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
        
        <div class="flex items-center gap-1.5">
            <div class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              :class="isAdminRole(post.user?.role) ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-zinc-600'">
              {{ getAuthorInitial(post.authorId, post.user?.role) }}
            </div>
            <span class="font-medium" :class="isAdminRole(post.user?.role) ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'">
              {{ getAuthorName(post.authorId, post.user?.role) }}
            </span>
        </div>

        <div class="w-px h-3 bg-slate-200 dark:bg-zinc-700"></div>

        <div class="flex items-center gap-2">
           <span title="작성일">{{ formatDate(post.createdAt) }}</span>
           
           <div v-if="isModified(post)" class="flex items-center gap-1 text-slate-400" title="수정됨">
              <i class="pi pi-pencil text-[10px]"></i> <span>{{ formatDate(post.updatedAt) }}</span>
           </div>
        </div>

        <div class="w-px h-3 bg-slate-200 dark:bg-zinc-700"></div>

        <div class="flex items-center gap-1.5" title="조회수">
            <i class="pi pi-eye text-[10px]"></i>
            <span>{{ post.views }}</span>
        </div>

        <div v-if="isAuthorOrAdmin" class="flex gap-2 ml-2 pl-4 border-l border-slate-200 dark:border-zinc-700">
            <button 
              @click="editPost" 
              class="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700 transition-colors"
            >
              수정
            </button>
            <button 
              @click="deletePost" 
              class="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-colors"
            >
              삭제
            </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
    </div>

    <div v-else-if="!post" class="flex-1 flex flex-col items-center justify-center gap-4">
      <p class="text-slate-500">게시글을 찾을 수 없습니다.</p>
      <button @click="$router.push({ name: 'qna-list' })" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold">목록으로</button>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
      <div class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-8" v-html="post.content"></div>
    </div>

    <div v-if="post" class="bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shrink-0 flex flex-col max-h-[40%]">
        
        <div class="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-1 min-h-[100px]">
            <div v-if="(!post.comments || post.comments.length === 0)" class="text-center py-4 text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-zinc-700 rounded-lg">
                등록된 댓글이 없습니다.
            </div>

            <div 
              v-for="comment in post.comments" 
              :key="comment.commentId"
              class="flex w-full"
              :class="isPostAuthorComment(comment.authorId) ? 'justify-end' : 'justify-start'"
            >
                <div 
                    class="flex items-start gap-2 max-w-[95%]"
                    :class="{'flex-row-reverse': isPostAuthorComment(comment.authorId)}"
                >
                    <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-white dark:border-zinc-700 mt-1"
                      :class="getCommentAvatarClass(comment.authorId, comment.user?.role)">
                        {{ getAuthorInitial(comment.authorId, comment.user?.role) }}
                    </div>

                    <div 
                        class="px-3 py-2 rounded-xl text-xs shadow-sm group"
                        :class="isPostAuthorComment(comment.authorId) 
                            ? 'bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tr-none' 
                            : (isAdminRole(comment.user?.role) ? 'bg-indigo-600 border border-indigo-600 text-white rounded-tl-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none')"
                    >
                        <div v-if="editingCommentId !== comment.commentId">
                            <div class="flex items-center gap-2 mb-1" :class="isPostAuthorComment(comment.authorId) ? 'flex-row-reverse' : ''">
                                <span class="font-bold flex items-center gap-1 shrink-0" 
                                      :class="isAdminRole(comment.user?.role) && !isPostAuthorComment(comment.authorId) ? 'text-indigo-100' : (isAdminRole(comment.user?.role) ? 'text-indigo-700' : 'text-slate-800')">
                                  {{ getAuthorName(comment.authorId, comment.user?.role) }}
                                  <i v-if="isPostAuthorComment(comment.authorId)" class="pi pi-star-fill text-[9px] text-amber-500" title="작성자"></i>
                                  <i v-if="isAdminRole(comment.user?.role)" class="pi pi-verified text-[9px]" title="관리자/매니저"></i>
                                </span>
                                
                                <span class="text-[10px] opacity-60 shrink-0">
                                    {{ formatDate(comment.createdAt) }}
                                </span>

                                <div v-if="isMyComment(comment.authorId)" class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                    <button @click="startEdit(comment)" class="hover:text-indigo-300 transition-colors" title="수정">
                                        <i class="pi pi-pencil text-[10px]"></i>
                                    </button>
                                    <button @click="requestDeleteComment(comment.commentId)" class="hover:text-rose-300 transition-colors" title="삭제">
                                        <i class="pi pi-trash text-[10px]"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="whitespace-pre-wrap leading-snug break-all" :class="isPostAuthorComment(comment.authorId) ? 'text-right' : 'text-left'">
                                {{ comment.content }}
                            </div>
                        </div>

                        <div v-else class="min-w-[200px]">
                            <textarea 
                                v-model="editContent" 
                                rows="2" 
                                class="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 mb-2 resize-none text-slate-900"
                            ></textarea>
                            <div class="flex justify-end gap-2">
                                <button @click="cancelEdit" class="text-[10px] opacity-70 hover:opacity-100">취소</button>
                                <button @click="saveEdit(comment.commentId)" class="px-2 py-1 bg-white text-indigo-600 rounded text-[10px] font-bold hover:bg-indigo-50 shadow-sm">저장</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="p-3 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div class="flex flex-col gap-2">
                <div class="flex gap-2">
                    <div class="flex-1">
                        <textarea 
                        v-model="newComment"
                        rows="1"
                        :placeholder="isAdminRole(authStore.user?.role) ? '답변을 입력하세요...' : '댓글을 입력하세요...'" 
                        class="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-sm transition-all shadow-sm"
                        @keydown.enter.prevent="submitComment"
                        style="min-height: 42px;"
                        ></textarea>
                    </div>
                    <button 
                        @click="submitComment"
                        :disabled="!newComment.trim() || isSubmittingComment"
                        class="flex-shrink-0 w-12 h-auto flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        <i v-if="isSubmittingComment" class="pi pi-spin pi-spinner text-xs"></i>
                        <i v-else class="pi pi-send text-sm"></i>
                    </button>
                </div>
                
                <div v-if="isAdminRole(authStore.user?.role) && post.status !== 'ANSWERED'" class="flex items-center justify-end gap-2 px-1">
                    <label class="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" v-model="markAsAnswered" class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                        <span class="text-xs text-slate-500 font-bold group-hover:text-indigo-600 transition-colors">답변 완료 처리 (상태 변경)</span>
                    </label>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { boardApi } from '@/api/board';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const post = ref<any>(null);
const newComment = ref('');
const isSubmittingComment = ref(false);
const markAsAnswered = ref(true);

const editingCommentId = ref<number | null>(null);
const editContent = ref('');

const isAuthorOrAdmin = computed(() => {
  if (!post.value || !authStore.user) return false;
  const postAuthor = String(post.value.authorId);
  const currentUserId = String(authStore.user.userId);
  return postAuthor === currentUserId || isAdminRole(authStore.user.role);
});

const isPostAuthorComment = (commentAuthorId: string) => {
  return post.value && String(commentAuthorId) === String(post.value.authorId);
};

const isMyComment = (commentAuthorId: string) => {
  if (!authStore.user) return false;
  return String(commentAuthorId) === String(authStore.user.userId);
};

const isAdminRole = (role?: string) => {
  if (!role) return false;
  const upperRole = role.toUpperCase();
  return upperRole === 'ADMIN' || upperRole === 'MANAGER';
};

const getAuthorName = (authorId: string, role?: string) => {
  if (isAdminRole(role)) return role?.toUpperCase();
  return authorId;
};

const getAuthorInitial = (authorId: string, role?: string) => {
  if (isAdminRole(role)) return role?.charAt(0).toUpperCase();
  return authorId ? authorId.charAt(0).toUpperCase() : '?';
};

const getCommentAvatarClass = (authorId: string, role?: string) => {
  if (isAdminRole(role)) return 'bg-indigo-600 text-white';
  if (isPostAuthorComment(authorId)) return 'bg-indigo-500 text-white';
  return 'bg-slate-200 text-slate-600';
};

// [확인] 수정 여부 판별 (Updated가 존재하고 Created와 다를 때)
const isModified = (postItem: any) => {
  if (!postItem || !postItem.updatedAt || !postItem.createdAt) return false;
  const created = dayjs(postItem.createdAt);
  const updated = dayjs(postItem.updatedAt);
  return updated.format('YYYY-MM-DD HH:mm') !== created.format('YYYY-MM-DD HH:mm');
};

const formatDate = (dateStr: string | Date) => {
  if (!dateStr) return '-';
  const date = dayjs(dateStr);
  return date.isValid() ? date.format('YYYY.MM.DD HH:mm') : '-';
};

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'NOTICE': return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30';
    case 'BUG': return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30';
    default: return 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30';
  }
};

const fetchPost = async () => {
  const id = Number(route.params.id);
  if (!id) return;

  loading.value = true;
  try {
    const res = await boardApi.getPost(id);
    post.value = res.data;
  } catch (e) {
    console.error(e);
    post.value = null;
  } finally {
    loading.value = false;
  }
};

const editPost = () => {
  router.push({ name: 'qna-write', query: { id: post.value.postId } });
};

const deletePost = async () => {
  if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
  try {
    await boardApi.deletePost(post.value.postId);
    alert("게시글이 삭제되었습니다.");
    router.replace({ name: 'qna-list' }); 
  } catch (e) {
    alert("게시글 삭제에 실패했습니다.");
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  if (!authStore.user) {
    alert("로그인이 필요합니다.");
    return;
  }
  isSubmittingComment.value = true;
  try {
    const statusParam = (isAdminRole(authStore.user.role) && markAsAnswered.value) ? 'ANSWERED' : undefined;
    await boardApi.createComment({
      postId: post.value.postId,
      authorId: authStore.user.userId,
      content: newComment.value,
      status: statusParam 
    });
    newComment.value = '';
    await fetchPost(); 
  } catch (e) {
    alert("댓글/답변 등록에 실패했습니다.");
  } finally {
    isSubmittingComment.value = false;
  }
};

const startEdit = (comment: any) => {
  editingCommentId.value = comment.commentId;
  editContent.value = comment.content;
};

const cancelEdit = () => {
  editingCommentId.value = null;
  editContent.value = '';
};

const saveEdit = async (commentId: number) => {
  if (!editContent.value.trim()) return;
  try {
    await boardApi.updateComment(commentId, editContent.value);
    await fetchPost();
    cancelEdit();
  } catch (e) {
    alert("댓글 수정에 실패했습니다.");
  }
};

const requestDeleteComment = async (commentId: number) => {
  if (!confirm("정말로 댓글을 삭제하시겠습니까?")) return;
  try {
    await boardApi.deleteComment(commentId);
    await fetchPost(); 
  } catch (e) {
    alert("댓글 삭제에 실패했습니다.");
  }
};

watch(() => route.params.id, (newId) => {
  if (newId) fetchPost();
});

onMounted(() => {
  fetchPost();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }
</style>
