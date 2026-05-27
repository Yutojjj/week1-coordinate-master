// ── BGM・SE管理 ──────────────────────────────────────────
export class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmNodes: AudioNode[] = [];
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  // 炎の発射音（シュワッ）
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

  // ダメージヒット音（ドカッ）
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

  // 戦闘BGM（ループ）
  startBattleBgm() {
    if (this.isBgmPlaying) return;
    try {
      const ctx = this.getCtx();
      this.bgmGain = ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.15, ctx.currentTime);
      this.bgmGain.connect(ctx.destination);
      this.isBgmPlaying = true;
      const bpm = 140;
      const beat = 60 / bpm;
      // ドラムパターン（キック・スネア）
      const playDrum = (time: number) => {
        if (!this.isBgmPlaying) return;
        const kick = [0, 2, 4, 6]; // 拍の位置
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
        // メロディー（ファンファーレ風）
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
    this.isBgmPlaying = false;
    try {
      if (this.bgmGain) {
        this.bgmGain.gain.exponentialRampToValueAtTime(0.001, this.getCtx().currentTime + 0.5);
      }
    } catch {}
  }
}

export const audioManager = new AudioManager();

export interface GameState {
  playerX: number;
  playerY: number;
  enemyX: number;
  enemyY: number;
  enemyHP: number;
  enemyMaxHP: number;
  enemyType: string; 
  coins: { x: number; y: number; collected: boolean; hidden?: boolean }[];
  attackPoints: { id: number; x: number; y: number; radius: number; hit: boolean }[];
  traps: { id: number; x: number; y: number; radius: number; type: string; activePhase: number; inactivePhase: number; offset: number; }[];
  gameOver: boolean;
  gameWon: boolean;
  damageEffects: { x: number; y: number; text: string; alpha: number }[];
  fireballEffects: { x: number; y: number; tx: number; ty: number; progress: number; id: number }[];
  explosionFrame: number;
  explosionX: number;
  explosionY: number;
  showExplosion: boolean;
  showCoordLabels: boolean;
  timeLeft: number;
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
  
  // ★ トラップやアニメーションのための基準時間
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

  constructor(canvas: HTMLCanvasElement, initialState: GameState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.state = JSON.parse(JSON.stringify(initialState));
    this.startTime = Date.now();
  }

