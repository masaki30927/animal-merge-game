(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const nextCanvas = document.getElementById("nextCanvas");
  const nextCtx = nextCanvas.getContext("2d");
  const gameColumn = document.querySelector(".game-column");
  const scoreValue = document.getElementById("scoreValue");
  const restartButton = document.getElementById("restartButton");
  const overlay = document.getElementById("overlay");
  const overlayRestartButton = document.getElementById("overlayRestartButton");
  const boardBackground = new Image();
  const ballAtlas = new Image();
  boardBackground.src = "assets/space-board.png";
  ballAtlas.src = "assets/planet-balls.png";
  const SCALE = canvas.height / 720;

  const GAME = {
    width: canvas.width,
    height: canvas.height,
    innerLeft: canvas.width * 0.193,
    innerRight: canvas.width * 0.807,
    floorY: canvas.height * 0.896,
    spawnY: canvas.height * 0.118,
    warningLineY: canvas.height * 0.147,
    gravity: 0.26 * SCALE,
    airDrag: 0.9985,
    wallBounce: 0.04,
    floorBounce: 0.2,
    collisionBounce: 0.14,
    settleFriction: 0.992,
    mergeImpulse: -2.2 * SCALE,
    mergeEffectMs: 360,
    scorePopupMs: 760,
    keyboardAimStep: 18 * SCALE,
    keyboardAimSpeed: 0.42 * SCALE,
    spawnCooldownMs: 480,
    gameOverMs: 1600,
    fixedDt: 1000 / 60,
    substeps: 2,
    solverPasses: 6
  };

  const PIECES = [
    {
      name: "A",
      radius: 16.5 * SCALE,
      score: 1,
      base: "#b8c2d1",
      rim: "#8a96a8",
      glow: "rgba(198, 210, 225, 0.55)",
      spots: ["#dbe2ec", "#97a1b2"],
      sprite: { x: 18, y: 482, w: 332, h: 332, fit: 1.28, cx: 0.53, cy: 0.53 }
    },
    {
      name: "B",
      radius: 24 * SCALE,
      score: 3,
      base: "#e4a960",
      rim: "#b6752c",
      glow: "rgba(246, 198, 120, 0.48)",
      spots: ["#f4d09d", "#bf7c35"],
      sprite: { x: 376, y: 462, w: 386, h: 386, fit: 1.26, cx: 0.52, cy: 0.53 }
    },
    {
      name: "C",
      radius: 30.5 * SCALE,
      score: 6,
      base: "#f2c754",
      rim: "#d59a19",
      glow: "rgba(255, 219, 110, 0.52)",
      spots: ["#ffe7a8", "#c89218"],
      sprite: { x: 1198, y: 28, w: 322, h: 322, fit: 1.24, cx: 0.5, cy: 0.5 }
    },
    {
      name: "D",
      radius: 34.5 * SCALE,
      score: 10,
      base: "#8fd05a",
      rim: "#5e9828",
      glow: "rgba(165, 232, 121, 0.48)",
      spots: ["#c9f0a2", "#679d34"],
      sprite: { x: 76, y: 8, w: 472, h: 472, fit: 1.18, cx: 0.51, cy: 0.49 }
    },
    {
      name: "E",
      radius: 44.5 * SCALE,
      score: 15,
      base: "#49b6b7",
      rim: "#227f86",
      glow: "rgba(105, 220, 220, 0.46)",
      spots: ["#baf3f0", "#2f8f97"],
      sprite: { x: 702, y: 8, w: 484, h: 484, fit: 1.18, cx: 0.5, cy: 0.5 }
    },
    {
      name: "F",
      radius: 57 * SCALE,
      score: 21,
      base: "#5d82df",
      rim: "#2f4da6",
      glow: "rgba(128, 163, 255, 0.46)",
      spots: ["#cfe0ff", "#3e5db6"],
      ring: "#dbcda2",
      sprite: { x: 744, y: 432, w: 520, h: 472, fit: 1.3, cx: 0.48, cy: 0.5 }
    },
    {
      name: "G",
      radius: 64.5 * SCALE,
      score: 28,
      base: "#aa84f0",
      rim: "#7852ca",
      glow: "rgba(195, 164, 255, 0.44)",
      spots: ["#ead8ff", "#875fd7"],
      ring: "#f2bfd7",
      sprite: { x: 1216, y: 470, w: 320, h: 320, fit: 1.28, cx: 0.5, cy: 0.5 }
    }
  ];

  class Game {
    constructor() {
      this.pointerX = GAME.width / 2;
      this.balls = [];
      this.score = 0;
      this.nextId = 1;
      this.lastTimestamp = 0;
      this.accumulator = 0;
      this.lastDropAt = 0;
      this.gameOver = false;
      this.effects = [];
      this.previewType = this.randomSpawnType();
      this.nextType = this.randomSpawnType();
    }

    reset() {
      this.balls = [];
      this.score = 0;
      this.nextId = 1;
      this.accumulator = 0;
      this.lastDropAt = 0;
      this.gameOver = false;
      this.effects = [];
      this.previewType = this.randomSpawnType();
      this.nextType = this.randomSpawnType();
      this.pointerX = GAME.width / 2;
      this.renderHud();
      this.hideOverlay();
    }

    randomSpawnType() {
      return Math.floor(Math.random() * 4);
    }

    clampSpawnX(typeIndex, x) {
      const radius = PIECES[typeIndex].radius;
      return Math.max(GAME.innerLeft + radius, Math.min(GAME.innerRight - radius, x));
    }

    dropCurrentPiece(now) {
      if (this.gameOver || now - this.lastDropAt < GAME.spawnCooldownMs) {
        return;
      }

      const typeIndex = this.previewType;
      const x = this.clampSpawnX(typeIndex, this.pointerX);
      const radius = PIECES[typeIndex].radius;

      this.balls.push({
        id: this.nextId++,
        typeIndex,
        x,
        y: GAME.spawnY,
        vx: 0,
        vy: 0,
        radius,
        mergeLock: false,
        warningTimer: 0
      });

      this.previewType = this.nextType;
      this.nextType = this.randomSpawnType();
      this.lastDropAt = now;
      this.renderHud();
    }

    update(deltaMs) {
      if (this.gameOver) {
        return;
      }

      const stepMs = GAME.fixedDt / GAME.substeps;

      while (this.accumulator >= GAME.fixedDt) {
        for (let i = 0; i < GAME.substeps; i += 1) {
          this.integrate(stepMs);
          this.solveCollisions();
          this.mergeTouchingPairs();
        }

        this.accumulator -= GAME.fixedDt;
      }

      this.updateEffects(deltaMs);
      this.updateWarningState(deltaMs);
    }

    integrate(stepMs) {
      const stepFactor = stepMs / GAME.fixedDt;

      for (const ball of this.balls) {
        ball.vy += GAME.gravity * stepFactor;
        ball.vx *= GAME.airDrag;
        ball.vy *= GAME.airDrag;
        ball.x += ball.vx * stepFactor;
        ball.y += ball.vy * stepFactor;
      }
    }

    solveCollisions() {
      for (let pass = 0; pass < GAME.solverPasses; pass += 1) {
        for (const ball of this.balls) {
          this.solveBounds(ball);
        }

        for (let i = 0; i < this.balls.length; i += 1) {
          for (let j = i + 1; j < this.balls.length; j += 1) {
            this.solveBallPair(this.balls[i], this.balls[j]);
          }
        }
      }
    }

    solveBounds(ball) {
      if (ball.x - ball.radius < GAME.innerLeft) {
        ball.x = GAME.innerLeft + ball.radius;
        ball.vx = Math.abs(ball.vx) * GAME.wallBounce;
      }

      if (ball.x + ball.radius > GAME.innerRight) {
        ball.x = GAME.innerRight - ball.radius;
        ball.vx = -Math.abs(ball.vx) * GAME.wallBounce;
      }

      if (ball.y + ball.radius > GAME.floorY) {
        ball.y = GAME.floorY - ball.radius;
        ball.vy = -Math.abs(ball.vy) * GAME.floorBounce;
        ball.vx *= GAME.settleFriction;
      }
    }

    solveBallPair(a, b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distanceSq = dx * dx + dy * dy;
      const minDistance = a.radius + b.radius;

      if (distanceSq === 0 || distanceSq >= minDistance * minDistance) {
        return;
      }

      const distance = Math.sqrt(distanceSq) || 0.0001;
      const overlap = minDistance - distance;
      const nx = dx / distance;
      const ny = dy / distance;
      const push = overlap * 0.5;

      a.x -= nx * push;
      a.y -= ny * push;
      b.x += nx * push;
      b.y += ny * push;

      const relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

      if (relativeVelocity < 0) {
        const impulse = (-(1 + GAME.collisionBounce) * relativeVelocity) * 0.5;
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
        b.vx += impulse * nx;
        b.vy += impulse * ny;
      }
    }

    mergeTouchingPairs() {
      const merges = [];
      const locked = new Set();
      const mergeTolerance = 1.5;

      for (let i = 0; i < this.balls.length; i += 1) {
        const a = this.balls[i];

        if (locked.has(a.id) || a.mergeLock) {
          continue;
        }

        for (let j = i + 1; j < this.balls.length; j += 1) {
          const b = this.balls[j];

          if (
            locked.has(b.id) ||
            b.mergeLock ||
            a.typeIndex !== b.typeIndex ||
            a.typeIndex >= PIECES.length - 1
          ) {
            continue;
          }

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const minDistance = a.radius + b.radius;
          const mergeDistance = minDistance + mergeTolerance;

          if (dx * dx + dy * dy <= mergeDistance * mergeDistance) {
            merges.push([a, b]);
            locked.add(a.id);
            locked.add(b.id);
            break;
          }
        }
      }

      if (merges.length === 0) {
        return;
      }

      const removedIds = new Set();

      for (const [a, b] of merges) {
        removedIds.add(a.id);
        removedIds.add(b.id);

        const sourcePiece = PIECES[a.typeIndex];
        const nextTypeIndex = a.typeIndex + 1;
        const piece = PIECES[nextTypeIndex];
        const mergeX = (a.x + b.x) * 0.5;
        const mergeY = (a.y + b.y) * 0.5;
        const awardedScore = sourcePiece.score;

        this.balls.push({
          id: this.nextId++,
          typeIndex: nextTypeIndex,
          x: mergeX,
          y: mergeY,
          vx: (a.vx + b.vx) * 0.5,
          vy: Math.min((a.vy + b.vy) * 0.5 + GAME.mergeImpulse, GAME.mergeImpulse),
          radius: piece.radius,
          mergeLock: true,
          warningTimer: 0
        });

        this.score += awardedScore;
        this.effects.push(this.createMergeEffect(mergeX, mergeY, nextTypeIndex, awardedScore));
      }

      this.balls = this.balls.filter((ball) => !removedIds.has(ball.id));

      for (const ball of this.balls) {
        if (ball.mergeLock) {
          ball.mergeLock = false;
        }
      }

      this.renderHud();
    }

    createMergeEffect(x, y, typeIndex, score) {
      const piece = PIECES[typeIndex];
      const particles = Array.from({ length: 10 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 10 + Math.random() * 0.28;
        const speed = piece.radius * (0.045 + Math.random() * 0.025);
        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - piece.radius * 0.006,
          size: Math.max(3, piece.radius * (0.09 + Math.random() * 0.04))
        };
      });

      return {
        x,
        y,
        typeIndex,
        score,
        age: 0,
        duration: Math.max(GAME.mergeEffectMs, GAME.scorePopupMs),
        startRadius: Math.max(18, piece.radius * 0.38),
        endRadius: piece.radius * 1.24,
        particles
      };
    }

    updateEffects(deltaMs) {
      if (this.effects.length === 0) {
        return;
      }

      this.effects = this.effects
        .map((effect) => {
          const nextAge = effect.age + deltaMs;
          const progress = Math.min(1, nextAge / effect.duration);

          return {
            ...effect,
            age: nextAge,
            particles: effect.particles.map((particle) => ({
              ...particle,
              x: particle.x + particle.vx * (deltaMs / 16.67),
              y: particle.y + particle.vy * (deltaMs / 16.67),
              vy: particle.vy + 0.03 * (deltaMs / 16.67),
              size: particle.size * (1 - progress * 0.045)
            }))
          };
        })
        .filter((effect) => effect.age < effect.duration);
    }

    updateWarningState(deltaMs) {
      let triggeredGameOver = false;

      for (const ball of this.balls) {
        if (ball.y - ball.radius <= GAME.warningLineY) {
          ball.warningTimer += deltaMs;
          if (ball.warningTimer >= GAME.gameOverMs) {
            triggeredGameOver = true;
          }
        } else {
          ball.warningTimer = 0;
        }
      }

      if (triggeredGameOver) {
        this.gameOver = true;
        this.showOverlay();
      }
    }

    renderHud() {
      scoreValue.textContent = String(this.score);
      this.renderNextPiece();
    }

    renderNextPiece() {
      nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
      const piece = PIECES[this.previewType];
      const scale = Math.min(1, 22 / piece.radius);

      this.drawPiece(
        nextCtx,
        nextCanvas.width / 2,
        nextCanvas.height / 2,
        piece.radius * scale,
        piece.color,
        piece.name
      );
    }

    draw(now) {
      ctx.clearRect(0, 0, GAME.width, GAME.height);
      this.drawArena();
      this.drawGuide(now);

      const sortedBalls = [...this.balls].sort((a, b) => a.radius - b.radius);
      for (const ball of sortedBalls) {
        const piece = PIECES[ball.typeIndex];
        this.drawPiece(ctx, ball.x, ball.y, ball.radius, piece.color, piece.name);
      }

      this.drawEffects();
    }

    drawArena() {
      ctx.save();

      if (boardBackground.complete && boardBackground.naturalWidth > 0) {
        ctx.drawImage(boardBackground, 0, 0, GAME.width, GAME.height);
        ctx.restore();
        return;
      }

      const fieldGradient = ctx.createLinearGradient(0, 0, 0, GAME.floorY);
      fieldGradient.addColorStop(0, "rgba(255, 250, 234, 0.5)");
      fieldGradient.addColorStop(1, "rgba(255, 212, 138, 0.16)");
      ctx.fillStyle = fieldGradient;
      ctx.fillRect(GAME.innerLeft, 0, GAME.innerRight - GAME.innerLeft, GAME.floorY);

      const stars = [
        [88, 76, 2.2],
        [136, 120, 1.5],
        [286, 88, 2.1],
        [332, 164, 1.6],
        [198, 222, 1.3],
        [250, 286, 1.8]
      ];
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      for (const [x, y, radius] of stars) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(94, 44, 18, 0.16)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(GAME.innerLeft, 16);
      ctx.lineTo(GAME.innerLeft, GAME.floorY);
      ctx.lineTo(GAME.innerRight, GAME.floorY);
      ctx.lineTo(GAME.innerRight, 16);
      ctx.stroke();

      ctx.strokeStyle = "rgba(216, 48, 48, 0.65)";
      ctx.lineWidth = 2;
      ctx.setLineDash([9, 7]);
      ctx.beginPath();
      ctx.moveTo(GAME.innerLeft + 8, GAME.warningLineY);
      ctx.lineTo(GAME.innerRight - 8, GAME.warningLineY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    drawGuide(now) {
      const x = this.clampSpawnX(this.previewType, this.pointerX);
      const piece = PIECES[this.previewType];
      const pulse = 0.85 + Math.sin(now * 0.006) * 0.08;

      ctx.save();
      ctx.strokeStyle = "rgba(113, 64, 24, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(x, GAME.height * 0.08);
      ctx.lineTo(x, GAME.floorY - GAME.height * 0.028);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = this.gameOver ? 0.35 : 0.55;
      this.drawPiece(ctx, x, GAME.spawnY, piece.radius * pulse, piece.color, piece.name);
      ctx.restore();
    }

    drawPiece(targetCtx, x, y, radius, color, label) {
      const piece = PIECES.find((entry) => entry.name === label);

      if (!piece) {
        return;
      }

      targetCtx.save();

      if (ballAtlas.complete && ballAtlas.naturalWidth > 0) {
        const destSize = radius * 2 * (piece.sprite.fit || 1);
        const centerX = piece.sprite.cx ?? 0.5;
        const centerY = piece.sprite.cy ?? 0.5;
        const destX = x - destSize * centerX;
        const destY = y - destSize * centerY;

        targetCtx.shadowColor = piece.glow;
        targetCtx.shadowBlur = Math.max(8, radius * 0.28);
        targetCtx.beginPath();
        targetCtx.arc(x, y, radius, 0, Math.PI * 2);
        targetCtx.clip();
        targetCtx.drawImage(
          ballAtlas,
          piece.sprite.x,
          piece.sprite.y,
          piece.sprite.w,
          piece.sprite.h,
          destX,
          destY,
          destSize,
          destSize
        );
        targetCtx.restore();
        targetCtx.save();
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        targetCtx.lineWidth = Math.max(1.5, radius * 0.05);
        targetCtx.beginPath();
        targetCtx.arc(x, y, radius - targetCtx.lineWidth * 0.5, 0, Math.PI * 2);
        targetCtx.stroke();
      } else {
        targetCtx.shadowColor = piece.glow;
        targetCtx.shadowBlur = Math.max(10, radius * 0.45);
        const gradient = targetCtx.createRadialGradient(
          x - radius * 0.35,
          y - radius * 0.45,
          radius * 0.18,
          x,
          y,
          radius
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(0.22, piece.base);
        gradient.addColorStop(1, this.shadeColor(piece.rim, -12));
        targetCtx.fillStyle = gradient;
        targetCtx.beginPath();
        targetCtx.arc(x, y, radius, 0, Math.PI * 2);
        targetCtx.fill();
      }

      targetCtx.fillStyle = "rgba(66, 33, 11, 0.82)";
      targetCtx.strokeStyle = "rgba(255, 248, 230, 0.9)";
      targetCtx.lineWidth = Math.max(2, radius * 0.08);
      targetCtx.font = `${Math.max(13, radius * 0.62)}px Georgia`;
      targetCtx.textAlign = "center";
      targetCtx.textBaseline = "middle";
      targetCtx.strokeText(label, x, y + 1);
      targetCtx.fillText(label, x, y + 1);

      targetCtx.restore();
    }

    drawEffects() {
      for (const effect of this.effects) {
        const piece = PIECES[effect.typeIndex];
        const progress = effect.age / effect.duration;
        const eased = 1 - Math.pow(1 - progress, 3);
        const ringRadius = effect.startRadius + (effect.endRadius - effect.startRadius) * eased;
        const alpha = 1 - progress;
        const scoreY = effect.y - piece.radius * (0.7 + progress * 0.85);

        ctx.save();
        ctx.globalAlpha = alpha * 0.75;
        ctx.strokeStyle = piece.glow;
        ctx.lineWidth = Math.max(3, piece.radius * 0.08);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = alpha * 0.28;
        ctx.fillStyle = piece.base;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, ringRadius * 0.72, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        for (const particle of effect.particles) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, Math.max(1.2, particle.size * (1 - progress)), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = alpha * 0.95;
        ctx.fillStyle = "rgba(66, 33, 11, 0.82)";
        ctx.font = `${Math.max(16, piece.radius * 0.34)}px Georgia`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(piece.name, effect.x, effect.y - piece.radius * 0.08);

        ctx.globalAlpha = Math.max(0, alpha * 0.98);
        ctx.fillStyle = "rgba(255, 248, 230, 0.98)";
        ctx.strokeStyle = "rgba(91, 52, 18, 0.35)";
        ctx.lineWidth = 4;
        ctx.font = `700 ${Math.max(16, piece.radius * 0.3)}px "Trebuchet MS"`;
        ctx.strokeText(`+${effect.score}`, effect.x, scoreY);
        ctx.fillText(`+${effect.score}`, effect.x, scoreY);
        ctx.restore();
      }
    }

    shadeColor(hex, amount) {
      const value = hex.replace("#", "");
      const num = parseInt(value, 16);
      const clamp = (input) => Math.max(0, Math.min(255, input));
      const r = clamp((num >> 16) + amount);
      const g = clamp(((num >> 8) & 0x00ff) + amount);
      const b = clamp((num & 0x0000ff) + amount);
      return `rgb(${r}, ${g}, ${b})`;
    }

    showOverlay() {
      overlay.classList.remove("overlay--hidden");
    }

    hideOverlay() {
      overlay.classList.add("overlay--hidden");
    }
  }

  const game = new Game();
  const keyState = {
    left: false,
    right: false
  };
  game.renderHud();

  function updatePointer(clientX) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * GAME.width;
    game.pointerX = Math.max(GAME.innerLeft, Math.min(GAME.innerRight, x));
  }

  function updateKeyboardAim(deltaMs) {
    const direction = (keyState.right ? 1 : 0) - (keyState.left ? 1 : 0);

    if (direction === 0) {
      return;
    }

    const distance = GAME.keyboardAimSpeed * deltaMs;
    game.pointerX = Math.max(
      GAME.innerLeft,
      Math.min(GAME.innerRight, game.pointerX + direction * distance)
    );
  }

  function handleAimAndDrop(event) {
    if (event.target.closest("button")) {
      return;
    }

    updatePointer(event.clientX);
    game.dropCurrentPiece(performance.now());
  }

  function loop(timestamp) {
    if (!game.lastTimestamp) {
      game.lastTimestamp = timestamp;
    }

    const delta = Math.min(32, timestamp - game.lastTimestamp);
    game.lastTimestamp = timestamp;
    updateKeyboardAim(delta);
    game.accumulator += delta;
    game.update(delta);
    game.draw(timestamp);
    window.requestAnimationFrame(loop);
  }

  gameColumn.addEventListener("mousemove", (event) => {
    updatePointer(event.clientX);
  });

  gameColumn.addEventListener("click", handleAimAndDrop);

  restartButton.addEventListener("click", () => {
    game.reset();
  });

  overlayRestartButton.addEventListener("click", () => {
    game.reset();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft") {
      event.preventDefault();
      keyState.left = true;
      game.pointerX = Math.max(GAME.innerLeft, game.pointerX - GAME.keyboardAimStep);
      return;
    }

    if (event.code === "ArrowRight") {
      event.preventDefault();
      keyState.right = true;
      game.pointerX = Math.min(GAME.innerRight, game.pointerX + GAME.keyboardAimStep);
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      game.dropCurrentPiece(performance.now());
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft") {
      keyState.left = false;
      return;
    }

    if (event.code === "ArrowRight") {
      keyState.right = false;
    }
  });

  window.addEventListener("blur", () => {
    keyState.left = false;
    keyState.right = false;
  });

  window.addEventListener("resize", () => {
    game.draw(performance.now());
  });

  boardBackground.addEventListener("load", () => {
    game.draw(performance.now());
  });

  ballAtlas.addEventListener("load", () => {
    game.renderHud();
    game.draw(performance.now());
  });

  game.reset();
  window.requestAnimationFrame(loop);
})();
