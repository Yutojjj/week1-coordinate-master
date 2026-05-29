// ── BGM・SE管理 ──────────────────────────────────────────
export class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmNodes: AudioNode[] = [];
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmMode: "none" | "ambient" | "battle" | "boss" = "none";
  private bossAudio: HTMLAudioElement | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  private stopCurrentBgm() {
    this.isBgmPlaying = false;
    try {
      if (this.bgmGain) {
        this.bgmGain.gain.exponentialRampToValueAtTime(0.001, this.getCtx().currentTime + 0.4);
      }
    } catch {}
    if (this.bossAudio) {
      this.bossAudio.pause();
      this.bossAudio.currentTime = 0;
      this.bossAudio = null;
    }
    this.bgmGain = null;
    this.bgmMode = "none";
  }

  startBossBgm() {
    if (this.bgmMode === "boss") return;
    this.stopCurrentBgm();
    try {
      const audio = new Audio("/bgm/Banners_at_the_Gate.mp3");
      audio.loop = true;
      audio.volume = 0.45;
      audio.play().catch(() => {});
      this.bossAudio = audio;
      this.bgmMode = "boss";
      this.isBgmPlaying = true;
    } catch {}
  }

  startAmbientBgm() {
    if (this.bgmMode === "ambient") return;
    this.stopCurrentBgm();
    try {
      const audio = new Audio("/bgm/Sunlit_Meadow_Path.mp3");
      audio.loop = true;
      audio.volume = 0.4;
      audio.play().catch(() => {});
      this.bossAudio = audio; 
      this.bgmMode = "ambient";
      this.isBgmPlaying = true;
    } catch {}
  }

  playCoinSe() {
    try {
      const audio = new Audio("/bgm/コイン_チャリーン_.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}
  }

  playWalkSe() {
    try {
      const ctx = new AudioContext();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      g.connect(ctx.destination);
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / d.length * 12) * 0.6;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(g);
      src.start();
    } catch {}
  }

  playFireball() {
    try {
      const ctx = this.getCtx();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      g.connect(ctx.destination);
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.6
                + Math.sin(2 * Math.PI * (800 - t * 1200) * t) * Math.exp(-t * 5) * 0.4;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(g);
      src.start();
    } catch {}
  }

  playHit() {
    try {
      const ctx = this.getCtx();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      g.connect(ctx.destination);
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.8
                + Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 10) * 0.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(g);
      src.start();
    } catch {}
  }

  startBattleBgm() {
    if (this.bgmMode === "battle") return;
    this.stopCurrentBgm();
    try {
      const ctx = this.getCtx();
      if (ctx.state === "suspended") ctx.resume();
      this.bgmGain = ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.15, ctx.currentTime);
      this.bgmGain.connect(ctx.destination);
      this.isBgmPlaying = true;
      this.bgmMode = "battle";
      const bpm = 140;
      const beat = 60 / bpm;
      const playDrum = (time: number) => {
        if (!this.isBgmPlaying || this.bgmMode !== "battle") return;
        const kick = [0, 2, 4, 6];
        const snare = [2, 6];
        for (let measure = 0; measure < 2; measure++) {
          for (let b = 0; b < 8; b++) {
            const t = time + (measure * 8 + b) * beat * 0.5;
            if (kick.includes(b)) {
              const g = ctx.createGain();
              g.gain.setValueAtTime(0.5, t);
              g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
              g.connect(this.bgmGain!);
              const osc = ctx.createOscillator();
              osc.frequency.setValueAtTime(150, t);
              osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
              osc.connect(g);
              osc.start(t); osc.stop(t + 0.3);
            }
            if (snare.includes(b)) {
              const g = ctx.createGain();
              g.gain.setValueAtTime(0.3, t);
              g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
              g.connect(this.bgmGain!);
              const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
              const d = buf.getChannelData(0);
              for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / d.length * 8);
              const src = ctx.createBufferSource();
              src.buffer = buf; src.connect(g); src.start(t);
            }
          }
        }
        const notes = [523, 659, 784, 659, 784, 880, 784, 1047];
        notes.forEach((freq, i) => {
          const t = time + i * beat * 0.5;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.45);
          g.connect(this.bgmGain!);
          const osc = ctx.createOscillator();
          osc.type = "square";
          osc.frequency.value = freq;
          osc.connect(g);
          osc.start(t); osc.stop(t + beat * 0.45);
        });
        setTimeout(() => playDrum(ctx.currentTime), (8 * beat * 0.5 - 0.1) * 1000);
      };
      playDrum(ctx.currentTime);
    } catch {}
  }

  stopBgm() {
    this.stopCurrentBgm();
    setTimeout(() => this.startAmbientBgm(), 600);
  }

  stopAll() {
    this.stopCurrentBgm();
  }
}

export const audioManager = new AudioManager();

export interface GameState {
  playerX: number;
  playerY: number;
  playerAngle: number;
  enemyX: number;
  enemyY: number;
  enemyHP: number;
  enemyMaxHP: number;
  enemyType: string; 
  coins: { x: number; y: number; collected: boolean; hidden?: boolean; sprite?: string; label?: string }[];
  potions: { x: number; y: number; collected: boolean }[];
  attackPoints: { id: number; x: number; y: number; radius: number; hit: boolean; createdAt?: number; isMagicCircle?: boolean }[];
  traps: { id: number; x: number; y: number; radius: number; type: string; activePhase: number; inactivePhase: number; offset: number; }[];
  gameOver: boolean;
  gameWon: boolean;
  damageAccum: number;
  damageEffects: { x: number; y: number; text: string; alpha: number }[];
  fireballEffects: { x: number; y: number; tx: number; ty: number; progress: number; id: number; isEnemyMagic?: boolean; isReflected?: boolean; speedMultiplier?: number }[];
  explosionFrame: number;
  explosionX: number;
  explosionY: number;
  showExplosion: boolean;
  showCoordLabels: boolean;
  timeLeft: number;
  coinFloatEffects: { x: number; y: number; alpha: number; vy: number }[];
  lightningStrike: { progress: number; x: number; isGlobal?: boolean; timer?: number } | null;
  hideCoinCoords: boolean;
  chapter: number;
  isBarrierActive?: boolean;
  barrierEndTime?: number;
  lastEnemyAttackTime?: number;
  bossNextAttack?: "magic_circle" | "global_lightning";
  magicCircleSpawnTime?: number;
  // ★ 実行フラグと敵の移動用プロパティを追加
  isStarted?: boolean;
  enemyTargetX?: number;
  enemyTargetY?: number;
  // ★ プレイヤーHP（コウモリステージ用）
  playerHP?: number;
  playerMaxHP?: number;
  lastPlayerHitTime?: number;
  // ★ 宝箱（コウモリ撃破後にドロップ）
  treasureBox?: { x: number; y: number; collected: boolean } | null;
  // ★ オークキングフラグ
  isOrcKing?: boolean;
  // ★ オークキングのファイア間隔管理
  lastOrcKingFireTime?: number;
  // ★ バリア成功カウント（3-2-1クリア条件）
  barrierCount?: number;
}

