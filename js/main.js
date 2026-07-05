// Initialize Lucide Icons
lucide.createIcons();
// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
  const isOpen = mobileMenu.classList.contains('active');
  // Toggle icon between menu and x
  if (isOpen) {
    menuIcon.setAttribute('data-lucide', 'x');
  } else {
    menuIcon.setAttribute('data-lucide', 'menu');
  }
  lucide.createIcons();
});
// Smooth Scrolling with Offset
const navLinks = document.querySelectorAll('.nav-link-scroll');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const offset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // Close mobile menu if open
    mobileMenu.classList.remove('active');
    menuIcon.setAttribute('data-lucide', 'menu');
    lucide.createIcons();
  });
});
// Simple Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate__animated', 'animate__fadeInUp');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// --- Calculator Widget ("我現在差多少口？") ---
document.addEventListener('DOMContentLoaded', () => {
  const lotsInput = document.getElementById('lots-input');
  const lotsStatusText = document.getElementById('lots-status-text');
  const lotsProgressBar = document.getElementById('lots-progress-bar');
  const lotsProgressMin = document.getElementById('lots-progress-min');
  const lotsProgressMax = document.getElementById('lots-progress-max');
  const lotsRemainingMsg = document.getElementById('lots-remaining-msg');
  const daysLeftCount = document.getElementById('days-left-count');
  const monthPicker = document.getElementById('month-picker');
  const shareText = document.getElementById('share-text');
  const btnCopy = document.getElementById('btn-copy');
  const btnShareLine = document.getElementById('btn-share-line');
  const btnShareFb = document.getElementById('btn-share-fb');

  if (!lotsInput) return;

  // Calculate days left in current month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = lastDay - now.getDate();
  daysLeftCount.textContent = daysLeft > 0 ? daysLeft : 0;

  let selectedMonthCount = 0;

  // Define thresholds from Plan 5
  // 800 口以上, 1,500 口以上, 3,500 口以上
  const thresholds = [
    { limit: 800, next: 1500, prize: "金豆 1 克", detail: "金豆 0.05 錢 (0.187 克)" },
    { limit: 1500, next: 3500, prize: "金豆 1.68 克", detail: "金豆 0.05 錢 (0.187 克)" },
    { limit: 3500, next: null, prize: "元寶 0.5 錢", detail: "元寶 0.5 錢 (1.875 克)" }
  ];

  function updateCalculator() {
    const val = parseInt(lotsInput.value) || 0;
    
    let statusIcon = "🧴";
    let statusText = "當月尚未達到最低門檻 (800 口)";
    
    if (val < 800) {
      statusIcon = "🧴";
      statusText = "當月尚未達到最低門檻 (800 口)";
      lotsProgressMin.textContent = "0 口";
      lotsProgressMax.textContent = "800 口";
      const percent = Math.min(100, (val / 800) * 100);
      lotsProgressBar.style.width = percent + "%";
      
      lotsRemainingMsg.innerHTML = `再交易 <span class="text-red-500 text-base md:text-lg font-extrabold">${800 - val}</span> 口，<br>即可升級至 800 口門檻，獲得金豆 0.05 錢 (0.187 克)`;
    } else if (val >= 800 && val < 1500) {
      statusIcon = "🌱";
      statusText = "已達到 800 口門檻";
      lotsProgressMin.textContent = "800 口";
      lotsProgressMax.textContent = "1,500 口";
      const percent = Math.min(100, ((val - 800) / (1500 - 800)) * 100);
      lotsProgressBar.style.width = percent + "%";
      
      lotsRemainingMsg.innerHTML = `再交易 <span class="text-red-500 text-base md:text-lg font-extrabold">${1500 - val}</span> 口，<br>即可升級至 1,500 口門檻，獲得金豆 0.05 錢 (0.187 克)`;
    } else if (val >= 1500 && val < 3500) {
      statusIcon = "🌿";
      statusText = "已達到 1,500 口門檻";
      lotsProgressMin.textContent = "1,500 口";
      lotsProgressMax.textContent = "3,500 口";
      const percent = Math.min(100, ((val - 1500) / (3500 - 1500)) * 100);
      lotsProgressBar.style.width = percent + "%";
      
      lotsRemainingMsg.innerHTML = `再交易 <span class="text-red-500 text-base md:text-lg font-extrabold">${3500 - val}</span> 口，<br>即可升級至 3,500 口門檻，獲得元寶 0.5 錢 (1.875 克)`;
    } else {
      statusIcon = "👑";
      statusText = "恭喜！已達到最高門檻 3,500 口以上";
      lotsProgressMin.textContent = "3,500 口";
      lotsProgressMax.textContent = "3,500+ 口";
      lotsProgressBar.style.width = "100%";
      
      lotsRemainingMsg.innerHTML = `<span class="text-green-600 text-sm md:text-base font-extrabold">您已達到最高門檻！持續交易累積更多財富！</span>`;
    }
    
    const iconSpan = document.querySelector('#lots-status span:first-child');
    if (iconSpan) iconSpan.textContent = statusIcon;
    if (lotsStatusText) lotsStatusText.textContent = statusText;

    updateShareText(val);
  }

  function updateShareText(lots) {
    let prizeDesc = "";
    if (lots >= 3500) {
      prizeDesc = "獲得實體元寶 0.5 錢 (1.875 克) ！";
    } else if (lots >= 1500) {
      prizeDesc = "獲得實體金豆 1.68 克！";
    } else if (lots >= 800) {
      prizeDesc = "獲得實體金豆 1 克！";
    }

    let consecutiveText = "";
    if (selectedMonthCount > 0) {
      consecutiveText = `，累計連續達標 ${selectedMonthCount} 個月`;
    }

    const prizeLine = prizeDesc ? `${prizeDesc}\n` : "";

    shareText.value = `各位！我把交易量變成了真黃金了！大推~永豐期貨交易 存黃金計畫！😜

這個月我的金豆種植進度大爆發，交易了 ${lots.toLocaleString()} 口${consecutiveText}！${prizeLine}月底最後衝刺還有 ${daysLeftCount.textContent} 天，有興趣的朋友趕快一起加入吧~
👉 點進去一起存黃金：[點我了解更多：永豐期貨交易 存黃金計畫]`;
  }

  // Month picker event handlers
  const monthBtns = monthPicker.querySelectorAll('.month-btn');
  monthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      monthBtns.forEach(b => {
        b.classList.remove('active', 'bg-[#FCD34D]', 'text-blue-950');
        b.classList.add('bg-white', 'text-gray-500');
      });
      btn.classList.add('active', 'bg-[#FCD34D]', 'text-blue-950');
      btn.classList.remove('bg-white', 'text-gray-500');
      
      selectedMonthCount = parseInt(btn.getAttribute('data-month')) || 0;
      updateMonthsDisplay();
      updateCalculator();
    });
  });

  function updateMonthsDisplay() {
    // 3-month badges
    const badges3 = document.querySelectorAll('#badges-3month .badge-item');
    badges3.forEach((badge, idx) => {
      if (idx < selectedMonthCount) {
        badge.classList.add('bg-[#F59E0B]', 'border-[#F59E0B]', 'text-white');
        badge.classList.remove('bg-white', 'text-gray-400', 'border-gray-200');
      } else {
        badge.classList.remove('bg-[#F59E0B]', 'border-[#F59E0B]', 'text-white');
        badge.classList.add('bg-white', 'text-gray-400', 'border-gray-200');
      }
    });
    const msg3 = document.getElementById('msg-3month');
    if (selectedMonthCount >= 3) {
      msg3.textContent = "🎉 恭喜！已解鎖連續 3 個月升等獎勵！";
      msg3.classList.remove('text-red-500');
      msg3.classList.add('text-green-600');
    } else {
      msg3.textContent = `還差 ${3 - selectedMonthCount} 個月解鎖升等獎勵`;
      msg3.classList.add('text-red-500');
      msg3.classList.remove('text-green-600');
    }

    // 6-month badges
    const badges6 = document.querySelectorAll('#badges-6month .badge-item');
    badges6.forEach((badge, idx) => {
      if (idx < selectedMonthCount) {
        badge.classList.add('bg-[#B45309]', 'border-[#B45309]', 'text-white');
        badge.classList.remove('bg-white', 'text-gray-400', 'border-gray-200');
      } else {
        badge.classList.remove('bg-[#B45309]', 'border-[#B45309]', 'text-white');
        badge.classList.add('bg-white', 'text-gray-400', 'border-gray-200');
      }
    });
    const msg6 = document.getElementById('msg-6month');
    if (selectedMonthCount >= 6) {
      msg6.textContent = "🎉 恭喜！已解鎖連續 6 個月升等專屬訂製幣！";
      msg6.classList.remove('text-red-500');
      msg6.classList.add('text-green-600');
    } else {
      msg6.textContent = `還差 ${6 - selectedMonthCount} 個月解鎖升等獎勵`;
      msg6.classList.add('text-red-500');
      msg6.classList.remove('text-green-600');
    }
  }

  lotsInput.addEventListener('input', updateCalculator);

  // Initial run
  lotsInput.value = "";
  updateCalculator();
  updateMonthsDisplay();

  // Copy to clipboard
  btnCopy.addEventListener('click', () => {
    shareText.select();
    document.execCommand('copy');
    alert('已複製分享內容至剪貼簿！');
  });

  // LINE Share
  btnShareLine.addEventListener('click', () => {
    const text = encodeURIComponent(shareText.value);
    window.open(`https://social-plugins.line.me/lineit/share?url=${text}`, '_blank');
  });

  // FB Share
  btnShareFb.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  });
});