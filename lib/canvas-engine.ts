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
    const list: [string, string][] = [
      ["player",       "/sprites/player_front.png"],
      ["player_left",  "/sprites/player_left.png"],
      ["player_right", "/sprites/player_right.png"],
      ["player_back",  "/sprites/player_back.png"],
      ["slime",        "/sprites/enemy_slime.png"],
      ["orc",          "/sprites/enemy_orc.png"],
      ["bat",          "/sprites/enemy_bat.png"], 
      ["coin1",        "/sprites/coin_frame1.png"],
      ["coin2",        "/sprites/coin_frame2.png"],
      ["coin3",        "/sprites/coin_frame3.png"],
      ["coin4",        "/sprites/coin_frame4.png"],
      ["exp1",         "/sprites/explosion_frame1.png"],
      ["exp2",         "/sprites/explosion_frame2.png"],
      ["exp3",         "/sprites/explosion_frame3.png"],
      ["exp4",         "/sprites/explosion_frame4.png"],
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

    // ── トラップ（雷）の描画（背景とキャラの間） ───────────────────
    const t = this.globalTime;
    for (const trap of state.traps) {
      const cycle = trap.activePhase + trap.inactivePhase;
      const phaseTime = (t + trap.offset) % cycle;
      const isActive = phaseTime < trap.activePhase;
      const px = this.toCanvasX(trap.x);
      const py = this.toCanvasY(trap.y);
      const r = trap.radius * (W / 400);

      if (isActive) {
        // 雷（危険・黄色）
        ctx.fillStyle = "rgba(255, 255, 0, 0.6)";
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#FFD600";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "white"; ctx.font = "bold 24px Arial"; ctx.textAlign = "center";
        ctx.fillText("⚡", px, py + 8);
      } else {
        // 予告（安全・薄い赤点線）
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255, 0, 0, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]); // 元に戻す
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
      const px = this.toCanvasX(ap.x), py = this.toCanvasY(ap.y);
      const r = ap.radius * rScale;
      ctx.strokeStyle = `rgba(255,50,50,${0.5 + 0.4 * pulse})`; 
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(255,100,50,${0.2 + 0.1 * pulse})`;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FF5252"; ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
      ctx.fillText(`🔥`, px, py + 5);
      if (state.showCoordLabels) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(px - 27, py + r + 2, 54, 14);
        ctx.fillStyle = "#FF5252"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillText(`X:${ap.x}`, px - 25, py + r + 13);
        ctx.fillStyle = "#42A5F5"; ctx.textAlign = "right";
        ctx.fillText(`Y:${ap.y}`, px + 25, py + r + 13);
      }
      ctx.textAlign = "left";
    }

    // ── 敵 ──────────────────────────────────────────
    if (state.enemyHP > 0 && state.enemyType !== "none") {
      const ex = this.toCanvasX(state.enemyX), ey = this.toCanvasY(state.enemyY);
      const eSize = Math.round(W * 0.12);
      const img = this.sprites.get(state.enemyType);
      
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, ex - eSize/2, ey - eSize/2, eSize, eSize);
      } else {
        ctx.fillStyle = "#42a5f5"; ctx.beginPath(); ctx.arc(ex, ey, eSize/2, 0, Math.PI * 2); ctx.fill();
      }
      
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
    const pImg = this.sprites.get("player");
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

    // ── ダメージエフェクト ──────────────────────────────────────────
    for (const eff of state.damageEffects) {
      const ex2 = this.toCanvasX(state.enemyX);
      ctx.globalAlpha = eff.alpha;
      ctx.fillStyle = "#FF5252"; ctx.font = "bold 22px Arial"; ctx.textAlign = "center";
      ctx.fillText(eff.text, ex2, eff.y);
      ctx.textAlign = "left"; ctx.globalAlpha = 1;
    }

    // ── 終了メッセージ ──────────────────────────────────────────
    if (state.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#F44336";
      ctx.font = `bold ${Math.round(W * 0.08)}px Arial`;
      ctx.textAlign = "center"; ctx.fillText("GAME OVER", W/2, H/2 - 20);
      ctx.textAlign = "left";
    }

    if (state.gameWon) {
      ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#FFD600";
      ctx.font = `bold ${Math.round(W * 0.07)}px Arial`;
      ctx.textAlign = "center"; ctx.fillText("🎉 クリア！", W/2, H/2 - 20);
      ctx.fillStyle = "white"; ctx.font = `${Math.round(W * 0.03)}px Arial`;
      ctx.fillText("おめでとう！", W/2, H/2 + 36);
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
      if (this.state.gameOver) return;
      this.state.playerX = sx + (lx - sx) * (i / STEPS);
      this.state.playerY = sy + (ly - sy) * (i / STEPS);
      
      // 移動中にトラップに当たったら即エラーを投げて止まる
      if (this.checkTraps()) {
        throw new Error("TRAP_HIT");
      }
      
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
            if (this.state.enemyHP === 0) {
              ap.hit = true;
              this.state.coins.forEach(c => {
                if (c.hidden) c.hidden = false;
              });
            }
          }
        }
      }
      
      this.draw();
      await new Promise<void>(r => setTimeout(r, 100));
    }
  }
}