  async loadAllSprites(): Promise<void> {
    const v = "?v=" + Date.now(); // キャッシュバスター
    const list: [string, string][] = [
      ["player",       "/sprites/player_front.png" + v],
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
        img.onload = () => { this.bgImage = img; res(); };
        img.onerror = () => res();
        img.src = "/sprites/bg_grassland.png";
      }),
    ]);
    this.spritesLoaded = true;
  }

  // ★ 追加：トラップ（カミナリ）に当たっているかの判定
  checkTraps(): boolean {
    const t = this.globalTime;
    for (const trap of this.state.traps) {
      const cycle = trap.activePhase + trap.inactivePhase;
      const phaseTime = (t + trap.offset) % cycle;
      // activePhase（危険な時間）の中にいるか
      if (phaseTime < trap.activePhase) {
        if (Math.hypot(this.state.playerX - trap.x, this.state.playerY - trap.y) < trap.radius) {
          return true; // 当たった！
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
    if (this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#5a8a3c";
      ctx.fillRect(0, 0, W, H);
    }

    // ── グリッド ──────────────────────────────────────────
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
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

      // 落雷まで何秒か（休み中のみ）
      const timeUntilBolt = isActive ? 0 : (cycle - phaseTime);
      const isWarning = !isActive && timeUntilBolt < 2.0;

      if (isActive) {
        // ── 落雷中 ──
        // 地面の危険エリア（赤→黄フラッシュ）
        const flash = 0.5 + Math.sin(now * 18) * 0.4;
        ctx.save();
        ctx.fillStyle = `rgba(255,220,0,${flash * 0.5})`;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(255,255,100,${flash})`;
        ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();

        // 雷ボルト画像（上から地面まで）
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
        // ── 待機中：魔法陣を表示 ──
        if (mcImg && mcImg.complete && mcImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(px, py);
          // 警告時は高速回転＋点滅
          ctx.rotate(now * (isWarning ? 4.0 : 0.7));
          ctx.globalAlpha = isWarning
            ? 0.6 + Math.abs(Math.sin(now * 6)) * 0.4
            : 0.55;
          if (isWarning) ctx.filter = "hue-rotate(180deg) saturate(3) brightness(1.5)";
          ctx.drawImage(mcImg, -r, -r, r * 2, r * 2);
          ctx.filter = "none";
          ctx.restore();
        } else {
          // フォールバック
          ctx.fillStyle = isWarning ? "rgba(255,80,0,0.25)" : "rgba(100,50,255,0.15)";
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = isWarning ? "rgba(255,150,0,0.9)" : "rgba(150,80,255,0.6)";
          ctx.lineWidth = 2; ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
        }

        // 警告カウントダウン表示
        if (isWarning) {
          ctx.save();
          ctx.font = `bold ${Math.round(r * 0.7)}px Arial`;
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillText(`${Math.ceil(timeUntilBolt)}`, px + 2, py + 6);
          ctx.fillStyle = "#FFD600";
          ctx.fillText(`${Math.ceil(timeUntilBolt)}`, px, py + 5);
          ctx.restore();
        }
      }
    }

    // ── 軸とラベル ──────────────────────────────────────────
    ctx.strokeStyle = "#FF5252"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.fillStyle = "#FF5252"; ctx.beginPath(); ctx.moveTo(W - 2, cy);
    ctx.lineTo(W - 14, cy - 7); ctx.lineTo(W - 14, cy + 7); ctx.closePath(); ctx.fill();
    ctx.font = "bold 13px Arial"; ctx.textAlign = "right";
    ctx.fillText("X（よこ）→", W - 16, cy - 6); ctx.textAlign = "left";
    
    if (state.showCoordLabels) {
      for (let lx = -200; lx <= 200; lx += 100) {
        if (lx === 0) continue;
        const px = this.toCanvasX(lx);
        ctx.fillStyle = "rgba(255,82,82,0.9)"; ctx.fillRect(px - 16, cy + 5, 32, 15);
        ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText(String(lx), px, cy + 17);
      }
    }

    ctx.strokeStyle = "#42A5F5"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, H); ctx.lineTo(cx, 0); ctx.stroke();
    ctx.fillStyle = "#42A5F5"; ctx.beginPath(); ctx.moveTo(cx, 2);
    ctx.lineTo(cx - 7, 16); ctx.lineTo(cx + 7, 16); ctx.closePath(); ctx.fill();
    ctx.font = "bold 13px Arial"; ctx.textAlign = "left";
    ctx.fillText("↑ Y（たて）", cx + 6, 20);

    if (state.showCoordLabels) {
      for (let ly = -200; ly <= 200; ly += 100) {
        if (ly === 0) continue;
        const py = this.toCanvasY(ly);
        ctx.fillStyle = "rgba(66,165,245,0.9)"; ctx.fillRect(cx + 5, py - 8, 32, 15);
        ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
        ctx.fillText(String(ly), cx + 7, py + 4);
      }
    }

    ctx.fillStyle = "white"; ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (state.showCoordLabels) {
      ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(cx + 8, cy - 16, 38, 14);
      ctx.fillStyle = "#FFD600"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
      ctx.fillText("(0,0)", cx + 10, cy - 4);
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
    for (const coin of state.coins) {
      if (coin.collected || coin.hidden) continue;
      const px = this.toCanvasX(coin.x), py = this.toCanvasY(coin.y);
      if (coinImg) {
        ctx.drawImage(coinImg, px - coinSize/2, py - coinSize/2, coinSize, coinSize);
      } else {
        ctx.fillStyle = "#FFD600"; ctx.beginPath(); ctx.arc(px, py, coinSize/2, 0, Math.PI * 2); ctx.fill();
      }
      if (state.showCoordLabels) {
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
    for (const ap of state.attackPoints) {
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
      // ダメージ直後はorc_hurtスプライトに切り替え
      const recentlyHit = state.damageEffects.some(e => e.alpha > 0.7);
      const enemySprite = (recentlyHit && state.enemyType === "orc")
        ? (this.sprites.get("orc_hurt") || this.sprites.get(state.enemyType))
        : this.sprites.get(state.enemyType);
      const img = enemySprite;

      // 攻撃モーション: プレイヤーがX軸100以内にいるとき揺れ＋エフェクト
      const distX = Math.abs(state.playerX - state.enemyX);
      const isAttacking = state.attackPoints.length === 0 && distX <= 100 && state.enemyHP > 0;
      const shake = isAttacking ? Math.sin(Date.now() / 80) * 4 : 0;
      const attackScale = isAttacking ? 1 + Math.abs(Math.sin(Date.now() / 150)) * 0.08 : 1;

      // 攻撃中は赤いオーラ
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

        // 攻撃エフェクト: 斜め線（剣筋）
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
      
      const bw = eSize * 1.0, bh = 8;
      ctx.fillStyle = "#555"; ctx.fillRect(ex - bw/2, ey - eSize/2 - 14, bw, bh);
      const hpR = Math.max(0, state.enemyHP / state.enemyMaxHP);
      ctx.fillStyle = hpR > 0.5 ? "#4CAF50" : hpR > 0.25 ? "#FFD600" : "#F44336";
      ctx.fillRect(ex - bw/2, ey - eSize/2 - 14, bw * hpR, bh);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
      ctx.strokeRect(ex - bw/2, ey - eSize/2 - 14, bw, bh);
      
      // HP99（倒せない設定）のときはHPバーの数値を隠す
      if (state.enemyMaxHP < 99) {
        ctx.fillStyle = "white"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
        ctx.fillText(`HP ${state.enemyHP}/${state.enemyMaxHP}`, ex, ey - eSize/2 - 17);
      }
      ctx.textAlign = "left";
    }

    // ── プレイヤー ──────────────────────────────────────────
    const px = this.toCanvasX(state.playerX);
    const py = this.toCanvasY(state.playerY);
    const pSize = Math.max(52, Math.round(W * 0.08));
    // 魔法陣に乗っているときはcastポーズ
    const onAttackPoint = state.attackPoints.some(
      ap => !ap.hit && Math.hypot(state.playerX - ap.x, state.playerY - ap.y) <= ap.radius
    );
    const playerSprite = onAttackPoint ? "player_cast" : "player";
    const pImg = this.sprites.get(playerSprite) || this.sprites.get("player");
    if (pImg && pImg.complete && pImg.naturalWidth > 0) {
      ctx.drawImage(pImg, px - pSize/2, py - pSize * 0.65, pSize, pSize);
    } else {
      ctx.fillStyle = "#1565C0"; ctx.strokeStyle = "#FFD600"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, pSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "white"; ctx.font = `bold ${Math.round(pSize*0.3)}px Arial`;
      ctx.textAlign = "center"; ctx.fillText("勇", px, py + Math.round(pSize*0.12));
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
          // 進行方向を向くように回転
          const angle = Math.atan2(fb.ty - fb.y, fb.tx - fb.x);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.drawImage(fbImg, -size*1.5, -size*0.8, size*3, size*1.6);
          ctx.restore();
          // 尾（トレイル）
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
          // フォールバック：グラデーション円
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

    // ── ダメージエフェクト（強化版）──────────────────────────────────────────
    for (const eff of state.damageEffects) {
      const ex2 = this.toCanvasX(state.enemyX);
      const scale = 1 + (1 - eff.alpha) * 0.8;
      ctx.save();
      ctx.globalAlpha = eff.alpha;
      ctx.translate(ex2, eff.y);
      ctx.scale(scale, scale);
      // 影
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = `bold ${Math.round(W * 0.065)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(eff.text, 2, 2);
      // 本体（グラデーション風に二重描画）
      ctx.fillStyle = "#FF1744";
      ctx.fillText(eff.text, 0, 0);
      ctx.fillStyle = "#FFD600";
      ctx.font = `bold ${Math.round(W * 0.055)}px Arial`;
      ctx.fillText(eff.text, 0, 0);
      // 衝撃波リング
      const ring = (1 - eff.alpha);
      ctx.strokeStyle = `rgba(255,100,0,${eff.alpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ring * 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ── 終了メッセージ ──────────────────────────────────────────
    if (state.gameOver) {
      // 暗転
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(0, 0, W, H);
      // 赤いスキャンライン風
      for (let i = 0; i < H; i += 4) {
        ctx.fillStyle = "rgba(255,0,0,0.04)";
        ctx.fillRect(0, i, W, 2);
      }
      const gof = Math.round(W * 0.09);
      ctx.textAlign = "center";
      // 影
      ctx.fillStyle = "rgba(255,0,0,0.3)";
      ctx.font = `bold ${gof}px Arial`;
      ctx.fillText("GAME OVER", W/2 + 3, H/2 + 3);
      // グロー
      ctx.fillStyle = "#FF1744";
      ctx.shadowColor = "#FF1744";
      ctx.shadowBlur = 30;
      ctx.fillText("GAME OVER", W/2, H/2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `${Math.round(W * 0.033)}px Arial`;
      ctx.fillText("もういちどためしてみよう！", W/2, H/2 + gof * 0.9);
      ctx.textAlign = "left";
    }

    if (state.gameWon) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, W, H);
      // 金色の放射光
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
      // 影
      ctx.fillStyle = "rgba(180,120,0,0.5)";
      ctx.font = `bold ${cfs}px Arial`;
      ctx.fillText("🎉 クリア！", W/2 + 3, H/2 + 3);
      // グロー
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

  // ★ movePlayer内でのリアルタイム当たり判定
  async movePlayer(lx: number, ly: number): Promise<void> {
    lx = Math.max(-200, Math.min(200, lx));
    ly = Math.max(-200, Math.min(200, ly));
    const STEPS = 25;
    const sx = this.state.playerX, sy = this.state.playerY;
    
    for (let i = 1; i <= STEPS; i++) {
      if (this.state.gameOver || this.state.gameWon) return;
      this.state.playerX = sx + (lx - sx) * (i / STEPS);
      this.state.playerY = sy + (ly - sy) * (i / STEPS);
      // 移動中は雷を避けながら走っている演出のため判定なし
      this.draw();
      await new Promise<void>(r => setTimeout(r, 16));
    }
    
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
  }

  // ★ wait内でのリアルタイム当たり判定
  async wait(ms: number): Promise<void> {
    const STEPS = Math.floor(ms / 100); 
    for (let i = 0; i < STEPS; i++) {
      if (this.state.gameOver) return;

      // 待っている間にトラップに当たったら即エラーを投げる
      if (this.checkTraps()) {
        throw new Error("TRAP_HIT");
      }
      
      // 魔法陣の処理（1-2-1用）
      if (i % 10 === 9 && this.state.enemyHP > 0 && this.state.enemyType !== "none") {
        for (const ap of this.state.attackPoints) {
          if (!ap.hit && Math.hypot(this.state.playerX - ap.x, this.state.playerY - ap.y) <= ap.radius) {
            this.state.enemyHP = Math.max(0, this.state.enemyHP - 1);
            this.state.damageEffects.push({
              x: 0, y: this.toCanvasY(this.state.enemyY) - 50, text: "-1 💥", alpha: 1,
            });
            // 炎弾を発射
            audioManager.playFireball();
            audioManager.playHit();
            if (!this.state.fireballEffects) this.state.fireballEffects = [];
            this.state.fireballEffects.push({
              x: this.toCanvasX(this.state.playerX),
              y: this.toCanvasY(this.state.playerY),
              tx: this.toCanvasX(this.state.enemyX),
              ty: this.toCanvasY(this.state.enemyY),
              progress: 0,
              id: Date.now() + Math.random(),
            });
            if (this.state.enemyHP === 0) {
              ap.hit = true;
              this.state.coins.forEach(c => {
                if (c.hidden) c.hidden = false;
              });
            }
          }
        }
        // オーク近くにいるとダメージ（attackPointsなしのステージ用）
        // プレイヤーのX座標だけで判定（Y方向のオークとの距離は無視）
        if (this.state.attackPoints.length === 0) {
          const distX = Math.abs(this.state.playerX - this.state.enemyX);
          if (distX <= 100) {
            this.state.enemyHP = Math.max(0, this.state.enemyHP - 1);
            this.state.damageEffects.push({
              x: 0, y: this.toCanvasY(this.state.enemyY) - 50, text: "-1 💥", alpha: 1,
            });
            // HP0になったら即クリアフラグ
            if (this.state.enemyHP === 0) {
              this.state.gameWon = true;
            }
          }
        }
      }
      
      this.draw();
      await new Promise<void>(r => setTimeout(r, 100));
    }
  }
}