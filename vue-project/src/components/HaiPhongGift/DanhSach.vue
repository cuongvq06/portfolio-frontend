<template>
  <div class="card">
    <div class="card-header">
      <h2>Danh sách</h2>
      <button
        class="btn btn-primary"
        @click="$emit('navigate', { view: 'ThemChienDich' })"
      >
        Thêm chương trình
      </button>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th style="width: 120px">Ảnh bìa</th>
            <th>Tên chương trình</th>
            <th>Thời gian triển khai</th>
            <th>Tình trạng</th>
            <th style="width: 150px; text-align: center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in campaigns" :key="item.id">
            <td>
              <div class="cover-thumb">
                <!-- Click chuột trái mở preview, chặn chuyển hướng mặc định; click phải hiện menu Chrome -->
                <a
                  v-if="item.coverImage"
                  :href="item.coverImage"
                  @click.prevent="openPreview(item.coverImage)"
                  title="Click chuột trái để xem lớn"
                >
                  <img :src="item.coverImage" alt="Cover" />
                </a>
                <div v-else class="no-img">No Img</div>
              </div>
            </td>
            <td class="font-semibold text-dark">{{ item.name }}</td>
            <td>{{ item.startDate }} ~ {{ item.endDate }}</td>
            <td>
              <span
                class="badge"
                :class="
                  item.status === 'Đang triển khai'
                    ? 'badge-success'
                    : 'badge-secondary'
                "
              >
                {{ item.status }}
              </span>
            </td>
            <td style="text-align: center">
              <button
                class="btn btn-secondary btn-sm"
                @click="viewDetail(item.id)"
              >
                Chi tiết
              </button>
            </td>
          </tr>
          <tr v-if="campaigns.length === 0">
            <td
              colspan="5"
              style="text-align: center; padding: 3rem; color: #94a3b8"
            >
              Chưa có dữ liệu .
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ĐÃ BỔ SUNG: KHỐI HTML HIỂN THỊ POPUP PHÓNG TO ẢNH -->
    <div
      v-if="previewImage"
      class="image-preview-overlay"
      @click="previewImage = ''"
    >
      <div class="preview-content" @click.stop>
        <img :src="previewImage" alt="Preview" />
        <button class="btn-close-preview" @click="previewImage = ''">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["navigate"]);
const campaigns = ref([]);

// ĐÃ BỔ SUNG: State và hàm quản lý hiển thị ảnh phóng to
const previewImage = ref("");
const openPreview = (imgUrl) => {
  if (imgUrl) {
    previewImage.value = imgUrl;
  }
};

const fetchCampaigns = async () => {
  try {
    const res = await fetch(
      "https://portfolio-api-cirb.onrender.com/campaigns",
    );
    campaigns.value = await res.json();
  } catch (error) {
    console.error("Lỗi kết nối API:", error);
  }
};

const viewDetail = (id) => {
  emit("navigate", { view: "ChiTiet", campaignId: id });
};

onMounted(fetchCampaigns);
</script>

<style scoped>
/* Toàn bộ CSS gốc của bạn giữ nguyên */
.card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h2 {
  font-size: 1.25rem;
  color: var(--text-dark);
  font-weight: 600;
}
.table-container {
  overflow-x: auto;
}
.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}
.premium-table th {
  background-color: #f8fafc;
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid var(--border-color);
}
.premium-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}
.cover-thumb {
  width: 80px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f1f5f9;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}
.cover-thumb:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.cover-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-img {
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: center;
  line-height: 48px;
}
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
}
.badge-success {
  background-color: #ecfdf5;
  color: var(--success);
}
.badge-secondary {
  background-color: #f1f5f9;
  color: #64748b;
}
.font-semibold {
  font-weight: 600;
}
.text-dark {
  color: var(--text-dark);
}
.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
}

/* ĐÃ BỔ SUNG: CSS ĐỂ DỰNG POPUP XEM TRƯỚC MƯỢT MÀ */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10005;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.18s ease-out;
}
.preview-content {
  position: relative;
  max-width: 85%;
  max-height: 85%;
  background: #fff;
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}
.preview-content img {
  max-width: 100%;
  max-height: 75vh;
  border-radius: 4px;
  display: block;
  object-fit: contain;
}
.btn-close-preview {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 28px;
  height: 28px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background 0.2s;
}
.btn-close-preview:hover {
  background: #dc2626;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
