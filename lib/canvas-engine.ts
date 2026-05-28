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
    // ボスBGM（HTML Audio）を停止
    if (this.bossAudio) {
      this.bossAudio.pause();
      this.bossAudio.currentTime = 0;
      this.bossAudio = null;
    }
    this.bgmGain = null;
    this.bgmMode = "none";
  }

  // ボスBGM（MP3使用）
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

  // 待機中BGM（MP3使用）
  startAmbientBgm() {
    if (this.bgmMode === "ambient") return;
    this.stopCurrentBgm();
    try {
      const audio = new Audio("/bgm/Sunlit_Meadow_Path.mp3");
      audio.loop = true;
      audio.volume = 0.4;
      audio.play().catch(() => {});
      this.bossAudio = audio; // 同じフィールドで管理
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
      // コトッという足音
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
    // バトル・ボス終了後はアンビエントに戻す
    setTimeout(() => this.startAmbientBgm(), 600);
  }

  // ページ離脱時など完全停止（アンビエント再起動なし）
  stopAll() {
    this.stopCurrentBgm();
  }
}

export const audioManager = new AudioManager();

export interface GameState {
  playerX: number;
  playerY: number;
  // ★ 第2章：向き（角度）のデータを追加
  playerAngle: number;
  enemyX: number;
  enemyY: number;
  enemyHP: number;
  enemyMaxHP: number;
  enemyType: string; 
  coins: { x: number; y: number; collected: boolean; hidden?: boolean; sprite?: string; label?: string }[];
  attackPoints: { id: number; x: number; y: number; radius: number; hit: boolean }[];
  traps: { id: number; x: number; y: number; radius: number; type: string; activePhase: number; inactivePhase: number; offset: number; }[];
  gameOver: boolean;
  gameWon: boolean;
  damageAccum: number;
  damageEffects: { x: number; y: number; text: string; alpha: number }[];
  fireballEffects: { x: number; y: number; tx: number; ty: number; progress: number; id: number }[];
  explosionFrame: number;
  explosionX: number;
  explosionY: number;
  showExplosion: boolean;
  showCoordLabels: boolean;
  timeLeft: number;
  coinFloatEffects: { x: number; y: number; alpha: number; vy: number }[];
  lightningStrike: { progress: number; x: number } | null;
  hideCoinCoords: boolean;
  chapter: number; // 章番号（背景切り替えに使用）
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
  private walkFrame = 0;       // 歩行アニメフレーム(0〜7)
  private walkTimer = 0;       // フレーム進行タイマー
  private isWalking = false;   // 移動中フラグ
  
