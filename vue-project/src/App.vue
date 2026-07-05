<template>
  <div class="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="brand-group">
          <!-- Hải Phòng Gift -->
          <div
            class="brand-item"
            :class="{ active: currentTab === 'HaiPhongGift' }"
            @click="goHaiPhongGift"
          >
            <img :src="logoHpg" class="header-logo" />
          </div>

          <div class="brand-divider"></div>

          <!-- Bảo Lợi -->
          <div
            class="brand-item"
            :class="{ active: currentTab === 'BaoLoi' }"
            @click="goBaoLoi"
          >
            <img :src="logoBlc" class="header-logo" />
          </div>
        </div>
      </div>
    </header>

    <!-- Nội dung -->
    <main class="main-content">
      <!-- Hải Phòng Gift -->
      <div v-if="currentTab === 'HaiPhongGift'">
        <component
          :is="currentViewComponent"
          :key="viewKey"
          :campaignId="selectedCampaignId"
          :orderData="selectedOrderData"
          @navigate="handleNavigation"
        />
      </div>

      <!-- Bảo Lợi -->
      <div v-else-if="currentTab === 'BaoLoi'" class="placeholder-tab">
        <div class="empty-state">
          <h3>Chức năng Bảo Lợi</h3>
          <p>Phần mềm đang được phát triển theo lộ trình giai đoạn 2.</p>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";

// ===== Logo =====
import logoHpg from "./assets/logo-hpg.png";
import logoBlc from "./assets/logo-blc.png";

// ===== Components =====
import DanhSach from "./components/HaiPhongGift/DanhSach.vue";
import ThemChienDich from "./components/HaiPhongGift/ThemChienDich.vue";
import ChiTiet from "./components/HaiPhongGift/ChiTiet.vue";
import ThemDonHang from "./components/HaiPhongGift/ThemDonHang.vue";
import SuaDonHang from "./components/HaiPhongGift/SuaDonHang.vue";

// ======================
// State
// ======================

const currentTab = ref("HaiPhongGift");
const currentView = ref("DanhSach");

const selectedCampaignId = ref(null);
const selectedOrderData = ref(null);

// Key dùng để ép Vue render lại component
const viewKey = ref(0);

// ======================
// Map Component
// ======================

const componentsMap = {
  DanhSach,
  ThemChienDich,
  ChiTiet,
  ThemDonHang,
  SuaDonHang,
};

const currentViewComponent = computed(() => {
  return componentsMap[currentView.value];
});

// ======================
// Điều hướng giữa các component
// ======================

function handleNavigation({ view, campaignId, orderData }) {
  currentView.value = view;

  if (campaignId !== undefined) {
    selectedCampaignId.value = campaignId;
  }

  if (orderData !== undefined) {
    selectedOrderData.value = orderData;
  }
}

// ======================
// Click Logo Hải Phòng Gift
// ======================

function goHaiPhongGift() {
  if (currentTab.value === "HaiPhongGift") {
    // Đang ở HPG -> quay về Danh sách và reload
    currentView.value = "DanhSach";
    selectedCampaignId.value = null;
    selectedOrderData.value = null;

    viewKey.value++;
  } else {
    // Đang ở Bảo Lợi -> chuyển sang HPG
    currentTab.value = "HaiPhongGift";

    currentView.value = "DanhSach";
    selectedCampaignId.value = null;
    selectedOrderData.value = null;

    viewKey.value++;
  }
}

// ======================
// Click Logo Bảo Lợi
// ======================

function goBaoLoi() {
  if (currentTab.value === "BaoLoi") {
    // Sau này nếu có component của BLC thì chỉ cần reset tương tự
    viewKey.value++;
  } else {
    currentTab.value = "BaoLoi";
    viewKey.value++;
  }
}
</script>
<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ================= HEADER ================= */

.app-header {
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0.75rem 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
}

.header-logo {
  height: 45px;
  object-fit: contain;
  display: block;
}

.avatar-circle {
  width: 35px;
  height: 35px;

  border-radius: 50%;

  background: var(--primary);
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 600;
  font-size: 0.9rem;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

/* ================= LOGO MENU ================= */

.logo-tab:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
}

.logo-tab.active {
  border-color: var(--primary);
  background: rgba(0, 123, 255, 0.08);
}

/* ================= CONTENT ================= */

.main-content {
  flex: 1;

  max-width: 1400px;
  width: 100%;

  margin: 0 auto;
  padding: 2rem;
}

/* ================= PLACEHOLDER ================= */

.placeholder-tab {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 350px;
}

.empty-state {
  background: #fff;
  border: 1px solid var(--border-color);

  border-radius: 10px;

  padding: 3rem;

  text-align: center;

  max-width: 500px;

  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.empty-state h3 {
  margin-bottom: 12px;
  color: var(--text-dark);
}

.empty-state p {
  color: var(--text-main);
  line-height: 1.6;
}
.brand-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand-item {
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.25s;
  border: 2px solid transparent;
}

.brand-item:hover {
  background: #f8f9fb;
  transform: translateY(-2px);
}

.brand-item.active {
  border-color: var(--primary);
  background: #eef5ff;
}

.brand-divider {
  width: 1px;
  height: 36px;
  background: #ddd;
}

.header-logo {
  height: 42px;
  display: block;
  object-fit: contain;
}
</style>
