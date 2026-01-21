<!-- frontend/src/views/support/QnaDetailView.vue -->
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#09090b] p-6 lg:p-10">
    <div class="max-w-4xl mx-auto">
      
      <button 
        @click="$router.push({ name: 'qna-list' })"
        class="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <i class="pi pi-arrow-left mr-2"></i> 목록으로 돌아가기
      </button>

      <div v-if="loading" class="text-center py-20">
        <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
      </div>

      <div v-else-if="!post" class="text-center py-20">
        <p class="text-slate-500">게시글을 찾을 수 없거나 접근 권한이 없습니다.</p>
      </div>

      <div v-else class="animate-fade-in">
        <div class="bg-white dark:bg-zinc-900 rounded-t-2xl p-8 border-b border-slate-100 dark:border-zinc-800 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
             <span 
                class="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border"
                :class="getCategoryColor(post.category)"
              >
                {{ post.category }}
              </span>
              <span class="text-sm text-slate-400">{{ formatDate(post.createdAt) }}</span>
              <span v-if="post.isSecret === 'Y'" class="ml-auto flex items-center text-xs text-amber-500 font-medium">
                <i class="pi pi-lock mr-1"></i> 비밀글
              </span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-snug">{{ post.title }}</h1>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {{ post.authorId.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ post.authorId }}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 rounded-b-2xl p-8 shadow-sm border border-t-0 border-slate-200 dark:border-zinc-800 min-h-[200px]">
          <div class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-300" v-html="post.content"></div>
          
          <div class="mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end" v-if="isAuthorOrAdmin">
             <button 
              @click="deletePost"
              class="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <i class="pi pi-trash mr-1"></i> 게시글 삭제
            </button>
          </div>
        </div>

        <div class="mt-8">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            댓글 <span class="text-indigo-500">{{ post.comments?.length || 0 }}</span>
          </h3>

          <div class="space-y-4 mb-8">
            <div 
              v-for="comment in post.comments" 
              :key="comment.commentId"
              class="flex gap-4"
              :class="{'flex-row-reverse': comment.authorId === authStore.user?.userId}"
            >
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                 {{ comment.authorId.charAt(0).toUpperCase() }}
              </div>
              
              <div 
                class="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed"
                :class="comment.authorId === authStore.user?.userId 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm'"
              >
                <div class="flex items-center justify-between gap-4 mb-1 opacity-80">
                  <span class="font-bold text-xs">{{ comment.authorId }}</span>
                  <span class="text-[10px]">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="whitespace-pre-wrap">{{ comment.content }}</p>
              </div>
            </div>

            <div v-if="(!post.comments || post.comments.length === 0)" class="text-center py-8 text-slate-400 text-sm italic">
              아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
            </div>
          </div>

          <div class="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex gap-4">
             <div class="flex-1">
               <textarea 
                  v-model="newComment"
                  rows="2"
                  placeholder="댓글을 입력하세요..." 
                  class="w-full px-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 resize-none text-sm transition-all"
                  @keydown.enter.prevent="submitComment"
               ></textarea>
             </div>
             <button 
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmittingComment"
                class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
             >
                <i v-if="isSubmittingComment" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-send"></i>
             </button>
          </div>
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
  return post.value.authorId === authStore.user.userId || authStore.user.role === 'ADMIN';
});

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

const deletePost = async () => {
  if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
  try {
    await boardApi.deletePost(post.value.postId);
    router.replace({ name: 'qna-list' });
  } catch (e) {
    alert("게시글 삭제에 실패했습니다.");
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  isSubmittingComment.value = true;
  try {
    await boardApi.createComment({
      postId: post.value.postId,
      authorId: authStore.user?.userId || 'unknown',
      content: newComment.value
    });
    newComment.value = '';
    // 댓글 목록 갱신
    await fetchPost();
  } catch (e) {
    alert("댓글 등록에 실패했습니다.");
  } finally {
    isSubmittingComment.value = false;
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

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
