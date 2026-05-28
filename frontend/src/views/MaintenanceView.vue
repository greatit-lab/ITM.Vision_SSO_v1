<!-- frontend/src/views/MaintenanceView.vue -->
<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
    
    <div 
      class="absolute inset-0 bg-center bg-cover bg-no-repeat"
      style="background-image: url('/images/login-bg.png');" 
    ></div>
    
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>

    <div class="relative z-10 flex flex-row items-center justify-center w-full max-w-[1400px] gap-8">
      
      <transition name="slide-fade-left">
        <div v-if="showArcadeMenu" class="hidden xl:flex flex-col w-[340px] shrink-0">
          <div class="flex flex-col p-6 bg-white/10 dark:bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 dark:border-zinc-700/50">
            <h2 class="text-white font-black tracking-widest mb-5 flex items-center gap-2 text-lg">
              <i class="pi pi-bolt text-amber-400"></i> ARCADE MENU
            </h2>
            
            <div class="flex flex-col gap-3 w-full">
              <button 
                v-for="game in GAMES" 
                :key="game.value" 
                @click="selectGame(game.value)"
                class="px-5 py-4 rounded-xl font-bold text-left transition-all border flex items-center justify-between group"
                :class="isGameSelected && currentSlot.gameType === game.value 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/50' 
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700/80 hover:border-slate-500'"
              >
                <span class="text-sm tracking-wide">{{ game.label }}</span>
                <i class="pi pi-chevron-right text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <div class="text-center p-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/30 dark:border-zinc-800 max-w-md w-full mx-4 animate-fade-in shrink-0 relative z-20">
        <div class="w-20 h-20 mx-auto bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <i class="pi pi-wrench text-4xl animate-bounce"></i>
        </div>
        
        <h1 class="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">시스템 점검 중입니다</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          더 나은 서비스 제공을 위해 현재 시스템 업데이트 및 안정화 작업을 진행하고 있습니다.<br/>
          이용에 불편을 드려 대단히 죄송합니다.
        </p>
        
        <div class="p-4 bg-slate-100 dark:bg-zinc-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-zinc-700">
          예상 완료 시간: <span class="text-indigo-600 dark:text-indigo-400 font-bold ml-1">{{ expectedTime }}</span>
        </div>
        
        <button 
          @click="checkStatus" 
          class="mt-6 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-900/20 hover:shadow-lg flex items-center justify-center"
        >
          <i class="pi pi-refresh mr-2"></i> 시스템 상태 확인
        </button>

        <button 
          @click="toggleArcadeMenu" 
          class="mt-4 w-full py-2.5 bg-slate-100 dark:bg-zinc-800/50 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-xs"
        >
          <i class="pi" :class="showArcadeMenu ? 'pi-times' : 'pi-gamepad'"></i>
          <span class="ml-2">{{ showArcadeMenu ? '미니게임 메뉴 닫기' : '🎮 지루하시다면 미니게임을 즐겨보세요!' }}</span>
        </button>

      </div>

      <transition name="slide-fade-right">
        <div v-if="showArcadeMenu && isGameSelected" class="hidden xl:flex flex-col w-[340px] shrink-0">
          <div class="flex flex-col items-center p-5 bg-white/10 dark:bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 dark:border-zinc-700/50">
            <h2 class="text-white font-black tracking-widest mb-1 flex items-center gap-2">
              <span :class="getGameColor(currentSlot.gameType)">PLAYING</span>
            </h2>
            
            <div class="flex justify-between w-[300px] mb-3 px-1">
              <span class="text-sm font-bold text-slate-200">Score: <span :class="getGameColor(currentSlot.gameType)">{{ currentSlot.score }}</span></span>
              <span class="text-[10px] text-slate-300 font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-600">
                {{ getGameControls(currentSlot.gameType) }}
              </span>
            </div>
            
            <div class="relative w-[300px] h-[300px] rounded-lg overflow-hidden border-2 border-slate-700 shadow-inner bg-[#0f172a]">
              <canvas ref="gameCanvas" width="300" height="300" class="block"></canvas>
              
              <div v-if="currentSlot.over" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                <h2 class="text-2xl font-black text-rose-500 mb-2">GAME OVER</h2>
                <p class="text-white font-bold mb-4">Final Score: {{ currentSlot.score }}</p>
                <button @click="startGame" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-colors shadow-lg shadow-indigo-900/50">
                  다시 시작
                </button>
              </div>
              
              <div v-if="!currentSlot.playing && !currentSlot.over" class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm cursor-pointer group z-20" @click="startGame">
                <i class="pi pi-play text-5xl text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform"></i>
                <p class="text-white font-bold mt-4 text-sm tracking-wide">클릭하여 시작</p>
              </div>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi } from '@/api/admin';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const expectedTime = ref('별도 공지 시까지');