export class CanvasEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState;
  private sprites: Map<string, HTMLImageElement> = new Map();
  private bgImage: HTMLImageElement | null = null;
  private coinFrame = 0;
  private coinFrameTimer = 0;
  spritesLoaded = false;
  private walkFrame = 0;
  private walkTimer = 0;
  private isWalking = false;
  
  startTime: number = Date.now();

  private loopId: number = 0;
  private keyCallbacks: Record<string, (() => Promise<void>)[]> = {};
  private clickCallbacks: (() => Promise<void>)[] = [];
  private keydownHandler: (e: KeyboardEvent) => void;
  private clickHandler: (e: MouseEvent) => void;

  get globalTime(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  toCanvasX(lx: number): number {
    return (lx + 200) / 400 * this.canvas.width;
  }
  toCanvasY(ly: number): number {
    return (1 - (ly + 200) / 400) * this.canvas.height;
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  constructor(canvas: HTMLCanvasElement, initialState: GameState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    if (!initialState.potions) initialState.potions = [];
    if (initialState.isStarted === undefined) initialState.isStarted = false;
    this.state = JSON.parse(JSON.stringify(initialState));
    this.startTime = Date.now();

    if ((window as any)._activeCanvasEngine) {
      (window as any)._activeCanvasEngine.dispose();
    }
    (window as any)._activeCanvasEngine = this;

    this.keydownHandler = (e: KeyboardEvent) => {
      if (this.state.gameOver || this.state.gameWon) return;
      let key = "";
      if (e.key === "ArrowRight") key = "RIGHT";
      if (e.key === "ArrowLeft") key = "LEFT";
      if (e.key === "ArrowUp") key = "UP";
      if (e.key === "ArrowDown") key = "DOWN";
      
      if (key && this.keyCallbacks[key]) {
        e.preventDefault();
        this.keyCallbacks[key].forEach(cb => cb().catch(console.error));
      }
    };

    this.clickHandler = (e: MouseEvent) => {
      if (this.state.gameOver || this.state.gameWon) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      const px = this.toCanvasX(this.state.playerX);
      const py = this.toCanvasY(this.state.playerY);
      const pSize = Math.max(52, Math.round(this.canvas.width * 0.08));

      if (Math.abs(mouseX - px) <= pSize && Math.abs(mouseY - py) <= pSize) {
        this.clickCallbacks.forEach(cb => cb().catch(console.error));
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
    this.canvas.addEventListener('mousedown', this.clickHandler);

    this.state.lastEnemyAttackTime = this.globalTime;
    if (this.state.chapter === 3 && this.state.enemyMaxHP > 1 && (this.state.enemyType === "orc" || this.state.enemyType === "orc_king")) {
      this.state.bossNextAttack = "magic_circle";
      this.state.isOrcKing = true; // ★ 最初からオークキングフラグを立てる
    }

    this.startGameLoop();
  }

  dispose() {
    window.removeEventListener('keydown', this.keydownHandler);
    this.canvas.removeEventListener('mousedown', this.clickHandler);
    cancelAnimationFrame(this.loopId);
  }

  onKeyPressed(key: string, callback: () => Promise<void>) {
    if (!this.keyCallbacks[key]) this.keyCallbacks[key] = [];
    this.keyCallbacks[key].push(callback);
  }

  onSpriteClicked(callback: () => Promise<void>) {
    this.clickCallbacks.push(callback);
  }

  async castBarrier(): Promise<void> {
    this.state.isBarrierActive = true;
    this.state.barrierEndTime = this.globalTime + 1.2; 
    
    try {
      const ctx = new AudioContext();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
      g.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 1.0);
      osc.connect(g);
      osc.start(); osc.stop(ctx.currentTime + 1.0);
    } catch {}
    this.draw();
  }

  startGameLoop() {
    const loop = () => {
      if (!this.state.gameOver && !this.state.gameWon) {
        this.updateGameLogic();
      }
      this.tickDamageEffects(); 
      this.draw();
      this.loopId = requestAnimationFrame(loop);
    };
    this.loopId = requestAnimationFrame(loop);
  }

  updateGameLogic() {
    // ★ 開始前（実行ボタンを押す前）はゲームロジック（攻撃やトラップ判定）をストップ
    if (!this.state.isStarted) return;

    const t = this.globalTime;

    if (this.state.isBarrierActive && this.state.barrierEndTime && t > this.state.barrierEndTime) {
      this.state.isBarrierActive = false;
    }

    if (this.state.chapter === 3 && this.state.enemyHP > 0 && this.state.enemyType !== "none") {
      const isOrcBoss = (this.state.enemyType === "orc" || this.state.enemyType === "orc_king") && this.state.enemyMaxHP > 1;
      const isBatBoss = this.state.enemyType === "bat";
      // ★ オークキングフラグ（3-2-2: HP=4）
      if (isOrcBoss && !this.state.isOrcKing) {
        this.state.isOrcKing = true;
      }

      // ★ コウモリの移動処理
      if (isBatBoss) {
        if (this.state.enemyTargetX === undefined || Math.hypot(this.state.enemyX - this.state.enemyTargetX, this.state.enemyY - (this.state.enemyTargetY ?? 0)) < 10) {
          this.state.enemyTargetX = Math.floor(Math.random() * 240) - 120; // 左右に動く
          this.state.enemyTargetY = Math.floor(Math.random() * 100) + 20;  // 上半分をうろつく
        }
        this.state.enemyX += (this.state.enemyTargetX - this.state.enemyX) * 0.015;
        this.state.enemyY += ((this.state.enemyTargetY ?? 60) - this.state.enemyY) * 0.015;
      }

      // ★ 魔法陣の生成と8秒間隔での再配置
      if (isOrcBoss || isBatBoss) {
        const hasCircle = this.state.attackPoints.some(ap => ap.isMagicCircle);
        
        // 8秒経過したら消す
        if (hasCircle && this.state.magicCircleSpawnTime && t - this.state.magicCircleSpawnTime > 8.0) {
          this.state.attackPoints = this.state.attackPoints.filter(ap => !ap.isMagicCircle);
          this.state.magicCircleSpawnTime = t; // 消した時間を記録（すぐに再生成させるため）
        }

        // 魔法陣がない場合、消えてから0.5秒後に生成
        if (!this.state.attackPoints.some(ap => ap.isMagicCircle)) {
          if (!this.state.magicCircleSpawnTime || t - this.state.magicCircleSpawnTime > 0.5) {
            const rx = Math.floor(Math.random() * 300) - 150;
            const ry = Math.floor(Math.random() * 150) - 175; // プレイヤー側（下半分）に限定
            this.state.attackPoints.push({
              id: Date.now(), x: rx, y: ry, radius: 40, hit: false, isMagicCircle: true
            } as any);
            this.state.magicCircleSpawnTime = t;
          }
        }
      }

      // ★ コウモリは2.5秒間隔、オークボスは4.5秒、通常オークは3.0秒
      const attackInterval = isOrcBoss ? 4.5 : (isBatBoss ? 1.2 : 3.0);

      if (t - (this.state.lastEnemyAttackTime || 0) > attackInterval) {
        this.state.lastEnemyAttackTime = t;

        if (isOrcBoss) {
          if (this.state.bossNextAttack === "magic_circle") {
            this.state.attackPoints.push({
              id: Date.now(),
              x: this.state.playerX,
              y: this.state.playerY,
              radius: 40,
              hit: false,
              createdAt: t
            } as any);
            this.state.bossNextAttack = "global_lightning";
          } else {
            // ★ 全体カミナリはカウントダウン付きで予告（progress -3.0 からカウント）
            this.state.lightningStrike = { progress: -3.0, x: 0, isGlobal: true };
            this.state.bossNextAttack = "magic_circle";
          }
        } else if (isBatBoss) {
          // ★ コウモリはプレイヤー狙い1発＋扇状3発
          this.fireEnemyMagic(true);
        } else {
          this.fireEnemyMagic(false);
        }
      }

      // ★ オークキングは別途ファイアも撃つ（1.5秒間隔、扇状3発）
      if (isOrcBoss) {
        if (!this.state.lastOrcKingFireTime) this.state.lastOrcKingFireTime = t;
        if (t - this.state.lastOrcKingFireTime > 1.5) {
          this.state.lastOrcKingFireTime = t;
          audioManager.playFireball();
          // プレイヤー狙い＋左右に広がる3発
          const toPlayer = Math.atan2(
            this.state.playerY - this.state.enemyY,
            this.state.playerX - this.state.enemyX
          );
          const spread = Math.random() * 0.3 + 0.25; // 0.25〜0.55ラジアン
          [toPlayer, toPlayer + spread, toPlayer - spread].forEach((angle, i) => {
            const spd = i === 0 ? 1.1 : 0.85; // 中央弾が少し速い
            this._fireSingleMagic(angle, spd, false);
          });
        }
      }
    }

    for (let i = this.state.attackPoints.length - 1; i >= 0; i--) {
      const ap: any = this.state.attackPoints[i];
      if (ap.createdAt && t - ap.createdAt > 1.5) { 
        if (Math.hypot(this.state.playerX - ap.x, this.state.playerY - ap.y) <= ap.radius) {
          if (!this.state.isBarrierActive) {
             this.state.gameOver = true;
             this.state.lightningStrike = { progress: 0, x: this.toCanvasX(this.state.playerX) };
          }
        }
        this.state.attackPoints.splice(i, 1);
      }
    }

    for (let i = this.state.attackPoints.length - 1; i >= 0; i--) {
      const ap: any = this.state.attackPoints[i];
      if (ap.isMagicCircle) {
        const onCircle = Math.hypot(this.state.playerX - ap.x, this.state.playerY - ap.y) <= ap.radius;
        if (onCircle) {
          // ★ 魔法陣の上にいる間は連射（0.6秒ごとに1発）
          if (!ap.lastFireTime || t - ap.lastFireTime > 0.2) {
            ap.lastFireTime = t;
            this.firePlayerMagicToEnemy();
          }
        }
      }
    }

    if (this.state.lightningStrike && this.state.lightningStrike.isGlobal) {
      const ls = this.state.lightningStrike;
      if (ls.progress >= 0 && ls.progress < 0.05) {
        if (!this.state.isBarrierActive) {
          this.state.gameOver = true;
        } else {
          audioManager.playHit();
          ls.progress = 1.0; 
        }
      }
    }

    // ★ 通常雷（プレイヤー位置狙い）の当たり判定
    if (this.state.lightningStrike && !this.state.lightningStrike.isGlobal) {
      const ls = this.state.lightningStrike;
      if (ls.progress >= 0.45 && ls.progress < 0.55) {
        if (this.state.isBarrierActive) {
          audioManager.playHit();
          ls.progress = 1.0;
          // ★ 3-2-1: バリアカウント
          if (this.state.enemyMaxHP === 1 && this.state.enemyType === "orc") {
            this.state.barrierCount = (this.state.barrierCount ?? 0) + 1;
            this.state.damageEffects.push({
              x: 0, y: this.toCanvasY(this.state.enemyY) - 50,
              text: `🛡️ ${this.state.barrierCount}/3`, alpha: 1,
            });
            if (this.state.barrierCount >= 3) {
              this.state.gameWon = true;
            }
          }
        } else if (!this.state.gameOver) {
          this.state.gameOver = true;
        }
      }
    }

    if (this.state.fireballEffects) {
      for (let i = this.state.fireballEffects.length - 1; i >= 0; i--) {
        const fb: any = this.state.fireballEffects[i];

        // ★ 敵の弾の当たり判定（軌跡全体をサンプリング→爆速弾もすり抜けない）
        if (fb.isEnemyMagic && !fb.isReflected) {
          const speed = fb.speedMultiplier || 1.0;
          const step = 0.004 * speed;
          let isHit = false;
          // 前フレームから現フレームまでの軌跡を細かくサンプリング
          const startP = Math.max(0, fb.progress - step);
          for (let s = startP; s <= fb.progress + 0.001; s += Math.min(0.02, step / 4)) {
            const cx = fb.x + (fb.tx - fb.x) * s;
            const cy = fb.y + (fb.ty - fb.y) * s;
            const lx = (cx / this.canvas.width) * 400 - 200;
            const ly = 200 - (cy / this.canvas.height) * 400;
            if (Math.hypot(lx - this.state.playerX, ly - this.state.playerY) < 22) {
              isHit = true;
              break;
            }
          }

          if (isHit) {
            if (this.state.isBarrierActive) {
              fb.isReflected = true;
              fb.tx = this.toCanvasX(this.state.enemyX);
              fb.ty = this.toCanvasY(this.state.enemyY);
              fb.x = this.toCanvasX(this.state.playerX);
              fb.y = this.toCanvasY(this.state.playerY);
              fb.progress = 0;
              audioManager.playHit();
            } else {
              audioManager.playHit();
              this.state.showExplosion = true;
              this.state.explosionX = this.toCanvasX(this.state.playerX);
              this.state.explosionY = this.toCanvasY(this.state.playerY);
              this.state.explosionFrame = 0;
              this.state.gameOver = true;
              if (fb.isBatMagic) {
                // ★ コウモリはフィールド全体雷
                this.state.lightningStrike = { progress: 0, x: 0, isGlobal: true };
              } else {
                this.state.lightningStrike = { progress: 0, x: this.toCanvasX(this.state.playerX) };
              }
              this.state.fireballEffects.splice(i, 1);
            }
            continue;
          }
        }

        if (fb.isEnemyMagic && fb.isReflected && fb.progress >= 0.95) {
          this.damageEnemy();
          this.state.fireballEffects.splice(i, 1);
        } else if (!fb.isEnemyMagic && fb.progress >= 0.95) {
          this.damageEnemy();
          this.state.fireballEffects.splice(i, 1);
        }
      }
    }

    if (this.checkTraps() && !this.state.isBarrierActive) {
      this.state.gameOver = true;
      this.state.lightningStrike = { progress: 0, x: this.toCanvasX(this.state.playerX) };
    }

    // ★ 宝箱の収集判定（コウモリ撃破後）
    if (this.state.treasureBox && !this.state.treasureBox.collected) {
      if (Math.hypot(this.state.playerX - this.state.treasureBox.x, this.state.playerY - this.state.treasureBox.y) < 40) {
        this.state.treasureBox.collected = true;
        audioManager.playCoinSe();
        this.state.gameWon = true;
      }
    }

    this.checkCoinCollection();
    this.checkPotionCollection();
    this.checkGoalCondition();
  }

  damageEnemy() {
    this.state.enemyHP = Math.max(0, this.state.enemyHP - 1);
    audioManager.playHit();
    this.state.damageEffects.push({
       x: 0, y: this.toCanvasY(this.state.enemyY) - 50, text: `-1 💥`, alpha: 1,
    });
    if (this.state.enemyHP === 0) {
      if (this.state.enemyType === "bat") {
        // ★ コウモリ撃破時は宝箱をドロップ（宝箱を拾うとクリア）
        this.state.treasureBox = {
          x: this.state.enemyX,
          y: this.state.enemyY - 20,
          collected: false,
        };
        this.state.enemyType = "none"; // 敵を消す
      } else {
        this.state.gameWon = true;
      }
    }
  }

  // 1発撃つ内部メソッド
  private _fireSingleMagic(angle: number, speed: number, isBat: boolean) {
    if (!this.state.fireballEffects) this.state.fireballEffects = [];
    const tx = this.state.enemyX + Math.cos(angle) * 500;
    const ty = this.state.enemyY + Math.sin(angle) * 500;
    this.state.fireballEffects.push({
      x: this.toCanvasX(this.state.enemyX),
      y: this.toCanvasY(this.state.enemyY),
      tx: this.toCanvasX(tx),
      ty: this.toCanvasY(ty),
      progress: 0,
      id: Date.now() + Math.random(),
      isEnemyMagic: true,
      isBatMagic: isBat,
      speedMultiplier: speed,
    } as any);
  }

  fireEnemyMagic(isRandomAndSlow: boolean = false, isBat: boolean = false) {
    audioManager.playFireball();

    if (isRandomAndSlow) {
      // ★ コウモリ: 全部ランダム方向3発
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        this._fireSingleMagic(angle, 0.9, true);
      }
    } else {
      // ★ 通常オーク（3-2-1）: プレイヤー位置に雷を落とす
      this.state.lightningStrike = { progress: 0, x: this.toCanvasX(this.state.playerX) };
    }
  }

  firePlayerMagicToEnemy() {
    audioManager.playFireball();
    if (!this.state.fireballEffects) this.state.fireballEffects = [];
    this.state.fireballEffects.push({
      x: this.toCanvasX(this.state.playerX),
      y: this.toCanvasY(this.state.playerY),
      tx: this.toCanvasX(this.state.enemyX),
      ty: this.toCanvasY(this.state.enemyY),
      progress: 0,
      id: Date.now() + Math.random(),
      isEnemyMagic: false,
      speedMultiplier: 6.0, // ★ プレイヤーの弾
    } as any);
  }

  async loadAllSprites(): Promise<void> {
    const v = "?v=" + Date.now(); 
    const list: [string, string][] = [
      ["player",       "/sprites/player_front.png" + v],
      ["player_front", "/sprites/player_front.png" + v],
      ["potion",       "/sprites/potion.png" + v],
      ["villager",     "/sprites/villager.png" + v],
      ["player_cast",  "/sprites/player_cast.png" + v],
      ["player_hurt",  "/sprites/player_hurt.png" + v],
      ["orc_hurt",     "/sprites/orc_hurt.png" + v],
      ["fireball",     "/sprites/fireball.png" + v],
      ["magic_circle", "/sprites/magic_circle.png" + v],
      ["lightning_bolt","/sprites/lightning_bolt.png" + v],
      ["player_left",  "/sprites/player_left.png" + v],
      ["player_right", "/sprites/player_right.png" + v],
      ["player_back",  "/sprites/player_back.png" + v],
      ["slime",        "/sprites/enemy_slime.png" + v],
      ["orc",          "/sprites/enemy_orc.png" + v],
      ["orc_king",     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAB69UlEQVR42uz9d5xl2VnfC3/XWjucXCdVruqu6pwmB2kkpJlRQAIJgYAhy4C5xvYFc32vxX2xCaMx1zb4vuDLaxtfjG0wGFtoLJCEEhIKI2lGM5rcM51D5XRyDjusdf/Yp6q7Jwhx7QH8wpnPme6p6a46e++1nvU8v+f3+z3wP85LjN57rwcffFACfPrFx/J33Pr6K0dP3vZt0dfvtV7l7//163/Ql3iF3wuAn/lnv5771re+6aOn5meCmw8srP/IT/zETX/a3/nr17WX/B/k4ZsHHnh9/Nd+7e+5gAHkAyB/6Td+aezxj33wofvnm+/5o19M6X/+w85s9cwzX/nlf/kv7wTMgw8+KEdRwrzrXTflpJTmf5Br/qv5uu6B3bBz77jjx+3FxWO/c/DwiX9tjJEnTpxwAN5w/3t++sfecVh/+Rdm/Kd/Zc586aFZ/7f+l5vMkUNHnhBSAIyOgszB8eL8+Xe964E7AIwxN0SHBx54QP1VvefWX6YP89BDD+nrH/wDIA/+zM9kLzz12N9Wzeb7glDy7e/85gvd8fF/C+B7YUrSF/2GzVNP9xlL20LlBjSrdYkRgDHve9/7jj/zhc/9J9v2j7a2z/6Xv/f+93+LEOLKbmQBzMMPPxz+9RHwF/ga7Ujxy//4Hx/+jd/4jYNRyH/AfhjCrz23+S1F1fgn//XnisEvvHeM9XPP/drWM8/sNwYxUUivt/18balki1gsZnwkz15W4YEDC2tah8IYo1947uzvfucdzu0f/4WJ4Y+/3T3873/93/0ywL333qt48EFpjHF+5Zd+5e6/qlHgL8UCuPPOOy0B5nf+y4ff+y//5f/9b3/rwR+OPfzwwwLA9/sqGAy4cLbO2uUWchj4XrvdFgLzw7eF//GPX2j/3vJAy8NzfjAxq+Rja0H72J1vekgIYWzbMt6w0x02A84+WRWO18frdS2A+MaG4qGH9MzEzH3/+YMf+sOPf/yPwgej+yH+egH8OSd5Tz/9tG9ATKZ0tl/euO9ffXztQWOMD5BJhdtLpXDjyfNCxFK2GWop9+/ff7Mxxv1Xj9R+Rfj1nyhmLN3ztG1Zytj0xj78u//5d/7hj33f5Kc//LuTwz552wl0YyDEZ54a9JVyzgDi05cvDw/d/ZYT1Vr1P2WcfuzHf/z9xx8C/VdtAfxFhz0BiF/5lV/Jdeul/+Vdr8t84L47C/rpJ5ff/KWvfr6dTOef+8LnPnt+ueJcOnUs/oP3Hia4VLKs08vN+z72qS/kts5d/gf/yzvGODEeyMtLGr+nxf235/XZ9eH0Z55ZP/T5rz73bumV3vzum92gMOPav/ukc3ajWvoejOGXfvGX3tC68sxnjk6p4s/95K2x//jBL9w/s//EFzY2Vqp/vQD+nF4PPPCAOnv2rA7jh18X33rqd9//v94bzhzYL2frL/KxJzbffmFp9V89/B9/deyZ55b+1onx3h1HJ0KxfyolAqMz3cbmm958zDJ3HrDE+pUO6XQSbygYDpryzuN5U2t2j6dE+9iPvSVHxrSkStjmM2el+c7v+4EXUonY6tNffeo/vfdQ69gD92eDm7/1neb055+c+vQTl0KtvU+NkmP911XAn9MrCHuBE+qgX9qUbd9FCC20N+x2u92dLz2x9B7aO397KmkHtYZlba5W+Ml3ZEwibpmVjb5cvtqi5iW4eqFDLm6zWIiR1hXxT78/q5UjOHO2KxstW0zOOsG41Zn5nd/+Lz/lD6qf3bf/WFPQN5axxaBcMXG0Hg6HXfFXDCr6S7EAUsqzdvy49chnntPzOZ/1aoru0HOmxqce+MxnH7n7e96aCU/MdsQLpz2SyTjnTveEFkYoqRiGMb5yqYWemObiVoVhoLhtX4xnn2lJgUILw9BXrCy15f/2nQXz/t/ayl31E98Z+oO5syVbHN1uiksf+6BZLUsJKm7w/7oK+PN6nThxwgDida9fbO6E8Yt/8nyHE0cy4msbXZYr2mnWvQ+9YX/1/d9xe6g2tz2VScWRSnGu7nK65HKxHudzZ7rcfNTlkc//Pf6Pf3g3z14p88K2zYWKywtll47vknEV3aFQSVMXv/C9k2/cn4t/eG2tfssfPtFCZ5NyY2CJR68OWzcfP7KE2cMH/kq8XpOAZ4wR991338vyi0ceeSR4pTxEKRkWi+Ove+Ok//iHf2Va/8Sve/Kpcz3edNQJf+DehFg635SX1l02OiH9geYPn2kwDAQai3ecUvzr//AuWslb2D9W4t//04/x8/9mHYNF3/R542KaY7MxHAW3zgbcfWvMPLnm6I8+3ZOrO0Z89F9PhF/+fEX9/X/v/XGtVXqn7/sKCF8JpfziF794w4aZmJj4Hx5Eei2OACGEMEDwKhHn5cmV0ezs7Nju/gJYIdv1Dt952xjfckuorlzosL7j8l+f7PB0eUB+PIuazjMmbSrVFqduTRPaGR77VI/24oD73j5J7PdKhMk4CZXkdGh45KttkmHAj74phyOGYmbGUz/7XTn+/m+UaXd6xOOKgYfw/VcN/3KEUupv+Jr+Ki6ABx98UD700EP6Qx/6UP63/8Pv/aDn9Y0RUkAoYrF4/9Of/sRvhmEodyHYURVi/dzP3yt++Z88IdcaNme3YrzrPoc/eLhOq6Sp9C26fY8jdxY43Bc8Ww0I5iZIpmMMzq6BFbLy+ceQne/i7KMXOHFbB5EWTL1ukX4gyHT63Dq2zcKRAlcubVC/5DC5pmkNyxw+FCMet3jinI9DIO598F7rkYceUaPIGALm3nvvtR555JHgB3/wh19fr9fv9n0/xNdIhbLjsTMf//hHP/fAAw+ov8pw8g1wrjHGeu+7v/MjM7n9phifNMX4lMm74+bQ7FHzIz/0Nx+SUjKCXW84InJJ+ybImPd/9/7QnL/XfPvrD5ufuveoicm0+dabxo3Z/gmz/dUfNHfuHzMTb7jLvOlvv8Xc88Drzbe/44h59F/dZf7N+46ar/zqSfOrP3uXueneY+ab/+d7zbHveZspziyYD/7cTcbonzcf/ie3GUiZv/G6Q+b+Q7Pmkd+6xZz798eCglM007mZj7/0QLz33ohX8L73ve/4LcduO5dPjJuJ+JSZiE+aQmLCnDpyy9pP/dRP3bW7+P9KRwAhBL/1W7/lvv2tb//Zs09f+PbAxy+OTwljDEIIs7O9zWc++Zmf+6ZvesuZhx9++EMA7/3u7/kbfnvw+mQ6KdZXVqe/9tRpBo2+8LbbVFp9Gn0bpRUIxfrzq8zs8xifTtEck4zlDOnpNF98uMLnzjX4+z82ZLOZ41f/r1Vue+AU0u4zZ9nUlGF2RtE4c4FeP8QhYLPqsV0dEnqa5Y2+VEITj4/d8vabb3konk5NCeH7P//gz/3vd955Z+93fud3Fn/xwX/6q5vLW8eyY7lhPJFUylJ4nh/urJbnHvnUI7/+0z/9v77/oYce+spuBPyrCAQJwHzkIx8JH/xHD368WmmoIydPqcXjh1Uik5KTk5Mq0IEobZfNzsbmG4Y6/Mz3fu8Dx772xaf+w9Kl1Xsvnb9yZ7VUOzYMFHcfT4jXHzdUhi5/+NUqhYVZSq2A7GCDTjPk0xct8keSuDFDo+RT7PT4nrc6HLsDLK3YWHdYrobY+Tiu0pggpL1aJ1tf5tc+1MVMT3Nxs8fRAy4/cL9NtWzEJ746oNn0M6Wt0r3LS6t3bG5s3/3BD/6e/ge/+A+e/73f/OC/W7+6+S3pTC44cvKEMz4zJQuTE3Jqetra3tr2arXKfH6ycPbs2bNfAdTKyspfmQVgjRIgOfq9+OTHPvn3G9XWvfnxSfvUrbdLIQXryyvUtks4ji3SyZQZdPrZYqFwR6PZ+L6d9Z15y5LeRGHM5HIx45tALk66nCx4vOvtKR4/HXK2AdPFND/2N6b5vT+qcMUpMLuYQBrJyvkux7x13v+jKfooMo7BrXr81idbLN46S3cwJD+X59Mf3+Q77hpje+jyXNnB9bv88k9kuXmyzdnTkq9ctsiOZ0wqrkLP83WvO9BBYN7c3KofW7608m2uHQ9npqetfr9Ho9EgnkoyMzODFkbu7GyFrWa7+7Zv/pazn/zkH9VOnDihyuWyuK7ENv9/swBG0O3u3wlH2a/e/X273vt1YdS+hUOH9dyBBbmzscH506dpVOp0Ox3SqbTsdbsmDM1crVwr5HMJU8ilrH3zRZkdS8qdnRp+o8WxCYfkWJ9bD2VRzQbfd7/Fe97r0Nrq89iTHl48jpAhvfMVfvRd+zlyUwalOxhL4TuTnHmxyXITCuNprjy1w7uPu7z7pg63Lipq6zV+4L4Udx40rCyHfPXJFk9cCclPZMXkxJi0LKSllCSQsl5uHAt9HaZSKdXtdllfW6NVbyCkYO7AAm4sJhqVuum1uyf3HZj+yNmzZy+VK+Xr74sBrHu5V67wlzMyqD9DiLfOnj0bAtp1XTM9Ofv+Qb9/r2sl36SE/eaYFfsm2zhviMcSuZO33opQSlx48TS1nRKxeBxtDI1mA5QUnhfo8eyYObAwIfO5GAbDynqFqvZ59994Jwlf09uqcNMpwZ0zcHhfiGv1ufmO22gtNfiDT5cJS0N++HVx/tZP3ooXbqO9Nia0mTo8yf7COI9+8iKnL/ocp8r/+bO30G9vIodNvuXOFMcPaDZWhnzhaUnq9W/nTKVNeaXE1HSOZCxGNptACEyt0dUGo4bDPsNBH8dxkECv26E4OUWhOE6rUqe6U9HbO9t4vn/cUe69tnLe4NqxN8eTsY3hcFgbPXwFD0g4+5cqIljf4CIJhRDBAw9833csXbp6r23ZiasXr/64E8ZR2NEK0aCURb6YZ3xyUrYaTcwgwFYORmsEAikkriWZnsjK7Fgc25boMGRju8HGep3cLVNMv+N2Sn9cY6wkuPhcn8EwYFo4jB+W+KLD33n/G+h1PkfM8vmp999Pr3uWmFfCTqfAC2jvrHLPN9/Dz/YEv/97j/M//9Q7Ke6XdM4FKC3pDvpUVgzlssN212Lq1GGm1xtsn99ic7VGvpAhHlfkCwnhG191OwHNegfLsjE6ohQqYdFv94gvxClMTcjVK5dp1bo/7Og4QkikEEgtKY7lv31x/sBX3aTTe/bZZ37W8x7evZ/6L8vR8KdFACml1D/1U3/neMJN/1+rV1b/15WLK2+plmp35LLFcGp6VqdzY3osn9fZfE73ej0xs29eTM7O0azVWbp0kSAIEEJgjEFKwcREln3zBSwl0CZkbbPB9ladiWIBV1icfvIMbJS4bZ9mLK0xGtI5QXHWhd4OTlzzTTcL7nnHG9Fs4XgX2bgc54k/KdPchrn9iiCoMX/yDt5xp2ZiJkAMVultV9ChjbQMnmcz8CxWK/DwZy9SuloipR2azT71VtRZjDmKwliGRDxGtxvgB5rdRpEONclMium5OYbekJ2NDbK5XDg1M62zubwuFIs6nU7rRrW+b2dz5/WdZvtNN99028k77rx7/9LKlUeNNvzCL/yCfOSRR8xfyghgjBFCCGGMsd/zru/40KOfe2rxzJmzN2WSWfYvHAyUbYuxXFbFkwm00ZjRZZSrO2SKBUDSbbepNxrEXRetNcYYbNsikYyzXSrTaPSxbItKuUG+MMbEZJJabcjSoyvcfMolFothjEYbjQ4Mji144qpiqnGJmYXD6Omb0ctP4NeT/Nc/qpA9+DaeefI00u1y4nVDiHuofScJV/4zX1weY0EncVWfUAtCrYk7NvOJkPZn1xhaLsePTdPLOqyv1Vhe2SGZcLGUZGp8jFjcotsfoIRASoXveTRqdYIwIJlJY8ddCuMFNTEzTeCHSCEJfR875up+r6e73Q5PP/HcA7Nz0+9951u+9e3NVv2fP/TQQ5/bBZn+0i0AIYRwHFvfdfPr/79XL6+8JwgCFheOBOnsmEpnxyzLtgjDgIE3RIySXSlASUUmk0UbQahDpJR7GIExIITBdRT1ps92qUdoNOmkS7GYp9Pr0+60sKXNnXfl6LXLSBFDGYFrC758Oc6m821sDZew2mtMFhs4juLLZzrI4+9k5lvuwr56iE/8yR9w5KYeKt9D6hhPlOZoz3w/f/zkp3iLc5Gk6+HG4iyvNDh6dI6Jac1SaUC51GF8Mkt2bMDGZpVGzSWZijM5kcWyDVprlLRAgJASISW+7xNLxIkl4oShxg8CvBGcLAxkx4syJ5DDwYDJqZmgWa/LL3z6S988VsiM/YN/8DOdX/mVX3riLxpFfCX0ypZS6nxm/GdLa+WftLD84zedCmf277PGcjmhtcH3fAhBIfb0OkIJLOlgtCGWtJiam0SHAQixFzqVANcR2JaNowSvf+dBRDzg6pV1ypUOg26IJQUf+1obL1Nku+zhaUE6afO1TZtPrjh84qKg3hcoFWCCPjtBnJVEghdXn6Ae77Lu5PARCC1QtuDTlyy+uCT40pbDwAicWIKtkkdxZpInlgylxgBbQKPRZ32tzPpWmRNvXKAwmwEdoCyB47jshTkDQRgQS8cYn8qjwxClbKQAYQTCjG6JEGgNYWhwnRj58YI1f3C/LEwU/Waj9bqPPPwHv/XP/tk/O/Dwww+Lv0gUUb4C9Om/51ve85O2dn6h1+sHB44fsooT40oKOdoFEjSEWhNoTahDQh0Q6hCtNY6rOHhslrFcEm12If9oBWijEUJiCUEY+oyfiHPPDx4hd3ORXneAtMBS8NiZJs+sCI6emmJpfcjKcsj3vz7BeO1PeOPYVeYzAZ4fokWMhaTP+tNPsFYNefyJZzkQbuE4NoEUBF6Pbz8xpHXuE3zH/hrpmMPnv9DCjsfp2Cn+4+fLdAYQtxyCwOAlNLd+5yGOfvM42vLw/CHaQPSva2+jQyxbsHh4P8XJHIEfEISaIAyjRNFcS/GkkhhhGAwHGAP7Dx6wk+l0UN4qH/+TT37+940x8otf/KI0GPEXfQSoRx55JHjHO7712x//ypM/E/RC+8DhQyZfHBee5yNGDzEMQ8ZyBWzXASGwpEJKQbNRJwgCpJRksmOEOtz7OzrUWLZgbq6IUqCNwTeawcDnwD05EtMpng5CNp6ukIzbFGJJfvujG1SqOX7y22ZxYz6n/+tljpZs0m2f2B2HcHM5gprNHbclefdyyB89WWJy0OR73pUikfAwiRzCAWu5ypHlDkHV48okvPG+ffzJMyG/9okl6lVNLO7QGwyITca5/bsOMHXcQg7AG4YYoQgDTaGQotPzqdebWJYV7e5Q48Qc4skEYRiCEoxPTyGFGl1zdP3Vapl+v4eSgjAMsV2XIyeOW5fPXghPP3X6zsJY4f+otWr/+7U4+RezABRgjh06du+F0+d+vdvuzexbPKCLM5PSD6IzLTSadGYMO+5w+OQRMtkkzXqHzeUSCTdBt9uOlr0QBGGU+e/tGCMwWpNIxgi1idARIWnWFGdP91nc5/DG753nhaTg4pe3sOIO7tw0H3u8RrMb8pbXpXjPHeMs+kOunhnykd9ahsKHEe1VlC0x1YATpTpjdsBTT0ie+9oAbf0JA98wFoR819tclGVzaTvOL/yXNl99pkYzUSQ+oemU6iQKSe763gUmjzhsbwZ0GhYoC0sYDAbbVliWIQw1li1HMU2gjcFogyUlllJkxrIEQUgqk2BqdhzQnHtB0qq2aNTqSCnRaOLJJAePHpEXXjgTBkP907ecuE2cufjCTwdB8OdORtldAEJKGcaTqQOrVzdmJqdnvam5WccLApACrTXp9Bj58SLT+6eYmCuglCaWyOMNPOqlVhQmTYQZ7ZZ90ZFpEBKmp/OAJgwEY2MpCvkhl76yTurULP2u5rZbYxy+f5ryWo/6aovCwgSpg0U+f6bEs79b4qlLad5w2OF7v2ORhsjR7h1C6BQCH9t1eIct8cOQYW8I+Bi1gDGaw5NjXHi2wr/4gyYX1gc8cn7IzC2HmJzKUH9uHeU6HHnrFNOH42ytDrm6BLVzJcJmyMxsAaUkYaApFjN0OkMGw3B0pGkQIEfXi4HBYIgdc5icz5PIRADX4ZsOsXx+Fcu2qdeqSAG+5+PG4+LQsaOce+EMSlrfnUgkfrrVapm/iAgggfCd73zP8UsvXvzHE8UpvXjwsC2kxGiNDjVuLEZxvMj0/BTTc+OE+HjDEMdxGcslaZQbUbA3r7x8hTBkswlsW2BCg+tY2I5Nc6PB/tfB+pKH6QQcvztF4cAY1aU+BBpZcPmm792H7efZ6Ar+w6Mlfv/RFebm23z/fYo33dkhHIb4YRvjaRJCo+ICaWnW1tb53c8OeGGzws5yj+Sd+0js03zHW5OsNBxadR8z9LBcOHD7OJWtAc8/PWRqdoxBv0W94+Put3cvgGQyRsxVDPrh6GCLFrmJyubRdQviyRiZsQQDz8cISXosycKR/WwsbQOCcmkbKSXGaHL5vDx85HCwtraUfeMb3vRrn/zUx/++iEKn/nNcAPdKeCQolXZUdbM8Nz+/zyQTCdEbDBCAbVlMTEwQIlCOQiiN9jWW5RD4hkajg2W5KHENU9L6RqBLIDAhCBNxQbQx6BC0CnHShryEq09vs3jyIIv35Ni+2mI49MhKxeQ+i2Q6hjA2OzOS0pLH73/wHM8/usrcTAzfixLCqO0ssS2J7Sja7Q2eXGpy4J6DHHrXODOH0zhxMKGg/aJPqwqhpTnwuimQhouP1xBNn9l7ipSfkGhBdFwZPTrJLDDyBsqAMQajNaGOnpfjWAw6XTZXK0zPFfHDAIwhmXTxw4D0WBZv0KfdbCIti8CEIpnJ0Gl2sptrGwtS/fmrly14JDh06FBm6dzl38zmC7o4NyN838dSUdYvpCRTyCFsi4HnYYxCKY0JDMsX1+l1eljSJsRcW7bC7D14hMKIAI1GG4VQima1TbPVAGEoLQ2YPp5j0yguPLrJTd88R/62SZptGyXAlnEGrR6YkPyUw8R8jJn9t1DaFjz2XId9B5Mc2K8YdkM0Pl7gcvrFLjMHXd79XYrMhI2bEXg9jT/UxBKKeMzB4JE9uY+JkzatjR5rL9Q4ft9+dja7dOohQkrK1SZjyfFRaAtHOc6o7EWOihuJEQKjwZgQYwQ7GxXirk1+KksQGPzQQ+sApVzceJJWs4kREIQh2ELtP3Qg2FzeeOPB/Yd/7PLSxd8eReY/F4DIMsYkPvyJD+d+5Lv+pzuMFDKeTJih50V1rZBR2eZY7D84z+bqBi8+fQllKYQ29Hs9EBJjGYIwJDQGR0osKUBGu0UhovTARLtJGIHvhQS+Rkqbypktxo8WcJIx1s80yJ/ysLMJVDdk54Utnhklkh6aY8eSFMY9svM2+XmFHLNY29AkZ9McmjAMh4LHv9pm+mCS2+6OkUxq/EHAsGtx7kxAt+sTcxU7F+toEyOzWEBZmp3lOqEWWPk0pRfW6O20sS0brz8cne/mJZ2x6B+DAWEQxuCHAWGoUZaN1pqNtSrlUhOtDRiJwkbIKHG8PozYtiPSY0W21jcKIjTTo87qrhvKa54TyDe/8b7P/Pzf+4VHhVbaCEOoA8Eo+8UYlJIM+0NWLq/RrHfpdwZ0m0O6nSFCRPQ5P/DIT4xz8MAhnnryqwwHfQoT48zu34e32wu4ISfY/Y0m7IU0Kz6W62JMinpZ4Q1DhLBw0mNc+tRFLn/6EsufvMwzn9ih37EJQ02/FzI7rUgnQx77UoX1Tc3zz/SoV0OOHLeR4YBuK0RLh6ULPlc/sUzp0yuc++gVOqU+sWwSP+jTHEqaFQc3kWDYgu5Ol2IxiYrt5bR7OIYYHW9uLM78vgVcx+bcC6fxfY8jx48hpY02BiEFw2FIqzGg2xrS6wzBiKjSF7zkXggMoRJGmXq5+UOThenP/ugP/ejdjAwuXvMF8OwTz71uY2V71ha2u/tgzO6Vi+gDhl5Au94n9CWWLVFKI5VACwNEOL/juiTSSdqNFsEwIFssMD4zFYEpu0nTKGMOQo+JyRxj2RRmqKk+u4m0bfo7FaovVPEHFoEYYOXjqKkCR9p9/oVlsXhugy9+pMTyBUHggbQ8jp+Mk7QFTz/W5sLTJY4cTJEvCBCCdkfw1Be6XP3EVX429PlhApRtkdlfJLQHEBhqy11Kz2xgx22qqy2aKx2y6RS2EWgdlXnGGLSOCh0dBjiJGPsOLyIRDLpdJIJUJjNKgCKgSGCQSiCUQKgI5lFCoJRAyFHlMKqSNKHQWgslnKNBj7d99rOP/P4v/uIvLv55cA2tmBO39h9c1EuXr8joYqOHzujteR7VcoXi1AyBHyIMI8xKj456s7esbdsiHGpOP3WGW990J2PjaULtYUyM1dUdDh6aBgO9rkcun0ENoWEkXntANpcid3CSnRc3yeqAm980SbM9oFWyiVsW35SJ85Zcgu+/tMOjmy1uv3+C/HSMjZUeWy9sk8wVCSpDls82MW4Shc2LX9qm9OIOvzaV5oGUw7+pDHBTceL5OPsXYGtTs/1iDe1C8cgs7fUqypdIW7Jv/xTLKzsReGMrNrarNNtdkBrLkcwdmmN9eYON5XUS8SSh1ig0GH2NKW4AI9BGYNkWw16XRrWCZVu7VeTeoeL5A+YWD+tupxfWyuX9/+V3PvT75y6/eLfZ242vzXEgj548Rb5YlEEYjECba+FfjBCtwPOQZhS6xSuVeSM0SUWdsu31LaQBy1GjXoDEG/qjMjFig+sQ5mfGSaVihO0B9eeXGDs4hTsWJy5DChOauXnI7U+wdGKef1PvMC1C/u9TY+yrtnjxD9Z44t9d5cwfXsISLrG5ONnFAuuPr/Pkv7vE0799mdaTJf7x/gl+OBvn8+0B/9GGsRNTTM9r5vdZZDOa/k6d8VPzdOp1Wuc2UZaDJQWJhI2l1OgZCnw/JAgMBoEmSo777SHNWofJ2WmSqTRG69HNMHtsMLMHH2t838fzPIw2owR5dLSMcgwhpTx84phKJpK6UWksfvbRR2df8yMgnR/DIFHKHSV90W422qDDCPsf9PrUKzUsZY3w/VdfBIHnc+b0GTZWtpmdW6SYnyT0NUIotNZIKVGWAmNwLIEUhjAweLUugfYRDigHhCXJj1mcOJ7EXRjj48UMv3CxS/lin78ZGyM3gH7dJzuVYfH148zs0xQXHMYOZQg6A7pVj29NxLit3uaPr3b5paGgfXSW4qxhcd7GEKJiCmU0whUETZ9g4AFRnS+0QQmBZe12ANVeY2v/4gF63QHPPPkM2ztbWDH3uo2hb2CECWGQCgaDPlsbmyghoyPF6FEXVaJGO2uEoMoDx48ZR8Xyf+cHfvg3v07T7r9bFRDtSaWQQkYrc3T2CVuRnxintFXC8wYYE7wKW2yE/ClBtpDD8wL8YUA8mcaJx+g0GoSBzdpqmRPH95OMO/QHPkM/JDQhUgnC1pD2xS0caeM4LlLaIPsk4j7j45rtSclvboR8rN1HSYd6yoHxJEffPseRwwJ/6FFPB6Syc1xNpamcK/HlzpAXmj4DBN3xFHOHYyTGfIS0CEPQoUApm6DUpX15G2VZhIRIKRj6IRiBbduUq00qlc4oIggKhXGEUbQaTeJujGGvT6/TwXHcCDcYYQTX3yMd+gwGfWbnZkEISjvb2JYNCKS0UFKiLAtjDMqxGAyGslEp2a95Gai1wbZt5ufnaTWbUYEjBFrC+Pg4y1eXSLhxGvUq0hLkx8cJw3Avidld+lGZZyhMTLCytMz6yipTs7MIS+4tkiAkigAy6ib6QYjWgBZIZdFf6WCQtNNJLp3vceCAQ8wJObjgsjgzBfdPgR3jwkWP7E4XowQXLzVIppIcPmzAtXnhbJsgYZE/ksEbwvjdeaamFZYIkHEBRiAtWFoWLJ9pE/YM9TNbWAGEGLLZNJblcHV5A4VCCAhC0AHYlgSlcFyXbrNDebtEoVjEUgrf96O28UvsCaUQBJ7HzvYWsZjL8tISs3Nz5HJ56rUalmUT+iET09NMz84SGr3XQ7Es1xAMXuN2sDHRD7Uk/W6PTquFEIKZ+TmSySTB0Iswb0vSrNfotppIpa4liteVMyBxYjFsW/HkY0+gQ81Nt9+GG09gtEbKqD8Yak0YhmgdYllRGBRCQmiQoUfzyg4bTzW4cjbA9yVOLCCZEcTykuW1HqtPXOaeN6W4654kyYSJunFSYCtQAeTSIW//nmnyCY8Xv7zJ0NO4aYEkwLYF2yXYWhrSv9SEPohQoKXAoLFV9GuoDbNzEQgkRfQgjTYcO3WS+YX9PP/ss5S2thnLZdHyukg4Yj9JKZEKMCGl7S1MqLGUBQZa7RaDwQCBwBsOqdUqKMfGdl2EECiliGzuXntEWIZBCALm5ucZ9vvUajWUUsRiMZauXCGRTEbAj4jAj/JOiUG/H/UJgmCvRTwcDikWiyjbQkiB3x8ShAH7FveTzefRRhOGhl5/EP1ehxgEBw/N4jgRgcOg0cKghwHVixusvNBisxwgLRDS4dknh1S2PMKez9ZyDzeteOObcuzfr2i3DRqPb7o/ya135+i0Q5rl6Lh49JMblJY9pFK0BpKLT9TY+OIaYa2HUAEIjREGrQ0x18FxJUYESGUIgoDBwIuSOUsyf/gATjxG6PkR+UNJCsUitm3hDYeYEVbgex46DNnZ2cEbDFEyQlZz2SydVju6z5ZFo15ndX2F/ESRQrGI0SY6jqVk1B18bReAHwTE4zFuuv0WDp44RrPZQDkWfhgwGAz3+t9iL7E1lDc3Wb1yhfLWFmhDs1plbekqO1sbKEsxPj2F73lsLq3iewH7Di9gxRw6nT6Xrm5RHM/hOJJuxyNmW7iO2ouc2ghwFePHDsCgx2zBRkqL8+f69Pua2+7JMHFykme/UOJrn2mzcnUAMtp50kj6XcPTj9b56h9WaLUMt79lisXbp3nuxS6tFmRSioSjye4rEt+XR+ho50oT7Tykwfc0WksMgkqtzfZWFW1CJmYmsS2b8tYOta0yheI4+WKReq3GxsoKW+urhIFHt9lgbXmJ9aVl+p1uhABi0BiMjCLJ3P59JNMpuq028WScYzcfw024JFIJuu0uUkozu2/mNQ8BstNuMTk9RbKQ4citJ6jWy5R3drh09hy2VCjHflnmHwYBxhiGgwGry0u0Wq29Dpcxmmw2hxKCtStLhL5PKpvBiblIKWg3+zQbXWJOjE67T6PVZWpmAo0X5R7GUDwyixl3KR5LIZXg7HNDrpzvcPTmBGOZkMN3ZZi/ucD6V9d58ZNrrF0xBEGMZsfmzJN1rnzqKtr3OPHO/cTGBxw9ZTE5l+Frn6vSKRkKizHUZILUwgQqEYt6+1ozMZkjnU5x6dIGoW/wfJ/V1QpSKaSAbD6PUIJWo8nW5hbTMzPXuoEmOoo21tap1WpgIAxCGP2/a9xIQyKdJFfMEgz7rK8ss7C4yMGjh4ilkkhl6dXLV1Ro/Oov//qv/fh1pcVrswBWr1yh222jjWbuwDy33n47Lz77HO1ynXgiHsGC5uVC0D0kK4xQLyGucQHA4NgOzUaDy+cvYCmbhYMHoqrYRJl0zJUMvRHd2gqwnAgulgZCW+OmfA6eylHa8Vh/vELeC5GBj7Y8JqcEt7wux9ytedqrdZ7++DKPfrrM05+scPmzV0mOJzj51glO3uySToAMfcaMRCx3ePwTS0xM55iYAi/sYUQQRQAlcR2JZSsMNrYNnheitcLzQ8anp5g/sEi9Wmf18hW0CQiF3sv69+6JNghtsBDXJco3dhAtZSGRnD97jrFcjje+5b5Iix6GXDhzhlanZey4tfrd7373ymseAUQISxeu0KhWSY8lufn1dzA9Mc2w18f3fZSQEVBhXsGvfS/5u/Hl+wGZXJZ+t8vl8xcJPI/J6SlS6QyWUvT7Q4oTWaSAdruP69oUi/kRW8ig/YCDiwmSruFrf7zG/SeO8EP338Pa89tAin5X4iR6nLgvx+RNU7RWepSeKbP1XBWRSHLwTZNM7xOYMKQ/dGi0NZ2LTX71n/5t1l9ssHGhzoFjDvGExPNDwjAkmUySz2fwvQApBXOz42xulhFCI6SgODWJ7djsrG+wdOkyhUKRIAhevjn28P2XfH3UEBNCYEvFU195gmHP481vfwsT89PoIGTz6qopr29JK26L9/3NH/wRY8wuYfQ1awpJaclOq9rkucefod/pcfDIYV73ljcRCsPVC5dot9sIS0VnmNnDtdilv0YNjpEWUo5wBASB1ti2TbVc5sqlS3jDqGEihKFcalNvdojFHKqVFr4fRMeHDtGj3oK0DN5Q0F2qcezQBCb06NY1Vy8EPPdEg07TopATHL93ioPfeoCj33yIg998gKNvX+DoTRn00HDhdJ9zT/ZorkksY8ilHcZTKRqbHo4TG/UxIu1BEPiAplFrMRwEJGIJlLTxhh4TU+OMZcdYuXyV5UtXUNLCktbetYrd23GNOPxyiqcxSCHRQcja6irrq6vcfOftnLjjJqQwrFy4ysbSKo5jMzmZayil6iOnldc2AiTH4pXtzQ2a5Zo+/fhp+q0ep+68iXu/9W1oS/LC88/TbbUjNMySUQNo96GLa6FPiNENMKCDgDAISOVyTE5MsnZlmUG/j+U4uMkEBkG34zPwvKjEQmFbgpirIoxcKqSyWT1X5ebDC/zoD72FqdkCa8+Xqb9QJratufREnXbHITOuOHlHjoM3xTh2W4rF4ykCo7h8YcjGV3eYEjGe+qOz3H3zYW69ZZ6/+6NvZftqk05Do2JRw0dKg+VEVYBGYIyk3w8QSBw3RjKdwbIdVpaWGfoeU7PTICUm1NERODrbzaugpMYYjBDoMGT16hLLy1e55c7buO2eO9BCsHT+KpfOnqe0va2FMLzvfT/8ow899ND6Aw88oF5rvwHLqPBxRDi7vbahdKDBGG57451YcZc7X383j33xi7z47HMsHjxEYXIc5VjXuH7cuNQFMOj3aTaaWMpGEwFD3sAj8HzGinnmDyxw9rnTbG/XESgcO8ag75FIxpkYVyyv7BBLJtGBxcXPb3BkaoKtzQ3e+63HOHvum/n13/4UH/mtf8hP/OP/wJcq4MQVWgsQQRSFQoEiZOvyBr/+j36UJ55+kcuxOH/3x+5n2K2hCChdKdNanWYslQIUbkwyNVVgOAwZDD2QAaurO3h+yOTUFPsXF6NwH4YUx8cRtgWhZtDvI6Qgnc3uiWBeUX+nFP1uj5WrV6lUytx59+uZW9wHyrCxvMYzjz9Fu96kWiqTGcvwyU99al4Iseui9tpGgLe++a2/kc3lO41GQ25tbZjli5c4+9QLTM9NU5yd4Jvuu598vsDO+gZXz10kHPqEYYjv+Qz6QwaDAcPBAL8/xBsO6HTaEeAjDLaSBL6PHXNASQaDQYQ2CgFaEQx9+v0eaxtlbKVQCixho9t96IeEA4NQmn6/Q71S4fW3H2Q8XeCps0ssHJ7EKpVhrQQbJVivItbKyK0y3lqZUwcmEfGQqxc3+e53vxlHBVR2qjgxm5AAPEnQ6aNChZQK24FGs0WpUsMPPHw/RAqB7w3pd7sgBKl0JmqKjZo8Ukn6gwG9bpcgCPA8j6E3YOgN8TyPIAjQYUi70WDp8iUGXp+Tt93KwZuOMr+4j0G7z5mnn6dRrbG5sY6bjsmBN+Dymav/v3e+8z3fC8jXvB385a985bcb1VouXsjobq0jpWVz8cJFYpkEJ269ifn5ObKFLFfOXuLZrz3JhRfOEIvHUZZFIpkcIVaMgB2DkvJav1sb1tfXOHDoEOlMhnq9xvrKKpaQxJNJEpkEgQ7oVxuEvokIJlJSO7tC/+YkyX02lUqPJ58uYzmGj37xGfy0x0efe4ab3zLB8W+9GbAiJHCUkAhpQCik8vjg41/iYqvO1c9+HtvymZ2Y4PSZDZJJG5k0lB7fQnseVjKGwmLQD8nkCiQzaYb9Ab1Gk1qtRnxjk8Ujh9l/8ABnnn4OKSSpXIYwDFBG0Gu26ZoWUsmo/4/AH/r0uz201qxvrTMzN8s9b7mXuYMLTM1OU90p8ezjT1EvV6hsb2FZ4BwqCoahbp3dlM8/+cyvffqPP/b7kSL5tWsHW4EftAJhmDo5Q/nFZXqVKl3H4crZi6TTY8SSDm4yxpFbThJPxXnh2efo93s0mw0KxXEsqbBsm1Qmg7QiLEAIgRKCjfVNAh1GEQBD0B0gQgO25NDJ47zuzfcQ6JBP/OeHWV7ZojgxgeUq+r6gNxTc/a6TPP/J8/zz//SH+H7IHe9c5Lu+81YCP8BnwMpygFcdRqSNEVVLCYHlOmT32Ry7K8uR2wv4fcUHf+8x+i2PUGtufccRnIkUvbqHtDROPM7mVp1mu8cb3voWjt1yE1fOXeKpxx6lWakx7PXxhkNsxyGRTlLa2iGWiBFLxPHDMOKLakOn08YfDLCUTbfVQUiBm4hz0223csuddyCUpNtqsz4ccub5FyhtblPbKiMtl8ShSdL7MlgKEfQ7xmpj/a3/6e98Z71e+ejDDz9sXqsFIGaK8yvDmLVv/M79xvR6on62StjymEhniY2lkUqSKxY4cctN+IHPoD/A9zzOPHcafzjEsVyq5RLSCOKZJH4YIIWg2+rQ7XY5cfMp0rks5e0dVi5cwrYdjtx8ksnZedKFDPsOLrC5tM6nP/wHaDSOdNje2aFwfJzDb59hYb8iFgepI8h5EIQ0K4ZWz+bs1yrUzpejli1yT7Yl0i7H37iPmf2S9JjPWEIglRu5P/qwseVx4dkelcc2Ub6hMDPDysplbrvzLt74jrcyDANWz12m02hx7vQLNKo1JqenWTh2GFtaXD5zlka9QWFqHG1MhF1oTblcZnJmGsuy0UHIkZPHmZ6dxXEdlC3Z2dzmhWeeQ3s+XhBQ2S4RhgGpw9PkjuUZnwiRjkV5Jwwrn1tV/qD/5XK39OZdj4bXxB9ABrF/MX7XAoV9tpiZT0Ahi9Y21eVNapUqsbhLs1bnyoVLbG1ukRrLkM3lmdu/j9n9+1k8dAAjBds7W+ggJAxCgiAgMCFzC/uYnJpBSMGls+fodrpMzExz9NQpatUKZ587jevYTM3MEvg+m6vrxFNJvO6AYbWPp1x00qXb7FNr+zRb0KhbvPBil6FvGJ+NM3dqgomjeSaP5UbvAuP7UgShz9VLAzzfQmtJvRHSrPu0mprVy11WvryGaGsy+Sy2tMhks7zuvjeBlDzxhS9T2yoxMT1FIpFgZ3OLVqtFOp1mLJ/FTSZod9r4nocJQvTomnO5HPfc+2bm9u1jbmE/sVSSMAw59+KLXD1/ibWryzhSUa/U2N7ewh6LocZTpA5MMZYXFKcFtisIEDTX+qbX7DTf+S3ffOn7vv/7lh555JHXJgdIjmeQlmZyXOJaAd2uoT6ZxO4V0Y0mq+vLCF8QTyaYTexj9cJlVs9dAkuRHy9GglDH4fbX3R2xiHZZLjI6C1u1JoN+D0solFR4vsdwOKTTbuNYFueefoFatUXgR4zhQqGARFLZ2qH2zBaBtrAKCYbekFxO49pDZqZsjpyIYVn+NfnZHuAiMTpK7DbWbDY3Q9ZDqFYDwlBhhdB6sUrY6JNIZ8lOTNJtNslks2TGxvjy575Au1pHSBUlcSZi+Ti2TafdYntDkMnluOWO26+hfyOipw41G8trCAHtTodms4mtFLay6A88tlY28P0hsUKG9MFpMvtzxCZiNKoefiCjja4DCllb1g4XwtZG9ZbSTvmffuADH7jnoYceek3yACuxWCA54RAGEAiDPwxwXE3xrjyN9STBpSquY2HaA5bOXkCgMELjJGIRcLNb/+6yXbUZMWcEMdthe32LaqmE4zpIKbHt6FfHcehqg5GGfYtzbC6vYyuLwA9IZzIEXkBzp0r3xQ0yt8/hxmzSjuTYzTbS8vF9D+0LEOFosUVwm9GRq4gfGKYmFLMzMSpVaDUESjr0L28SbnVIJTIUJycwJiQIQ/wgIozGYzHaCNJjmcgHQAiCwMexbDZW1jBynQMHD2LZ1ssA+l02lVKSeq1OaW0TMdoUwoCdSeDkxrDGE1iFFJmCxcScQ70+jDBwDVoTgWLSgBSGQFSUpfSJEyec8fFx/cgjj4T/PReCFZqA2dkktm4jPMlw4JPPOeybt1iVHunpOVodSVgdolIuQikYhnS365x7/jR6Dw8b6eQstYeGSQOWsnBdd+QkYuh1u/S6XYoTE3ieh21bjE9N8PxXvxaRIGIOgR9QGM8ThgGVUpngmRWKdyxQqru4SwELByRGh0gJfigZ9sI9kFoqTcweJaPSUK2EnD+vCT0L7+oG3ctlYskkk9PTxBwHZSvaWlPe3GJtaYVUNkuv3WNicgqhBFubmyhl4bguDCOdwPLFy1wPgewSZU0QYoQZsaoNsYksKhmL7oU2OMUUiX0FhPJxrR4TUwpLeozlLCwVLeZAG3oNTW+1KfCN6XX7i+994Htu/vAHP3j6NUkCj33bm8zkYoxiFpQMWb7QQ7qSuX0OoBgGIdubhl5X0u0QsWLDkPbVHUQgkUru6eGFUHjlJmIY7A3fMdcIj2SzWXr9Hsq2ufnOO0gmkyhbcfHiRc4/8zyLiwtMzM9Rr1ZHREnB1tYW7XqDzGyBxFwWCjYHTqVY3B/iByG1umIwDEdOJYJ4PCSXtbAtaLXh3Fkon62hGwMaS1u4ymV6bp5EPIEX+EzNTNOs1rhy4SLxVIo73/B63FgMP/C4eukSV85eYGZ+LuJFVqvYlvOyDSiAUAnsiTGkFV1zEATEZ3K44wlMoNGhRQi47oADh5IkUyMxqSVo1hXNxpCFQxZgsb3qs/lCDdWSurW6Iwszxaen9s9+yBFC//Hn//hXR8fsf5fKQEyfPGFsGTIxkSA/HyfIJOgPfGanIfQUWnrYtqJRFZRKHsIyNKogTQLpRMIRwqhPoIyi9uUzmH6AUOoGhTBScvDQQUKtuXr5Krl8jqnpaXrDPssXLpHLF5g7sJ/ceBHbcbh0/jwmCInZDjub27SbHYQJyRyahDHFvjmB54X0+pGpxC4cbTsCJQ2Oa1GthLTqFt2lHfqNLtJ1mZwokoglsRNxFg4dYDAcRp4/OxWuXLxIOpehODVJb9Bj/eISM7OzpPNZ2o1mFI38qMrZg3mjVY4hpPBNJyFlgY4YQQPPww9CLAzF8YhhnB2zyOY1vo6AJiVhZwd63ZD5uRSlqw0G7RA9kLR32tTObxmlLGGkIB53efPbvuk3P/KJj/z4qVOn7Keffjr4b10EYnH6qKnVG7QGdaaKWYon5hg/nGXuiEOr0cMYgTY+CImlbARQ2gnwQ/B8qJQjfbwApBZ0r24zWK2jjNytzEBAPJMmX8ijLAtvMKRVq0c1tNakUynmDi6ibItsIU9xcoJGvU6v1WblyhIEIf1un067S7dVB0sRBgaFAiVGYlQ9WnARDV0DjhRgQqRlkcsVkI6NEILJ2WkKE+Pk8nnKpTKeN0QKwdbKOtvbmyNaPKRSaXLjhcgMQimazSblndKI1n3tpdHY02lSh2fQtkSHmjDUFIoWiUSUl0xOK5QUBMagdUCkOJMR6zpQVJdC+mtNVp5Zw/eGFNJFYukYrhNnRE8JjVam12s4bsb6/ktXL33wv4eGUPzdv/t+s7W9TafZotdsc+aZF8gtxCgs5pi7LYexowaJVGZklRLxA5UUDHuS5aWQbleiIi41woPyV86NTJ6jvMAImN0/j+XY6FBHDSAZ8QeFEEhLkUylMFoThJowDDh89CjjM1M8/8yzlNY3CAce3V6PQa9Hu9mK/HgEe1KsqAU7UvGMFoIJQ9JjWZKJBMlUGitmM7swTzabpdloUi6XiY0+gxlR2r3BcBRcDf1BL6rzR3xApRQbq2sMev1rUUBAqAMK9xxB5GIEg4BkWpJKG3JZi9SYj+8LQj+Sz0af1UIYTWgERktqGx7Lj67QXOlx6+23kRhLkM3nyWSyVHcqSBXdQwupr1y6rC9dPNsbnxn/m0urlz/834oRqDvueuMH7rj7Tg7fdIzC7CTJfJZGucWLT1/AFjEmD+cwMty7EYJILxB4EIsZhCWp1AKEsDChz2C1gmkMR8KHa54B6Uway4pYzkYb/DBkLJslmU6hbButQxASpRS2bVMpl/F9j/GJCWZmZ/GMpt/v4cZixNwYsXgMNxYjkUoiiEwXpFRkMhliiQTxRIJYPE4yk8KOOTjxOLfddQdHTh5lbXWNeq1OPB6/oV1rWRZuLPq+Tsyl225f2+mja2k3W4RBcI0HIXblHwaRTWCUwFaG6RmLeGzIcBigiVqlQowY0kJgjEC6UN/UPP+JC9i+zZve9lZuuucubn39HRQnJjnzzPNcuXCBRrlGpVSmVC4JQk2n2XHGxsbe/qP/09+88thjj545dOiQW6vVdv2J5b333it/5Ed+hG/Eh1AcX7jFzC7uIzmW4tQdt+Ekk1Q2trjw4mme/OKXWXjjAhO3FEhmIm600QIhNEEoadYF9aqh2RZIpbGNovzYRRjokdhhtyyE6fk57Ji7xzAyGJxYjEx27JqdnBHXKggh8LwhsUSC6flZ7JhLr92h1+5w+cJF/KGH4zokEwm21jeplkq4jsv84n5CGUnatA4pFIvMzM4ST6eIxVyqlSq1ShXXcUY9hBvbtsJE0anb7dJtt25o8QoEm2vrDPuDvQgw0ggTSJi45wheQqCHhlTScOCwg+X4+KFGCINAjioCsG1JaUdx6bPrBOUu3/59D7Bw6jDaC3jua19je32b88+fpZDPR+ZTJlIjSaXQYRjUymUrW8i8uNPc+o7hcHjl1Z7vn5YjWJ7n89xTT9Ppttlc3+DoyZMcuekEY4V7SSQyfPbjf0y7GzB76wTdgYchojYbI2i1QryeRjkS13XoL9VQfrS6jdBRc2b0CeqNBsXxInK3WYRg0O+TSqdR1yWMeypcY3AcF+0HXD5/kWw+S2F8nHg6xdGTx7Ftm0ajwdryCl7gj3INQWg0xfEpZuZnMVrTHw5xYzE8z2PpyhUcZeFY1sse/p6fwejV7XajBXHdHZQjXEBrjVRqLwmMxG4W3fUyqcNT+G5A34OVVZ99C+AqSTAqi5QlsCybtWcaXH2qQr/S5lve++0cue0kz33taZYvnuP5p54nlc5y8PAhitOThFoz6PbwhkOEUvjDoRX4ftioNE4lYql/78SdL+0eBR2vp9/z7veof/4vfunjRw8cfeJPm2Ggvu27vvsDR28+TjwR54nHH6O102B6dpZ2sx2ZPA+HLJ9Zom9sekGCRsNnMFRoz0UoiRtPElS79JbK9FdqCC9ECvYe/q5jltYh+UIRI67RyiKqOcTc2LUE7ga5yUhDb9l4gyG1coVWo0FuPHIpc+MxAEprm4ReAMJQnJ7k5K23oIQkFo/TbDTY2tyk14mIqDKSQlwndLzuLQTCCDqdDsPh4EY3ECFo1Rv0Ox3GslmGnnfNE2n0uYf1DsqxsLNpjDb0OwF+X9D1okAYDqFUMgTDOMtf26K33OHYzcc4fOoUrXqdz/zBxyltbnPnPffw+je9gWwhS7e1qziKAKV+r4dlObiOI7vNttaoRT3kXnzrTSKU9wqt7ouZ+Juf/Noz97hx6zGtdens2bOvGgms6f37cByb8cI4YSdkY2OTT/7XP+TkqVP4RlOcmWa6VWft9DLH336E/LExttZ7lM6s4XiglUTX+wT1LtK2Ior2S35ILp+n1+9RrVQoTozv2ckJIeh1uwCkx8ZGuvRXJlJKKaOFgmFzdYNhr09xNlLTnH7yaUI0OojEF45t8dzzL6AshVKKRCy+J1/b4zW+5EMaRhYztsIbDvZ0jLs/XylJt9PZQyrb7fZ1AHT0HZS06FzaxihFYjaHJS16PWj2PGJJAaGkN/ApV3bwy0OOHD3E9Mx+ls5e5NLZFwnCgHd823vYd+QAodB4/QH9oUezXCPmuMRiLpZS9HpdpJT0vKEcP5bVi6dmtWVFVnzgcvbxreD5jz99MpVNzj3//PPP8XU8oaU2If1en/WVTYrTUxw9dZxep8NzTz+NMJHIYeHAIhOpAp2lGrmUxeKCzb5DSVTGxko4CDti1b6S053WmkwmjTEm2sH1BrZtRzt+9ED63S6Dbjfi5fMyQ45r32uEJkohmZidZnJinJUrV3GUhTCRwsi2bISIkEDXcSO6un4JXWv0s811byUVgefTqNZAXyttwSCVotNs4w+Gkc5v5AlkblxBUUQLJN0rJTpnN2mcXqF65gpqoOk1I+3CrTdnSekBnUaL/PQEvudz5uln6bU6HD9xgvxkES0M3nCIsi3mFvaTTKfp9fvoMCSRTICGna1tkrNJbn7HorztW6etE2/LW0fvzVtH3jJm3fzOBTeVzQQLEwf/6T/63//R3YAezWl6+QKwpIVCUq1U6PZ6ICXHTt1Ep9Pl7JkzKASumyA/McXO+QaljRqJgmL+VJHY/gLJwxNYuRhB+Moj14QUVKpVMmNjWJZFrVyl1WyBgEBHzqEIQafboVat4Xse9q4S6br3bn9BCoEWAT2/T7Vaprq5w7A3QOoIkt1a2+Dc6RdJpdJgQBLZt+99Lyn2vH6FFJFiJwyp12o0mw3a3W5kcikEGlDq2vHj+z7ZQo5Wq4UO9ctildEGYwnkUNO9WkIJQbKYR7qCmRlY3K/obVVorDRZXDyIFYvTqFRoNZvMHzxILJFgY2UNPfCJ2S46CHFdh/nFfSwcOYDluAz6AzbW1ukGAQuvWyAxYbG50WDYD+l1fLxmyNhEQky/8bBoep2bhu3hJGBKpdIrqowsYUT0Q3VU5ukgJJFKcfDIEZavXGF1aYmFgwdJpuJkkmkYSPTA0O8MGQ58YsIamSjfuMDMdfVTt9ejOD0JwNbmJtsbm8zOz5HKpNEjly0/CPH9LjrwGfR7hGGIGT1wJeS1bp8ALQJotllvdtla3yCVTjG9bw7ta9ZW16hVK8wfWCSRTKFHyZ4we5ztax4Io2gQhgGDwSAK+VJGqKaQ2LZFMPSobJUYDAYUx8cpFossX11i5KTxspQbY0AKhG3hTuVwF7LIsE9xXJFMO1x+scZOucGBA6ewLMH66irZbI5CMeqsdlotrly4iJtIMLcwT6hDMrlMxLjShtWrS1Qr2xQOjzNzKMOw3SMwEoxhctKm2TZcvlrDzaZl06rrz/zJZ37+fT/+vud/99/+7torVQXWxsoK29vbuwTnvc5atpAntrJGZafExMw0rhsjlk5w8StXiOeOUGlJLNfBb3TpbzewLPmqrFgpBNVSmeL4OPPWPjrtNuWtHfrtLkZAfryIoywMkdmU5weRxYpUDD2PWqUamUsFkRhDjQSUMTfGxOwUi0cPM3/wAOFwSPr0GfqtNpWdEhve+jWbNwSOFR0V6ewYqUwmWmQjqw7HcUZ/LrqGarmMDkMG/QG2stm3sEAiHqdWraJ1+Ip6iJfmLSo06L6OHMIch/pGh61zVSbzEwwHfUqbWwz6A/Yt7ENZFtr3UUiatSam1oi8CA4t0mm2ePrRx6lvV2jU6tjxGJn9GYwajoypoN+D7a2QUl1QXvbpXLoihs2O8IW8S3nKADzIg+IhHrrhIamxVOEDtrL2gBulFIPBgH6ni+3YtBotfG9IYsTpq26WsAqTdHR0M71ym+FyHctSmOuMoV8aH4eDIQbDxNQUsVgcy7Jo1BsRodL36XTatFtt2q0O/V6XXq/HsNOl3+nRbXfo9/sk0inceCxyLnNd8hNFjp46zsKxQ7ipBI7rMD49SWFignarjR/62DEXJx7DdR3q9Tr+cBgtsuGQbrtNt9Oh0+nQabfptNt02x267S6dZovBYEg2n2Msl2csP0alUqFero6iiXj1yltE+YjX66PGbISTAAtMI2D58XWKk5M4rsPa0jI6DMhNTmAkuI5LoKOEUyAY9gcM+gNeePo5rpy9QK/TAyNwczYH71tE2iGCyGxDKEmrrVh6vkP/TIXedhOlhVHSMpvb67neoPfRz4eff9mHti6fP8/CgYM4sVjUIRsOaTebYAyJdIpMboxOt4sYPbywN6DdNqiYQvg+puMhHMlLT8SXShqUkHRabVauXCWdGaNQKOLGYmxtrNNsNkeb1FzL+hGgwXJs5hf2E0+nicVcDp88gh2PERqNtCzi8RjxRAI/8MGxiSfixJMJ7rz3HtCgZPR9Vq6uUJ+uYPyA9bU1yuXSXm5gxI2GDrtt7Nl9c2TGstTrNa5e3CHwvJfYnL3C8ze7f0QybPbI+JGeolLSUOmTy42RGhtDEuVA+cnxaAM02wx7A+LJFI7r7NnGXDpzjqULl5AGlKUIlcXELdMIG66c7yKlxcyMSyot0Z5P/ZkV3ESS6fuPY0KPynPr9Jq9H11cPFi6cPHcz2C4QWlkDRpdrp6/SDo3xr7FRZqNVmTrDgRBQDKdplqrUdreZm7/frYtiQmGWDJFOAwZlBpRH8CYP70tpQ29Thff9+l02xTHx5men+X6mb27h5QeJYj5YoFkOkUynmRtaZmvPvIV3HiMoe8R6JAwDCLDZktFXv5BFJ6VpVAobCuKbv7A59CxwwRo3HSCQb8PRNBuVI2IPUcfYUCNSCtrqysMBkOCwRAl1ctC/0v/2+whnRrbsmktl8gn4+i4RacT4joO8ZjL5toGRhtSmaj81WHIwPcJgpB8oYDjuHTaLdaWV0Z5hSLwNcmcYfpIgWq1xm2vy3P+xR5XrvQ5djzF1tkmRiqKd+0jdOHo0YSwbovzuX/7YrBztfr+7/z2783+0Sf+4O9cPyBbxd3MB7TvE/rBHgNmtzQSQhAGIfVqDddxyBbyVHd2cKZzKMui+dwSohdGPhOvcg6+9AYpFXkFDQZ9ur0evu9TKBZJJBI4jhu9XQfHjWG7DlJJKpUKVy9dolGpUd4uUa1UsS0bf+jhewGOZbO1vknMiZGIJZBIgqGPP/ApbW6zubnOoNenVC5RazVw3egYEVJiK5uYG8N1Y7gxN+o1OC61apVKqUy/14s6nfLVxyu9Uj6w66cQdoZ4vSHZqTzeYICpD8hkslRKJfyhRzaXvWYWNUIZPW+I7/sMe312NjdRkdNERL8XiuRcjEPHExSLhkJBUKtLdjZ6VC7sUDw6Q5CxyGYMC/OC7LQSxYW8aDS12bm4cdf9b31T7ez584+POonassZcdGOI72nqtTqTU5N4Wl+H1kX+dhGCFo1NaZ/bQChJ2PAQUl5TCX0DN8ZgMDqgkM/R7XapV2v4Qy9yxRiVDnr08w2GQIcMvSGxWIyJiUkOFvIcvfkk6WwGPwjQWhN3Y3zqY3/ETbfezMy+eXSwqxOInLlCz+fS+YtcuXSJ7ZVV2uVqhFTumkBdD08SdT17/R6O4zAxMUG1Wn1FcOJ6V/SXfi2Sg4GUFl65Te3iOrFkAs9cOxLlS10jd8klQUBnOKS0tY2tIswkMBolDENf0O1pUimbbqdDKpkgPWZobgt0KJFjMQZtj7E5Fysm8Ho+08fjQqX3i688fCX8k09+8eeSyj3XDYefBywLxybUA5TUtBvRQIRcIY8ONUZElq8YE4k2g0j84dc6KGUhlNwDc75uSLwRLwGpaHe65PJ5ipM2w4FHuVSKbsroz4dR+UBuvMB4IkE6nSGTTqMsi1azFSFxxjAcDFk4tIDjSpykgx13WTp7ESkjf5+os6tJpJIcPX6c5vQ0tUqF0A/oNtv0h9Ei3v10OtQUJ8cZn54k8H3qldoez/GVFvduDnF9DrC7CHZ9FC2h6K836dsd0vHEntp6t1wWL7s/AhmKUdNJEQYeY8emGWzVMcMhw77FhfMdTp6Mc/mKT71sGC5VcbTABDbT04L9s5G5kbItQi9kYkbKE/fPm2c/NJgQrfB3v+U97/i2T33sY09ZY4t56s0Opht5+DQrNSzbJpPJ7JEedz2D90KVlAhLjubofYPEg5E3UCqTxonFKO/sUK/WmJ2bI5lPkkgmEFJQq1RxbCcSmkhBcXJi5El0rRHTrNb2QCZ/dG4qYSGMQHsBzXpj9Hl3c5MI6XNcl/GJCdLZMYQhWghegDcY0m63GZ+cIEQTi8XwfZ/qZoV+r0e+UEAKQa1Wj5RP/y+Ge6gQ/OEAGUvypxUROgwpbW7t9RgAnKRD8s5Fyo9dpn2ujOVO8ER5yMAX1M7u0N+so+IOpccuMXPvBGPjk7RbXYQK0KHCH2oWD1qC7zmsz31keWrt9PIf/Lvf/Xdvt9ITDmUhQGi0kuCFaN8freJrTSTHtqiUSrRbbaRS39DDf8XdLwS5XH5kSNVmZ3OL6blZLNsewcmCcrVCPJ0kmUjjxtzIN0Bfy0t2TarkyHfHkgrXiWMLi42VVZRU0Wc0144yLSA0IcKIaAKolNiui+95lCplHMfGdmwUBh2ElLa26Xa6xJMJChPjNKu1vd39da/5urNT6GvHHhgcy6LVaJJIJ6/B3i/zFYuiiDf0Rsn4NWMtO+eQvXUf1WdWKT3awfdDlFQM+x2m7lhECYetx69w7pEtGr7m1P0TpBIeJtRIExFQF08k5PpXXbP0/Mr8P3/wVz4hldAYT+NkEhQPziGFpNFs0Rv0sS1rz/VKGEHg+XuzcP5fKVHNSIItYHJ2msxYBs/zWF9bY3NrkyAMyRfyJNwYJgjxfZ9avb6nP9xl6tzwz8iF3IzmFw4HI6mYuYbXm5e0e4UQEbHD9yntlAAYn5wk1CHl7W1Wry4x7PZIpBJMzEyDFKOZAKM6QfwZwp64ZhihRTQ3SHvRNDUjbtgaI2r7yLNIij1zFiMEGAWewZpIkD82Q1AbYvcNYadP/tg+xHiWxKLNe3/hNg6+Ps+Zz17l/Fcr+EM3os4rTS+Q1Eodjtw7JXIzGdOp9w7KXiea6ElMYeddlBQYL0QYQxgEbG9sRZl4tUKtUo1GqO4CqVLcYBfzst0hrt34QIJ2oNvr0KrWcWyX4uQkluMw9Dz67Q71ao1YPE4iFqdaqkQ3K4imkRmxe17ujleKHu0udyAwAUaYa0INc53pNSIKAVzrKewOexBCkMvncGMuzUaTVr2B50d5weTMLMlUinajRb1RR1pWpPPf5QEIvu6sr+v/zG7r21KKarmC60YVRxgEI1rJ6EFfxzEwgNAaJQX1K+uElT4MIHQE2BKDJn9yH8lDEziOx/HjcdxcwPG3T3PkjnFe/NRFzjxax4gYnlS02yFhoIjlFVYMITChEkP3A0ZD/pb9yFwcYUm8aodBL5JyB76PFNGOCgN9bRfthrlXSP7MCCfXYlcsoZGuZPyuw9ipGNXVbZSQuPE4Ku4w9IZIDd5wSLPRpFDI43sejusShpGnoJuIR7tDXpuvZUblWaPeYP3qMgcOHqLX7RF4/rWocf0mM9EC6vd6DLo9Sls7aK0ZH59gfWmFXrsz+hmS8ZkpEokk/VaH6k4ZPwwYOzFPoAN0d7hHCPmz5EB7Jls6EqJ4noc3GJLOpPfMuXdxkE4rmsPkG4/YfI7ckTnKV9doX9km3GljEYFv8ekM9rjLiWM26fSQYV+jCZg+nKOzMeDKi2U65Gh2QpKpSLYvtMP6c2WCfihVPIh9YOLkPnQhjh8EJHJpvF4fv9KNdm7oMzaWIpfL0m62984uXrIAXjH6mSjsaVuQv2kBcg52OhKJVNY3abYapMeyTI1PkEgk6He6mCCk3x/g+z6tRpP+oB/lB0KSSCT2FtduWWYpi267Q3l9G2vUL2e3grmuC2hCjTCGVqtFq1GnslOKOH8auu1O5H6qFMXpKSYmJrFtm26vzfbWJkHokz08g7MwhpOOEVS7GF/zZzkJX1opBWGIEgodhHRbbXqdHo5toyyFNoZ2o4UOPeJzOTJHZwhdiI9lSCSSdNaqJPYVScyOUb+wRSwVY/ZQHCWv2dQqyzB/qkCQSNMYgrJgLGPAWNRKhp2zdZOwYgMVt5IfGHZ7JMbHMCP7F6/UwW/0sGxBJuWSL2bY3Cjf6IKxG2qvJ9Vcl/TtljdaaDKn5lDjSbQOCbUmNpYEz6Nf7WJJxVguy/zCArl8nm63Q2dEEtE6sprptdqYUKN1SKfTwXXdvQSQEZu3UauTyWSwY+7e13ePCIOhXq3RabWpVypsrW/gD4d7pZrWkUj06KkTzO6bxQ98quUytVIVf9gnNp8nc3ASbQJUzMLJJOntNCNHMHndtFDg6+8I9lzCpTAs7h/HGw4JA58gDKnVG9i2xFZWJI7JuBRuP0hgRf6CllDUXryKiFkkTs5h5Sys7pDt85t4MsHEvIstQ0aEbJStGRtPMgwME+MKjKDRFJz9zBXj9KR417e/870qo8Y+4Pc8eo0WiXwK6Vj4pR5+Y8DhI9PMTOfxfJ9KpXvjApDiZbv9hrIHQSAgdXSS2GSGIIyOj4gvKImPjyGHmkG5TafdIZZOkiqMUZwqkEzFSSRSDIY+Qip0qOl3e9RrNRzLQvsB3XaHQadLr9Ml9MOootjeQgLDfp9ep0e/26XXif7coDdgY201Mm40YNk2wraY2T/P5PwsC0cWSGYSdBotVs5fodfsghK4U2OMHZ8jHHEctRGouIWbiDGotBH6JVFQfEN5IWCYnh5jfHyMiYlo8zUabXzPp91sGx2GQsVt4vsLhER+zq3Tq+iepnjXIp4cUshaHL9rim6tz+a5EnY2S3FfAokHxsGYSDzbbAakMjF6fVj5wibtSxUxPlX0j9997P+0tALtSnS9S+3iBpN3HrmuRQqWpfdUNzegXS+53l2Gz27Y9XVIanECZ6EQyaiN3AvfRgh8Jciemqc2XKHf6HL++RdYOHqIiZki0/Oz9DoehclJQj9gbW0tGrSAoLJdoiJKe7jAbmkYhAFow8bS6o1H1F6jR0RTvaUmk80ys28Oy7XIjGUQMhpl2yw1WD5/lW6zjRhLULh9P74rCExkai12Wc4mREwnSfuTtM5vYQnrVVvhr14iK/rDEMcekU3NSC8QzVgScnR9odbRYG7PQCtASUloSfIpl7lZC1/1OfXufSyfHXDh8R1sd5ojt8TQIiAMFJKAmUmL3sAn3OrRutA2yWxqML04+R2/esevnrXSp6ZxikkGOy16q1XkIET7AVIFURzXFmGobyihXq3rZ0YPX/sBieks8YMTaBHixqIJGlqbUR4n8UJF12iSt82Rag7Yee4ql0+fo7QxxqETR0kk03uK4mQ2RbVUod/u0KjUGAwHUS/fRAObjLn+bA1eitdiWZG4c2JqingqEl0YAUqBtKBdb3Hu9Hn63X408DouGD85gx+TIAJse0Rf2zv2JVoHWLM5gs6Q3lIVy7G/4UUgRuD52lqJ5KFJXFdG/kgyAt0sKRrGkDEIKURkgF17cYVBrwc2OGHI3L4EUg4iBZatWbgthe/5vPi5TWKxecb3WUgT8QtiVki8qPCWvcCYQBUnZt7/hS984TPiC0Kp7MmDH8AREBo6KzX6GzW81oDF+XHGxhL0egOuLlUw5lWgzxsq2ejhhkpDIYZbcJmeVszvt8jlFYWiTaEgGR+PZvIOe36UdyQcEskE3XIDf+CzubnJsN/HhIZkKoXl2GSzOWKpSOyRyWbpdDpIQFk20lKRobVSCGUhR29LRZ5DU7OzTM5MkSvmyRWLkYmVgXKpws7WDlfOX8Lre9Egi7gkc3QWKx+HcEg2b3HggMN4XjJetCkUFeNFG9cVNJsB/W6foNm/ASl9tTaxuGEJhEghKY6nMQKSqQQ6FKY38MR3/NB7fnZjef2OQRgkxxYmTPNiSbQ3Skzcto9Bo0dro0n+wBiZnCLUkTTZEj6ZiTHaTY+NS3VqfRupIJuxkcpHWi7lVS/cOlNVJuRD7UHjebhXWdm8odmz0MpCeCEmjIyTXUchRIhv9N75/afjnYIgCHFyCRL7pkinBdmCINTDPdKoMQKMZGJcMlFMcPVih65nE5sYI3d0htr5DRxfUtrapl6pjaTiRYqT48zt38fy5St4vs/47PTIpvbawAojbqR6YQxGROplKQX5fI54IsHa0gqdRpO1y1cZDPpgNIHwie+bJnNoGl/7IHyOHE+grAAZeqN6ftTqNZLMmGRqVoDJ0an79MotpG0h/4yufrs5gZKRKkoIQTweR8swrkKhu8sl0bi4TvGW/VhTGebzDluPrbH5tR2K370PrfvgQxgoLDXkwK05NpbjeKHL6sqQZEKQKaboloS58mxdZoupYGKi4G80lgU8grV/v8vmlqFa9nCKKRiE6O6Q7jAkY9R1+1vc0O/mJTufESCDEshkDBkHNxlBsaGRUcY88hEWxqBsw3AYEAobY0KGQYAzO0Y6COhdLuMYhQkCrl64yPbaBvmpcfITRRKxBAsHDuAm4liuTRgG0VDHXUvb6/IUqRT+wMfzfNZXVtje3KbVbFLa3KLbbEdnq1T42pCaK5I8MMHARIJbZRRBoHFdjQ5HE9L2xKcGYXwKRQsvcKlfkiglkOGrD4F/WdS8AVaORstoExqBFLGYW7Ljzpl+pfG6Qben49hCuA5uAhZPZpmbcfnaFza5+LUmi0cTCFdAYNCBT3pMMXMgzsamj7GTnH+xiwwIdWOIqIfmzjff/cu/+JGHPnxKnJJAoE7eO/8B48PKU5tMvv4Yxhi8nRatboeY4+A4NpVq6zobiK+zmkODcB3St86Tm5FMT1uEoYcUEoxkd5qWFIbQOKys+vR6inQ6RAEDX5AsjCGMYFBrI4SKWLuBx87ODu1mG9dxqJbLNFtN3EQcZQvcmB09AEvtvX3fRwearc0Nrl64RL/dY+nSFVaXlke9jgijIAxx5/KMndqPrwe4lsCNW/SHIZ22z1jGxbJ1VFAaa1T6GgwWSkCnEyCcNP1KDzPwEUq+LEF+5RUBSsL4RCYaLIGk2+vrbn8oW73u5xYOpv4/y5d3vlOGoqiECq25lFy8dYwYPeyMIj+f5dzjqwwrfdIz2chwWyokmlQ6Uk0HZUP16U1TO7Mh2ztNU5jM/POvfPXLPz8pJneHGmF1hxZXTpfBlliJiHQ5GiTC2lqZmdlJlLBvZNK+Su9fWxqdEFhuwGzeJQwHCGGhTITE7uo+wtBhfS2gVRdksyEHDsfp9w3LVzy8MCB9ZArtDRmst4jFHBLpGLoe4HU7nDn9ApZlMTk9xcbKKotHDjI5PUkYRmeqMVFWXdopsbO+hQ4Cli5fZdgfoixBMh5l7EEIhBpVjDN2bIahDrEtwfyCTTorWb4cUK5IlpaHHDjoIi2fqLsTYQdGawJA2QYkqKSN3+lHljB/eg0QSdgN9AcB6aRFEARMjmdlo9nj4tkL/3rfwn1/9Pbvmv7O88+ee3rr8qYreloHLeQwJ5HDkHgCbrvvIC988SLtL25y/JvmkLEhliPxBkOmp5LsfHWZYaUZTkzmL69vr3304tXazwpxw1gzlMoWPlC+VGfxzkmKs0lqSy2GpR7pTBwdKmr1FkM/iDz4lMK8ine1iIxnKd6+SHpSkMuCUgLLctBCj5IggaUsdraGNCqaVEYzO28jpcF1IZZQtNoBgZYkxpJ01sooE5CfyJBJZ9CE+F5Ej+61u/SaHZavXOXM8y9w9vQZzp9+kfPPn+Hc8y+ydmWJaqlMdWcHrQOkkCSTitmZIn5o6HUHGGnI3rqAF5coHTA775AtCAJ/QCrjMPR9hsMRd6+gCH1/r59gOxLbFQwDh17XJ54ao1dugRd8Y+1iIdAh9Dp9CoXUqIKWVKttgZD6vre9+df+/W/+5uX3fs93r6+vrd/fXKvG2z1jcrMp4dohOoDEmMLJjlNeatP3BX1fkkjaOK5kUDOsP1cy+EL99D/5qTd9/GOf+uADDzygzp49e0OWIuuXahy4c5b54xl0u8OwMcALB8zP5EnGXYStmDs6S7KQwPeHIOTXofxZWHFD1kia6x7t9YDqSgc8iVS7I+IEvm+YmpMcOZrCcSKmUeBr0hkYz9hoLyQQATrr4hnwByEQkMsmibkO8ZhFPD46/8PImELpaOyMGPn1Cx2pcOOJGImEi2UJcrkMQaDRQZSHyIwb1V6eJp0QjOUMvucDEilDDh9OcOBgDKMNw67EEjaWiH5efaVH+2rAYKNDQmiwTXQEanODc/jXB4ZHilGze09D0inXOLYjrl6++raf//mfl7/x6//qt5vdxt8NtddqnFvXOy+0zcC3cFxw7BARC8mdnEBlHOoVzcWvVeht+ebSFzfC1mpPxNKxq1/+kyd6gHol72Fx+L7Xm0O3Z0gkYfnZGmc+cYV0wuLI4gTLK1WEm+AH/7f3cenCBR792CPo3ugzm5eJ6zCuRfbIBNVzazDUIDQePifeeIj8qQwoSb0SAdP7F+IMvN4IHo3sUyyp2VoO2SkplAuyHbDz2HmS8QQz02PE4w4rK1UKxQxKSba3KpEg5fqwJKKDShIN8SxOjOHGHNbWdpgYHyMMoVRu4vf7jL/uCKaYIBgMGRsTzB281mCKvpcmbjmsrnl0m0OmZhJoofFXPZ794/OYgYz2g1Rkj8wx2KphOsNrKKngVauniBpniLkWR49O7X3Vth197vym1JasrpWWZoQQIRC+7q43/pPlc5f/UV8H/r77F+25E2MQaEr1gGY9xLYkg60BlSevgI5G3R44ML/1Q3/rB7/7Z37mZx574IEH1MMPP/wySbQlEw6ddkijrll/sUU2nmD/QoHMWBx0hUQ+gZfoceSeY5SWqpz+0pPE4omXLwAB9H1qp9dJp9O4mTjSUjSbVV788iWKpf3IYhwrnaI4HXWs9urmkc+8FDZIgyZEYRG6gvhklsFOF88LmJ3Jsb7ajNw6HJiZmRjlJiPxh7jWrxcIhLFABPTaA6SxSacchh6EvkZmE/iuRDEq76SMZgjq6yRuRqKNxnIF7UGc1gtdwkaf+tlVklaK/GwEdHmeR+vy1khjKG8skV6V+fMKQyUQIwWQRgd04MwuO04+/rWv/Nz9b37rzReeu/ju7a9sBH5fWWRtjFC4MYEUNnZ/aKSWFCfzXq6QuRJPxX/qH/7Df/gY8IoPH8BCCjZWBwTrTbprdRZmc0yMp6mUW3gm5Pv+5rdw65tPUak2UQn5danfbiqOrWzmDi1y+MQxYjGXJ778ZcKrhu7lMvaWRfqWBSwZI9Qao82I+BA1VXoDw8AHoSwIQcVtMouTlLYvj3D4ECdm4XmaWFzhhQOEUXvwM3rXtAm0CcGEOI6iXm/hODEy6QSVagff8xjfv4Aci6O9ECklng/9PsRduRdMAqMJTJTHOH5A6+wO3XKbZDJDcWaGb3rbfRglWLpwicvPvYAXhvi9wTeOCO6O3jPXnEaua6/Lrz58VgE8+OCDCCGMMeYHXn/3vZ86+9yZN5ZPr/r5wzMiwCeQArRlqufXRb6Ytd543xt+5Q8++l9/ttPpjHK+V7eQsaRr4V2uM7haIy4V/YFma7PJ5asbnLr/Ft703rvJZsfoDtuMjccI0K+Y5ARBwNzUODIWJ5GIMTk/hUazcOwQyUSGeq3OzvoG1WeWSSf3ERYSWJYYGSNG1vKNnqbeDLDtJCbw0TpEE9nTaCMx2qJQTLK8tEW+MB25ixsLP4j0AbtdYiEEju1EITZmIRVkxlxCX9PtDJBKRtO7iDqMUik6PZ9GQ5OZc/A8HbGhlYwk3TtDqs+so/qGuf0HKIznSBWzpHMZLMdh8/Iy+alJlBFcvXjpz8YZFCCVHBlWjAgu2mCU0W/+gR/oAzz00EMRjVCIzoMP/vDbLp8/+zHRNW+vP70BgC+iod6WhKmDs//6Q3/wwZ8dDoZ8IxNHLH+9ZQYbVREEQ6QlqTc6GNfiwB1HecffeBseHt1uHyflRBSxl5hS7Y43jKdTKGUjQo2vdTRgQUI2XyDoB4zlsnj+gPJ2ibWvreGOHSAxYeEoH8uWBIFh2LeQVgwIsdyofOzUW1iWpN3q0mi6xGMWQkospYi7cQyS/tAjCBiVgZG0Kh6LgTEEJvITNCag3/fY3mlhWRZes0diKo2JKWQIllB4A8GwL5A2BB50hhD0YO3xdbx6m9kD+zlw6BAYQzKTjkCuoTcqcaNGVzKdotvpRjv5FbwSXpoHBKGm0ekzloimjkqkyIwlTWs4TN9//9u+7bOf/fQfXXeb5UMP/cdBEn5IWZl/IqVlNFoYg/YJZSKd2nj8sS994M9iL29VnroqpLLIjyfxwpBqtcH999/P4TuOcvXiClbKYnJxkmFlyNalbRwVv4EsihCEYUChWMCJudFETCGwHQdpK4b9IYP+AKUs5uf3gdbsbG6x/JVtEsfzHL4piZKwuepRLvsox0UajV/t4bcCuld2sIRNq92n2/NwYxbGaDw/HM3yDYi7ClwbTLSro0jggzEoZWFZEqSg0ervScw7KyWEJZH5GG42gVSSRjXAhIZ9iwphKVYv9OhdbuFttslmM0xMTIwqlhCkxI5Hzh2xTBykQUgoTIyPpHTf2BHgeQGl7Sa5QzPRJDKtxdR0JqyeW8k/9qXH/xHwRy8tG7pQImj9rZd+v365zZ/VNUyKmNUSSnNoccpMTWQRKK6euUylXCIdz7J5pcLWmR0+/Ksf5emvnCbmxtDXMYLNiJ4dGk04QnrCMKRZrlHdKOH1BigZOYo6MZd4Ikk8noyaTssNOnWoVDS1qo7sUv0olLfObVI7uxaxe2XkENLpDBiOrNartSYGeW1a+4gcynXGE1JadDpDfD+MvH63q4AhBJRt071covnCeiSwDAyWUrSaIeWSpN3W+OtN+pd3ULZLKjuGE3MjSpoE3/Oo7ZRoVWoMO32MgWAkTdOvApm9XFYWxdCoB2BGuUuA7wcIgwm9oPkKxg67qaX1Cu8/s2Wclc1l1nrV1slQByblWmIiW+D80+ewHIvxmUkQgsfXH+Xs42cZS4wRht7IlvUlNlS7N11JvMGApQuXI5GnUkgZGUsFvo/lWEzOTVHbLtNZbrJRTCMzLkpaKEuAUAzKHYQnsJVChHpvPEulUidfSFDIpeh2etF0EC33OpU3fiKBUpLKToNEIk484SClQocjMqkeJZtG0C+3Sc5kCADLSMoVH9MNaJ+vEXNj5CeLxJPJaGCm6yIsi36vz9ULV7CkollrII1EShVVFK+O/r5icI4ml4XsTnIXSEwohRAyHGXvr7QI/psMIq8ZRKAwJjJHisVdpufS9L0B55+4yDlzbpSg2SRiCXTo3/Dwd7tukZhSjaROZg813O3S6dHgaGXZYCAeS+DG43Q6XZx4HJV2MY0hnfUatrTorTcw/aiDeI3ZC0o5tNs9ZqYmWFrZxvd9bKVuIH7vtVtNZM1mKYfxyTytTgsTXi8CHY058wK6l7awQ4MX+sTyKexCgtCXSAPJeIJsLs9wOMRSu4QNPbKjcfZG5CAi2nskcWOPinYDFmBeTinfjQIRh86AUVg2slDMaNGWx9719nf+jYcf/v3ffSmE+9/NLVz7wUwuG8eAGA4DkgnF3FyOjbUmYWi4ZvenX9nAaeQS3mm2SCSTEW1sxNLRelfIIUYTxXpIGdW6u1mvt9mAtoupDWmvVBBh5AIuLOslcjyDQFHe6RL6iuEwoNHwmZ6M4ftDzN5tNhgjsZRDq9Wn1+9RrkC91sFoiZDmBpROSEXY86k9vwba4E1nsMYT0PdhNOV8dzp5vz/AjcWQyromoL3OGUQY6DZbkYeguTZGb8+eRLA3gPP6X3cFM4z4rkoaMTWV1aVq/cDa6sZP2o79O8BrMkDSajVauZPHZkd8HkkYaArZFLVKj0ajh7L+9KFVUkpa9SZCSYqTEwS+R7/XR1kWvV4PpRRhGNBpt5HC4DixSF6GoHulgh6xhWxhkS6MYbk2rXojUiyLG115hVDUqh00IeVyC9cWZNJJLAvC0ItCv1R0uj1WVqv0+z79QdRZFPK6yY6juy2lpDg+jh8E1Oo1Ops1nHITJSykiHIXy4qk2d1uB4WMuo2Bj+04WFIy6PdRUkYmlOVq1DMR17XNX01LYl7+37uLIvBCTGCM9nSd1/BlSYQJtRZCWJGwAjmqu1+d9nwdOyBAC2GEUUpJqqUySlkUJoq0Wy2EiCRNjHx8Xddl2O9T2t5hOIjGyPuehxGCifEJpmdnsOMxBr0+/XaX0PNvYNnsCkKEEkijGA481jaqZMc8nJhivJDBmJCN7Rqt1oD+IEAq+zrrF7PXzNmTr0tJtpDHSCjMTFIrVShtbBJqH8uy0IGmtl0hkU4SS8TpdtsjbZ8BE6MfRjyIdr1BaXsbx3plapjh2oK4kVV1faNdYGQU64QwGJQwGMv3fPn/Ro/4DS2Aa7HpxqD+dXc8ItBGCymFpaNdpbU2cmJigka1ujdN09cBrhvbs0wRBtqtFtV6GY0hnylw4NQRMvkccTvOoNOmPxjiBcGrxDpxg9ZOKUXgG3ZKdZQl8IcRurhTriMtB2UpjNZfl7JrjGHoeziOSyKZZOGeA3ieR6fTYf3CEhtra9QaVVLpDKlMGnQ0BVTZknarSegbTBjSaDQoFAp0Wu1vnCD6Ss/UaIyIVD869Im5rm87tv5TH8p/wwJ4hQ9iro2D3dNgCAMmFEKYUId2POVy5NihX766vHJPvVR/syPcYHJyysrm82xvbdGo1zEYPDwkCgnYwmF+/z5O3H4LTjxGemyM2YU5VpeWqVfqbG+sY0kLS9lf12Pgml3Y6CKUjdGG7e16ZGtvxaK+wCghvZaDvXIfW4oIiatWKsQSMSZmZjh1x23sHDpEaXOLTqvN+tIyW2vrDPUgKnUxOFhIBLPz+9i3sIDjOnTbHYwxwave62+IMgyOY8np/6e5Kw2SozzPz3f09By7M7Mzs7vS7upGElouAQE7GGWlFFKQjHGFMuKKBQ6mcCB2qqhUmSKAEK7EFVdsFzYGhVSochFcmAUECAvhwo6Ewo0OdCwgIWm1q92d+z67vyM/umd2JSQCCSvSW/Nnqrpm++u3+3vf93ne5+mKyFK+eNHqK69au3nz84OnA3T+LweJmd160eKZ8HsZmg8LpRQfHZxAuWyBcwqltFBKcUopNFGoWrWfR7o7DsVTY49GI9EFYV/k+WKqfG57OKg6Z3ZTSwrULQuRjg6EIxFXd8/ZT3tm9cEfCKBUKKJSLqFcyGP446PQIDA93KVcMYwPj6BRrTmOJKehVxFXiqX5JSGTWABxZepbhs6nei1rDerhmDVvjiv/QiFtG7YSmDN/vqNETina2ttBDIaJiQnIhgVKHaCoWiwjk0khEolCC4mJ4+PIplJTfq9JISOAhnSDmbUGZwiBlArBdhML53dBStVKGBmnaFS12PvBER7u7tg4fPzw3+AL8Ac4ZVSe3DLWWqGrKwRbFKCEBjMk7+vtzS3qX/h0pVah37vzm/deffXtVQBmKpU6vOqmVTf/cctrGxPJ1MXe9oDyt7XRSLQdoVAQ7cF2+Px+MObQtGqVKhITEyjlCshncxCWBb/XB60BqZVj9NCakdOTo2Dk1FT0VlnqtmOnTC6eYNl++mxGgzPeqnSYwcHBMXLkKJTWaAsF0RGLItoVRWc04krcaFRKZUAqCBFGrVKFllKnk0kS7YqUl1564VPVSlkSAsIp17Va3bd75/vrlKUglbI5pdwpRvSU61FuDjY5GdoQdVDKNKWsMm1JoBOsn1yhaEdQxydyRHtZZmDlso3hYPDtx/79sc0AsOWVLc1zGwA8Tz755C4vaXvDy/2XlPIF4fX5aKVQRDmbx7AU6OzshMfrDHoSAlDO4ff7wQhFIZ93uPhuMkQJQS6bhWU1JKVUYxIwoyfvgyff3M+XKBEwYkgiCIqZPGuPhdyAayqVe9AWCsEf8EMIgfixcVDisHaUUkhMuNqK1CGf5jNZbds2CbR5k1t//+JtpVL5hCrpqjVXH6yW68v379l/hbQklNbOO8sdmXc4DXJqe6V5jVMZI1/4QZVWhLlyKs18UGsCoRpaQUFBZp9+5ql73ZtvTCaOrVeRWr9+PSVMxRgB6pUaGAgM6ih0mR4T3ODg3BFg8JgmDFcoyuM1na1cTZZnHs5Rr9VgNSymoLnW4EprDg3qkiMUAKk1JECkPk3GNVXoqkW3mfworZW0SYPVRY0VCgVwwiazdPe17fP7HHCJUHCPAWoYoAYH9xjw+Eww0wPKOThlqJYr0EpCKBkrFksBd50MAHzZsmX8xZee/8c1V6+6/fKBr/4g2NH+jlKaQEN6DIbuGUEHwzgpGdPORWu0pCamIQC8Pu9IfDwHrbRmpGnaIF2MnYERyrZ8tMV0e9LC/UxddLlhwwZtC+shoexDnDPGKVWaOpoGoI72PqgDEIEQZ7rKHcrUmHQXY4wil8lo27IRiPjW5+3sDUU7v65Yz9+gmHxFasGkFlRqyZQWTEMyrTTRSgsl1QkfrbRofq+Vlk4jgDBCCFPQlHoIM9v4T+DTt0oIJMYToJroJvm1qTPQEoLSzREuoJTNgUgFg1B4GAMjRBuGQSjn6YZt3QKg5gaaDUBs375dDAwM8LvuuuvIMy8880tNxK1tYd+oZVuMUKi2drM1jtfMtykh8HATDtFc+6dtCwiEAygmCprRbq1knUAxB/DQxO1kab164WqxZnCNPF3hAoAKiHcVUQnbshceOXJUaaJANAVzyRrZeAqm10R3bw9Mv3+K4/fUrhxBo1LTUgoysOqyTYODg/s0sZ0t0eN7vVisLoZLzmZgTELK7ljvdyD0jUKIT9bczYSQUYDrWwrZ4pjmmkohZVdXl3/z5k1/RDdwxeIrH6uUyizSHZ2sHOA+DITAMExIy8LI4WFUy0WUSuXW2Dl31kpbtqSM09KhIx9uIuSTc8Lbt28XWmuy9py1xuDQ4P477/ze37749Nb/qJUqbZDQmhAXvndnAqVU8fEM7enr3T2v/6yNR0YONSHhLzYAVn595YaXX9jy2EdHRrFg7kwtIQjRDC2Zjc+2r1IAioKCEYa+vj5I102RUket+6P9ByCUhWQyhWhXJ2bPcfRxJwEQ549zZ7Z5ePh4BwC+ZEk/HRoaUrlcbhTA6Mn0lr+8/ltj6WT8tVqtpk/olrDmP8YghWVvenHTr5VSrZNHR49i6dKlWL169SKqieaMtSbcNXRLqo4RgrGRUWQSSRRSGVhaYP6SRa7/jyNd7+MejBwbQaMuyKeNBLh32AZAH3740c1/+N15FbtSbyfUffNo7RAZCYNQVGeLNbZobm9ly5ZNe1tDFV90ADy68eHHv/qVr+kP9ux7/NgolfPm9jAlJunPn6H7TAyDi6VLL/6nA+8N9c+c36f65s2jbZEgZvb1QCiFer2OOf2LUCuXMfTubowcOoxsKoWeWX0wDAOKOJo4hWIBuXwe3GOguztaBiDOOeccNjQ0JN0F+MTCPvTQTz4A8MFnDNIp519MgZ3i0hWXFve9fQC1ch35fB7hcEfLTiY+PoFUIoFyrohQNILl31gNf0c7QqEQDMMApRTpZAq5ZIZIAr1vb7Lr7LOX/OvIyLHbq9Uq+RRihgLgaQJFjtaBbpWOthDq2GiaVu3qzkKldM+9997HN2zYMC3u4QSAQSm1+/vP/X5uPP8LqpTd1xPloY6A3rv3KJWMHI7nxha7CdjJF8QAyOtuXPf3b7762k9yqQIJhcPaY5rE9JrwtwVQlzaWr7oCvXNno5TN4a3/3IFcJo9MMoVqpYL2YDtiXZ1gBkc2lUZyfEKbXi8xg943qCm/fuzYscJpOudw+XJ027Zt/2OWvH37dnEKzJjO6p73rF21v1mv1HVsRhft6pkBYdlIxuPIFvLw+XyYNWs2+hbMQ/+F58PweVHO5fGHl7YCUqFRr6NWLkNKoYuFPAkEA7jgkot//vtXX7pLSnmqp5YSQtR5Sy76VXYi+d1ZMyK8PWRQ5Xoea0IhhZL7h4YZvOytTCH1p5hG+3jimgpRrTVbs/IbG/ftOnCLY7soRLloUSPAj8Tz42efHAADAwN827ZtWPutG67f/c6ux5LjaU9XTw8xPAaVQjo6/EoBlIAzBoMzLDy3H33z5iCfyuLggQ+RS6eRjidAGEU01ukolVeqWmtNEtm4rKlSD4Dk56E4fY7A1wCYjwWPx4KxGabXqyil1PR6kE6mIWwbHd0xeHw+LLngXMxetAAff3AQH+5830UctdsWnuw/EEp1/Pi4CIfaabSv855de97+l+XLl9OTgo9SSlUsPONdUan+ydLz5gvGKNca4Jxj/HhBJtM5eEM++8qr/uKvrrvxuhdWrFghMQ1IYGuvajpL3X333dFsKnvZ71585buNeuNqTjlMHxsbnhieMzUAmi3JddevO//Nt955fWx4rK3/vAt0d18PEUK45ZeTzDBCUcwXkMmkkc/n4G/zY3F/PzqjnTiwfz/q5Qpsy1EKDYU7EOvq1MnxOEln4oWyKi4EkJrOAPCztg/D7dGzembPUrlsjmZdX4N2V9By3lkLULMb2LtnFyrFKkyPid7eHoQjEYcL6LZPHQ8kinw6q4d271Ft0XYxsHLZ93/zmyf+bWBggE8JAkopUd3hnm12zRroXzJLml7O8tkGUokiLFvADAVw6eWXrPvtb594Yhqu/bRwxNSne0YgEJgvHIPE+tatW3c3GabNYFl/z/qlv/rlo096zbb++Wcv1j6vj5imBwpTp4cdx01CHYJGMZdHKpFA3W4gFAzC5/VBKIdc0XTj9PhMHR8dJ9lsslRWxQVnIAAOBts65vfNnats26bStuH1O6qllDoYRjaTAYEjJxeKRGAYBoSLllJNXKlZB1m0bQu1ck2NDB8muWI6tWz5n928efOmrVP6+JQQoro6Zu5olK3LTdMZxrRtraRQtKMz8sOll1+4Y/Nzz715zTXXsMHBQXWmAgAAyLXXXktPBzhop1jB6Oho7+qVV23LxAsLlq38c9W7YA6t1aqOpj1zVDpL+SLGjx13pnudhgY44yiXy8ikUsgkkuiIReELBBxDZuqobjBKdGI8RdLZeKkiz0QAhA6G2yLze2b3KBBNKXU8BSljEA0LqXgC4VgUse5OBENhh77l9i+ElOia2Y1IV8xhQcORfTdMD4rpvNr28qsUTKT+4YEfrrrtttvef+CBB0jTw8/r9c6u1+v+Kei69ng8xLKsQ+5+P61P/qcBkq1AAID+/n491XiQMYaLzr94x9ix+OWLF58jZi1ewPvmzUZDWlPkXAEGhtToBOLxOBh3FjOfy7demUQpjI9PIByNOIKJbl/AZFwnx+IklZ0ol2Rh/nQHQIAFD0XaovN65vYpoRWlrryZlArpeALRWAzc62kZTYU6wvB6TNhCIByLYNaCuRCQrnCEAlGAaZjIpTMY/vBjtXf3LhrtDh6+78H7lq5du7Z8yms56ZvpQP0+HQ4+xcN+un+AEIKRo6OdRBhaU9BsIoVsIoUZc/sQ7gi58wAEhUIRmVQKHsaQzeXRqNbcEW4CRRz/HmXZkHUL3PTCaliYGJvQREMrKaCJVmdiASijqlqvquGPj2qpNSKdUYTDIUjbhrBseFx3Ei0ltBCOyqdhoCMadRREk2mEIiEIW4BzjnK5goNHhqC0hi1tQsH1xFgyduDADnqKsvRU9Y0+Uzf/82HUUw7T9FmWLUmpXNK1chVKKeSyGTBjUi1LCgnRsMEZhSWEox7S0m9XWkoJZhhIjI0jFU84GsSMEO7jxOf1oS/We+uefTuz0/Q0NFkv8qxFC79dKhbfqFfqsMpVHT9+HJmkYxHvN32ufUkTInAIoQ3LQiadhlIK6WQS3GAtwy0hHcNHDQLGCLSUxMM9FhA5VS/gSz/+VwEgRYM7TGINTRUoI7DrDVjV+gnuFyCAZdtOB4YQEEJRLhQRPz5GGGNQWqEtHABlDoG0rSPwwjU3rf1ROVc2fvazf36PECIHBwfJNF27AoA9B9578/7771/BObde3vzy2vho/O+kUg7eX6jh6MFDaNg2Yp2diHTHnPFvOHMBhBAoKSEsnKBe6nQJFbQkDs9fWBz/T4/Pvbiccyyau2hnaixzEaOG0tT1iyEnuYXpk35AOeQNwok0PNyC1lBao/+C/psuW/aVw7YNWtbWxC9+/OPEl7AGGgAeeeSRjkK6MLtYK+rh4eGOHa/+17ME1A9oLYTyKAvcIZroEwd/pzC2p2KThBBt2xYJxgLjN9/67SUbNmwonqnkbloCwK0C9IMPPnjh44/8+vVCquRjjDQHF0+yUp0KxRKnL6QlC8+IbPvOD27964nxcUYplQ//9KdHp57WnISZ7vLnNL95wlZzxx13zJGSe/r6OsWzTz33o+Mfx2+CgtREfSalaK209gZ9ZNmKr605+9yFrwDApzl5fxnHfwOX/W+DTAH8xwAAAABJRU5ErkJggg=="],
      ["bat",          "/sprites/enemy_bat.png" + v],
      ["flag",         "/sprites/goal_flag.png" + v],
      ["treasure",     "/sprites/treasure_chest.png" + v],
      ["coin1",        "/sprites/coin_frame1.png" + v],
      ["coin2",        "/sprites/coin_frame2.png" + v],
      ["coin3",        "/sprites/coin_frame3.png" + v],
      ["coin4",        "/sprites/coin_frame4.png" + v],
      ["exp1",         "/sprites/explosion_frame1.png" + v],
      ["exp2",         "/sprites/explosion_frame2.png" + v],
      ["exp3",         "/sprites/explosion_frame3.png" + v],
      ["exp4",         "/sprites/explosion_frame4.png" + v],
    ];
    await Promise.all([
      ...list.map(([name, src]) => new Promise<void>(res => {
        const img = new Image();
        img.onload = () => { this.sprites.set(name, img); res(); };
        img.onerror = () => res();
        img.src = src;
      })),
      new Promise<void>(res => {
        const img = new Image();
        img.onload = () => { this.sprites.set("bg_field", img); res(); };
        img.onerror = () => res();
        img.src = "/sprites/bg_field.png";
      }),
      new Promise<void>(res => {
        const img = new Image();
        img.onload = () => { this.sprites.set("bg_grassland", img); res(); };
        img.onerror = () => res();
        img.src = "/sprites/bg_grassland.png";
      }),
    ]);
    this.spritesLoaded = true;
  }

  checkTraps(): boolean {
    const t = this.globalTime;
    for (const trap of this.state.traps) {
      if (trap.type === "spike") {
        if (Math.hypot(this.state.playerX - trap.x, this.state.playerY - trap.y) < trap.radius) {
          return true;
        }
        continue;
      }
      const cycle = trap.activePhase + trap.inactivePhase;
      const phaseTime = (t + trap.offset) % cycle;
      if (phaseTime < trap.activePhase) {
        if (Math.hypot(this.state.playerX - trap.x, this.state.playerY - trap.y) < trap.radius) {
          return true;
        }
      }
    }
    return false;
  }

  draw(): void {
    const { ctx, canvas, state } = this;
    const W = canvas.width, H = canvas.height;
    const cx = this.toCanvasX(0);
    const cy = this.toCanvasY(0);

    const bgKey = state.chapter >= 2 ? "bg_grassland" : "bg_field";
    const bgImg = this.sprites.get(bgKey) || this.bgImage;
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#5a8a3c";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let lx = -200; lx <= 200; lx += 50) {
      if (lx % 100 === 0) continue;
      const px = this.toCanvasX(lx);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let ly = -200; ly <= 200; ly += 50) {
      if (ly % 100 === 0) continue;
      const py = this.toCanvasY(ly);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    for (let lx = -200; lx <= 200; lx += 100) {
      const px = this.toCanvasX(lx);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let ly = -200; ly <= 200; ly += 100) {
      const py = this.toCanvasY(ly);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    const t = this.globalTime;
    const mcImg = this.sprites.get("magic_circle");
    const lbImg = this.sprites.get("lightning_bolt");
    const now = Date.now() / 1000;

    for (const trap of state.traps) {
      if (trap.type === "spike") {
        const px = this.toCanvasX(trap.x);
        const py = this.toCanvasY(trap.y);
        const r = trap.radius * (W / 400);
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#cbd5e1";
        for(let i=0; i<8; i++){
          const angle = (i/8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(px + Math.cos(angle - 0.2) * r * 0.5, py + Math.sin(angle - 0.2) * r * 0.5);
          ctx.lineTo(px + Math.cos(angle + 0.2) * r * 0.5, py + Math.sin(angle + 0.2) * r * 0.5);
          ctx.lineTo(px + Math.cos(angle) * r * 1.2, py + Math.sin(angle) * r * 1.2);
          ctx.fill();
        }
        ctx.restore();
        continue;
      }

      const cycle = trap.activePhase + trap.inactivePhase;
      const phaseTime = (t + trap.offset) % cycle;
      const isActive = phaseTime < trap.activePhase;
      const px = this.toCanvasX(trap.x);
      const py = this.toCanvasY(trap.y);
      const r = trap.radius * (W / 400);

      const timeUntilBolt = isActive ? 0 : (cycle - phaseTime);
      const isWarning = !isActive && timeUntilBolt < 2.0;

      if (isActive) {
        const flash = 0.5 + Math.sin(now * 18) * 0.4;
        ctx.save();
        ctx.fillStyle = `rgba(255,220,0,${flash * 0.5})`;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(255,255,100,${flash})`;
        ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();

        if (lbImg && lbImg.complete && lbImg.naturalWidth > 0) {
          const boltW = r * 1.0;
          ctx.save();
          ctx.globalAlpha = 0.75 + Math.sin(now * 30) * 0.25;
          ctx.drawImage(lbImg, px - boltW / 2, 0, boltW, py + r * 0.5);
          ctx.restore();
        } else {
          ctx.fillStyle = "white"; ctx.font = "bold 32px Arial";
          ctx.textAlign = "center"; ctx.fillText("⚡", px, py + 10);
        }
      } else {
        if (mcImg && mcImg.complete && mcImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(now * (isWarning ? 4.0 : 0.7));
          ctx.globalAlpha = isWarning ? 0.6 + Math.abs(Math.sin(now * 6)) * 0.4 : 0.55;
          if (isWarning) ctx.filter = "hue-rotate(180deg) saturate(3) brightness(1.5)";
          ctx.drawImage(mcImg, -r, -r, r * 2, r * 2);
          ctx.filter = "none";
          ctx.restore();
        } else {
          ctx.fillStyle = isWarning ? "rgba(255,80,0,0.25)" : "rgba(100,50,255,0.15)";
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = isWarning ? "rgba(255,150,0,0.9)" : "rgba(150,80,255,0.6)";
          ctx.lineWidth = 2; ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
        }

        if (isWarning) {
          ctx.save();
          const countText = `${Math.ceil(timeUntilBolt)}`;
          const badgeW = 36, badgeH = 24;
          const bx = px - badgeW / 2;
          const by = py - r - badgeH - 8;
          ctx.fillStyle = "rgba(0,0,0,0.75)";
          this.roundRect(ctx, bx - 1, by - 1, badgeW + 2, badgeH + 2, 7);
          ctx.fill();
          ctx.fillStyle = isWarning ? "rgba(255,80,0,0.9)" : "rgba(255,200,0,0.9)";
          this.roundRect(ctx, bx, by, badgeW, badgeH, 6);
          ctx.fill();
          ctx.font = "bold 13px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 3;
          ctx.fillText(`⚡${countText}`, px, by + badgeH - 6);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    ctx.save();
    ctx.strokeStyle = "rgba(255,100,100,0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.fillStyle = "rgba(255,100,100,0.9)";
    ctx.beginPath(); ctx.moveTo(W - 4, cy); ctx.lineTo(W - 16, cy - 6); ctx.lineTo(W - 16, cy + 6); ctx.closePath(); ctx.fill();
    ctx.font = "bold 11px 'Arial'"; ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,100,100,0.95)";
    ctx.fillText("X →", W - 18, cy - 7);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(100,180,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, H); ctx.lineTo(cx, 0); ctx.stroke();
    ctx.fillStyle = "rgba(100,180,255,0.9)";
    ctx.beginPath(); ctx.moveTo(cx, 4); ctx.lineTo(cx - 6, 16); ctx.lineTo(cx + 6, 16); ctx.closePath(); ctx.fill();
    ctx.font = "bold 11px 'Arial'"; ctx.textAlign = "left";
    ctx.fillStyle = "rgba(100,180,255,0.95)";
    ctx.fillText("Y ↑", cx + 8, 18);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();

    if (state.showCoordLabels) {
      for (let lx = -200; lx <= 200; lx += 100) {
        if (lx === 0) continue;
        const px = this.toCanvasX(lx);
        const label = String(lx);
        const lw = label.length * 7 + 10;
        ctx.save();
        ctx.fillStyle = "rgba(220,60,60,0.82)";
        this.roundRect(ctx, px - lw/2, cy + 6, lw, 16, 4);
        ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText(label, px, cy + 18);
        ctx.restore();
      }
      for (let ly = -200; ly <= 200; ly += 100) {
        if (ly === 0) continue;
        const py = this.toCanvasY(ly);
        const label = String(ly);
        const lw = label.length * 7 + 10;
        ctx.save();
        ctx.fillStyle = "rgba(40,140,230,0.82)";
        this.roundRect(ctx, cx - lw - 6, py - 8, lw, 16, 4);
        ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText(label, cx - lw/2 - 6, py + 4);
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      this.roundRect(ctx, cx + 7, cy - 17, 36, 14, 4);
      ctx.fill();
      ctx.fillStyle = "#FFD600"; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("(0,0)", cx + 9, cy - 5);
      ctx.restore();
    }

    if (state.timeLeft > 0) {
      const tc = state.timeLeft <= 1 ? "#F44336" : state.timeLeft <= 3 ? "#FF9800" : "#FFD600";
      ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(W - 110, 10, 100, 38);
      ctx.strokeStyle = tc; ctx.lineWidth = 2; ctx.strokeRect(W - 110, 10, 100, 38);
      ctx.fillStyle = tc; ctx.font = "bold 24px monospace"; ctx.textAlign = "center";
      ctx.fillText(`⏰${state.timeLeft.toFixed(1)}`, W - 60, 38); ctx.textAlign = "left";
    }

    const coinImg = this.sprites.get(`coin${(this.coinFrame % 4) + 1}`);
    const coinSize = Math.round(W * 0.055);
    for (let ci = 0; ci < state.coins.length; ci++) {
      const coin = state.coins[ci];
      if (coin.collected || coin.hidden) continue;
      const px = this.toCanvasX(coin.x), py = this.toCanvasY(coin.y);
      const customImg = coin.sprite ? this.sprites.get(coin.sprite) : null;
      const drawImg = customImg || coinImg;
      const displaySize = coin.sprite === "villager" ? Math.round(W * 0.10) : coinSize;

      if (drawImg && drawImg.complete && drawImg.naturalWidth > 0) {
        ctx.drawImage(drawImg, px - displaySize/2, py - displaySize/2, displaySize, displaySize);
      } else {
        ctx.fillStyle = "#FFD600"; ctx.beginPath(); ctx.arc(px, py, displaySize/2, 0, Math.PI * 2); ctx.fill();
      }

      if (state.showCoordLabels && !state.hideCoinCoords) {
        const lw = 54, lh = 14;
        ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(px - lw/2, py + coinSize/2 + 2, lw, lh);
        ctx.fillStyle = "#FF5252"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillText(`X:${coin.x}`, px - lw/2 + 2, py + coinSize/2 + 13);
        ctx.fillStyle = "#42A5F5"; ctx.textAlign = "right";
        ctx.fillText(`Y:${coin.y}`, px + lw/2 - 2, py + coinSize/2 + 13);
        ctx.textAlign = "left";
      }
    }

    const potionImg = this.sprites.get("potion");
    const potionSize = Math.round(W * 0.055);
    if (state.potions) {
      for (const potion of state.potions) {
        if (potion.collected) continue;
        const px = this.toCanvasX(potion.x), py = this.toCanvasY(potion.y);
        if (potionImg) {
          ctx.drawImage(potionImg, px - potionSize/2, py - potionSize/2, potionSize, potionSize);
        } else {
          ctx.fillStyle = "#E91E63"; ctx.beginPath(); ctx.arc(px, py, potionSize/2, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    const rScale = W / 400;
    
    for (let index = 0; index < state.attackPoints.length; index++) {
      const ap: any = state.attackPoints[index];
      if (ap.hit) continue;
      const apx = this.toCanvasX(ap.x), apy = this.toCanvasY(ap.y);
      const r = ap.radius * rScale;
      
      if (ap.createdAt) {
        const p = (t - ap.createdAt) / 1.5; 
        ctx.save();
        ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + p * 0.3})`;
        ctx.beginPath(); ctx.arc(apx, apy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + p * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(apx, apy, r * p, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        continue;
      }

      if (mcImg && mcImg.complete && mcImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(apx, apy);
        ctx.rotate(t * 0.8);
        const scalePulse = 1 + Math.sin(t * 2) * 0.04;
        ctx.scale(scalePulse, scalePulse);
        ctx.globalAlpha = 0.85 + Math.sin(t * 3) * 0.1;
        ctx.drawImage(mcImg, -r, -r, r * 2, r * 2);
        ctx.restore();
      } else {
        ctx.strokeStyle = `rgba(180,100,255,${0.5 + 0.4 * pulse})`;
        ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(apx, apy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(180,100,255,${0.15 + 0.1 * pulse})`;
        ctx.beginPath(); ctx.arc(apx, apy, r, 0, Math.PI * 2); ctx.fill();
      }
    }

    if (state.enemyHP > 0 && state.enemyType !== "none") {
      const ex = this.toCanvasX(state.enemyX), ey = this.toCanvasY(state.enemyY);
      const eSize = Math.round(W * 0.12);
      const recentlyHit = state.damageEffects.some(e => e.alpha > 0.7);
      // ★ オークキングは通常オークスプライトを使うが、王冠エフェクトを追加
      const baseSpriteName = state.enemyType === "orc_king" ? "orc_king" : state.enemyType;
      const enemySprite = (recentlyHit && (state.enemyType === "orc" || state.enemyType === "orc_king"))
        ? (this.sprites.get("orc_hurt") || this.sprites.get(baseSpriteName) || this.sprites.get("orc"))
        : (this.sprites.get(baseSpriteName) || this.sprites.get("orc"));
      const img = enemySprite;

      const distX = Math.abs(state.playerX - state.enemyX);
      const isAttacking = state.attackPoints.length === 0 && distX <= 100 && state.enemyHP > 0;
      const shake = isAttacking ? Math.sin(Date.now() / 80) * 4 : 0;
      const attackScale = isAttacking ? 1 + Math.abs(Math.sin(Date.now() / 150)) * 0.08 : 1;

      ctx.save();
      ctx.translate(ex + shake, ey);
      ctx.scale(attackScale, attackScale);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -eSize/2, -eSize/2, eSize, eSize);
      } else {
        ctx.fillStyle = "#42a5f5"; ctx.beginPath(); ctx.arc(0, 0, eSize/2, 0, Math.PI * 2); ctx.fill();
      }
      // ★ オークキングは王冠を描画
      if (state.enemyType === "orc_king") {
        const crownY = -eSize * 0.42;
        const crownW = eSize * 0.7;
        const crownH = eSize * 0.25;
        ctx.save();
        ctx.fillStyle = "#FFD700";
        ctx.strokeStyle = "#B8860B";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-crownW/2, crownY + crownH);
        ctx.lineTo(-crownW/2, crownY);
        ctx.lineTo(-crownW/4, crownY + crownH * 0.5);
        ctx.lineTo(0, crownY - crownH * 0.2);
        ctx.lineTo(crownW/4, crownY + crownH * 0.5);
        ctx.lineTo(crownW/2, crownY);
        ctx.lineTo(crownW/2, crownY + crownH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#FF1744";
        ctx.beginPath(); ctx.arc(0, crownY + crownH * 0.15, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4FC3F7";
        ctx.beginPath(); ctx.arc(-crownW/4, crownY + crownH * 0.45, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(crownW/4, crownY + crownH * 0.45, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      
      const bw = eSize * 1.2, bh = 10;
      const bx = ex - bw / 2, by = ey - eSize / 2 - 18;
      const hpR = Math.max(0, state.enemyHP / state.enemyMaxHP);
      const hpColor = hpR > 0.6 ? "#4ade80" : hpR > 0.3 ? "#facc15" : "#f87171";

      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      this.roundRect(ctx, bx - 1, by - 1, bw + 2, bh + 2, 6);
      ctx.fill();

      if (hpR > 0) {
        ctx.fillStyle = hpColor;
        ctx.shadowColor = hpColor;
        ctx.shadowBlur = 6;
        this.roundRect(ctx, bx, by, bw * hpR, bh, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.font = "10px Arial"; ctx.textAlign = "right";
      ctx.fillStyle = hpColor;
      ctx.shadowColor = hpColor; ctx.shadowBlur = 4;
      ctx.fillText("♥", bx - 3, by + bh - 1);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.textAlign = "left";

      // ★ 通常オーク（3-2-1, HP=1）の攻撃カウントダウン表示
      if (state.enemyType === "orc" && !state.isOrcKing && state.isStarted && state.lastEnemyAttackTime !== undefined) {
        const atkInterval = 3.0;
        const elapsed = this.globalTime - state.lastEnemyAttackTime;
        const remaining = Math.max(0, atkInterval - elapsed);
        if (remaining > 0) {
          const cdText = remaining.toFixed(1);
          const badgeW = 52, badgeH = 22;
          const cdBx = ex - badgeW / 2;
          const cdBy = ey + eSize / 2 + 6;
          ctx.save();
          ctx.fillStyle = "rgba(0,0,0,0.75)";
          this.roundRect(ctx, cdBx - 1, cdBy - 1, badgeW + 2, badgeH + 2, 7);
          ctx.fill();
          const cdColor = remaining < 1.0 ? "#FF4444" : remaining < 2.0 ? "#FF9800" : "#FFD600";
          ctx.fillStyle = cdColor;
          this.roundRect(ctx, cdBx, cdBy, badgeW, badgeH, 6);
          ctx.fill();
          ctx.font = `bold 12px Arial`;
          ctx.textAlign = "center";
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 3;
          ctx.fillText(`🔥 ${cdText}`, ex, cdBy + badgeH - 6);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      // ★ オークキング（3-2-2）の次のカミナリ攻撃カウントダウン
      if (state.enemyType === "orc_king" && state.isStarted
          && state.bossNextAttack === "global_lightning" && state.lastEnemyAttackTime !== undefined
          && !(state.lightningStrike && state.lightningStrike.isGlobal && state.lightningStrike.progress < 0)) {
        const atkInterval = 4.5;
        const elapsed = this.globalTime - state.lastEnemyAttackTime;
        const remaining = Math.max(0, atkInterval - elapsed);
        if (remaining <= 2.5) {
          const cdText = remaining.toFixed(1);
          const badgeW = 64, badgeH = 24;
          const cdBx = ex - badgeW / 2;
          const cdBy = ey + eSize / 2 + 6;
          ctx.save();
          ctx.fillStyle = "rgba(0,0,0,0.75)";
          this.roundRect(ctx, cdBx - 1, cdBy - 1, badgeW + 2, badgeH + 2, 7);
          ctx.fill();
          const cdColor = remaining < 0.8 ? "#FF0000" : remaining < 1.5 ? "#FF4444" : "#FF9800";
          ctx.fillStyle = cdColor;
          this.roundRect(ctx, cdBx, cdBy, badgeW, badgeH, 6);
          ctx.fill();
          ctx.font = `bold 12px Arial`;
          ctx.textAlign = "center";
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 3;
          ctx.fillText(`⚡ ${cdText}`, ex, cdBy + badgeH - 6);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    // ★ 宝箱の描画（コウモリ撃破後のドロップ）
    if (state.treasureBox && !state.treasureBox.collected) {
      const tbx = this.toCanvasX(state.treasureBox.x);
      const tby = this.toCanvasY(state.treasureBox.y);
      const tbSize = Math.round(W * 0.10);
      const treasureImg = this.sprites.get("treasure");
      const bounce = Math.sin(Date.now() / 300) * 5;
      ctx.save();
      // 光るオーラ
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 400) * 0.2;
      const glow = ctx.createRadialGradient(tbx, tby + bounce, 0, tbx, tby + bounce, tbSize);
      glow.addColorStop(0, "rgba(255,215,0,0.8)");
      glow.addColorStop(1, "rgba(255,215,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(tbx, tby + bounce, tbSize, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1.0;
      if (treasureImg && treasureImg.complete && treasureImg.naturalWidth > 0) {
        ctx.drawImage(treasureImg, tbx - tbSize/2, tby - tbSize/2 + bounce, tbSize, tbSize);
      } else {
        ctx.fillStyle = "#FFD700";
        ctx.font = `${tbSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("📦", tbx, tby + tbSize/2 + bounce);
        ctx.textAlign = "left";
      }
      // ラベル
      ctx.fillStyle = "#FFD700";
      ctx.font = `bold ${Math.round(W * 0.028)}px Arial`;
      ctx.textAlign = "center";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 4;
      ctx.fillText("宝箱！とりにいけ！", tbx, tby - tbSize/2 + bounce - 6);
      ctx.shadowBlur = 0;
      ctx.textAlign = "left";
      ctx.restore();
    }

    if (this.state.lightningStrike && this.state.lightningStrike.isGlobal && this.state.lightningStrike.progress < 0) {
      const cd = Math.ceil(Math.abs(this.state.lightningStrike.progress));
      ctx.save();
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#FFD600";
      ctx.font = `bold ${Math.round(W * 0.2)}px Arial`;
      ctx.textAlign = "center";
      ctx.shadowColor = "#FF0000";
      ctx.shadowBlur = 20;
      ctx.fillText(String(cd), W/2, H/2 + W * 0.08);
      ctx.restore();
    }

    const px = this.toCanvasX(state.playerX);
    const py = this.toCanvasY(state.playerY);
    const pSize = Math.max(52, Math.round(W * 0.08));

    if (this.state.isBarrierActive) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2;
      const gradient = ctx.createRadialGradient(px, py, pSize * 0.4, px, py, pSize * 1.2);
      gradient.addColorStop(0, "rgba(96, 165, 250, 0.2)");
      gradient.addColorStop(0.8, "rgba(59, 130, 246, 0.6)");
      gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, pSize * 1.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "rgba(147, 197, 253, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, pSize * 1.0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const onAttackPoint = state.attackPoints.some(
      ap => !ap.hit && Math.hypot(state.playerX - ap.x, state.playerY - ap.y) <= ap.radius
    );
    
    let spriteName = "player_front";
    const angle = ((state.playerAngle % 360) + 360) % 360;

    if (state.gameOver) {
      spriteName = "player_hurt"; 
    } else if (onAttackPoint || this.state.isBarrierActive) {
      spriteName = "player_cast";
    } else {
      if (angle >= 45 && angle < 135) spriteName = "player_right";
      else if (angle >= 135 && angle < 225) spriteName = "player_front";
      else if (angle >= 225 && angle < 315) spriteName = "player_left";
      else spriteName = "player_back";
    }

    const pImg = this.sprites.get(spriteName) || this.sprites.get("player") || this.sprites.get("player_front");
    const walkBob = this.isWalking && !state.gameOver ? Math.sin(this.walkFrame * Math.PI / 4) * 4 : 0;

    if (state.gameOver) {
      ctx.save();
      ctx.translate(px, py - pSize * 0.15);
      ctx.rotate(0.4);
      ctx.globalAlpha = 0.85;
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, -pSize/2, -pSize * 0.5, pSize, pSize);
      }
      ctx.restore();
    } else {
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, px - pSize/2, py - pSize * 0.65 + walkBob, pSize, pSize);
      } else {
        ctx.fillStyle = "#1565C0"; ctx.strokeStyle = "#FFD600"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px, py + walkBob, pSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "white"; ctx.font = `bold ${Math.round(pSize*0.3)}px Arial`;
        ctx.textAlign = "center"; ctx.fillText("勇", px, py + walkBob + Math.round(pSize*0.12));
      }
    }

    if (this.isWalking && !state.gameOver) {
      this.walkTimer++;
      if (this.walkTimer >= 4) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 8;
      }
    }

    if (state.showCoordLabels) {
      const lw = 80, lh = 14;
      ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(px - lw/2, py + pSize * 0.38, lw, lh);
      ctx.fillStyle = "#FF5252"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
      ctx.fillText(`X:${Math.round(state.playerX)}`, px - lw/2 + 3, py + pSize * 0.38 + 11);
      ctx.fillStyle = "#42A5F5"; ctx.textAlign = "right";
      ctx.fillText(`Y:${Math.round(state.playerY)}`, px + lw/2 - 3, py + pSize * 0.38 + 11);
    }
    ctx.textAlign = "left";

    // ★ 被弾爆発エフェクト
    if (state.showExplosion) {
      const ef = state.explosionFrame;
      const expIdx = Math.min(Math.floor(ef / 4) + 1, 4);
      const expImg = this.sprites.get(`exp${expIdx}`);
      const expSize = pSize * 2.5;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - ef / 20);
      if (expImg && expImg.complete && expImg.naturalWidth > 0) {
        ctx.drawImage(expImg, state.explosionX - expSize/2, state.explosionY - expSize/2, expSize, expSize);
      } else {
        // フォールバック：赤い爆発円
        const grad = ctx.createRadialGradient(state.explosionX, state.explosionY, 0, state.explosionX, state.explosionY, expSize/2);
        grad.addColorStop(0, "rgba(255,255,100,0.9)");
        grad.addColorStop(0.4, "rgba(255,100,0,0.7)");
        grad.addColorStop(1, "rgba(255,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(state.explosionX, state.explosionY, expSize/2 * (ef/16 + 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      state.explosionFrame++;
      if (state.explosionFrame > 20) state.showExplosion = false;
    }

    if (this.state.fireballEffects) {
      for (const fb of this.state.fireballEffects as any[]) {
        const cx = fb.x + (fb.tx - fb.x) * fb.progress;
        const cy = fb.y + (fb.ty - fb.y) * fb.progress;
        const alpha = fb.progress < 0.8 ? 1 : (1 - fb.progress) / 0.2;
        const size = 10 + Math.sin(fb.progress * Math.PI) * 8;

        ctx.save();
        ctx.globalAlpha = alpha;

        const fbImg = this.sprites.get("fireball");
        if (fbImg && fbImg.complete && fbImg.naturalWidth > 0 && !fb.isEnemyMagic) {
          const angle = Math.atan2(fb.ty - fb.y, fb.tx - fb.x);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.drawImage(fbImg, -size*1.5, -size*0.8, size*3, size*1.6);
          ctx.restore();
          for (let t = 1; t <= 3; t++) {
            const tp = Math.max(0, fb.progress - t * 0.06);
            const tx2 = fb.x + (fb.tx - fb.x) * tp;
            const ty2 = fb.y + (fb.ty - fb.y) * tp;
            ctx.save();
            ctx.globalAlpha = alpha * (1 - t * 0.28) * 0.5;
            ctx.translate(tx2, ty2);
            ctx.rotate(angle);
            ctx.drawImage(fbImg, -size, -size*0.5, size*2, size);
            ctx.restore();
          }
        } else {
          const grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.8);
          if (fb.isEnemyMagic && !fb.isReflected) {
            grad1.addColorStop(0, "rgba(200,50,255,0.9)");
            grad1.addColorStop(0.4, "rgba(120,0,255,0.7)");
            grad1.addColorStop(1, "rgba(50,0,255,0)");
          } else if (fb.isEnemyMagic && fb.isReflected) {
            grad1.addColorStop(0, "rgba(50,200,255,0.9)");
            grad1.addColorStop(0.4, "rgba(0,120,255,0.7)");
            grad1.addColorStop(1, "rgba(0,50,255,0)");
          } else {
            grad1.addColorStop(0, "rgba(255,200,50,0.9)");
            grad1.addColorStop(0.4, "rgba(255,80,0,0.7)");
            grad1.addColorStop(1, "rgba(255,0,0,0)");
          }
          ctx.fillStyle = grad1;
          ctx.beginPath();
          ctx.arc(cx, cy, size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    if (this.state.coinFloatEffects) {
      for (const ef of this.state.coinFloatEffects) {
        const coinImg = this.sprites.get(`coin_frame${(this.coinFrame % 4) + 1}`);
        ctx.save();
        ctx.globalAlpha = ef.alpha;
        if (coinImg && coinImg.complete) {
          ctx.drawImage(coinImg, ef.x - 12, ef.y - 12, 24, 24);
        } else {
          ctx.fillStyle = `rgba(255,215,0,${ef.alpha})`;
          ctx.beginPath(); ctx.arc(ef.x, ef.y, 10, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    }

    for (const eff of state.damageEffects) {
      const ex2 = this.toCanvasX(state.enemyX);
      const scale = 1 + (1 - eff.alpha) * 0.8;
      ctx.save();
      ctx.globalAlpha = eff.alpha;
      ctx.translate(ex2, eff.y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = `bold ${Math.round(W * 0.065)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(eff.text, 2, 2);
      ctx.fillStyle = "#FF1744";
      ctx.fillText(eff.text, 0, 0);
      ctx.fillStyle = "#FFD600";
      ctx.font = `bold ${Math.round(W * 0.055)}px Arial`;
      ctx.fillText(eff.text, 0, 0);
      const ring = (1 - eff.alpha);
      ctx.strokeStyle = `rgba(255,100,0,${eff.alpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ring * 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (state.gameOver && state.lightningStrike) {
      const ls = state.lightningStrike;
      if (ls.isGlobal) {
        if (ls.progress > 0 && ls.progress < 1.0) {
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.fillRect(0, 0, W, H);
        }
      } else {
        const px2 = ls.x;
        const py2 = this.toCanvasY(this.state.playerY);
        const strikeY = ls.progress < 0.5
          ? H * 0.02 + (py2 - H * 0.02) * (ls.progress / 0.5) 
          : py2; 

        if (ls.progress > 0.45 && ls.progress < 0.65) {
          const flashAlpha = Math.sin((ls.progress - 0.45) / 0.2 * Math.PI) * 0.55;
          ctx.fillStyle = `rgba(200,220,255,${flashAlpha})`;
          ctx.fillRect(0, 0, W, H);
        }

        const segments = 10;
        ctx.save();
        ctx.strokeStyle = `rgba(180,200,255,${Math.max(0, 1 - ls.progress * 1.5)})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = "#aad4ff";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(px2, H * 0.02);
        for (let s = 1; s <= segments; s++) {
          const sy = H * 0.02 + (strikeY - H * 0.02) * (s / segments);
          const jitter = s === segments ? 0 : (Math.sin(s * 137 + ls.progress * 20) * 14);
          ctx.lineTo(px2 + jitter, sy);
        }
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 1 - ls.progress * 1.8)})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(px2, H * 0.02);
        for (let s = 1; s <= segments; s++) {
          const sy = H * 0.02 + (strikeY - H * 0.02) * (s / segments);
          const jitter = s === segments ? 0 : (Math.sin(s * 137 + ls.progress * 20) * 14);
          ctx.lineTo(px2 + jitter, sy);
        }
        ctx.stroke();
        ctx.restore();

        if (ls.progress > 0.45) {
          const impactAlpha = Math.max(0, 1 - (ls.progress - 0.45) / 0.55);
          const impactR = (ls.progress - 0.45) / 0.55 * 50;
          ctx.save();
          ctx.globalAlpha = impactAlpha * 0.8;
          const ig = ctx.createRadialGradient(px2, py2, 0, px2, py2, impactR);
          ig.addColorStop(0, "rgba(255,255,200,1)");
          ig.addColorStop(0.4, "rgba(150,180,255,0.7)");
          ig.addColorStop(1, "rgba(100,150,255,0)");
          ctx.fillStyle = ig;
          ctx.beginPath(); ctx.arc(px2, py2, impactR, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
    }

    if (state.gameOver) {
      const lsProgress = state.lightningStrike?.progress ?? 99;
      if (lsProgress > 1.0) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, W, H);
      }
    }

    if (state.gameWon) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, W, H);
      const t2 = Date.now() / 1000;
      const rays = 12;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2 + t2 * 0.5;
        const grad = ctx.createLinearGradient(W/2, H/2, W/2 + Math.cos(angle)*W*0.6, H/2 + Math.sin(angle)*H*0.6);
        grad.addColorStop(0, "rgba(255,215,0,0.15)");
        grad.addColorStop(1, "rgba(255,215,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(W/2, H/2);
        ctx.arc(W/2, H/2, W*0.8, angle - 0.15, angle + 0.15);
        ctx.closePath();
        ctx.fill();
      }
      const cfs = Math.round(W * 0.09);
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(180,120,0,0.5)";
      ctx.font = `bold ${cfs}px Arial`;
      ctx.fillText("🎉 クリア！", W/2 + 3, H/2 + 3);
      ctx.fillStyle = "#FFD600";
      ctx.shadowColor = "#FFD600";
      ctx.shadowBlur = 40;
      ctx.fillText("🎉 クリア！", W/2, H/2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = `bold ${Math.round(W * 0.036)}px Arial`;
      ctx.fillText("すごい！よくできました！", W/2, H/2 + cfs * 0.95);
      ctx.textAlign = "left";
    }

    this.coinFrameTimer++;
    if (this.coinFrameTimer >= 8) { this.coinFrame++; this.coinFrameTimer = 0; }
  }

  tickDamageEffects(): void {
    this.state.damageEffects = this.state.damageEffects
      .map(e => ({ ...e, y: e.y - 1.5, alpha: e.alpha - 0.025 }))
      .filter(e => e.alpha > 0);
    if (this.state.fireballEffects) {
      this.state.fireballEffects = this.state.fireballEffects
        .map((f: any) => ({ ...f, progress: f.progress + 0.004 * (f.speedMultiplier || 1.0) }))
        .filter((f: any) => f.progress < 1.0);
    }
    if (this.state.coinFloatEffects) {
      this.state.coinFloatEffects = this.state.coinFloatEffects
        .map(e => ({ ...e, y: e.y + e.vy, vy: e.vy - 0.3, alpha: e.alpha - 0.03 }))
        .filter(e => e.alpha > 0);
    }
    if (this.state.lightningStrike && this.state.lightningStrike.progress < 1.2) {
      this.state.lightningStrike.progress += 0.025;
    }
  }

  async movePlayerInstantly(lx: number, ly: number): Promise<void> {
    if (!this.state.isStarted) return;
    this.state.playerX = Math.max(-200, Math.min(200, lx));
    this.state.playerY = Math.max(-200, Math.min(200, ly));
    audioManager.playWalkSe();
    this.draw();
  }

  async movePlayer(lx: number, ly: number): Promise<void> {
    if (!this.state.isStarted) return;
    lx = Math.max(-200, Math.min(200, lx));
    ly = Math.max(-200, Math.min(200, ly));
    const STEPS = 25;
    const sx = this.state.playerX, sy = this.state.playerY;
    
    this.isWalking = true;
    let seStep = 0;

    for (let i = 1; i <= STEPS; i++) {
      if (this.state.gameOver || this.state.gameWon || !this.state.isStarted) { this.isWalking = false; return; }
      this.state.playerX = sx + (lx - sx) * (i / STEPS);
      this.state.playerY = sy + (ly - sy) * (i / STEPS);
      seStep++;
      if (seStep % 8 === 0) audioManager.playWalkSe();
      this.draw();
      await new Promise<void>(r => setTimeout(r, 16));
    }

    this.isWalking = false;
    this.state.playerX = lx; this.state.playerY = ly;
    this.draw();
  }

  async setPlayerAngle(angle: number): Promise<void> {
    this.state.playerAngle = angle;
    this.draw();
    await new Promise<void>(r => setTimeout(r, 200)); 
  }

  async pointTowardsTarget(target: string): Promise<void> {
    let tx = this.state.playerX;
    let ty = this.state.playerY;

    if (target === "enemy" || target === "villager" || target === "flag" || target === "slime" || target === "orc") {
      tx = this.state.enemyX;
      ty = this.state.enemyY;
    } else if (target === "potion") {
      const p = this.state.potions.find(p => !p.collected);
      if (p) { tx = p.x; ty = p.y; }
    } else if (target === "magic_circle_1") {
      const ap = this.state.attackPoints[0];
      if (ap) { tx = ap.x; ty = ap.y; }
    } else if (target === "magic_circle_2") {
      const ap = this.state.attackPoints[1];
      if (ap) { tx = ap.x; ty = ap.y; }
    }

    const dx = tx - this.state.playerX;
    const dy = ty - this.state.playerY;
    const rad = Math.atan2(dy, dx);
    let angle = 90 - (rad * 180 / Math.PI);
    this.state.playerAngle = angle;
    this.draw();
    await new Promise<void>(r => setTimeout(r, 300));
  }

  async moveSteps(steps: number): Promise<void> {
    const rad = (90 - this.state.playerAngle) * Math.PI / 180;
    const dx = steps * Math.cos(rad);
    const dy = steps * Math.sin(rad);
    await this.movePlayer(this.state.playerX + dx, this.state.playerY + dy);
  }

  checkCoinCollection(): number {
    let n = 0;
    for (const c of this.state.coins) {
      if (c.collected || c.hidden) continue;
      if (Math.hypot(this.state.playerX - c.x, this.state.playerY - c.y) < 32) {
        c.collected = true; n++;
        audioManager.playCoinSe();
        if (!this.state.coinFloatEffects) this.state.coinFloatEffects = [];
        this.state.coinFloatEffects.push({
          x: this.toCanvasX(c.x),
          y: this.toCanvasY(c.y),
          alpha: 1,
          vy: -4,
        });
      }
    }
    return n;
  }

  checkPotionCollection(): number {
    let n = 0;
    if (!this.state.potions) return 0;
    for (const p of this.state.potions) {
      if (p.collected) continue;
      if (Math.hypot(this.state.playerX - p.x, this.state.playerY - p.y) < 32) {
        p.collected = true; n++;
        audioManager.playCoinSe(); 
        if (!this.state.coinFloatEffects) this.state.coinFloatEffects = [];
        this.state.coinFloatEffects.push({
          x: this.toCanvasX(p.x),
          y: this.toCanvasY(p.y),
          alpha: 1,
          vy: -4,
        });
      }
    }
    return n;
  }

  checkGoalCondition(): void {
    const distX = this.state.playerX - this.state.enemyX;
    const distY = this.state.playerY - this.state.enemyY;
    const dist = Math.hypot(distX, distY);

    if (this.state.enemyType === "flag" && dist <= 40) {
      this.state.gameWon = true;
    }
    if (this.state.enemyType === "villager" && dist <= 40) {
      const allPotionsCollected = this.state.potions.every(p => p.collected);
      if (allPotionsCollected || this.state.potions.length === 0) {
        this.state.gameWon = true;
      }
    }
    
    if (this.state.chapter === 3 && this.state.coins.length > 0) {
      const allCollected = this.state.coins.every(c => c.collected);
      if (allCollected) {
        this.state.gameWon = true;
      }
    }
  }

  async wait(ms: number): Promise<void> {
    const STEPS = Math.floor(ms / 100); 
    for (let i = 0; i < STEPS; i++) {
      if (this.state.gameOver || this.state.gameWon || !this.state.isStarted) return;

      if (this.checkTraps()) {
        throw new Error("TRAP_HIT");
      }
      
      if (this.state.enemyHP > 0 && this.state.enemyType !== "none" && this.state.chapter < 3) {
        for (const ap of this.state.attackPoints) {
          if (!ap.hit && Math.hypot(this.state.playerX - ap.x, this.state.playerY - ap.y) <= ap.radius) {

            let isHit: boolean;
            let fbTargetX: number;
            let fbTargetY: number;

            if (this.state.chapter <= 1) {
              fbTargetX = this.state.enemyX;
              fbTargetY = this.state.enemyY;
              isHit = true;
            } else {
              const dx = this.state.enemyX - this.state.playerX;
              const dy = this.state.enemyY - this.state.playerY;
              const rad = this.state.playerAngle * (Math.PI / 180);
              const fbDirX = Math.sin(rad);
              const fbDirY = Math.cos(rad);
              fbTargetX = this.state.playerX + fbDirX * 400;
              fbTargetY = this.state.playerY + fbDirY * 400;
              const enemyAngle = Math.atan2(dx, dy) * (180 / Math.PI);
              let angleDiff = Math.abs(this.state.playerAngle - enemyAngle) % 360;
              if (angleDiff > 180) angleDiff = 360 - angleDiff;
              isHit = angleDiff <= 5;
            }

            if (i === 0 || i % 2 === 1) {
              audioManager.playFireball();
              if (!this.state.fireballEffects) this.state.fireballEffects = [];
              this.state.fireballEffects.push({
                x: this.toCanvasX(this.state.playerX),
                y: this.toCanvasY(this.state.playerY),
                tx: this.toCanvasX(fbTargetX),
                ty: this.toCanvasY(fbTargetY),
                progress: 0,
                id: Date.now() + Math.random(),
              } as any);
            }

            if (isHit) {
              audioManager.playHit();
              this.state.damageAccum = (this.state.damageAccum || 0) + 0.4;
              const dmg = Math.floor(this.state.damageAccum);
              if (dmg >= 1) {
                this.state.damageAccum -= dmg;
                this.state.enemyHP = Math.max(0, this.state.enemyHP - dmg);
                this.state.damageEffects.push({
                  x: 0, y: this.toCanvasY(this.state.enemyY) - 50, text: `-${dmg} 💥`, alpha: 1,
                });
              }
            } else {
              this.state.damageAccum = 0;
            }
            if (this.state.enemyHP === 0) {
              ap.hit = true;
              this.state.gameWon = true;
              this.state.coins.forEach(c => { if (c.hidden) c.hidden = false; });
              this.draw();
              return; 
            }
          }
        }
        if (this.state.attackPoints.length === 0) {
          const distX = Math.abs(this.state.playerX - this.state.enemyX);
          if (distX <= 100) {
            this.state.damageAccum = (this.state.damageAccum || 0) + 0.4;
            const dmg = Math.floor(this.state.damageAccum);
            if (dmg >= 1) {
              this.state.damageAccum -= dmg;
              this.state.enemyHP = Math.max(0, this.state.enemyHP - dmg);
              this.state.damageEffects.push({
                x: 0, y: this.toCanvasY(this.state.enemyY) - 50, text: `-${dmg} 💥`, alpha: 1,
              });
              if (this.state.enemyHP === 0) {
                this.state.gameWon = true;
              }
            }
          }
        }
      }
      
      this.draw();
      await new Promise<void>(r => setTimeout(r, 100));
    }
  }
}