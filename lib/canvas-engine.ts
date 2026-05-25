export interface GameState {
  playerX: number;
  playerY: number;
  enemyX: number;
  enemyY: number;
  enemyHP: number;
  enemyMaxHP: number;
  coins: { x: number; y: number; collected: boolean }[];
  attackPoints: { id: number; x: number; y: number; radius: number; hit: boolean }[];
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
  }

  async loadAllSprites(): Promise<void> {
    const list: [string, string][] = [
      ["player",       "/sprites/player_front.png"],
      ["player_left",  "/sprites/player_left.png"],
      ["player_right", "/sprites/player_right.png"],
      ["player_back",  "/sprites/player_back.png"],
      ["slime",        "/sprites/enemy_slime.png"],
      ["orc",          "/sprites/enemy_orc.png"],
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

  draw(): void {
    const { ctx, canvas, state } = this;
    const W = canvas.width, H = canvas.height;
    const cx = this.toCanvasX(0);   // X=0 のcanvas座標
    const cy = this.toCanvasY(0);   // Y=0 のcanvas座標

    // ── 背景 ──────────────────────────────────────────
    if (this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#5a8a3c";
      ctx.fillRect(0, 0, W, H);
    }

    // ── グリッド（薄い白） ──────────────────────────────────────────
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

    // ── X軸（赤・太め）＋ラベル ──────────────────────────────────────────
    // X軸 = 横方向の線（Y=0の位置）
    ctx.strokeStyle = "#FF5252";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

    // X軸矢印（右端）
    ctx.fillStyle = "#FF5252";
    ctx.beginPath();
    ctx.moveTo(W - 2, cy);
    ctx.lineTo(W - 14, cy - 7);
    ctx.lineTo(W - 14, cy + 7);
    ctx.closePath(); ctx.fill();

    // X軸ラベル「X（よこ）→」
    ctx.fillStyle = "#FF5252";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "right";
    ctx.fillText("X（よこ）→", W - 16, cy - 6);
    ctx.textAlign = "left";

    // X軸の目盛りラベル（practiceのみ）
    if (state.showCoordLabels) {
      for (let lx = -200; lx <= 200; lx += 100) {
        if (lx === 0) continue; // 原点は別途表示
        const px = this.toCanvasX(lx);
        ctx.fillStyle = "rgba(255,82,82,0.9)";
        ctx.fillRect(px - 16, cy + 5, 32, 15);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(lx), px, cy + 17);
      }
    }

    // ── Y軸（青・太め）＋ラベル ──────────────────────────────────────────
    // Y軸 = 縦方向の線（X=0の位置）
    ctx.strokeStyle = "#42A5F5";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, H); ctx.lineTo(cx, 0); ctx.stroke();

    // Y軸矢印（上端）
    ctx.fillStyle = "#42A5F5";
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx - 7, 16);
    ctx.lineTo(cx + 7, 16);
    ctx.closePath(); ctx.fill();

    // Y軸ラベル「↑ Y（たて）」
    ctx.fillStyle = "#42A5F5";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText("↑ Y（たて）", cx + 6, 20);

    // Y軸の目盛りラベル（practiceのみ）
    if (state.showCoordLabels) {
      for (let ly = -200; ly <= 200; ly += 100) {
        if (ly === 0) continue;
        const py = this.toCanvasY(ly);
        ctx.fillStyle = "rgba(66,165,245,0.9)";
        ctx.fillRect(cx + 5, py - 8, 32, 15);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "left";
        ctx.fillText(String(ly), cx + 7, py + 4);
      }
    }

    // ── 原点(0,0)マーカー ──────────────────────────────────────────
    // 白い丸
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // (0,0) ラベル
    if (state.showCoordLabels) {
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(cx + 8, cy - 16, 38, 14);
      ctx.fillStyle = "#FFD600";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText("(0,0)", cx + 10, cy - 4);
    }

    // ── タイマー ──────────────────────────────────────────
    if (state.timeLeft > 0) {
      const tc = state.timeLeft <= 1 ? "#F44336" : state.timeLeft <= 3 ? "#FF9800" : "#FFD600";
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(W - 110, 10, 100, 38);
      ctx.strokeStyle = tc; ctx.lineWidth = 2;
      ctx.strokeRect(W - 110, 10, 100, 38);
      ctx.fillStyle = tc;
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`⏰${state.timeLeft.toFixed(1)}`, W - 60, 38);
      ctx.textAlign = "left";
    }

    // ── コイン ──────────────────────────────────────────
    const coinImg = this.sprites.get(`coin${(this.coinFrame % 4) + 1}`);
    const coinSize = Math.round(W * 0.055);
    for (const coin of state.coins) {
      if (coin.collected) continue;
      const px = this.toCanvasX(coin.x), py = this.toCanvasY(coin.y);
      if (coinImg) {
        ctx.drawImage(coinImg, px - coinSize/2, py - coinSize/2, coinSize, coinSize);
      } else {
        ctx.fillStyle = "#FFD600";
        ctx.beginPath(); ctx.arc(px, py, coinSize/2, 0, Math.PI * 2); ctx.fill();
      }
      // 座標ラベル（X赤・Y青）
      if (state.showCoordLabels) {
        const lw = 54, lh = 14;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(px - lw/2, py + coinSize/2 + 2, lw, lh);
        // X部分（赤）
        ctx.fillStyle = "#FF5252";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`X:${coin.x}`, px - lw/2 + 2, py + coinSize/2 + 13);
        // Y部分（青）
        ctx.fillStyle = "#42A5F5";
        ctx.textAlign = "right";
        ctx.fillText(`Y:${coin.y}`, px + lw/2 - 2, py + coinSize/2 + 13);
        ctx.textAlign = "left";
      }
    }

    // ── 攻撃ポイント ──────────────────────────────────────────
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    const rScale = W / 400;
    for (const ap of state.attackPoints) {
      if (ap.hit) continue;
      const px = this.toCanvasX(ap.x), py = this.toCanvasY(ap.y);
      const r = ap.radius * rScale;
      ctx.strokeStyle = `rgba(255,200,0,${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(255,220,50,${0.1 + 0.08 * pulse})`;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFD600";
      ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
      ctx.fillText(`⚔${ap.id}`, px, py + 5);
      if (state.showCoordLabels) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(px - 27, py + r + 2, 54, 14);
        ctx.fillStyle = "#FF5252"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillText(`X:${ap.x}`, px - 25, py + r + 13);
        ctx.fillStyle = "#42A5F5"; ctx.textAlign = "right";
        ctx.fillText(`Y:${ap.y}`, px + 25, py + r + 13);
      }
      ctx.textAlign = "left";
    }

    // ── 敵 ──────────────────────────────────────────
    if (state.enemyHP > 0 && state.enemyX > -9000) {
      const ex = this.toCanvasX(state.enemyX), ey = this.toCanvasY(state.enemyY);
      const eSize = Math.round(W * 0.1);
      const key = state.enemyMaxHP <= 3 ? "slime" : "orc";
      const img = this.sprites.get(key);
      if (img) {
        ctx.drawImage(img, ex - eSize/2, ey - eSize/2, eSize, eSize);
      } else {
        ctx.fillStyle = "#42a5f5";
        ctx.beginPath(); ctx.arc(ex, ey, eSize/2, 0, Math.PI * 2); ctx.fill();
      }
      const bw = eSize * 1.2, bh = 8;
      ctx.fillStyle = "#555"; ctx.fillRect(ex - bw/2, ey - eSize/2 - 14, bw, bh);
      const hpR = Math.max(0, state.enemyHP / state.enemyMaxHP);
      ctx.fillStyle = hpR > 0.5 ? "#4CAF50" : hpR > 0.25 ? "#FFD600" : "#F44336";
      ctx.fillRect(ex - bw/2, ey - eSize/2 - 14, bw * hpR, bh);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
      ctx.strokeRect(ex - bw/2, ey - eSize/2 - 14, bw, bh);
      ctx.fillStyle = "white"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
      ctx.fillText(`HP ${state.enemyHP}/${state.enemyMaxHP}`, ex, ey - eSize/2 - 17);
      ctx.textAlign = "left";
    }

    // ── 爆発 ──────────────────────────────────────────
    if (state.showExplosion) {
      const ex = this.toCanvasX(state.explosionX), ey = this.toCanvasY(state.explosionY);
      const img = this.sprites.get(`exp${Math.min(state.explosionFrame + 1, 4)}`);
      if (img) ctx.drawImage(img, ex - 56, ey - 56, 112, 112);
    }

    // ── プレイヤー（最前面） ──────────────────────────────────────────
    const px = this.toCanvasX(state.playerX);
    const py = this.toCanvasY(state.playerY);
    const pSize = Math.max(52, Math.round(W * 0.08));
    const pImg = this.sprites.get("player");
    if (pImg && pImg.complete && pImg.naturalWidth > 0) {
      ctx.drawImage(pImg, px - pSize/2, py - pSize * 0.65, pSize, pSize);
    } else {
      ctx.fillStyle = "#1565C0"; ctx.strokeStyle = "#FFD600"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, pSize/2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "white"; ctx.font = `bold ${Math.round(pSize*0.3)}px Arial`;
      ctx.textAlign = "center"; ctx.fillText("勇", px, py + Math.round(pSize*0.12));
    }

    // プレイヤー座標ラベル（X赤・Y青）
    if (state.showCoordLabels) {
      const lw = 80, lh = 14;
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(px - lw/2, py + pSize * 0.38, lw, lh);
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

    // ── GAME OVER ──────────────────────────────────────────
    if (state.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#F44336";
      ctx.font = `bold ${Math.round(W * 0.08)}px Arial`;
      ctx.textAlign = "center"; ctx.fillText("GAME OVER", W/2, H/2 - 20);
      ctx.fillStyle = "white"; ctx.font = `${Math.round(W * 0.032)}px Arial`;
      ctx.fillText("「まつ」のじかんをへらしてみよう！", W/2, H/2 + 32);
      ctx.textAlign = "left";
    }

    // ── クリア ──────────────────────────────────────────
    if (state.gameWon) {
      ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#FFD600";
      ctx.font = `bold ${Math.round(W * 0.07)}px Arial`;
      ctx.textAlign = "center"; ctx.fillText("🎉 クリア！", W/2, H/2 - 20);
      ctx.fillStyle = "white"; ctx.font = `${Math.round(W * 0.03)}px Arial`;
      ctx.fillText("おめでとう！", W/2, H/2 + 36);
      ctx.textAlign = "left";
    }

    // コインアニメ更新
    this.coinFrameTimer++;
    if (this.coinFrameTimer >= 8) { this.coinFrame++; this.coinFrameTimer = 0; }
  }

  async movePlayer(lx: number, ly: number): Promise<void> {
    lx = Math.max(-200, Math.min(200, lx));
    ly = Math.max(-200, Math.min(200, ly));
    const STEPS = 25;
    const sx = this.state.playerX, sy = this.state.playerY;
    for (let i = 1; i <= STEPS; i++) {
      this.state.playerX = sx + (lx - sx) * (i / STEPS);
      this.state.playerY = sy + (ly - sy) * (i / STEPS);
      this.draw();
      await new Promise<void>(r => setTimeout(r, 16));
    }
    this.state.playerX = lx; this.state.playerY = ly;
    this.draw();
  }

  checkCoinCollection(): number {
    let n = 0;
    for (const c of this.state.coins) {
      if (c.collected) continue;
      if (Math.hypot(this.state.playerX - c.x, this.state.playerY - c.y) < 32) {
        c.collected = true; n++;
      }
    }
    return n;
  }

  checkAttackPoints(): number {
    let n = 0;
    for (const ap of this.state.attackPoints) {
      if (ap.hit) continue;
      if (Math.hypot(this.state.playerX - ap.x, this.state.playerY - ap.y) < ap.radius) {
        ap.hit = true; n++;
        this.state.enemyHP = Math.max(0, this.state.enemyHP - 1);
        this.state.damageEffects.push({
          x: 0, y: this.toCanvasY(this.state.enemyY) - 50, text: "-1 💥", alpha: 1,
        });
      }
    }
    return n;
  }

  tickDamageEffects(): void {
    this.state.damageEffects = this.state.damageEffects
      .map(e => ({ ...e, y: e.y - 1.5, alpha: e.alpha - 0.025 }))
      .filter(e => e.alpha > 0);
  }

  async showExplosionAnim(lx: number, ly: number): Promise<void> {
    this.state.showExplosion = true;
    this.state.explosionX = lx; this.state.explosionY = ly;
    for (let f = 0; f < 4; f++) {
      this.state.explosionFrame = f; this.draw();
      await new Promise<void>(r => setTimeout(r, 120));
    }
    this.state.showExplosion = false; this.draw();
  }

  async wait(ms: number): Promise<void> {
    await new Promise<void>(r => setTimeout(r, ms));
  }
}