// 👨‍💻 [신규 추가] 게임 메뉴 토글 상태 관리
const showArcadeMenu = ref(false);

const toggleArcadeMenu = () => {
  showArcadeMenu.value = !showArcadeMenu.value;
  // 메뉴를 닫으면 진행 중이던 게임도 중지 및 화면 초기화
  if (!showArcadeMenu.value) {
    stopGame();
    isGameSelected.value = false;
  }
};

// --- [공통] 시스템 점검 상태 통신 로직 ---
const loadStatus = async () => {
  try {
    const isAdmin = authStore.user?.role === 'ADMIN';
    const res = await adminApi.getMaintenanceStatus();
    if (!res.isMaintenance || isAdmin) {
      router.push('/');
    } else {
      expectedTime.value = res.expectedTime || '별도 공지 시까지';
    }
  } catch (error) {
    console.error('Status fetch failed', error);
  }
};

const checkStatus = async () => {
  try {
    const isAdmin = authStore.user?.role === 'ADMIN';
    const res = await adminApi.getMaintenanceStatus();
    if (!res.isMaintenance || isAdmin) {
      router.push('/');
    } else {
      alert('아직 시스템 점검이 진행 중입니다.\n안내된 예상 완료 시간을 참고해 주세요.');
      expectedTime.value = res.expectedTime || '별도 공지 시까지';
    }
  } catch (error) {
    console.error('Status check failed', error);
  }
};

// ==============================================
// 🎮 Single Arcade Engine
// ==============================================

type GameType = 'snake' | 'brick' | 'pong' | 'dino' | '2048';

const GAMES = [
  { value: 'snake', label: '🐍 스네이크 (Snake)' },
  { value: 'brick', label: '🧱 벽돌 깨기 (Brick Breaker)' },
  { value: 'pong', label: '🏓 핑퐁 (Ping Pong)' },
  { value: 'dino', label: '🦖 공룡 달리기 (Dino Run)' },
  { value: '2048', label: '🧩 2048 퍼즐 (2048)' }
] as const;

const getGameControls = (type: GameType) => {
  switch (type) {
    case 'snake': return 'W,A,S,D (방향키)';
    case 'brick': return '←, → (좌우 이동)';
    case 'pong': return 'W, S (상하 이동)';
    case 'dino': return 'Space (점프)';
    case '2048': return '방향키 (상하좌우 슬라이드)';
    default: return '';
  }
};

const getGameColor = (type: GameType) => {
  switch (type) {
    case 'snake': return 'text-indigo-400';
    case 'brick': return 'text-rose-400';
    case 'pong': return 'text-emerald-400';
    case 'dino': return 'text-amber-400';
    case '2048': return 'text-amber-300';
    default: return 'text-white';
  }
};

interface SlotState {
  gameType: GameType;
  score: number;
  playing: boolean;
  over: boolean;
  data: any;
  reqId: number | null;
}

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const isGameSelected = ref(false);

const currentSlot = reactive<SlotState>({ 
  gameType: 'snake', 
  score: 0, 
  playing: false, 
  over: false, 
  data: null, 
  reqId: null 
});

const keysDown = reactive<Record<string, boolean>>({});

