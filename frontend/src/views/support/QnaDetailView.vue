<!-- frontend/src/views/support/QnaDetailView.vue -->
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#09090b] p-6 lg:p-8 flex flex-col w-full">
    
    <button 
      @click="$router.push({ name: 'qna-list' })"
      class="mb-4 flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors w-fit"
    >
      <i class="pi pi-arrow-left mr-2"></i> 목록으로 돌아가기
    </button>

    <div v-if="loading" class="text-center py-20">
      <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
    </div>

    <div v-else-if="!post" class="text-center py-20">
      <p class="text-slate-500">게시글을 찾을 수 없거나 접근 권한이 없습니다.</p>
    </div>

    <div v-else class="animate-fade-in flex-1">
      
      <div class="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          
          <div class="flex items-center gap-3 min-w-0 flex-1">
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
               <div class="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
                  {{ post.authorId ? post.authorId.charAt(0).toUpperCase() : 'U' }}
               </div>
               <span class="font-medium text-slate-700 dark:text-slate-300">{{ post.authorId }}</span>
            </div>
            <div class="flex items-center gap-1.5" title="작성일">
               <i class="pi pi-calendar text-[10px]"></i>
               <span>{{ formatDate(post.createdAt) }}</span>
            </div>
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

        <div class="p-6 md:p-8 min-h-[300px]">
          <div class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 whitespace-pre-line leading-relaxed" v-html="post.content"></div>
        </div>
      </div>

      <div class="mt-4">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          댓글 <span class="bg-indigo-100 text-indigo-700 px-1.5 rounded text-xs">{{ post.comments?.length || 0 }}</span>
        </h3>

        <div class="space-y-2 mb-4">
          <div 
            v-for="comment in post.comments" 
            :key="comment.commentId"
            class="flex gap-2.5 animate-fade-in"
            :class="{'flex-row-reverse': isMyComment(comment.authorId)}"
          >
            <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shadow-sm border border-white dark:border-zinc-700"
              :class="isAdminUser(comment.authorId) ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'">
                {{ comment.authorId ? comment.authorId.charAt(0).toUpperCase() : '?' }}
            </div>
            
            <div 
              class="max-w-[90%] px-3 py-2 rounded-xl text-sm leading-snug shadow-sm relative"
              :class="isMyComment(comment.authorId) 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : (isAdminUser(comment.authorId) ? 'bg-emerald-50 border border-emerald-100 text-slate-800 rounded-tl-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none')"
            >
              <div class="flex items-center justify-between gap-3 mb-0.5 opacity-90 text-[11px]">
                <span class="font-bold flex items-center gap-1">
                   {{ comment.authorId }}
                   <i v-if="isAdminUser(comment.authorId)" class="pi pi-check-circle text-[9px]"></i>
                </span>
                <span class="opacity-70 text-[9px]">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="whitespace-pre-wrap text-[13px]">{{ comment.content }}</p>
            </div>
          </div>

          <div v-if="(!post.comments || post.comments.length === 0)" class="text-center py-4 bg-slate-100/50 dark:bg-zinc-900 rounded-lg border border-dashed border-slate-300 dark:border-zinc-800">
            <p class="text-[11px] text-slate-400">등록된 댓글이 없습니다.</p>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm flex gap-2">
            <div class="flex-1">
              <textarea 
                v-model="newComment"
                rows="1"
                placeholder="댓글을 입력하세요..." 
                class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-md outline-none focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 resize-none text-[13px] transition-all"
                @keydown.enter.prevent="submitComment"
                style="min-height: 38px;"
              ></textarea>
            </div>
            <button 
              @click="submitComment"
              :disabled="!newComment.trim() || isSubmittingComment"
              class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50"
            >
              <i v-if="isSubmittingComment" class="pi pi-spin pi-spinner text-[10px]"></i>
              <i v-else class="pi pi-send text-[10px]"></i>
            </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { boardApi } from '@/api/board';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const post = ref<any>(null);
const newComment = ref('');
const isSubmittingComment = ref(false);

const isAuthorOrAdmin = computed(() => {
  if (!post.value || !authStore.user) return false;
  const postAuthor = String(post.value.authorId);
  const currentUserId = String(authStore.user.userId);
  return postAuthor === currentUserId || authStore.user.role === 'ADMIN' || authStore.user.role === 'MANAGER';
});

const isMyComment = (commentAuthorId: string) => {
  if (!authStore.user) return false;
  return String(commentAuthorId) === String(authStore.user.userId);
};

const isAdminUser = (authorId: string) => {
  return authorId.toLowerCase().includes('admin') || authorId === 'manager';
};

const fetchPost = async () => {
  const id = Number(route.params.id);
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
  if (!confirm("정말로 이 게시글을 삭제하시겠습니까? 복구할 수 없습니다.")) return;
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
    await boardApi.createComment({
      postId: post.value.postId,
      authorId: authStore.user.userId,
      content: newComment.value
    });
    newComment.value = '';
    await fetchPost();
  } catch (e) {
    alert("댓글 등록에 실패했습니다.");
  } finally {
    isSubmittingComment.value = false;
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'NOTICE': return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30';
    case 'BUG': return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30';
    default: return 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30';
  }
};

onMounted(() => {
  fetchPost();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
