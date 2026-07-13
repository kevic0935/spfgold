// Unified Gold Accumulation Plan Calculator Logic
// File: /src/threshold.js

document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURATION DEADLINE (Adjust this date/time to change the countdown target) ---
  // 設定目標日期，2026-12-31。
  const TARGET_DATE = "2026-12-31";
  const TARGET_DEADLINE = new Date(`${TARGET_DATE}T23:59:59`);

  // --- STATE ---
  let state = {
    lots: 0, // matches "再交易 780 口" (800 - 20) in the mockup
    consecutiveMonths: 0, // matches mockup initial state
    editedShareMessage: null,
  };

  // --- CONFIG / TIERS ---
  const tiers = [
    { threshold: 0, rewardMace: 0, rewardGram: 0, label: "無" },
    { threshold: 800, rewardMace: 0.1, rewardGram: 0.375, label: "金豆 0.1 錢" },
    { threshold: 1800, rewardMace: 1, rewardGram: 1, label: "金豆 1 克" },
    { threshold: 3500, rewardMace: 1, rewardGram: 3.75, label: "金豆 1 錢" },
  ];

  // --- DOM SELECTORS ---
  const lotsInput = document.getElementById("lots-input");
  const bottleGoldFill = document.getElementById("bottle-gold-fill");
  const bottleGoldSurface = document.getElementById("bottle-gold-surface");
  const bottleSparkles = document.getElementById("bottle-sparkles");
  const bottleStatusText = document.getElementById("bottle-status-text");
  const bottleAccumulatedText = document.getElementById("bottle-accumulated-text");
  
  const progressBarMin = document.getElementById("progress-bar-min");
  const progressBarMax = document.getElementById("progress-bar-max");
  const progressBarFilled = document.getElementById("progress-bar-filled");
  const milestoneDescription = document.getElementById("milestone-description");

  // Countdown timer elements
  const countdownDaysSpan = document.getElementById("countdown-days-span");

  // Consecutive months elements
  const btnConsecutiveMonths = document.querySelectorAll(".tracker-month-btn");
  const l1Circles = document.querySelectorAll(".tracker-tier-dots .tracker-tier-dot[data-num='1'], .tracker-tier-dots .tracker-tier-dot[data-num='2'], .tracker-tier-dots .tracker-tier-dot[data-num='3']");
  const l1Status = document.getElementById("l1-status");
  const l2Circles = document.querySelectorAll(".tracker-tier-dots .tracker-tier-dot");
  const l2Status = document.getElementById("l2-status");

  // Share area elements
  const shareTextarea = document.getElementById("share-textarea");
  const btnResetShareText = document.getElementById("btn-reset-share-text");
  const btnCopyText = document.getElementById("btn-copy-text");
  const btnLineShare = document.getElementById("btn-line-share");
  const btnFbShare = document.getElementById("btn-fb-share");

  // Toast
  const toastElement = document.getElementById("toast-notification");
  const toastMessageSpan = document.getElementById("toast-message");

  let countdownInterval = null;

  function getDaysLeft() {
    const now = new Date();
    const targetDate = new Date(TARGET_DEADLINE);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // --- INITIALIZATION ---
  function init() {
    setupEventListeners();
    startCountdownTimer();
    render();
  }

  function showToast(message) {
    if (!toastElement) return;
    toastMessageSpan.innerText = message;
    toastElement.classList.add("show");
    
    setTimeout(() => {
      toastElement.classList.remove("show");
    }, 2500);
  }

  // --- RENDERING STATE ---
  function render() {
    // 1. Lots Input
    if (lotsInput && document.activeElement !== lotsInput) {
      lotsInput.value = state.lots === 0 ? "" : state.lots;
    }

    const numericLots = Number(state.lots) || 0;

    // 3. Determine Tiers & Brackets
    let currentTierIndex = 0;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (numericLots >= tiers[i].threshold) {
        currentTierIndex = i;
        break;
      }
    }
    const currentTier = tiers[currentTierIndex];
    const isMaxTier = currentTierIndex === tiers.length - 1;
    const nextTier = isMaxTier ? null : tiers[currentTierIndex + 1];

    // Progress calculations
    let progressMin = 0;
    let progressMax = 800;
    let progressPercent = 0;

    if (numericLots < 800) {
      progressMin = 0;
      progressMax = 800;
      progressPercent = (numericLots / 800) * 100;
    } else if (isMaxTier) {
      progressMin = 10000;
      progressMax = 20000;
      progressPercent = 100;
    } else {
      const prevThreshold = currentTier.threshold;
      const nextThreshold = nextTier.threshold;
      progressMin = prevThreshold;
      progressMax = nextThreshold;
      progressPercent = ((numericLots - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
    }

    progressPercent = Math.max(0, Math.min(100, progressPercent));

    // 4. Update Progress Bar
    if (progressBarMin) progressBarMin.innerText = `${progressMin.toLocaleString()} 口`;
    if (progressBarMax) progressBarMax.innerText = `${progressMax.toLocaleString()} 口`;
    if (progressBarFilled) {
      progressBarFilled.style.width = `${progressPercent}%`;
    }

    // 5. Update status text
    if (numericLots >= 800) {
      if (bottleStatusText) {
        bottleStatusText.innerHTML = `當月已達標 <strong>${currentTier.threshold.toLocaleString()}</strong> 口門檻！🎉`;
      }
    } else {
      if (bottleStatusText) {
        bottleStatusText.innerText = "當月尚未達到最低門檻 (800 口)";
      }
    }
    if (bottleAccumulatedText) {
      bottleAccumulatedText.innerHTML = `目前累積：<span class="text-warning font-bold">${numericLots.toLocaleString()}</span> 口`;
    }

    // 6. Milestone Description text
    if (milestoneDescription) {
      if (!isMaxTier && nextTier) {
        milestoneDescription.innerHTML = `再交易 <strong class="text-amber-600 font-black fs-5 mx-1">${(nextTier.threshold - numericLots).toLocaleString()}</strong> 口，即可升級至 <strong class="text-amber-600 font-bold">${nextTier.threshold.toLocaleString()} 口</strong> 門檻，獲得 <span class="text-dark font-bold">${nextTier.label} (${nextTier.rewardGram} 克)</span>`;
      } else {
        milestoneDescription.innerHTML = `⭐ 恭喜您已達成最高 ${currentTier.threshold.toLocaleString()} 口門檻，獲得實體金豆 ${currentTier.rewardMace} 錢 (${currentTier.rewardGram} 克)！`;
      }
    }

    // 7. Consecutive Months Circle selector
    btnConsecutiveMonths.forEach((btn) => {
      const val = parseInt(btn.getAttribute("data-month"), 10);
      if (state.consecutiveMonths === val) {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    });

    // Sub-milestone lists lighting
    const milestoneGroups = [
      { nodes: l1Circles, target: 3 },
      { nodes: l2Circles, target: 6 },
    ];

    milestoneGroups.forEach(({ nodes, target }) => {
      nodes.forEach((circle) => {
        const val = parseInt(circle.getAttribute("data-num"), 10);
        if (state.consecutiveMonths >= val) {
          circle.classList.add("is-active");
        } else {
          circle.classList.remove("is-active");
        }
      });
    });
    
    if (l1Status) {
      const level1Needed = Math.max(0, 3 - state.consecutiveMonths);
      if (level1Needed > 0) {
        l1Status.innerHTML = `還差 <strong>${level1Needed}</strong> 個月解鎖升等獎勵`;
        l1Status.className = "tracker-tier-status";
      } else {
        l1Status.innerHTML = `⚡ 已達成升等條件！恭喜解鎖升等獎勵 🚀`;
        l1Status.className = "tracker-tier-status";
      }
    }

    if (l2Status) {
      const level2Needed = Math.max(0, 6 - state.consecutiveMonths);
      if (level2Needed > 0) {
        l2Status.innerHTML = `還差 <strong>${level2Needed}</strong> 個月解鎖升等獎勵`;
        l2Status.className = "tracker-tier-status";
      } else {
        l2Status.innerHTML = `🏆 已達成 6 個月目標！恭喜獲得專屬黃金訂製幣 🏆`;
        l2Status.className = "tracker-tier-status";
      }
    }

    // 8. Synchronize Share message text
    updateShareMessage();
  }

  // --- COUNTER LOGIC ---
  function getShareMessage() {
    const numericLots = Number(state.lots) || 0;
    let rewardText = "";
    if (numericLots < 800) {
      rewardText = "0.05 錢 (0.187 克) [達標衝刺中！]";
    } else if (numericLots >= 800 && numericLots < 1799) {
      rewardText = "實體金豆 0.1 錢 (0.375 克)";
    } else if (numericLots >= 1800 && numericLots < 3499) {
      rewardText = "實體金豆 1 克";
    } else {
      rewardText = "實體金豆 1 錢 (3.75 克)";
    }

    const daysLeft = getDaysLeft();

    return `各位！我把交易量變成了真黃金了！大推~永豐期貨交易 存黃金計畫！🤩

    這個月我的金豆種植進度大爆發，交易了 ${numericLots.toLocaleString()} 口！獲得${rewardText}！
    月底最後衝刺還有 ${daysLeft} 天，有興趣的朋友趕快一起加入吧~
    👉 點進去一起存黃金：${window.location.href}`;;
  }

  function getEffectiveShareText() {
    const editedText = state.editedShareMessage ?? "";
    if (editedText.trim()) {
      return editedText;
    }

    const generatedText = getShareMessage();
    if (shareTextarea) {
      shareTextarea.value = generatedText;
    }
    return generatedText;
  }

  function updateShareMessage() {
    if (state.editedShareMessage !== null) {
      if (shareTextarea) shareTextarea.value = state.editedShareMessage;
      return;
    }

    const msg = getShareMessage();

    if (shareTextarea) {
      shareTextarea.value = msg;
    }
  }

  // --- TICKING TIMER LOGIC ---
  function startCountdownTimer() {
    if (countdownInterval) clearInterval(countdownInterval);

    function tick() {
      const days = getDaysLeft();

      if (days <= 0) {
        if (countdownDaysSpan) countdownDaysSpan.innerText = "0";
        return;
      }

      // keep banner state synchronized
      if (countdownDaysSpan) {
        countdownDaysSpan.innerText = days;
      }

      // Update share message if not manually edited
      updateShareMessage();
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // 1. Lots Input text change
    if (lotsInput) {
      lotsInput.addEventListener("input", (e) => {
        const val = e.target.value;
        if (val === "") {
          state.lots = 0;
        } else {
          const num = parseInt(val, 10);
          state.lots = isNaN(num) ? 0 : Math.max(0, num);
        }
        render();
      });
    }

    // 3. Consecutive Months Selection
    btnConsecutiveMonths.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.getAttribute("data-month"), 10);
        state.consecutiveMonths = val;
        render();
      });
    });

    // 4. Customizing Share text
    if (shareTextarea) {
      shareTextarea.addEventListener("input", (e) => {
        state.editedShareMessage = e.target.value;
        if (btnResetShareText) btnResetShareText.classList.remove("d-none");
      });
    }

    // 5. Reset Share Text
    if (btnResetShareText) {
      btnResetShareText.addEventListener("click", () => {
        state.editedShareMessage = null;
        btnResetShareText.classList.add("d-none");
        render();
        showToast("已重設為系統生成文字");
      });
    }

    // 6. Copy action
    if (btnCopyText) {
      btnCopyText.addEventListener("click", () => {
        const text = getEffectiveShareText();
        navigator.clipboard.writeText(text).then(
          () => {
            showToast("複製成功！快分享給朋友吧 💛");
          },
          () => {
            showToast("複製失敗，請手動複製文字");
          }
        );
      });
    }

    // 7. LINE share action
    if (btnLineShare) {
      btnLineShare.addEventListener("click", () => {
        const text = getEffectiveShareText();
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
        window.open(lineUrl, "_blank");
      });
    }

    // 8. Facebook share action
    if (btnFbShare) {
      btnFbShare.addEventListener("click", () => {
        const text = getEffectiveShareText();
        
        // 先複製文字到剪貼簿
        navigator.clipboard.writeText(text).then(() => {
          // 彈出瀏覽器內建警告視窗，強制使用者觀看
          alert("【文案已為您複製！】\n\n即將前往 Facebook，請在發文框內「點右鍵貼上」（或按 Ctrl+V / ⌘+V）即可顯示精彩文案 💛");
          // 使用者點選確定後，才會執行到這裏，開啟 Facebook
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
          )}`;
          window.open(fbUrl, "_blank");
        }).catch(() => {
          // 複製失敗的防呆
          alert("複製失敗，請手動複製分享區的文字再行分享。");
        });
      });
    }
  }

  // Run initial setup
  init();
});