// --- 데이터 초기화 팩토리 ---
const initGameData = (type: GameType) => {
  if (type === 'snake') {
    return { snake: [{x: 10, y: 10}], food: {x: 15, y: 15}, dx: 0, dy: -1, nextDx: 0, nextDy: -1, frames: 0 };
  }
  if (type === 'brick') {
    const bricks = Array.from({length: 6}, () => Array.from({length: 5}, () => ({x: 0, y: 0, status: 1})));
    return { ball: {x: 150, y: 250, r: 4, dx: 3, dy: -3}, paddle: {x: 110, w: 80, h: 8, y: 285}, bricks };
  }
  if (type === 'pong') {
    return { p1: {y: 130, w: 8, h: 40}, p2: {y: 130, w: 8, h: 40}, ball: {x: 150, y: 150, dx: 4, dy: 3, r: 4} };
  }
  if (type === 'dino') {
    return { dino: {y: 210, dy: 0, w: 20, h: 40, isJumping: false}, obstacles: [], frameCount: 0 };
  }
  if (type === '2048') {
    const grid = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    const spawnTile = (g: number[][]) => {
      const empty: {r: number, c: number}[] = [];
      for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
          if(g[r]![c] === 0) empty.push({r, c});
        }
      }
      if(empty.length > 0) {
        const pos = empty[Math.floor(Math.random() * empty.length)];
        if (pos && g[pos.r]) {
          g[pos.r]![pos.c] = Math.random() < 0.9 ? 2 : 4;
        }
      }
    };
    spawnTile(grid);
    spawnTile(grid);
    return { grid, spawnTile };
  }
};

const selectGame = async (type: GameType) => {
  isGameSelected.value = true;
  stopGame();
  
  currentSlot.gameType = type;
  currentSlot.over = false;
  currentSlot.score = 0;
  currentSlot.data = initGameData(type);
  
  await nextTick();
  drawGame(); // 초기 화면 렌더링
};

const startGame = () => {
  stopGame();
  currentSlot.data = initGameData(currentSlot.gameType);
  currentSlot.score = 0;
  currentSlot.over = false;
  currentSlot.playing = true;
  runLoop();
};

const stopGame = () => {
  currentSlot.playing = false;
  const reqId = currentSlot.reqId;
  if (reqId !== null) {
    cancelAnimationFrame(reqId);
    currentSlot.reqId = null;
  }
};

const gameOver = () => {
  stopGame();
  currentSlot.over = true;
};

const getContext = (): CanvasRenderingContext2D | null => {
  if (!gameCanvas.value) return null;
  return gameCanvas.value.getContext('2d') as CanvasRenderingContext2D | null;
};

// 메인 게임 루프 (실시간 엔진용)
const runLoop = () => {
  if (!currentSlot.playing) return;
  updateGame();
  drawGame();
  currentSlot.reqId = requestAnimationFrame(runLoop);
};

