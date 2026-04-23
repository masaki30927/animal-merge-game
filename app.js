(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const nextCanvas = document.getElementById("nextCanvas");
  const nextCtx = nextCanvas.getContext("2d");
  const evolutionCanvas = document.getElementById("evolutionCanvas");
  const evolutionCtx = evolutionCanvas.getContext("2d");
  const gameColumn = document.querySelector(".game-column");
  const scoreValue = document.getElementById("scoreValue");
  const rankingScoreValue = document.getElementById("rankingScoreValue");
  const bestScoreLabel = document.querySelector(".best-score");
  const leaderboardList = document.getElementById("leaderboardList");
  const playerForm = document.getElementById("playerForm");
  const playerNameInput = document.getElementById("playerNameInput");
  const playerRankValue = document.getElementById("playerRankValue");
  const restartButton = document.getElementById("restartButton");
  const overlay = document.getElementById("overlay");
  const overlayRestartButton = document.getElementById("overlayRestartButton");
  const SCALE = canvas.height / 620;
  const STORAGE_KEYS = {
    bestScore: "animal-merge-best",
    player: "animal-merge-player",
    leaderboard: "animal-merge-leaderboard"
  };
  const DEFAULT_LEADERBOARD = [
    { id: "seed-mika", name: "Mika", score: 8200 },
    { id: "seed-ren", name: "Ren", score: 6450 },
    { id: "seed-sora", name: "Sora", score: 5120 },
    { id: "seed-yui", name: "Yui", score: 3860 }
  ];

  const GAME = {
    width: canvas.width,
    height: canvas.height,
    innerLeft: canvas.width * 0.06,
    innerRight: canvas.width * 0.94,
    topY: canvas.height * 0.12,
    floorY: canvas.height * 0.94,
    spawnY: canvas.height * 0.18,
    warningLineY: canvas.height * 0.28,
    gravity: 0.26 * SCALE,
    airDrag: 0.9985,
    wallBounce: 0.04,
    floorBounce: 0.08,
    collisionBounce: 0.035,
    settleFriction: 0.986,
    angularDrag: 0.992,
    squishRecovery: 0.86,
    mergeImpulse: -2.2 * SCALE,
    mergeEffectMs: 360,
    scorePopupMs: 760,
    dangerLineGrace: 8 * SCALE,
    keyboardAimStep: 18 * SCALE,
    keyboardAimSpeed: 0.42 * SCALE,
    spawnCooldownMs: 480,
    gameOverMs: 1600,
    fixedDt: 1000 / 60,
    substeps: 2,
    solverPasses: 6
  };

  const MERGE_SCORES = [50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750];
  const PIECES = [
    {
      name: "rabbit",
      radius: 16.5 * SCALE,
      score: 50,
      base: "#f7c6d1",
      rim: "#df8fa1",
      belly: "#fff4ef",
      blush: "#ef7f96",
      accent: "#6bbf5f",
      detail: "#ee812f",
      ears: "bunny",
      face: "happy",
      pattern: "toeBeans",
      accessory: "carrot"
    },
    {
      name: "cat",
      radius: 23.5 * SCALE,
      score: 150,
      base: "#f6bf45",
      rim: "#d8942e",
      belly: "#fff0bd",
      blush: "#f39a80",
      accent: "#a45d22",
      detail: "#6a452c",
      ears: "cat",
      face: "small",
      pattern: "catStripes",
      accessory: "whiskers"
    },
    {
      name: "dog",
      radius: 30 * SCALE,
      score: 300,
      base: "#e7b36d",
      rim: "#a66835",
      belly: "#fff0c9",
      blush: "#ee987c",
      accent: "#c73f37",
      detail: "#70401f",
      ears: "dog",
      face: "happy",
      pattern: "paw",
      accessory: "bandana"
    },
    {
      name: "penguin",
      radius: 37 * SCALE,
      score: 500,
      base: "#71c996",
      rim: "#4f9f78",
      belly: "#fff7db",
      blush: "#f3a59b",
      accent: "#2ab4c7",
      detail: "#e8ad10",
      ears: "none",
      face: "small",
      pattern: "penguinMask",
      accessory: "blueBow"
    },
    {
      name: "elephant",
      radius: 46 * SCALE,
      score: 750,
      base: "#a9d2e8",
      rim: "#78abc9",
      belly: "#dff4ff",
      blush: "#f2a3aa",
      accent: "#f6a8b6",
      detail: "#7ba7c6",
      ears: "elephant",
      face: "happy",
      pattern: "toes",
      accessory: "trunk"
    },
    {
      name: "panda",
      radius: 56 * SCALE,
      score: 1050,
      base: "#fff8ef",
      rim: "#7855a3",
      belly: "#fffdf6",
      blush: "#ef9da2",
      accent: "#7650a5",
      detail: "#67b64f",
      ears: "panda",
      face: "small",
      pattern: "pandaPatch",
      accessory: "bamboo"
    },
    {
      name: "otter",
      radius: 66 * SCALE,
      score: 1400,
      base: "#b87836",
      rim: "#8a5428",
      belly: "#fff0d6",
      blush: "#eda07e",
      accent: "#f6ccb4",
      detail: "#6e4529",
      ears: "floppy",
      face: "happy",
      pattern: "shell",
      accessory: "shell"
    },
    {
      name: "hedgehog",
      radius: 78 * SCALE,
      score: 1800,
      base: "#fff0d0",
      rim: "#9b6b42",
      belly: "#fff8df",
      blush: "#eca18d",
      accent: "#9b6b42",
      detail: "#d9362e",
      ears: "hedgehog",
      face: "happy",
      pattern: "spines",
      accessory: "apple"
    },
    {
      name: "fox",
      radius: 91 * SCALE,
      score: 2250,
      base: "#f28b36",
      rim: "#c76325",
      belly: "#fff1d9",
      blush: "#ef8c70",
      accent: "#76aa45",
      detail: "#744328",
      ears: "fox",
      face: "happy",
      pattern: "foxMask",
      accessory: "greenScarf"
    },
    {
      name: "koala",
      radius: 106 * SCALE,
      score: 2750,
      base: "#cdd0d4",
      rim: "#9fa5ad",
      belly: "#eef0f1",
      blush: "#efa2a5",
      accent: "#6fb557",
      detail: "#59616b",
      ears: "koala",
      face: "small",
      pattern: "koalaNose",
      accessory: "eucalyptus"
    },
    {
      name: "lion",
      radius: 122 * SCALE,
      score: 3300,
      base: "#f5cf52",
      rim: "#91591f",
      belly: "#fff2b8",
      blush: "#eda468",
      accent: "#d24134",
      detail: "#f4c93d",
      ears: "lion",
      face: "happy",
      pattern: "mane",
      accessory: "crown"
    }
  ];

  class Game {
    constructor() {
      this.pointerX = GAME.width / 2;
      this.balls = [];
      this.score = 0;
      this.player = this.readPlayer();
      this.leaderboard = this.readLeaderboard();
      this.bestScore = this.readBestScore();
      this.bestScore = Math.max(this.bestScore, this.getPlayerBestScore());
      this.savePlayerScore(this.bestScore);
      this.scorePulse = 0;
      this.bestPulse = 0;
      this.nextId = 1;
      this.lastTimestamp = 0;
      this.accumulator = 0;
      this.lastDropAt = 0;
      this.gameOver = false;
      this.effects = [];
      this.shakePower = 0;
      this.mergeFlash = 0;
      this.previewType = this.randomSpawnType();
      this.nextType = this.randomSpawnType();
    }

    reset() {
      this.balls = [];
      this.score = 0;
      this.scorePulse = 0;
      this.bestPulse = 0;
      this.nextId = 1;
      this.accumulator = 0;
      this.lastDropAt = 0;
      this.gameOver = false;
      this.effects = [];
      this.shakePower = 0;
      this.mergeFlash = 0;
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

    getSpawnY(typeIndex) {
      const radius = PIECES[typeIndex].radius;
      return Math.max(radius + 8 * SCALE, GAME.warningLineY - radius - 5 * SCALE);
    }

    dropCurrentPiece(now) {
      if (this.gameOver || now - this.lastDropAt < GAME.spawnCooldownMs) {
        return;
      }

      const typeIndex = this.previewType;
      const x = this.clampSpawnX(typeIndex, this.pointerX);
      const radius = PIECES[typeIndex].radius;
      const y = this.getSpawnY(typeIndex);

      this.balls.push({
        id: this.nextId++,
        typeIndex,
        x,
        y,
        vx: 0,
        vy: 0,
        radius,
        mergeLock: false,
        warningTimer: 0,
        ageMs: 0,
        rotation: 0,
        angularVelocity: 0,
        previousX: x,
        contactCount: 0,
        squish: 0.45,
        hasClearedWarningLine: false
      });

      this.previewType = this.nextType;
      this.nextType = this.randomSpawnType();
      this.lastDropAt = now;
      this.vibrate(4);
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
          this.updateRolling(stepMs);
          this.mergeTouchingPairs();
        }

        this.accumulator -= GAME.fixedDt;
      }

      this.updateEffects(deltaMs);
      this.updateJuice(deltaMs);
      this.updateWarningState(deltaMs);
    }

    integrate(stepMs) {
      const stepFactor = stepMs / GAME.fixedDt;

      for (const ball of this.balls) {
        ball.previousX = ball.x;
        ball.ageMs += stepMs;
        ball.squish = (ball.squish || 0) * GAME.squishRecovery;
        ball.angularVelocity = (ball.angularVelocity || 0) * GAME.angularDrag;
        ball.vy += GAME.gravity * stepFactor;
        ball.vx *= GAME.airDrag;
        ball.vy *= GAME.airDrag;
        ball.x += ball.vx * stepFactor;
        ball.y += ball.vy * stepFactor;
      }
    }

    solveCollisions() {
      for (const ball of this.balls) {
        ball.contactCount = 0;
      }

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
        const impact = Math.min(1, Math.abs(ball.vy) / (5 * SCALE));
        ball.y = GAME.floorY - ball.radius;
        ball.vy = -Math.abs(ball.vy) * GAME.floorBounce;
        ball.vx *= GAME.settleFriction;
        ball.squish = Math.max(ball.squish || 0, impact * 0.58);
        ball.contactCount += 1;
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

      a.contactCount += 1;
      b.contactCount += 1;

      const relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

      if (relativeVelocity < 0) {
        const impulse = (-(1 + GAME.collisionBounce) * relativeVelocity) * 0.24;
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
        b.vx += impulse * nx;
        b.vy += impulse * ny;
        const softness = Math.min(0.42, Math.abs(relativeVelocity) * 0.06);
        a.squish = Math.max(a.squish || 0, softness);
        b.squish = Math.max(b.squish || 0, softness);
      }
    }

    updateRolling(stepMs) {
      for (const ball of this.balls) {
        const deltaX = ball.x - (ball.previousX ?? ball.x);

        if (ball.contactCount > 0) {
          const radius = Math.max(ball.radius, 1);
          const rollAmount = deltaX / radius;
          ball.rotation = (ball.rotation || 0) + rollAmount;
          ball.angularVelocity = rollAmount / Math.max(0.0001, stepMs / GAME.fixedDt);
        } else {
          ball.rotation = (ball.rotation || 0) + (ball.angularVelocity || 0) * (stepMs / GAME.fixedDt);
        }

        ball.previousX = ball.x;
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

        const nextTypeIndex = a.typeIndex + 1;
        const piece = PIECES[nextTypeIndex];
        const mergeX = (a.x + b.x) * 0.5;
        const mergeY = (a.y + b.y) * 0.5;
        const awardedScore = this.getMergeScore(a.typeIndex);

        this.balls.push({
          id: this.nextId++,
          typeIndex: nextTypeIndex,
          x: mergeX,
          y: mergeY,
          vx: (a.vx + b.vx) * 0.5,
          vy: Math.min((a.vy + b.vy) * 0.5 + GAME.mergeImpulse, GAME.mergeImpulse),
          radius: piece.radius,
          mergeLock: true,
          warningTimer: 0,
          ageMs: 0,
          rotation: ((a.rotation || 0) + (b.rotation || 0)) * 0.5,
          angularVelocity: ((a.angularVelocity || 0) + (b.angularVelocity || 0)) * 0.5,
          previousX: mergeX,
          contactCount: 0,
          squish: 0.52,
          hasClearedWarningLine:
            a.hasClearedWarningLine ||
            b.hasClearedWarningLine ||
            mergeY - piece.radius > GAME.warningLineY + GAME.dangerLineGrace
        });

        this.score += awardedScore;
        const isNewBest = this.updateBestScore();
        this.scorePulse = 1;
        this.effects.push(this.createMergeEffect(mergeX, mergeY, nextTypeIndex, awardedScore, isNewBest));
        this.addMergeJuice(piece.radius);
        this.vibrate(10);
      }

      this.balls = this.balls.filter((ball) => !removedIds.has(ball.id));

      for (const ball of this.balls) {
        if (ball.mergeLock) {
          ball.mergeLock = false;
        }
      }

      this.renderHud();
    }

    getMergeScore(typeIndex) {
      return MERGE_SCORES[typeIndex] ?? 0;
    }

    updateBestScore() {
      if (this.score <= this.bestScore) {
        return false;
      }

      this.bestScore = this.score;
      this.bestPulse = 1;

      try {
        window.localStorage.setItem(STORAGE_KEYS.bestScore, String(this.bestScore));
      } catch (error) {
        // Local storage can be unavailable in private browsing; the run can continue.
      }

      this.savePlayerScore(this.bestScore);
      return true;
    }

    readBestScore() {
      try {
        return Number(window.localStorage.getItem(STORAGE_KEYS.bestScore)) || 0;
      } catch (error) {
        return 0;
      }
    }

    readPlayer() {
      try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.player) || "null");
        if (saved && typeof saved.id === "string" && typeof saved.name === "string") {
          return {
            id: saved.id,
            name: this.normalizePlayerName(saved.name)
          };
        }
      } catch (error) {
        // Fall through to a new local player.
      }

      const player = {
        id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name: "Guest"
      };
      this.writePlayer(player);
      return player;
    }

    writePlayer(player) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.player, JSON.stringify(player));
      } catch (error) {
        // Local profile saving is optional.
      }
    }

    readLeaderboard() {
      try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.leaderboard) || "null");
        if (Array.isArray(saved)) {
          return this.normalizeLeaderboard(saved);
        }
      } catch (error) {
        // Fall through to seed scores.
      }

      return this.normalizeLeaderboard(DEFAULT_LEADERBOARD);
    }

    writeLeaderboard() {
      try {
        window.localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(this.leaderboard));
      } catch (error) {
        // Ranking display can still work for this session.
      }
    }

    normalizeLeaderboard(entries) {
      const byId = new Map();

      for (const entry of entries) {
        if (!entry || typeof entry.id !== "string") {
          continue;
        }

        const score = Math.max(0, Number(entry.score) || 0);
        const name = this.normalizePlayerName(entry.name);
        const previous = byId.get(entry.id);

        if (!previous || score > previous.score) {
          byId.set(entry.id, { id: entry.id, name, score });
        }
      }

      return [...byId.values()]
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 50);
    }

    normalizePlayerName(value) {
      const normalized = String(value || "Guest").replace(/\s+/g, " ").trim().slice(0, 12);
      return normalized || "Guest";
    }

    getPlayerBestScore() {
      const entry = this.leaderboard.find((item) => item.id === this.player.id);
      return entry ? entry.score : 0;
    }

    savePlayerScore(score) {
      const nextScore = Math.max(score, this.getPlayerBestScore());
      const withoutPlayer = this.leaderboard.filter((entry) => entry.id !== this.player.id);
      this.leaderboard = this.normalizeLeaderboard([
        ...withoutPlayer,
        {
          id: this.player.id,
          name: this.player.name,
          score: nextScore
        }
      ]);
      this.writeLeaderboard();
    }

    setPlayerName(name) {
      this.player.name = this.normalizePlayerName(name);
      this.writePlayer(this.player);
      this.savePlayerScore(this.bestScore);
      this.renderHud();
    }

    createMergeEffect(x, y, typeIndex, score, isNewBest = false) {
      const piece = PIECES[typeIndex];
      const colors = [piece.base, piece.belly, piece.blush, "#fff7d6"];
      const particleCount = 16;
      const particles = Array.from({ length: particleCount }, (_, index) => {
        const angle = (Math.PI * 2 * index) / particleCount + Math.random() * 0.22;
        const speed = piece.radius * (0.045 + Math.random() * 0.025);
        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - piece.radius * 0.006,
          size: Math.max(3, piece.radius * (0.08 + Math.random() * 0.045)),
          color: colors[index % colors.length],
          shape: index % 5 === 0 ? "heart" : index % 3 === 0 ? "star" : "puff"
        };
      });

      return {
        x,
        y,
        typeIndex,
        score,
        isNewBest,
        age: 0,
        duration: Math.max(GAME.mergeEffectMs, GAME.scorePopupMs),
        startRadius: Math.max(18, piece.radius * 0.38),
        endRadius: piece.radius * 1.24,
        particles
      };
    }

    addMergeJuice(radius) {
      this.shakePower = Math.min(7 * SCALE, this.shakePower + Math.max(1.2 * SCALE, radius * 0.035));
      this.mergeFlash = Math.min(1, this.mergeFlash + 0.45);
    }

    updateJuice(deltaMs) {
      this.shakePower = Math.max(0, this.shakePower - deltaMs * 0.018 * SCALE);
      this.mergeFlash = Math.max(0, this.mergeFlash - deltaMs / 220);
      this.scorePulse = Math.max(0, this.scorePulse - deltaMs / 260);
      this.bestPulse = Math.max(0, this.bestPulse - deltaMs / 560);
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
        if (ball.y - ball.radius > GAME.warningLineY + GAME.dangerLineGrace) {
          ball.hasClearedWarningLine = true;
        }

        if (ball.hasClearedWarningLine && ball.y - ball.radius <= GAME.warningLineY) {
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
        this.vibrate([18, 36, 24]);
        this.showOverlay();
      }
    }

    renderHud() {
      scoreValue.textContent = this.formatScore(this.score);
      rankingScoreValue.textContent = this.formatScore(this.score);
      if (bestScoreLabel) {
        bestScoreLabel.textContent = `Best Score ${this.formatScore(this.bestScore)}`;
      }
      this.renderLeaderboard();
      this.renderNextPiece();
      this.renderEvolutionRing();
    }

    renderLeaderboard() {
      if (playerNameInput && document.activeElement !== playerNameInput) {
        playerNameInput.value = this.player.name;
      }

      const ranked = this.normalizeLeaderboard(this.leaderboard);

      if (leaderboardList) {
        leaderboardList.innerHTML = "";

        ranked.slice(0, 3).forEach((entry, index) => {
          const item = document.createElement("li");
          if (entry.id === this.player.id) {
            item.classList.add("ranking-card__mine");
          }

          const rank = document.createElement("span");
          rank.textContent = String(index + 1);

          const name = document.createElement("em");
          name.textContent = entry.name;

          const score = document.createElement("strong");
          score.textContent = this.formatScore(entry.score);

          item.append(rank, name, score);
          leaderboardList.append(item);
        });
      }

      if (playerRankValue) {
        const playerIndex = ranked.findIndex((entry) => entry.id === this.player.id);
        playerRankValue.textContent = playerIndex >= 0 ? `#${playerIndex + 1}` : "--";
      }
    }

    renderNextPiece() {
      nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
      const piece = PIECES[this.previewType];
      const scale = Math.min(1, 32 / piece.radius);

      this.drawPiece(
        nextCtx,
        nextCanvas.width / 2,
        nextCanvas.height / 2,
        piece.radius * scale,
        piece.color,
        piece.name
      );
    }

    renderEvolutionRing() {
      evolutionCtx.clearRect(0, 0, evolutionCanvas.width, evolutionCanvas.height);
      const centerX = evolutionCanvas.width / 2;
      const centerY = evolutionCanvas.height / 2;
      const ringRadius = 58;

      evolutionCtx.save();
      evolutionCtx.globalAlpha = 0.62;
      const ringFill = evolutionCtx.createRadialGradient(centerX - 18, centerY - 20, 6, centerX, centerY, 70);
      ringFill.addColorStop(0, "rgba(255, 255, 246, 0.92)");
      ringFill.addColorStop(0.62, "rgba(255, 235, 204, 0.52)");
      ringFill.addColorStop(1, "rgba(214, 239, 222, 0.24)");
      evolutionCtx.fillStyle = ringFill;
      evolutionCtx.beginPath();
      evolutionCtx.arc(centerX, centerY, 64, 0, Math.PI * 2);
      evolutionCtx.fill();
      evolutionCtx.strokeStyle = "rgba(238, 158, 174, 0.28)";
      evolutionCtx.lineWidth = 7;
      evolutionCtx.beginPath();
      evolutionCtx.arc(centerX, centerY, 54, 0, Math.PI * 2);
      evolutionCtx.stroke();
      evolutionCtx.setLineDash([5, 5]);
      evolutionCtx.strokeStyle = "rgba(130, 189, 154, 0.32)";
      evolutionCtx.lineWidth = 2;
      evolutionCtx.beginPath();
      evolutionCtx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      evolutionCtx.stroke();
      evolutionCtx.setLineDash([]);
      evolutionCtx.restore();

      PIECES.forEach((piece, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / PIECES.length;
        const radius = Math.min(13, Math.max(8, piece.radius * 0.18));
        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;
        this.drawPiece(evolutionCtx, x, y, radius, piece.color, piece.name);
      });
    }

    draw(now) {
      ctx.clearRect(0, 0, GAME.width, GAME.height);
      ctx.save();
      const shake = this.getShakeOffset(now);
      ctx.translate(shake.x, shake.y);
      this.drawArena();
      this.drawDangerWarning(now);
      this.drawGuide(now);

      const sortedBalls = [...this.balls].sort((a, b) => a.radius - b.radius);
      for (const ball of sortedBalls) {
        const piece = PIECES[ball.typeIndex];
        this.drawSquishyPiece(ctx, ball, piece);
      }

      this.drawEffects();
      ctx.restore();
      this.drawRewardHud();
      this.drawMergeFlash();
    }

    getShakeOffset(now) {
      if (this.shakePower <= 0.01) {
        return { x: 0, y: 0 };
      }

      return {
        x: Math.sin(now * 0.079) * this.shakePower,
        y: Math.cos(now * 0.063) * this.shakePower * 0.65
      };
    }

    drawArena() {
      ctx.save();

      const boxWidth = GAME.innerRight - GAME.innerLeft;
      const boxHeight = GAME.floorY - GAME.topY;
      const radius = 24 * SCALE;

      ctx.shadowColor = "rgba(98, 78, 62, 0.18)";
      ctx.shadowBlur = 18 * SCALE;
      ctx.shadowOffsetY = 5 * SCALE;
      const caseGradient = ctx.createLinearGradient(0, GAME.topY, 0, GAME.floorY);
      caseGradient.addColorStop(0, "rgba(251, 248, 233, 0.86)");
      caseGradient.addColorStop(0.56, "rgba(236, 226, 207, 0.68)");
      caseGradient.addColorStop(1, "rgba(215, 190, 158, 0.72)");
      ctx.fillStyle = caseGradient;
      this.roundRect(ctx, GAME.innerLeft - 2 * SCALE, GAME.topY - 2 * SCALE, boxWidth + 4 * SCALE, boxHeight + 4 * SCALE, radius);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.save();
      this.roundRect(ctx, GAME.innerLeft + 8 * SCALE, GAME.topY + 16 * SCALE, boxWidth - 16 * SCALE, boxHeight - 20 * SCALE, 16 * SCALE);
      ctx.clip();

      const liningGradient = ctx.createLinearGradient(0, GAME.topY, 0, GAME.floorY);
      liningGradient.addColorStop(0, "rgba(253, 250, 240, 0.78)");
      liningGradient.addColorStop(0.52, "rgba(238, 231, 216, 0.64)");
      liningGradient.addColorStop(1, "rgba(220, 202, 178, 0.64)");
      ctx.fillStyle = liningGradient;
      ctx.fillRect(GAME.innerLeft + 8 * SCALE, GAME.topY + 16 * SCALE, boxWidth - 16 * SCALE, boxHeight - 20 * SCALE);

      this.drawLiningPrint(ctx);

      const cushionY = GAME.floorY - 58 * SCALE;
      const cushionGradient = ctx.createLinearGradient(0, cushionY, 0, GAME.floorY);
      cushionGradient.addColorStop(0, "rgba(232, 215, 160, 0.5)");
      cushionGradient.addColorStop(0.58, "rgba(214, 188, 150, 0.72)");
      cushionGradient.addColorStop(1, "rgba(186, 151, 122, 0.72)");
      ctx.fillStyle = cushionGradient;
      ctx.beginPath();
      ctx.ellipse(GAME.width / 2, GAME.floorY - 12 * SCALE, boxWidth * 0.5, 70 * SCALE, 0, Math.PI, Math.PI * 2);
      ctx.lineTo(GAME.innerRight - 10 * SCALE, GAME.floorY);
      ctx.lineTo(GAME.innerLeft + 10 * SCALE, GAME.floorY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(127, 105, 86, 0.22)";
      ctx.lineWidth = 1.4 * SCALE;
      for (let i = 0; i < 5; i += 1) {
        const y = cushionY + i * 17 * SCALE;
        ctx.beginPath();
        ctx.moveTo(GAME.innerLeft + 18 * SCALE, y);
        ctx.quadraticCurveTo(GAME.width / 2, y + 12 * SCALE, GAME.innerRight - 18 * SCALE, y);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = "rgba(178, 146, 108, 0.82)";
      ctx.lineWidth = 8 * SCALE;
      ctx.beginPath();
      ctx.moveTo(GAME.innerLeft + 24 * SCALE, GAME.topY);
      ctx.lineTo(GAME.innerRight - 24 * SCALE, GAME.topY);
      ctx.lineTo(GAME.innerRight, GAME.topY + 34 * SCALE);
      ctx.lineTo(GAME.innerRight, GAME.floorY);
      ctx.lineTo(GAME.innerLeft, GAME.floorY);
      ctx.lineTo(GAME.innerLeft, GAME.topY + 34 * SCALE);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 248, 0.8)";
      ctx.lineWidth = 3.4 * SCALE;
      ctx.beginPath();
      ctx.moveTo(GAME.innerLeft + 28 * SCALE, GAME.topY + 14 * SCALE);
      ctx.lineTo(GAME.innerRight - 28 * SCALE, GAME.topY + 14 * SCALE);
      ctx.stroke();

      ctx.strokeStyle = "rgba(135, 115, 96, 0.46)";
      ctx.lineWidth = 2 * SCALE;
      ctx.setLineDash([5 * SCALE, 7 * SCALE]);
      ctx.strokeRect(GAME.innerLeft + 18 * SCALE, GAME.topY + 26 * SCALE, boxWidth - 36 * SCALE, boxHeight - 45 * SCALE);
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(143, 96, 86, 0.42)";
      ctx.lineWidth = 1.8 * SCALE;
      ctx.setLineDash([8 * SCALE, 9 * SCALE]);
      ctx.beginPath();
      ctx.moveTo(GAME.innerLeft + 12 * SCALE, GAME.warningLineY);
      ctx.lineTo(GAME.innerRight - 12 * SCALE, GAME.warningLineY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255, 255, 246, 0.75)";
      for (let x = GAME.innerLeft + 32 * SCALE; x < GAME.innerRight; x += 36 * SCALE) {
        ctx.beginPath();
        ctx.arc(x, GAME.topY + 14 * SCALE, 4 * SCALE, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawLiningPrint(targetCtx) {
      targetCtx.save();
      targetCtx.lineWidth = Math.max(1, 1.2 * SCALE);

      const marks = [
        [88, 126, "star", "#d0b76a"],
        [162, 184, "dot", "#bd9990"],
        [306, 132, "paw", "#9db89f"],
        [386, 220, "star", "#92aeba"],
        [118, 318, "paw", "#aaa1b7"],
        [336, 372, "dot", "#c29d7e"],
        [224, 266, "star", "#d0b76a"],
        [412, 444, "paw", "#9db89f"]
      ];

      for (const [x, y, shape, color] of marks) {
        targetCtx.globalAlpha = 0.34;
        targetCtx.fillStyle = color;
        targetCtx.strokeStyle = color;

        if (shape === "star") {
          this.drawStar(targetCtx, x * SCALE, y * SCALE, 7 * SCALE, color);
        } else if (shape === "paw") {
          const cx = x * SCALE;
          const cy = y * SCALE;
          targetCtx.beginPath();
          targetCtx.arc(cx, cy, 4.2 * SCALE, 0, Math.PI * 2);
          targetCtx.arc(cx - 6 * SCALE, cy - 4 * SCALE, 2.4 * SCALE, 0, Math.PI * 2);
          targetCtx.arc(cx, cy - 7 * SCALE, 2.4 * SCALE, 0, Math.PI * 2);
          targetCtx.arc(cx + 6 * SCALE, cy - 4 * SCALE, 2.4 * SCALE, 0, Math.PI * 2);
          targetCtx.fill();
        } else {
          targetCtx.beginPath();
          targetCtx.arc(x * SCALE, y * SCALE, 4.8 * SCALE, 0, Math.PI * 2);
          targetCtx.fill();
        }
      }

      targetCtx.globalAlpha = 0.18;
      targetCtx.strokeStyle = "#9d8975";
      for (let x = GAME.innerLeft + 34 * SCALE; x < GAME.innerRight - 20 * SCALE; x += 38 * SCALE) {
        targetCtx.beginPath();
        targetCtx.moveTo(x, GAME.topY + 42 * SCALE);
        targetCtx.lineTo(x, GAME.floorY - 82 * SCALE);
        targetCtx.stroke();
      }

      targetCtx.restore();
    }

    drawDangerWarning(now) {
      const dangerProgress = this.balls.reduce(
        (max, ball) => Math.max(max, ball.warningTimer / GAME.gameOverMs),
        0
      );

      if (dangerProgress <= 0) {
        return;
      }

      const pulse = 0.55 + Math.sin(now * 0.014) * 0.22;
      const alpha = Math.min(0.95, 0.26 + dangerProgress * 0.62 + pulse * 0.18);
      const left = GAME.innerLeft + 14;
      const right = GAME.innerRight - 14;
      const width = right - left;

      ctx.save();
      ctx.shadowColor = "rgba(255, 42, 48, 0.55)";
      ctx.shadowBlur = 12 + dangerProgress * 18;
      ctx.strokeStyle = `rgba(255, 64, 68, ${alpha})`;
      ctx.lineWidth = 2 + dangerProgress * 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(left, GAME.warningLineY);
      ctx.lineTo(right, GAME.warningLineY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = 0.78;
      ctx.fillStyle = "rgba(255, 74, 70, 0.82)";
      ctx.fillRect(left, GAME.warningLineY - 5, width * Math.min(1, dangerProgress), 10);

      if (dangerProgress > 0.22) {
        ctx.globalAlpha = Math.min(1, dangerProgress + 0.18);
        ctx.fillStyle = "rgba(255, 246, 228, 0.96)";
        ctx.strokeStyle = "rgba(116, 38, 24, 0.48)";
        ctx.lineWidth = 3;
        ctx.font = `700 ${16 * SCALE}px "Trebuchet MS"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText("DANGER", GAME.width / 2, GAME.warningLineY - 26 * SCALE);
        ctx.fillText("DANGER", GAME.width / 2, GAME.warningLineY - 26 * SCALE);
      }

      ctx.restore();
    }

    drawRewardHud() {
      const hasBest = this.bestPulse > 0;
      const hasPulse = this.scorePulse > 0;

      if (!hasBest && !hasPulse) {
        return;
      }

      ctx.save();

      if (hasBest) {
        const alpha = Math.min(1, this.bestPulse * 1.4);
        const lift = (1 - this.bestPulse) * 18 * SCALE;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(251, 247, 226, 0.94)";
        ctx.strokeStyle = "rgba(138, 118, 82, 0.32)";
        ctx.lineWidth = 2 * SCALE;
        const badgeWidth = 120 * SCALE;
        const badgeHeight = 28 * SCALE;
        const x = (GAME.width - badgeWidth) / 2;
        const y = GAME.topY + 70 * SCALE - lift;
        this.roundRect(ctx, x, y, badgeWidth, badgeHeight, 14 * SCALE);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(91, 78, 61, 0.9)";
        ctx.font = `800 ${12 * SCALE}px "Trebuchet MS"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("NEW BEST", GAME.width / 2, y + badgeHeight / 2 + SCALE);
      }

      if (hasPulse) {
        ctx.globalAlpha = this.scorePulse * 0.26;
        ctx.strokeStyle = "rgba(234, 217, 133, 0.95)";
        ctx.lineWidth = 3 * SCALE;
        ctx.beginPath();
        ctx.arc(GAME.width / 2, GAME.topY + 48 * SCALE, 26 * SCALE + (1 - this.scorePulse) * 18 * SCALE, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawGuide(now) {
      const x = this.clampSpawnX(this.previewType, this.pointerX);
      const piece = PIECES[this.previewType];
      const y = this.getSpawnY(this.previewType);
      const pulse = 0.85 + Math.sin(now * 0.006) * 0.08;

      ctx.save();
      ctx.strokeStyle = "rgba(113, 64, 24, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(x, GAME.topY - 18 * SCALE);
      ctx.lineTo(x, GAME.floorY - GAME.height * 0.028);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = this.gameOver ? 0.35 : 0.55;
      this.drawPiece(ctx, x, y, piece.radius * pulse, piece.color, piece.name);
      ctx.restore();
    }

    drawPiece(targetCtx, x, y, radius, color, label) {
      const piece = PIECES.find((entry) => entry.name === label);

      if (!piece) {
        return;
      }

      targetCtx.save();
      targetCtx.shadowColor = "rgba(83, 55, 41, 0.18)";
      targetCtx.shadowBlur = Math.max(5, radius * 0.18);
      targetCtx.shadowOffsetY = Math.max(1, radius * 0.05);

      this.drawPlushEars(targetCtx, piece, x, y, radius);

      const bodyGradient = targetCtx.createRadialGradient(
        x - radius * 0.32,
        y - radius * 0.38,
        radius * 0.08,
        x,
        y,
        radius
      );
      bodyGradient.addColorStop(0, this.lighten(piece.base, 18));
      bodyGradient.addColorStop(0.58, piece.base);
      bodyGradient.addColorStop(1, piece.rim);
      targetCtx.fillStyle = bodyGradient;
      targetCtx.beginPath();
      targetCtx.arc(x, y, radius, 0, Math.PI * 2);
      targetCtx.fill();

      targetCtx.strokeStyle = this.alphaColor(piece.rim, 0.54);
      targetCtx.lineWidth = Math.max(1, radius * 0.045);
      targetCtx.beginPath();
      targetCtx.arc(x, y, radius * 0.985, 0, Math.PI * 2);
      targetCtx.stroke();

      targetCtx.shadowColor = "transparent";
      targetCtx.shadowBlur = 0;
      targetCtx.shadowOffsetY = 0;

      this.drawPlushFuzz(targetCtx, piece, x, y, radius);

      targetCtx.globalAlpha = 0.28;
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.lineWidth = Math.max(1, radius * 0.04);
      targetCtx.beginPath();
      targetCtx.arc(x - radius * 0.2, y - radius * 0.22, radius * 0.48, Math.PI * 1.08, Math.PI * 1.62);
      targetCtx.stroke();
      targetCtx.globalAlpha = 1;

      targetCtx.globalAlpha = 0.72;
      targetCtx.fillStyle = piece.belly;
      targetCtx.beginPath();
      targetCtx.ellipse(x, y + radius * 0.22, radius * 0.48, radius * 0.35, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.globalAlpha = 1;

      this.drawPlushSeams(targetCtx, piece, x, y, radius);
      this.drawPlushPattern(targetCtx, piece, x, y, radius);
      this.drawPlushAccessory(targetCtx, piece, x, y, radius);
      this.drawPlushFace(targetCtx, piece, x, y, radius);

      targetCtx.restore();
    }

    drawSquishyPiece(targetCtx, ball, piece) {
      const squish = Math.min(1, ball.squish || 0);
      const wobble = Math.sin(ball.ageMs * 0.018) * Math.min(0.05, squish * 0.12);

      targetCtx.save();
      targetCtx.translate(ball.x, ball.y);
      targetCtx.rotate((ball.rotation || 0) + wobble);
      targetCtx.scale(1 + squish * 0.16, 1 - squish * 0.1);
      this.drawPiece(targetCtx, 0, 0, ball.radius, piece.color, piece.name);
      targetCtx.restore();
    }

    drawPlushFuzz(targetCtx, piece, x, y, radius) {
      targetCtx.save();
      targetCtx.strokeStyle = this.alphaColor(piece.base, 0.56);
      targetCtx.lineWidth = Math.max(0.8, radius * 0.018);
      targetCtx.lineCap = "round";

      const count = Math.max(12, Math.floor(radius * 0.34));
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count;
        const wave = Math.sin(index * 1.7 + radius * 0.21) * 0.35;
        const start = radius * (0.88 + wave * 0.018);
        const end = radius * (1.02 + wave * 0.018);
        const sx = x + Math.cos(angle) * start;
        const sy = y + Math.sin(angle) * start;
        const ex = x + Math.cos(angle + wave * 0.03) * end;
        const ey = y + Math.sin(angle + wave * 0.03) * end;
        targetCtx.beginPath();
        targetCtx.moveTo(sx, sy);
        targetCtx.lineTo(ex, ey);
        targetCtx.stroke();
      }

      targetCtx.globalAlpha = 0.16;
      targetCtx.strokeStyle = "#ffffff";
      for (let index = 0; index < count * 0.7; index += 1) {
        const angle = (Math.PI * 2 * index) / (count * 0.7);
        const inner = radius * 0.24 + (index % 5) * radius * 0.1;
        targetCtx.beginPath();
        targetCtx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
        targetCtx.lineTo(x + Math.cos(angle + 0.04) * (inner + radius * 0.09), y + Math.sin(angle + 0.04) * (inner + radius * 0.09));
        targetCtx.stroke();
      }

      targetCtx.restore();
    }

    drawPlushSeams(targetCtx, piece, x, y, radius) {
      targetCtx.save();
      targetCtx.globalAlpha = 0.24;
      targetCtx.strokeStyle = this.lighten(piece.rim, -18);
      targetCtx.lineWidth = Math.max(1, radius * 0.026);
      targetCtx.setLineDash([radius * 0.055, radius * 0.065]);
      targetCtx.beginPath();
      targetCtx.arc(x, y, radius * 0.72, Math.PI * 0.1, Math.PI * 0.9);
      targetCtx.stroke();
      targetCtx.beginPath();
      targetCtx.arc(x, y, radius * 0.72, Math.PI * 1.1, Math.PI * 1.88);
      targetCtx.stroke();
      targetCtx.setLineDash([]);
      targetCtx.globalAlpha = 0.2;
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.beginPath();
      targetCtx.ellipse(x, y + radius * 0.22, radius * 0.47, radius * 0.34, 0, Math.PI * 0.1, Math.PI * 0.9);
      targetCtx.stroke();
      targetCtx.restore();
    }

    drawPlushPattern(targetCtx, piece, x, y, radius) {
      targetCtx.save();
      targetCtx.globalAlpha = 0.82;
      targetCtx.fillStyle = piece.accent;
      targetCtx.strokeStyle = piece.accent;
      targetCtx.lineCap = "round";
      targetCtx.lineWidth = Math.max(1.2, radius * 0.035);

      if (piece.pattern === "toeBeans") {
        for (const direction of [-1, 1]) {
          targetCtx.fillStyle = this.lighten(piece.rim, -8);
          targetCtx.beginPath();
          targetCtx.ellipse(x + direction * radius * 0.29, y + radius * 0.48, radius * 0.12, radius * 0.08, 0, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.fillStyle = piece.belly;
          targetCtx.beginPath();
          targetCtx.arc(x + direction * radius * 0.25, y + radius * 0.45, radius * 0.026, 0, Math.PI * 2);
          targetCtx.arc(x + direction * radius * 0.3, y + radius * 0.43, radius * 0.026, 0, Math.PI * 2);
          targetCtx.arc(x + direction * radius * 0.35, y + radius * 0.45, radius * 0.026, 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.pattern === "catStripes") {
        targetCtx.strokeStyle = piece.accent;
        targetCtx.lineWidth = Math.max(1.2, radius * 0.05);
        for (const dx of [-0.18, 0, 0.18]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x + radius * dx, y - radius * 0.74);
          targetCtx.quadraticCurveTo(x + radius * dx * 0.72, y - radius * 0.52, x + radius * dx * 0.55, y - radius * 0.38);
          targetCtx.stroke();
        }
      } else if (piece.pattern === "paw") {
        targetCtx.fillStyle = piece.detail;
        targetCtx.globalAlpha = 0.72;
        targetCtx.beginPath();
        targetCtx.arc(x + radius * 0.42, y + radius * 0.22, radius * 0.08, 0, Math.PI * 2);
        targetCtx.arc(x + radius * 0.31, y + radius * 0.08, radius * 0.035, 0, Math.PI * 2);
        targetCtx.arc(x + radius * 0.43, y + radius * 0.04, radius * 0.035, 0, Math.PI * 2);
        targetCtx.arc(x + radius * 0.54, y + radius * 0.08, radius * 0.035, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.pattern === "penguinMask") {
        targetCtx.fillStyle = piece.belly;
        targetCtx.globalAlpha = 0.95;
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.22, y - radius * 0.16, radius * 0.22, radius * 0.32, -0.12, 0, Math.PI * 2);
        targetCtx.ellipse(x + radius * 0.22, y - radius * 0.16, radius * 0.22, radius * 0.32, 0.12, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = piece.detail;
        targetCtx.beginPath();
        targetCtx.ellipse(x, y - radius * 0.03, radius * 0.13, radius * 0.06, 0, 0, Math.PI * 2);
        targetCtx.fill();
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.ellipse(x + direction * radius * 0.28, y + radius * 0.67, radius * 0.12, radius * 0.06, direction * -0.2, 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.pattern === "toes") {
        targetCtx.fillStyle = "#e9f8ff";
        for (const direction of [-1, 1]) {
          for (const toe of [-0.04, 0.04, 0.12]) {
            targetCtx.beginPath();
            targetCtx.arc(x + direction * radius * (0.28 + toe), y + radius * 0.62, radius * 0.035, 0, Math.PI * 2);
            targetCtx.fill();
          }
        }
      } else if (piece.pattern === "pandaPatch") {
        targetCtx.fillStyle = piece.accent;
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.ellipse(x + direction * radius * 0.32, y - radius * 0.12, radius * 0.18, radius * 0.24, direction * 0.28, 0, Math.PI * 2);
          targetCtx.fill();
        }
        targetCtx.beginPath();
        targetCtx.ellipse(x + radius * 0.5, y + radius * 0.42, radius * 0.15, radius * 0.22, 0.16, 0, Math.PI * 2);
        targetCtx.ellipse(x - radius * 0.5, y + radius * 0.42, radius * 0.15, radius * 0.22, -0.16, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.pattern === "shell") {
        targetCtx.fillStyle = piece.accent;
        targetCtx.strokeStyle = this.lighten(piece.accent, -22);
        targetCtx.lineWidth = Math.max(1, radius * 0.026);
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.36, y + radius * 0.18, radius * 0.19, radius * 0.14, -0.36, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        for (const offset of [-0.07, 0, 0.07]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x - radius * (0.47 - offset), y + radius * 0.1);
          targetCtx.quadraticCurveTo(x - radius * 0.36, y + radius * 0.22, x - radius * (0.26 + offset), y + radius * 0.1);
          targetCtx.stroke();
        }
      } else if (piece.pattern === "spines") {
        targetCtx.strokeStyle = piece.accent;
        targetCtx.lineWidth = Math.max(1.2, radius * 0.04);
        for (let i = 0; i < 12; i += 1) {
          const angle = Math.PI * 1.12 + (Math.PI * 0.76 * i) / 11;
          const start = radius * 0.78;
          const end = radius * 1.04;
          targetCtx.beginPath();
          targetCtx.moveTo(x + Math.cos(angle) * start, y + Math.sin(angle) * start);
          targetCtx.lineTo(x + Math.cos(angle) * end, y + Math.sin(angle) * end);
          targetCtx.stroke();
        }
      } else if (piece.pattern === "foxMask") {
        targetCtx.fillStyle = piece.belly;
        targetCtx.beginPath();
        targetCtx.moveTo(x - radius * 0.5, y - radius * 0.08);
        targetCtx.quadraticCurveTo(x - radius * 0.24, y + radius * 0.2, x, y + radius * 0.05);
        targetCtx.quadraticCurveTo(x + radius * 0.24, y + radius * 0.2, x + radius * 0.5, y - radius * 0.08);
        targetCtx.quadraticCurveTo(x + radius * 0.3, y + radius * 0.44, x, y + radius * 0.42);
        targetCtx.quadraticCurveTo(x - radius * 0.3, y + radius * 0.44, x - radius * 0.5, y - radius * 0.08);
        targetCtx.fill();
      } else if (piece.pattern === "koalaNose") {
        targetCtx.fillStyle = piece.detail;
        targetCtx.beginPath();
        targetCtx.ellipse(x, y + radius * 0.02, radius * 0.16, radius * 0.2, 0, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.pattern === "mane") {
        targetCtx.fillStyle = this.lighten(piece.rim, -6);
        for (let i = 0; i < 10; i += 1) {
          const angle = -Math.PI * 0.95 + (Math.PI * 1.9 * i) / 9;
          targetCtx.beginPath();
          targetCtx.arc(x + Math.cos(angle) * radius * 0.77, y + Math.sin(angle) * radius * 0.68, radius * 0.14, 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.pattern === "heart") {
        this.drawHeart(targetCtx, x + radius * 0.18, y + radius * 0.24, radius * 0.12, piece.accent);
      } else if (piece.pattern === "button") {
        targetCtx.beginPath();
        targetCtx.arc(x - radius * 0.18, y + radius * 0.24, radius * 0.12, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = piece.belly;
        for (const [dx, dy] of [[-0.04, -0.03], [0.04, -0.03], [-0.04, 0.04], [0.04, 0.04]]) {
          targetCtx.beginPath();
          targetCtx.arc(x - radius * 0.18 + radius * dx, y + radius * 0.24 + radius * dy, Math.max(1, radius * 0.018), 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.pattern === "stripes") {
        for (const offset of [-0.16, 0.04, 0.24]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x - radius * 0.38, y + radius * offset);
          targetCtx.quadraticCurveTo(x, y + radius * (offset + 0.08), x + radius * 0.38, y + radius * offset);
          targetCtx.stroke();
        }
      } else if (piece.pattern === "freckles") {
        for (const [dx, dy] of [[-0.18, 0.25], [0.02, 0.3], [0.21, 0.22]]) {
          targetCtx.beginPath();
          targetCtx.arc(x + radius * dx, y + radius * dy, Math.max(1.4, radius * 0.035), 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.pattern === "star") {
        this.drawStar(targetCtx, x + radius * 0.18, y + radius * 0.22, radius * 0.14, piece.accent);
      } else if (piece.pattern === "stitches") {
        targetCtx.setLineDash([radius * 0.08, radius * 0.08]);
        targetCtx.beginPath();
        targetCtx.moveTo(x - radius * 0.34, y + radius * 0.27);
        targetCtx.lineTo(x + radius * 0.34, y + radius * 0.27);
        targetCtx.stroke();
        targetCtx.setLineDash([]);
      } else if (piece.pattern === "moon") {
        targetCtx.fillStyle = piece.belly;
        targetCtx.beginPath();
        targetCtx.arc(x + radius * 0.2, y + radius * 0.2, radius * 0.16, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = piece.base;
        targetCtx.beginPath();
        targetCtx.arc(x + radius * 0.27, y + radius * 0.16, radius * 0.16, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.pattern === "spots") {
        for (const [dx, dy, size] of [[-0.22, 0.24, 0.12], [0.2, 0.26, 0.09], [0.04, 0.42, 0.07]]) {
          targetCtx.beginPath();
          targetCtx.arc(x + radius * dx, y + radius * dy, radius * size, 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.pattern === "bigPatch") {
        targetCtx.fillStyle = "rgba(255, 246, 213, 0.72)";
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.2, y + radius * 0.24, radius * 0.22, radius * 0.16, -0.25, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.strokeStyle = piece.accent;
        targetCtx.lineWidth = Math.max(1, radius * 0.025);
        targetCtx.stroke();
      }

      targetCtx.restore();
    }

    drawPlushAccessory(targetCtx, piece, x, y, radius) {
      targetCtx.save();
      targetCtx.fillStyle = piece.accent;
      targetCtx.strokeStyle = this.lighten(piece.accent, -24);
      targetCtx.lineWidth = Math.max(1, radius * 0.032);
      targetCtx.lineCap = "round";
      targetCtx.lineJoin = "round";

      if (piece.accessory === "carrot") {
        targetCtx.fillStyle = piece.detail;
        targetCtx.strokeStyle = this.lighten(piece.detail, -26);
        targetCtx.beginPath();
        targetCtx.ellipse(x, y + radius * 0.36, radius * 0.14, radius * 0.28, -0.2, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.strokeStyle = piece.accent;
        targetCtx.lineWidth = Math.max(1, radius * 0.04);
        for (const dx of [-0.08, 0, 0.08]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x - radius * 0.04, y + radius * 0.12);
          targetCtx.lineTo(x + radius * dx, y - radius * 0.05);
          targetCtx.stroke();
        }
      } else if (piece.accessory === "whiskers") {
        targetCtx.strokeStyle = "rgba(101, 65, 42, 0.72)";
        targetCtx.lineWidth = Math.max(1, radius * 0.025);
        for (const direction of [-1, 1]) {
          for (const offset of [-0.05, 0.04]) {
            targetCtx.beginPath();
            targetCtx.moveTo(x + direction * radius * 0.18, y + radius * (0.02 + offset));
            targetCtx.lineTo(x + direction * radius * 0.6, y + radius * (offset - 0.02));
            targetCtx.stroke();
          }
        }
      } else if (piece.accessory === "blueBow") {
        const by = y + radius * 0.12;
        targetCtx.fillStyle = piece.accent;
        targetCtx.strokeStyle = this.lighten(piece.accent, -24);
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.11, by, radius * 0.14, radius * 0.09, 0, 0, Math.PI * 2);
        targetCtx.ellipse(x + radius * 0.11, by, radius * 0.14, radius * 0.09, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.arc(x, by, radius * 0.06, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.accessory === "trunk") {
        targetCtx.fillStyle = this.lighten(piece.base, 4);
        targetCtx.strokeStyle = piece.rim;
        targetCtx.lineWidth = Math.max(1.2, radius * 0.04);
        targetCtx.beginPath();
        targetCtx.moveTo(x - radius * 0.08, y - radius * 0.03);
        targetCtx.bezierCurveTo(x - radius * 0.1, y + radius * 0.25, x + radius * 0.08, y + radius * 0.32, x + radius * 0.03, y + radius * 0.48);
        targetCtx.bezierCurveTo(x - radius * 0.02, y + radius * 0.58, x + radius * 0.16, y + radius * 0.6, x + radius * 0.18, y + radius * 0.48);
        targetCtx.bezierCurveTo(x + radius * 0.22, y + radius * 0.27, x + radius * 0.1, y + radius * 0.16, x + radius * 0.08, y - radius * 0.03);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
      } else if (piece.accessory === "bamboo") {
        targetCtx.strokeStyle = piece.detail;
        targetCtx.lineWidth = Math.max(2, radius * 0.09);
        targetCtx.beginPath();
        targetCtx.moveTo(x + radius * 0.36, y + radius * 0.42);
        targetCtx.lineTo(x + radius * 0.17, y + radius * 0.08);
        targetCtx.stroke();
        targetCtx.fillStyle = piece.detail;
        for (const [dx, dy, rot] of [[0.23, 0.12, -0.6], [0.32, 0.0, 0.62]]) {
          targetCtx.beginPath();
          targetCtx.ellipse(x + radius * dx, y + radius * dy, radius * 0.12, radius * 0.05, rot, 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.accessory === "shell") {
        targetCtx.fillStyle = piece.accent;
        targetCtx.strokeStyle = this.lighten(piece.accent, -24);
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.38, y + radius * 0.24, radius * 0.16, radius * 0.22, -0.62, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
      } else if (piece.accessory === "apple") {
        targetCtx.fillStyle = piece.detail;
        targetCtx.strokeStyle = "#9b332d";
        targetCtx.beginPath();
        targetCtx.arc(x, y - radius * 0.9, radius * 0.15, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.strokeStyle = "#5f7f36";
        targetCtx.beginPath();
        targetCtx.moveTo(x, y - radius * 1.04);
        targetCtx.lineTo(x, y - radius * 1.16);
        targetCtx.stroke();
        targetCtx.fillStyle = "#6aa34c";
        targetCtx.beginPath();
        targetCtx.ellipse(x + radius * 0.08, y - radius * 1.1, radius * 0.08, radius * 0.04, -0.35, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.accessory === "greenScarf") {
        targetCtx.fillStyle = piece.accent;
        targetCtx.strokeStyle = this.lighten(piece.accent, -24);
        targetCtx.beginPath();
        targetCtx.ellipse(x, y + radius * 0.18, radius * 0.52, radius * 0.09, 0.04, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.fillRect(x + radius * 0.14, y + radius * 0.18, radius * 0.1, radius * 0.28);
        targetCtx.fillStyle = this.lighten(piece.accent, 16);
        for (const dx of [-0.24, -0.06, 0.12]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x + radius * dx, y + radius * 0.11);
          targetCtx.lineTo(x + radius * (dx + 0.12), y + radius * 0.23);
          targetCtx.stroke();
        }
      } else if (piece.accessory === "eucalyptus") {
        targetCtx.strokeStyle = "#7a5d38";
        targetCtx.lineWidth = Math.max(1.2, radius * 0.035);
        targetCtx.beginPath();
        targetCtx.moveTo(x - radius * 0.14, y + radius * 0.32);
        targetCtx.lineTo(x - radius * 0.38, y + radius * 0.12);
        targetCtx.stroke();
        targetCtx.fillStyle = piece.accent;
        for (const [dx, dy, rot] of [[-0.32, 0.12, -0.7], [-0.24, 0.2, 0.7]]) {
          targetCtx.beginPath();
          targetCtx.ellipse(x + radius * dx, y + radius * dy, radius * 0.11, radius * 0.05, rot, 0, Math.PI * 2);
          targetCtx.fill();
        }
      } else if (piece.accessory === "bow") {
        const by = y - radius * 0.78;
        targetCtx.beginPath();
        targetCtx.moveTo(x, by);
        targetCtx.lineTo(x - radius * 0.22, by - radius * 0.12);
        targetCtx.lineTo(x - radius * 0.22, by + radius * 0.12);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.moveTo(x, by);
        targetCtx.lineTo(x + radius * 0.22, by - radius * 0.12);
        targetCtx.lineTo(x + radius * 0.22, by + radius * 0.12);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.arc(x, by, radius * 0.06, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.accessory === "tuft") {
        for (const dx of [-0.08, 0, 0.08]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x, y - radius * 0.78);
          targetCtx.quadraticCurveTo(x + radius * dx, y - radius * 1.02, x + radius * dx * 2, y - radius * 0.82);
          targetCtx.stroke();
        }
      } else if (piece.accessory === "scarf") {
        targetCtx.fillStyle = this.lighten(piece.accent, 26);
        targetCtx.beginPath();
        targetCtx.ellipse(x, y + radius * 0.02, radius * 0.45, radius * 0.1, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.fillRect(x + radius * 0.12, y + radius * 0.03, radius * 0.12, radius * 0.28);
      } else if (piece.accessory === "sprout") {
        targetCtx.strokeStyle = piece.accent;
        targetCtx.beginPath();
        targetCtx.moveTo(x, y - radius * 0.74);
        targetCtx.lineTo(x, y - radius * 1.0);
        targetCtx.stroke();
        targetCtx.fillStyle = piece.accent;
        targetCtx.beginPath();
        targetCtx.ellipse(x + radius * 0.13, y - radius * 0.94, radius * 0.15, radius * 0.08, -0.45, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.accessory === "patch") {
        targetCtx.fillStyle = "rgba(255, 246, 213, 0.76)";
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.36, y - radius * 0.14, radius * 0.14, radius * 0.2, -0.3, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
      } else if (piece.accessory === "cap") {
        targetCtx.beginPath();
        targetCtx.ellipse(x, y - radius * 0.62, radius * 0.42, radius * 0.16, 0, Math.PI, Math.PI * 2);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.fillStyle = piece.belly;
        targetCtx.beginPath();
        targetCtx.arc(x + radius * 0.32, y - radius * 0.68, radius * 0.09, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.accessory === "bandana") {
        targetCtx.beginPath();
        targetCtx.moveTo(x - radius * 0.38, y + radius * 0.04);
        targetCtx.lineTo(x + radius * 0.38, y + radius * 0.04);
        targetCtx.lineTo(x, y + radius * 0.28);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
      } else if (piece.accessory === "crown") {
        targetCtx.fillStyle = "#f7d36a";
        targetCtx.strokeStyle = "#b9892c";
        targetCtx.beginPath();
        targetCtx.moveTo(x - radius * 0.34, y - radius * 0.72);
        targetCtx.lineTo(x - radius * 0.2, y - radius * 0.98);
        targetCtx.lineTo(x, y - radius * 0.76);
        targetCtx.lineTo(x + radius * 0.2, y - radius * 0.98);
        targetCtx.lineTo(x + radius * 0.34, y - radius * 0.72);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.fillStyle = piece.accent;
        targetCtx.strokeStyle = this.lighten(piece.accent, -24);
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.13, y + radius * 0.28, radius * 0.13, radius * 0.08, 0.35, 0, Math.PI * 2);
        targetCtx.ellipse(x + radius * 0.13, y + radius * 0.28, radius * 0.13, radius * 0.08, -0.35, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.arc(x, y + radius * 0.28, radius * 0.05, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (piece.accessory === "ribbon") {
        targetCtx.fillStyle = piece.accent;
        targetCtx.beginPath();
        targetCtx.ellipse(x - radius * 0.22, y - radius * 0.58, radius * 0.18, radius * 0.1, 0.35, 0, Math.PI * 2);
        targetCtx.ellipse(x + radius * 0.22, y - radius * 0.58, radius * 0.18, radius * 0.1, -0.35, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.beginPath();
        targetCtx.arc(x, y - radius * 0.58, radius * 0.06, 0, Math.PI * 2);
        targetCtx.fill();
      }

      targetCtx.restore();
    }

    drawPlushEars(targetCtx, piece, x, y, radius) {
      targetCtx.fillStyle = piece.base;
      targetCtx.strokeStyle = piece.rim;
      targetCtx.lineWidth = Math.max(1, radius * 0.035);

      if (piece.ears === "none") {
        return;
      }

      if (piece.ears === "bunny") {
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.ellipse(
            x + direction * radius * 0.34,
            y - radius * 0.84,
            radius * 0.17,
            radius * 0.48,
            direction * -0.08,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
          targetCtx.stroke();
          targetCtx.fillStyle = piece.belly;
          targetCtx.beginPath();
          targetCtx.ellipse(
            x + direction * radius * 0.34,
            y - radius * 0.84,
            radius * 0.08,
            radius * 0.34,
            direction * -0.08,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
          targetCtx.fillStyle = piece.base;
        }
        return;
      }

      if (piece.ears === "cat" || piece.ears === "fox") {
        if (piece.ears === "fox") {
          targetCtx.fillStyle = piece.base;
          targetCtx.beginPath();
          targetCtx.ellipse(x + radius * 0.78, y + radius * 0.08, radius * 0.24, radius * 0.58, -0.52, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.fillStyle = piece.belly;
          targetCtx.beginPath();
          targetCtx.ellipse(x + radius * 0.86, y + radius * 0.02, radius * 0.12, radius * 0.2, -0.52, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.fillStyle = piece.base;
        }

        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x + direction * radius * 0.44, y - radius * 0.48);
          targetCtx.lineTo(x + direction * radius * 0.2, y - radius * 0.96);
          targetCtx.lineTo(x + direction * radius * 0.74, y - radius * 0.7);
          targetCtx.closePath();
          targetCtx.fill();
          targetCtx.stroke();
          targetCtx.fillStyle = piece.belly;
          targetCtx.beginPath();
          targetCtx.moveTo(x + direction * radius * 0.45, y - radius * 0.58);
          targetCtx.lineTo(x + direction * radius * 0.31, y - radius * 0.82);
          targetCtx.lineTo(x + direction * radius * 0.61, y - radius * 0.69);
          targetCtx.closePath();
          targetCtx.fill();
          targetCtx.fillStyle = piece.base;
        }
        return;
      }

      if (piece.ears === "dog") {
        targetCtx.fillStyle = piece.detail;
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.ellipse(
            x + direction * radius * 0.6,
            y - radius * 0.38,
            radius * 0.2,
            radius * 0.38,
            direction * 0.45,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
        }
        targetCtx.fillStyle = piece.base;
        return;
      }

      if (piece.ears === "elephant") {
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.ellipse(
            x + direction * radius * 0.66,
            y - radius * 0.2,
            radius * 0.34,
            radius * 0.42,
            direction * 0.18,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
          targetCtx.stroke();
          targetCtx.fillStyle = piece.accent;
          targetCtx.globalAlpha = 0.56;
          targetCtx.beginPath();
          targetCtx.ellipse(
            x + direction * radius * 0.68,
            y - radius * 0.18,
            radius * 0.2,
            radius * 0.28,
            direction * 0.18,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
          targetCtx.globalAlpha = 1;
          targetCtx.fillStyle = piece.base;
        }
        return;
      }

      if (piece.ears === "panda" || piece.ears === "koala") {
        for (const direction of [-1, 1]) {
          targetCtx.fillStyle = piece.ears === "panda" ? piece.accent : piece.base;
          targetCtx.beginPath();
          targetCtx.arc(x + direction * radius * 0.52, y - radius * 0.55, radius * 0.26, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.stroke();
          targetCtx.fillStyle = piece.ears === "panda" ? piece.rim : piece.belly;
          targetCtx.beginPath();
          targetCtx.arc(x + direction * radius * 0.52, y - radius * 0.55, radius * 0.12, 0, Math.PI * 2);
          targetCtx.fill();
        }
        targetCtx.fillStyle = piece.base;
        return;
      }

      if (piece.ears === "hedgehog") {
        targetCtx.fillStyle = piece.rim;
        for (let i = 0; i < 16; i += 1) {
          const angle = Math.PI * 1.08 + (Math.PI * 0.84 * i) / 15;
          targetCtx.beginPath();
          targetCtx.moveTo(x + Math.cos(angle) * radius * 0.78, y + Math.sin(angle) * radius * 0.78);
          targetCtx.lineTo(x + Math.cos(angle - 0.08) * radius * 1.1, y + Math.sin(angle - 0.08) * radius * 1.1);
          targetCtx.lineTo(x + Math.cos(angle + 0.08) * radius * 1.1, y + Math.sin(angle + 0.08) * radius * 1.1);
          targetCtx.closePath();
          targetCtx.fill();
        }
        targetCtx.fillStyle = piece.base;
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.arc(x + direction * radius * 0.48, y - radius * 0.48, radius * 0.16, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.stroke();
        }
        return;
      }

      if (piece.ears === "lion") {
        targetCtx.fillStyle = piece.rim;
        for (let i = 0; i < 18; i += 1) {
          const angle = -Math.PI + (Math.PI * 2 * i) / 18;
          targetCtx.beginPath();
          targetCtx.arc(x + Math.cos(angle) * radius * 0.73, y + Math.sin(angle) * radius * 0.68, radius * 0.2, 0, Math.PI * 2);
          targetCtx.fill();
        }
        targetCtx.fillStyle = piece.base;
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.arc(x + direction * radius * 0.44, y - radius * 0.52, radius * 0.17, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.stroke();
        }
        return;
      }

      if (piece.ears === "pointed") {
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.moveTo(x + direction * radius * 0.48, y - radius * 0.52);
          targetCtx.lineTo(x + direction * radius * 0.18, y - radius * 1.03);
          targetCtx.lineTo(x + direction * radius * 0.76, y - radius * 0.74);
          targetCtx.closePath();
          targetCtx.fill();
          targetCtx.stroke();
        }
        return;
      }

      if (piece.ears === "floppy") {
        for (const direction of [-1, 1]) {
          targetCtx.beginPath();
          targetCtx.ellipse(
            x + direction * radius * 0.64,
            y - radius * 0.42,
            radius * 0.25,
            radius * 0.44,
            direction * 0.36,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
          targetCtx.stroke();
        }
        return;
      }

      if (piece.ears === "leaf") {
        for (const direction of [-1, 1]) {
          targetCtx.fillStyle = piece.accent;
          targetCtx.beginPath();
          targetCtx.ellipse(
            x + direction * radius * 0.46,
            y - radius * 0.72,
            radius * 0.22,
            radius * 0.12,
            direction * -0.58,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
        }
        return;
      }

      for (const direction of [-1, 1]) {
        targetCtx.beginPath();
        targetCtx.arc(x + direction * radius * 0.52, y - radius * 0.54, radius * 0.27, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = piece.belly;
        targetCtx.beginPath();
        targetCtx.arc(x + direction * radius * 0.52, y - radius * 0.54, radius * 0.13, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = piece.base;
      }
    }

    drawPlushFace(targetCtx, piece, x, y, radius) {
      const eyeY = y - radius * 0.12;
      const eyeX = radius * 0.34;
      const eyeRadius = Math.max(2, radius * 0.065);
      const faceColor = "rgba(100, 61, 49, 0.9)";

      targetCtx.fillStyle = faceColor;
      targetCtx.beginPath();
      targetCtx.arc(x - eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      targetCtx.arc(x + eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      targetCtx.fill();

      targetCtx.strokeStyle = faceColor;
      targetCtx.lineWidth = Math.max(1.2, radius * 0.04);
      targetCtx.lineCap = "round";
      targetCtx.beginPath();

      if (piece.face === "sleepy") {
        targetCtx.moveTo(x - radius * 0.12, y + radius * 0.09);
        targetCtx.quadraticCurveTo(x, y + radius * 0.17, x + radius * 0.12, y + radius * 0.09);
      } else if (piece.face === "small") {
        targetCtx.moveTo(x - radius * 0.06, y + radius * 0.1);
        targetCtx.lineTo(x + radius * 0.06, y + radius * 0.1);
      } else {
        targetCtx.moveTo(x - radius * 0.13, y + radius * 0.08);
        targetCtx.quadraticCurveTo(x, y + radius * 0.26, x + radius * 0.13, y + radius * 0.08);
      }

      targetCtx.stroke();

      targetCtx.globalAlpha = 0.52;
      targetCtx.fillStyle = piece.blush;
      for (const direction of [-1, 1]) {
        targetCtx.beginPath();
        targetCtx.ellipse(
          x + direction * radius * 0.48,
          y + radius * 0.13,
          radius * 0.11,
          radius * 0.07,
          0,
          0,
          Math.PI * 2
        );
        targetCtx.fill();
      }
      targetCtx.globalAlpha = 1;

      targetCtx.strokeStyle = "rgba(255, 255, 255, 0.36)";
      targetCtx.lineWidth = Math.max(1, radius * 0.025);
      targetCtx.beginPath();
      targetCtx.arc(x - radius * 0.28, y - radius * 0.3, radius * 0.18, Math.PI * 1.1, Math.PI * 1.65);
      targetCtx.stroke();
    }

    drawMergeFlash() {
      if (this.mergeFlash <= 0) {
        return;
      }

      ctx.save();
      ctx.globalAlpha = this.mergeFlash * 0.13;
      ctx.fillStyle = "rgb(255, 245, 198)";
      ctx.fillRect(0, 0, GAME.width, GAME.height);
      ctx.restore();
    }

    drawEffects() {
      for (const effect of this.effects) {
        const piece = PIECES[effect.typeIndex];
        const progress = effect.age / effect.duration;
        const eased = 1 - Math.pow(1 - progress, 3);
        const alpha = 1 - progress;
        const scoreY = effect.y - piece.radius * (0.7 + progress * 0.85);

        ctx.save();
        ctx.globalAlpha = alpha * 0.46;
        ctx.fillStyle = piece.belly;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, piece.radius * (0.52 + eased * 0.46), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.58;
        ctx.strokeStyle = piece.blush;
        ctx.lineWidth = Math.max(2, piece.radius * 0.045);
        ctx.setLineDash([piece.radius * 0.08, piece.radius * 0.12]);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, piece.radius * (0.72 + eased * 0.38), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        for (const particle of effect.particles) {
          const size = Math.max(1.2, particle.size * (1 - progress * 0.36));
          ctx.globalAlpha = alpha * 0.92;

          if (particle.shape === "heart") {
            this.drawHeart(ctx, particle.x, particle.y, size * 0.72, particle.color);
          } else if (particle.shape === "star") {
            this.drawStar(ctx, particle.x, particle.y, size * 0.85, particle.color);
          } else {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.globalAlpha = Math.max(0, alpha * 0.98);
        ctx.fillStyle = "rgba(255, 248, 230, 0.98)";
        ctx.strokeStyle = "rgba(160, 95, 79, 0.38)";
        ctx.lineWidth = 4;
        ctx.font = `700 ${Math.max(16, piece.radius * 0.3)}px "Trebuchet MS"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(`+${this.formatScore(effect.score)}`, effect.x, scoreY);
        ctx.fillText(`+${this.formatScore(effect.score)}`, effect.x, scoreY);

        if (effect.isNewBest) {
          ctx.globalAlpha = Math.max(0, alpha * 0.8);
          ctx.fillStyle = "rgba(235, 214, 116, 0.92)";
          this.drawStar(ctx, effect.x + piece.radius * 0.34, scoreY - piece.radius * 0.14, Math.max(6, piece.radius * 0.12), "rgba(235, 214, 116, 0.92)");
        }
        ctx.restore();
      }
    }

    roundRect(targetCtx, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      targetCtx.beginPath();
      targetCtx.moveTo(x + r, y);
      targetCtx.lineTo(x + width - r, y);
      targetCtx.quadraticCurveTo(x + width, y, x + width, y + r);
      targetCtx.lineTo(x + width, y + height - r);
      targetCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      targetCtx.lineTo(x + r, y + height);
      targetCtx.quadraticCurveTo(x, y + height, x, y + height - r);
      targetCtx.lineTo(x, y + r);
      targetCtx.quadraticCurveTo(x, y, x + r, y);
      targetCtx.closePath();
    }

    drawHeart(targetCtx, x, y, size, color) {
      targetCtx.save();
      targetCtx.fillStyle = color;
      targetCtx.beginPath();
      targetCtx.moveTo(x, y + size * 0.45);
      targetCtx.bezierCurveTo(x - size * 1.05, y - size * 0.18, x - size * 0.58, y - size * 0.92, x, y - size * 0.38);
      targetCtx.bezierCurveTo(x + size * 0.58, y - size * 0.92, x + size * 1.05, y - size * 0.18, x, y + size * 0.45);
      targetCtx.fill();
      targetCtx.restore();
    }

    drawStar(targetCtx, x, y, radius, color) {
      targetCtx.save();
      targetCtx.fillStyle = color;
      targetCtx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 10;
        const pointRadius = i % 2 === 0 ? radius : radius * 0.48;
        const px = x + Math.cos(angle) * pointRadius;
        const py = y + Math.sin(angle) * pointRadius;
        if (i === 0) {
          targetCtx.moveTo(px, py);
        } else {
          targetCtx.lineTo(px, py);
        }
      }
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.restore();
    }

    formatScore(value) {
      return value.toLocaleString("en-US");
    }

    lighten(hex, amount) {
      const value = hex.replace("#", "");
      const num = parseInt(value, 16);
      const clamp = (input) => Math.max(0, Math.min(255, input));
      const r = clamp((num >> 16) + amount);
      const g = clamp(((num >> 8) & 0x00ff) + amount);
      const b = clamp((num & 0x0000ff) + amount);
      return `rgb(${r}, ${g}, ${b})`;
    }

    alphaColor(hex, alpha) {
      const value = hex.replace("#", "");
      const num = parseInt(value, 16);
      const r = num >> 16;
      const g = (num >> 8) & 0x00ff;
      const b = num & 0x0000ff;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    vibrate(pattern) {
      try {
        if (window.navigator && typeof window.navigator.vibrate === "function") {
          window.navigator.vibrate(pattern);
        }
      } catch (error) {
        // Haptics are a nice-to-have and should never interrupt play.
      }
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

  function handlePointerAim(event) {
    if (event.pointerType === "touch") {
      event.preventDefault();
    }

    updatePointer(event.clientX);
  }

  function handlePointerDrop(event) {
    if (event.target.closest("button")) {
      return;
    }

    if (event.pointerType === "touch") {
      event.preventDefault();
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

  gameColumn.addEventListener("pointermove", handlePointerAim, { passive: false });
  gameColumn.addEventListener("pointerdown", handlePointerDrop, { passive: false });
  gameColumn.addEventListener("click", (event) => {
    if (event.pointerType) {
      return;
    }

    handleAimAndDrop(event);
  });

  restartButton.addEventListener("click", () => {
    game.reset();
  });

  overlayRestartButton.addEventListener("click", () => {
    game.reset();
  });

  if (playerForm) {
    playerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      game.setPlayerName(playerNameInput ? playerNameInput.value : "");
      if (playerNameInput) {
        playerNameInput.blur();
      }
    });
  }

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

  game.reset();
  window.requestAnimationFrame(loop);
})();
