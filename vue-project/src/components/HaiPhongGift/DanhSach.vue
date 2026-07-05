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
                <img
                  v-if="item.coverImage"
                  :src="item.coverImage"
                  alt="Cover"
                />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["navigate"]);
const campaigns = ref([]);

const fetchCampaigns = async () => {
  try {
    const res = await fetch(
      "https://portfolio-api-1x58.onrender.com/campaigns",
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
/* Style Card và Bảng chuẩn Enterprise */
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
</style>