// ==============================================
// 🧠 물리 엔진 (Update)
// ==============================================
const updateGame = () => {
  const d = currentSlot.data;
  
  // 1. SNAKE
  if (currentSlot.gameType === 'snake') {
    d.frames++;
    if (d.frames % 8 !== 0) return; 
    d.dx = d.nextDx; d.dy = d.nextDy;
    if (!d.snake.length) return;
    const head = { x: d.snake[0].x + d.dx, y: d.snake[0].y + d.dy };
    
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) return gameOver();
    for (let i = 0; i < d.snake.length; i++) {
      if (d.snake[i].x === head.x && d.snake[i].y === head.y) return gameOver();
    }
    
    d.snake.unshift(head);
    if (head.x === d.food.x && head.y === d.food.y) {
      currentSlot.score += 10;
      d.food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
    } else d.snake.pop();
  }

  // 2. BRICK BREAKER
  if (currentSlot.gameType === 'brick') {
    if (keysDown['arrowright'] && d.paddle.x < 300 - d.paddle.w) d.paddle.x += 5;
    if (keysDown['arrowleft'] && d.paddle.x > 0) d.paddle.x -= 5;
    
    d.ball.x += d.ball.dx; d.ball.y += d.ball.dy;
    
    if (d.ball.x + d.ball.dx > 300 - d.ball.r || d.ball.x + d.ball.dx < d.ball.r) d.ball.dx = -d.ball.dx;
    if (d.ball.y + d.ball.dy < d.ball.r) d.ball.dy = -d.ball.dy;
    else if (d.ball.y + d.ball.dy > 300 - d.ball.r) {
      if (d.ball.x > d.paddle.x && d.ball.x < d.paddle.x + d.paddle.w) {
        d.ball.dy = -d.ball.dy;
        d.ball.dx = (d.ball.x - (d.paddle.x + d.paddle.w/2)) * 0.15;
      } else return gameOver();
    }

    for(let c=0; c<6; c++) {
      const col = d.bricks[c];
      if (!col) continue; 
      for(let r=0; r<5; r++) {
        const b = col[r];
        if(b && b.status === 1) {
          if(d.ball.x > b.x && d.ball.x < b.x + 40 && d.ball.y > b.y && d.ball.y < b.y + 12) {
            d.ball.dy = -d.ball.dy;
            b.status = 0;
            currentSlot.score += 10;
            if(currentSlot.score === 6 * 5 * 10) gameOver(); // 클리어
          }
        }
      }
    }
  }

  // 3. PONG
  if (currentSlot.gameType === 'pong') {
    if ((keysDown['w'] || keysDown['arrowup']) && d.p1.y > 0) d.p1.y -= 5;
    if ((keysDown['s'] || keysDown['arrowdown']) && d.p1.y < 300 - d.p1.h) d.p1.y += 5;
    
    if (d.p2.y + d.p2.h/2 < d.ball.y) d.p2.y += 3.5;
    if (d.p2.y + d.p2.h/2 > d.ball.y) d.p2.y -= 3.5;
    d.p2.y = Math.max(0, Math.min(300 - d.p2.h, d.p2.y));

    d.ball.x += d.ball.dx;
    d.ball.y += d.ball.dy;

    if (d.ball.y - d.ball.r < 0 || d.ball.y + d.ball.r > 300) d.ball.dy = -d.ball.dy;

    if (d.ball.x - d.ball.r < 10 + d.p1.w && d.ball.x > 10 && d.ball.y > d.p1.y && d.ball.y < d.p1.y + d.p1.h) {
      d.ball.dx = -d.ball.dx * 1.05; 
      d.ball.x = 10 + d.p1.w + d.ball.r;
      currentSlot.score += 1;
    }
    
    if (d.ball.x + d.ball.r > 290 - d.p2.w && d.ball.x < 290 && d.ball.y > d.p2.y && d.ball.y < d.p2.y + d.p2.h) {
      d.ball.dx = -d.ball.dx;
      d.ball.x = 290 - d.p2.w - d.ball.r;
    }

    if (d.ball.x < 0) return gameOver();
    if (d.ball.x > 300) { d.ball.dx = -Math.abs(d.ball.dx); d.ball.x = 290; }
  }

  // 4. DINO RUN
  if (currentSlot.gameType === 'dino') {
    d.frameCount++;
    
    if (keysDown[' '] || keysDown['arrowup'] || keysDown['w']) {
      if (!d.dino.isJumping) { d.dino.dy = -10; d.dino.isJumping = true; }
    }
    
    d.dino.dy += 0.5; 
    d.dino.y += d.dino.dy;
    
    if (d.dino.y > 210) { d.dino.y = 210; d.dino.dy = 0; d.dino.isJumping = false; }

    const spawnRate = Math.max(40, 100 - Math.floor(d.frameCount / 50));
    if (d.frameCount % spawnRate === 0) {
      d.obstacles.push({ x: 300, y: 220, w: 15, h: 30 });
    }

    for (let i = d.obstacles.length - 1; i >= 0; i--) {
      const obs = d.obstacles[i];
      obs.x -= (4 + Math.floor(d.frameCount / 500)); 
      
      if (40 < obs.x + obs.w && 40 + d.dino.w > obs.x && d.dino.y < obs.y + obs.h && d.dino.y + d.dino.h > obs.y) {
        return gameOver();
      }
      if (obs.x < -20) d.obstacles.splice(i, 1);
    }
    
    if (d.frameCount % 10 === 0) currentSlot.score += 1;
  }
};