  startTime: number = Date.now();

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
    this.state = JSON.parse(JSON.stringify(initialState));
    this.startTime = Date.now();
  }

  async loadAllSprites(): Promise<void> {
    const v = "?v=" + Date.now(); 
    const list: [string, string][] = [
      ["player",       "/sprites/player_front.png" + v],
      ["player_front", "/sprites/player_front.png" + v],
      ["potion",       "/sprites/potion.png" + v],
      ["hushou",       "/sprites/hushou.png" + v],
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
      ["bat",          "/sprites/enemy_bat.png" + v],
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

    // ── 背景 ──────────────────────────────────────────
    const bgKey = state.chapter >= 2 ? "bg_grassland" : "bg_field";
    const bgImg = this.sprites.get(bgKey) || this.bgImage;
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#5a8a3c";
      ctx.fillRect(0, 0, W, H);
    }

    // ── グリッド（モダン）──────────────────────────────────────────
    // サブグリッド（50刻み）
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
    // メイングリッド（100刻み）
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

    // ── トラップ（雷）の描画 ───────────────────
    const t = this.globalTime;
    const mcImg = this.sprites.get("magic_circle");
    const lbImg = this.sprites.get("lightning_bolt");
    const now = Date.now() / 1000;

    for (const trap of state.traps) {
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
          ctx.globalAlpha = isWarning
            ? 0.6 + Math.abs(Math.sin(now * 6)) * 0.4
            : 0.55;
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
          const by = py - r - badgeH - 8; // 魔法陣の上に配置

          // バッジ背景（角丸）
          ctx.fillStyle = "rgba(0,0,0,0.75)";
          this.roundRect(ctx, bx - 1, by - 1, badgeW + 2, badgeH + 2, 7);
          ctx.fill();
          ctx.fillStyle = isWarning ? "rgba(255,80,0,0.9)" : "rgba(255,200,0,0.9)";
          this.roundRect(ctx, bx, by, badgeW, badgeH, 6);
          ctx.fill();

          // ⚡アイコン + 数字
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

    // ── 軸とラベル（モダン）──────────────────────────────────────────
    // X軸
    ctx.save();
    ctx.strokeStyle = "rgba(255,100,100,0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    // X軸矢印
    ctx.fillStyle = "rgba(255,100,100,0.9)";
    ctx.beginPath(); ctx.moveTo(W - 4, cy); ctx.lineTo(W - 16, cy - 6); ctx.lineTo(W - 16, cy + 6); ctx.closePath(); ctx.fill();
    // X軸ラベル
    ctx.font = "bold 11px 'Arial'"; ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,100,100,0.95)";
    ctx.fillText("X →", W - 18, cy - 7);
    ctx.restore();

    // Y軸
    ctx.save();
    ctx.strokeStyle = "rgba(100,180,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, H); ctx.lineTo(cx, 0); ctx.stroke();
    // Y軸矢印
    ctx.fillStyle = "rgba(100,180,255,0.9)";
    ctx.beginPath(); ctx.moveTo(cx, 4); ctx.lineTo(cx - 6, 16); ctx.lineTo(cx + 6, 16); ctx.closePath(); ctx.fill();
    // Y軸ラベル
    ctx.font = "bold 11px 'Arial'"; ctx.textAlign = "left";
    ctx.fillStyle = "rgba(100,180,255,0.95)";
    ctx.fillText("Y ↑", cx + 8, 18);
    ctx.restore();

    // 原点ドット
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();

    if (state.showCoordLabels) {
      // X軸の数値ラベル（ピル型バッジ）
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
      // Y軸の数値ラベル（ピル型バッジ）
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
      // 原点ラベル
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      this.roundRect(ctx, cx + 7, cy - 17, 36, 14, 4);
      ctx.fill();
      ctx.fillStyle = "#FFD600"; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("(0,0)", cx + 9, cy - 5);
      ctx.restore();
    }

    // ── タイマー ──────────────────────────────────────────
    if (state.timeLeft > 0) {
      const tc = state.timeLeft <= 1 ? "#F44336" : state.timeLeft <= 3 ? "#FF9800" : "#FFD600";
      ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(W - 110, 10, 100, 38);
      ctx.strokeStyle = tc; ctx.lineWidth = 2; ctx.strokeRect(W - 110, 10, 100, 38);
      ctx.fillStyle = tc; ctx.font = "bold 24px monospace"; ctx.textAlign = "center";
      ctx.fillText(`⏰${state.timeLeft.toFixed(1)}`, W - 60, 38); ctx.textAlign = "left";
    }

    // ── コイン ──────────────────────────────────────────
    const coinImg = this.sprites.get(`coin${(this.coinFrame % 4) + 1}`);
    const coinSize = Math.round(W * 0.055);
    for (let ci = 0; ci < state.coins.length; ci++) {
      const coin = state.coins[ci];
      if (coin.collected || coin.hidden) continue;
      const px = this.toCanvasX(coin.x), py = this.toCanvasY(coin.y);

      // ポーション・村民画像（coin.spriteが設定されている場合）
      const customImg = coin.sprite ? this.sprites.get(coin.sprite) : null;
      const drawImg = customImg || coinImg;
      // 村民は大きめに表示
      const displaySize = coin.sprite === "hushou" ? Math.round(W * 0.10) : coinSize;

      // ラベル表示なし、画像のみ
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

    // ── 攻撃ポイント（魔法陣） ──────────────────────────────────────────
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    const rScale = W / 400;
    for (let index = 0; index < state.attackPoints.length; index++) {
      const ap = state.attackPoints[index];
      if (ap.hit) continue;
      const apx = this.toCanvasX(ap.x), apy = this.toCanvasY(ap.y);
      const r = ap.radius * rScale;
      const t2 = Date.now() / 1000;
      const mcImg = this.sprites.get("magic_circle");
      if (mcImg && mcImg.complete && mcImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(apx, apy);
        ctx.rotate(t2 * 0.8);
        const scalePulse = 1 + Math.sin(t2 * 2) * 0.04;
        ctx.scale(scalePulse, scalePulse);
        ctx.globalAlpha = 0.85 + Math.sin(t2 * 3) * 0.1;
        ctx.drawImage(mcImg, -r, -r, r * 2, r * 2);
        ctx.restore();
      } else {
        ctx.strokeStyle = `rgba(180,100,255,${0.5 + 0.4 * pulse})`;
        ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(apx, apy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(180,100,255,${0.15 + 0.1 * pulse})`;
        ctx.beginPath(); ctx.arc(apx, apy, r, 0, Math.PI * 2); ctx.fill();

        // 魔法陣番号ラベル（複数ある場合）
        if (state.attackPoints.length >= 2) {
          const label = `まほうじん${index + 1}`;
          ctx.font = `bold ${Math.round(r * 0.38)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(0,0,0,0.65)";
          ctx.fillText(label, apx, apy - r - 6 + 2);
          ctx.fillStyle = "rgba(220,180,255,0.95)";
          ctx.fillText(label, apx, apy - r - 6);
          ctx.textAlign = "left";
        }
      }
      if (state.showCoordLabels) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(apx - 27, apy + r + 2, 54, 14);
        ctx.fillStyle = "#FF5252"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillText(`X:${ap.x}`, apx - 25, apy + r + 13);
        ctx.fillStyle = "#42A5F5"; ctx.textAlign = "right";
        ctx.fillText(`Y:${ap.y}`, apx + 25, apy + r + 13);
      }
      ctx.textAlign = "left";
    }

    // ── 敵 ──────────────────────────────────────────
    if (state.enemyHP > 0 && state.enemyType !== "none") {
      const ex = this.toCanvasX(state.enemyX), ey = this.toCanvasY(state.enemyY);
      const eSize = Math.round(W * 0.12);
      const recentlyHit = state.damageEffects.some(e => e.alpha > 0.7);
      const enemySprite = (recentlyHit && state.enemyType === "orc")
        ? (this.sprites.get("orc_hurt") || this.sprites.get(state.enemyType))
        : this.sprites.get(state.enemyType);
      const img = enemySprite;

      const distX = Math.abs(state.playerX - state.enemyX);
      const isAttacking = state.attackPoints.length === 0 && distX <= 100 && state.enemyHP > 0;
      const shake = isAttacking ? Math.sin(Date.now() / 80) * 4 : 0;
      const attackScale = isAttacking ? 1 + Math.abs(Math.sin(Date.now() / 150)) * 0.08 : 1;

      if (isAttacking) {
        const auraR = eSize * 0.7 * attackScale;
        const auraAlpha = 0.25 + Math.abs(Math.sin(Date.now() / 200)) * 0.2;
        ctx.save();
        ctx.globalAlpha = auraAlpha;
        ctx.fillStyle = "#FF1744";
        ctx.beginPath();
        ctx.arc(ex + shake, ey, auraR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255,100,0," + (0.5 + Math.abs(Math.sin(Date.now() / 120)) * 0.5) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ex + shake - eSize * 0.4, ey - eSize * 0.3);
        ctx.lineTo(ex + shake + eSize * 0.1, ey + eSize * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex + shake - eSize * 0.1, ey - eSize * 0.4);
        ctx.lineTo(ex + shake + eSize * 0.4, ey + eSize * 0.2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(ex + shake, ey);
      ctx.scale(attackScale, attackScale);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -eSize/2, -eSize/2, eSize, eSize);
      } else {
        ctx.fillStyle = "#42a5f5"; ctx.beginPath(); ctx.arc(0, 0, eSize/2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      
      // ── HPバー（モダン）──
      const bw = eSize * 1.2, bh = 10;
      const bx = ex - bw / 2, by = ey - eSize / 2 - 18;
      const hpR = Math.max(0, state.enemyHP / state.enemyMaxHP);
      const hpColor = hpR > 0.6 ? "#4ade80" : hpR > 0.3 ? "#facc15" : "#f87171";

      // 背景トラック
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      this.roundRect(ctx, bx - 1, by - 1, bw + 2, bh + 2, 6);
      ctx.fill();

      // バー本体
      if (hpR > 0) {
        ctx.fillStyle = hpColor;
        ctx.shadowColor = hpColor;
        ctx.shadowBlur = 6;
        this.roundRect(ctx, bx, by, bw * hpR, bh, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ハート ❤ アイコン（左）
      ctx.font = "10px Arial"; ctx.textAlign = "right";
      ctx.fillStyle = hpColor;
      ctx.shadowColor = hpColor; ctx.shadowBlur = 4;
      ctx.fillText("♥", bx - 3, by + bh - 1);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.textAlign = "left";
    }

    // ── プレイヤー（第2章：角度による画像の切り替え） ──────────────────────────
    const px = this.toCanvasX(state.playerX);
    const py = this.toCanvasY(state.playerY);
    const pSize = Math.max(52, Math.round(W * 0.08));

    const onAttackPoint = state.attackPoints.some(
      ap => !ap.hit && Math.hypot(state.playerX - ap.x, state.playerY - ap.y) <= ap.radius
    );
    
    // ★ 向いている角度（playerAngle）に合わせて画像を切り替える！
    let spriteName = "player_front";
    const angle = ((state.playerAngle % 360) + 360) % 360;

    if (state.gameOver) {
      spriteName = "player_hurt"; // やられた！
    } else if (onAttackPoint) {
      spriteName = "player_cast";
    } else {
      if (angle >= 45 && angle < 135) spriteName = "player_right";
      else if (angle >= 135 && angle < 225) spriteName = "player_front";
      else if (angle >= 225 && angle < 315) spriteName = "player_left";
      else spriteName = "player_back";
    }

    const pImg = this.sprites.get(spriteName) || this.sprites.get("player") || this.sprites.get("player_front");

    // 歩行アニメ：移動中は上下バウンス
    const walkBob = this.isWalking && !state.gameOver
      ? Math.sin(this.walkFrame * Math.PI / 4) * 4
      : 0;

    // ゲームオーバー時は少し揺らして倒れた演出
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

    // 歩行フレーム更新
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

    // ── 炎弾エフェクト ──────────────────────────────────────────
    if (this.state.fireballEffects) {
      for (const fb of this.state.fireballEffects) {
        const cx = fb.x + (fb.tx - fb.x) * fb.progress;
        const cy = fb.y + (fb.ty - fb.y) * fb.progress;
        const alpha = fb.progress < 0.8 ? 1 : (1 - fb.progress) / 0.2;
        const size = 10 + Math.sin(fb.progress * Math.PI) * 8;

        ctx.save();
        ctx.globalAlpha = alpha;

        const fbImg = this.sprites.get("fireball");
        if (fbImg && fbImg.complete && fbImg.naturalWidth > 0) {
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
          grad1.addColorStop(0, "rgba(255,200,50,0.9)");
          grad1.addColorStop(0.4, "rgba(255,80,0,0.7)");
          grad1.addColorStop(1, "rgba(255,0,0,0)");
          ctx.fillStyle = grad1;
          ctx.beginPath();
          ctx.arc(cx, cy, size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // ── コイン浮き上がり演出 ──────────────────────────────────────────
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

    // ── ダメージエフェクト ──────────────────────────────────────────
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

    // ── 負け演出：雷がキャラに落ちる ──────────────────────────────────────────
    if (state.gameOver && state.lightningStrike) {
      const ls = state.lightningStrike;
      const px2 = ls.x;
      const py2 = this.toCanvasY(this.state.playerY);
      const strikeY = ls.progress < 0.5
        ? H * 0.02 + (py2 - H * 0.02) * (ls.progress / 0.5) // 上から落ちてくる
        : py2; // 着弾後は地面で停止

      // 雷の閃光（白いフラッシュ）
      if (ls.progress > 0.45 && ls.progress < 0.65) {
        const flashAlpha = Math.sin((ls.progress - 0.45) / 0.2 * Math.PI) * 0.55;
        ctx.fillStyle = `rgba(200,220,255,${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      // 雷のジグザグ線
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
      // 太い中心線
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

      // 着弾エフェクト（地面の円形閃光）
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

    // ── 終了メッセージ ──────────────────────────────────────────
    if (state.gameOver) {
      // 雷演出が終わったら軽く暗転だけ（テキストなし）
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

  async movePlayer(lx: number, ly: number): Promise<void> {
    lx = Math.max(-200, Math.min(200, lx));
    ly = Math.max(-200, Math.min(200, ly));
    const STEPS = 25;
    const sx = this.state.playerX, sy = this.state.playerY;
    
    this.isWalking = true;
    let seStep = 0;

    for (let i = 1; i <= STEPS; i++) {
      if (this.state.gameOver || this.state.gameWon) { this.isWalking = false; return; }
      this.state.playerX = sx + (lx - sx) * (i / STEPS);
      this.state.playerY = sy + (ly - sy) * (i / STEPS);
      // 歩行SE：8ステップごとに鳴らす（足音のリズム）
      seStep++;
      if (seStep % 8 === 0) audioManager.playWalkSe();
      this.draw();
      await new Promise<void>(r => setTimeout(r, 16));
    }

    this.isWalking = false;
    this.state.playerX = lx; this.state.playerY = ly;
    if (this.checkTraps()) { throw new Error("TRAP_HIT"); }
    this.draw();
  }

  checkCoinCollection(): number {
    let n = 0;
    for (const c of this.state.coins) {
      if (c.collected || c.hidden) continue;
      if (Math.hypot(this.state.playerX - c.x, this.state.playerY - c.y) < 32) {
        c.collected = true; n++;
        audioManager.playCoinSe();
        // コイン浮き上がり演出
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

  tickDamageEffects(): void {
    this.state.damageEffects = this.state.damageEffects
      .map(e => ({ ...e, y: e.y - 1.5, alpha: e.alpha - 0.025 }))
      .filter(e => e.alpha > 0);
    if (this.state.fireballEffects) {
      this.state.fireballEffects = this.state.fireballEffects
        .map(f => ({ ...f, progress: f.progress + 0.04 }))
        .filter(f => f.progress < 1.0);
    }
    if (this.state.coinFloatEffects) {
      this.state.coinFloatEffects = this.state.coinFloatEffects
        .map(e => ({ ...e, y: e.y + e.vy, vy: e.vy - 0.3, alpha: e.alpha - 0.03 }))
        .filter(e => e.alpha > 0);
    }
    // 雷落下アニメーション
    if (this.state.lightningStrike && this.state.lightningStrike.progress < 1.2) {
      this.state.lightningStrike.progress += 0.025;
    }
  }

  async wait(ms: number): Promise<void> {
    const STEPS = Math.floor(ms / 100); 
    for (let i = 0; i < STEPS; i++) {
      if (this.state.gameOver || this.state.gameWon) return;

      if (this.checkTraps()) {
        throw new Error("TRAP_HIT");
      }
      
      if (this.state.enemyHP > 0 && this.state.enemyType !== "none") {
        for (const ap of this.state.attackPoints) {
          if (!ap.hit && Math.hypot(this.state.playerX - ap.x, this.state.playerY - ap.y) <= ap.radius) {

            // ── ファイアボールが敵に当たるか判定 ──
            const dx = this.state.enemyX - this.state.playerX;
            const dy = this.state.enemyY - this.state.playerY;

            // 第1章：魔法陣に乗ったら自動で敵に向かって発射（向けるを習う前なのでオートエイム）
            // 第2章以降：playerAngle の角度が敵方向と一致しているか判定
            let isHit: boolean;
            let fbTargetX: number;
            let fbTargetY: number;

            if (this.state.chapter <= 1) {
              fbTargetX = this.state.enemyX;
              fbTargetY = this.state.enemyY;
              isHit = true;
            } else {
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

            // ファイアボール発射
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
              });
            }

            // ダメージは命中時のみ
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
              // 外れた場合はダメージリセットのみ
              this.state.damageAccum = 0;
            }
            if (this.state.enemyHP === 0) {
              ap.hit = true;
              this.state.gameWon = true;
              this.state.coins.forEach(c => { if (c.hidden) c.hidden = false; });
              this.draw();
              return; // 即座に終了
            }
          }
        }
        if (this.state.attackPoints.length === 0) {
          const distX = Math.abs(this.state.playerX - this.state.enemyX);
          if (distX <= 100) {
            // 継続ダメージ（攻撃ポイントなし時）
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