// ==============================================
// 🎨 렌더링 (Draw)
// ==============================================
const drawGame = () => {
  const ctx = getContext() as CanvasRenderingContext2D;
  const d = currentSlot.data;
  if (!ctx || !d) return;

  // 배경 공통
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 300, 300);

  if (currentSlot.gameType === 'snake') {
    ctx.fillStyle = '#f43f5e'; 
    ctx.fillRect(d.food.x * 15, d.food.y * 15, 14, 14);
    d.snake.forEach((part: any, i: number) => {
      ctx.fillStyle = i === 0 ? '#818cf8' : '#4f46e5'; 
      ctx.fillRect(part.x * 15, part.y * 15, 14, 14);
    });
  }

  if (currentSlot.gameType === 'brick') {
    const brickColors = ['#fb7185', '#f43f5e', '#e11d48', '#be123c', '#881337'];
    for(let c=0; c<6; c++) {
      const col = d.bricks[c];
      if (!col) continue;
      for(let r=0; r<5; r++) {
        const b = col[r];
        if(b && b.status === 1) {
          let bX = (c * (40 + 6)) + 15;
          let bY = (r * (12 + 6)) + 30;
          b.x = bX; b.y = bY;
          ctx.fillStyle = brickColors[r] || '#f43f5e';
          ctx.fillRect(bX, bY, 40, 12);
        }
      }
    }
    ctx.fillStyle = '#f43f5e'; 
    ctx.fillRect(d.paddle.x, d.paddle.y, d.paddle.w, d.paddle.h);
    ctx.beginPath(); ctx.arc(d.ball.x, d.ball.y, d.ball.r, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.closePath();
  }

  if (currentSlot.gameType === 'pong') {
    ctx.fillStyle = '#10b981'; 
    ctx.fillRect(10, d.p1.y, d.p1.w, d.p1.h);
    ctx.fillStyle = '#64748b'; 
    ctx.fillRect(290 - d.p2.w, d.p2.y, d.p2.w, d.p2.h);
    
    ctx.beginPath(); ctx.setLineDash([5, 15]); ctx.moveTo(150, 0); ctx.lineTo(150, 300);
    ctx.strokeStyle = '#334155'; ctx.stroke(); ctx.setLineDash([]);
    
    ctx.beginPath(); ctx.arc(d.ball.x, d.ball.y, d.ball.r, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.closePath();
  }

  if (currentSlot.gameType === 'dino') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 250, 300, 2);
    
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(40, d.dino.y, d.dino.w, d.dino.h);
    ctx.fillStyle = '#000';
    ctx.fillRect(52, d.dino.y + 6, 4, 4);

    ctx.fillStyle = '#ef4444';
    d.obstacles.forEach((obs: any) => {
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    });
  }

  if (currentSlot.gameType === '2048') {
    ctx.fillStyle = '#1e293b'; 
    ctx.fillRect(0, 0, 300, 300);
    
    const pad = 10;
    const size = (300 - pad * 5) / 4; 
    
    const colors: Record<number, string> = {
      0: '#334155', 2: '#f1f5f9', 4: '#e2e8f0', 8: '#fde68a', 16: '#f59e0b',
      32: '#fb923c', 64: '#f97316', 128: '#fca5a5', 256: '#ef4444',
      512: '#fecaca', 1024: '#f87171', 2048: '#eab308'
    };

    for(let r=0; r<4; r++) {
      const row = d.grid[r];
      if (!row) continue;
      for(let c=0; c<4; c++) {
        const val = row[c];
        if (val === undefined) continue;
        
        const x = pad + c * (size + pad);
        const y = pad + r * (size + pad);
        
        ctx.fillStyle = colors[val] || '#fbbf24';
        
        const anyCtx = ctx as any;
        if (typeof anyCtx.roundRect === 'function') {
          ctx.beginPath();
          anyCtx.roundRect(x, y, size, size, 6);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, size, size);
        }
        
        if (val > 0) {
          ctx.fillStyle = val <= 4 ? '#475569' : '#ffffff';
          ctx.font = `bold ${val > 100 ? '20px' : '24px'} sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toString(), x + size/2, y + size/2);
        }
      }
    }
  }
};

// ==============================================
// ⌨️ 키보드 핸들링 (2048 턴제 로직 포함)
// ==============================================
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  keysDown[key] = true;

  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
    if (currentSlot.playing) e.preventDefault(); 
  }

  if (!currentSlot.playing) return;
  const d = currentSlot.data;

  // 스네이크 (턴제 방향키)
  if (currentSlot.gameType === 'snake') {
    if ((key === 'w' || key === 'arrowup') && d.dy !== 1) { d.nextDx = 0; d.nextDy = -1; }
    if ((key === 's' || key === 'arrowdown') && d.dy !== -1) { d.nextDx = 0; d.nextDy = 1; }
    if ((key === 'a' || key === 'arrowleft') && d.dx !== 1) { d.nextDx = -1; d.nextDy = 0; }
    if ((key === 'd' || key === 'arrowright') && d.dx !== -1) { d.nextDx = 1; d.nextDy = 0; }
  }

  // 2048 턴제 슬라이드 논리
  if (currentSlot.gameType === '2048') {
    const prevGridStr = JSON.stringify(d.grid);
    let grid: number[][] = JSON.parse(prevGridStr);

    const rotateLeft = (g: number[][]) => {
      const first = g[0];
      if (!first) return g;
      return first.map((_, idx) => g.map(row => (row ? row[idx] : 0) as number).reverse());
    };
    
    const rotateRight = (g: number[][]) => {
      const first = g[0];
      if (!first) return g;
      return first.map((_, idx) => g.map(row => (row ? row[row.length - 1 - idx] : 0) as number));
    };

    const slideLeft = (g: number[][]) => {
      for (let i=0; i<4; i++) {
        const targetRow = g[i];
        if (!targetRow) continue;
        
        let row = targetRow.filter(v => v !== 0);
        for(let j=0; j<row.length-1; j++) {
          const curr = row[j];
          const next = row[j+1];
          if(curr !== undefined && curr === next) { 
            row[j] = curr * 2; 
            currentSlot.score += (curr * 2); 
            row[j+1] = 0; 
          }
        }
        row = row.filter(v => v !== 0);
        while(row.length < 4) row.push(0);
        g[i] = row;
      }
    };

    if (['w', 'arrowup'].includes(key)) {
      grid = rotateLeft(grid); slideLeft(grid); grid = rotateRight(grid);
    } else if (['s', 'arrowdown'].includes(key)) {
      grid = rotateRight(grid); slideLeft(grid); grid = rotateLeft(grid);
    } else if (['a', 'arrowleft'].includes(key)) {
      slideLeft(grid);
    } else if (['d', 'arrowright'].includes(key)) {
      grid = grid.map((r: number[]) => r.slice().reverse()); 
      slideLeft(grid); 
      grid = grid.map((r: number[]) => r.slice().reverse());
    }

    d.grid = grid;

    if (prevGridStr !== JSON.stringify(d.grid)) {
      d.spawnTile(d.grid);
      
      let emptyCount = 0;
      let canMove = false;
      const gameGrid = d.grid as number[][];
      
      for(let r=0; r<4; r++) {
        const row = gameGrid[r];
        const nextRow = gameGrid[r+1];
        if (!row) continue;
        
        for(let c=0; c<4; c++) {
          if(row[c] === 0) emptyCount++;
          if (c<3 && row[c] === row[c+1]) canMove = true;
          if (r<3 && nextRow && row[c] === nextRow[c]) canMove = true;
        }
      }
      
      if (emptyCount === 0 && !canMove) {
        gameOver();
      }
    }
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  keysDown[e.key.toLowerCase()] = false;
};

onMounted(() => {
  loadStatus();
  window.addEventListener('keydown', handleKeyDown, { passive: false });
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  stopGame();
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 슬라이드 트랜지션 (왼쪽 메뉴 패널용) */
.slide-fade-left-enter-active, .slide-fade-left-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-left-enter-from, .slide-fade-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* 슬라이드 트랜지션 (오른쪽 게임 패널용) */
.slide-fade-right-enter-active, .slide-fade-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-right-enter-from, .slide-fade-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
