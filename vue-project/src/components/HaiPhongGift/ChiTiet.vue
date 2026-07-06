<template>
  <div>
    <!-- Back to top bar -->
    <div class="back-bar" @click="$emit('navigate', { view: 'DanhSach' })">
      ← Quay lại
    </div>

    <div class="card" id="pdf-report-content">
      <div class="card-header no-pdf-hide">
        <div>
          <span class="subtitle">CHI TIẾT</span>
        </div>
        <div class="actions-group">
          <button class="btn btn-secondary" @click="exportToPDF">
            Báo cáo
          </button>
          <button class="btn btn-primary" @click="goToCreateOrder">
            Tạo đơn
          </button>
        </div>
      </div>

      <div class="search-box no-pdf-hide">
        <input
          type="text"
          class="form-control search-input"
          v-model="searchQuery"
          placeholder="Tìm kiếm"
        />
      </div>

      <!-- Bảng danh sách đơn hàng -->
      <div class="table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Sản phẩm & Phân loại</th>
              <th style="text-align: center">Tổng số lượng</th>
              <th style="text-align: right">Tổng tiền</th>
              <th>Ngày chốt</th>
              <th>Ngày giao</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
              <th class="no-pdf-hide" style="text-align: center; width: 220px">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="font-semibold">{{ order.customerName }}</td>
              <td>{{ order.phone }}</td>
              <td class="address-cell">{{ order.address }}</td>
              <td>
                <div
                  v-for="(item, i) in order.items"
                  :key="i"
                  class="item-desc"
                >
                  • {{ item.productName }} ({{ item.classificationName }}) x{{
                    item.quantity
                  }}
                </div>
              </td>
              <td style="text-align: center">{{ getTotalQty(order) }}</td>
              <td style="text-align: right" class="font-semibold text-dark">
                {{ order.totalPrice.toLocaleString() }}đ
              </td>
              <td>{{ order.orderDate }}</td>
              <td>{{ order.deliveryDate }}</td>
              <td>
                <div class="note-cell-wrapper">
                  <span class="note-text-snippet" :title="order.note">{{
                    order.note || "---"
                  }}</span>

                  <!-- ĐÃ ĐIỀU CHỈNH: Trở thành link ảnh thông minh, click trái xem nhanh, click phải hiện menu Chrome -->
                  <a
                    v-if="order.noteImage"
                    :href="order.noteImage"
                    class="image-indicator-badge"
                    @click.prevent="previewImage = order.noteImage"
                    style="cursor: pointer; text-decoration: none"
                    title="Click chuột trái để xem lớn"
                  >
                    🖼️ Ảnh
                  </a>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :class="
                    order.status === 'Đã hoàn thành'
                      ? 'badge-success'
                      : 'badge-warning'
                  "
                >
                  {{ order.status }}
                </span>
              </td>
              <td class="no-pdf-hide" style="text-align: center">
                <div class="table-actions">
                  <!-- ĐƠN HÀNG CHƯA HOÀN THÀNH: Hiện Sửa, Xoá, Hoàn thành -->
                  <template v-if="order.status !== 'Đã hoàn thành'">
                    <button class="action-link" @click="editOrder(order)">
                      Sửa
                    </button>
                    <button
                      class="action-link delete"
                      @click="deleteOrder(order.id)"
                    >
                      Xoá
                    </button>
                    <button
                      class="action-link success"
                      @click="completeOrder(order)"
                    >
                      Hoàn thành
                    </button>
                  </template>

                  <!-- ĐƠN HÀNG ĐÃ HOÀN THÀNH: Ẩn Sửa, chỉ hiện Chi tiết và Xoá (giao diện đồng bộ) -->
                  <template v-else>
                    <button
                      class="action-link info-link"
                      @click="openPreviewModal(order)"
                    >
                      Chi tiết
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td
                colspan="11"
                style="text-align: center; padding: 3rem; color: #94a3b8"
              >
                Không tìm thấy đơn hàng phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL XEM TRƯỚC CHI TIẾT ĐƠN HÀNG (POPUP) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closePreviewModal">
      <div class="modal-window">
        <div class="modal-header">
          <h3>Chi tiết đơn</h3>
          <button class="close-modal-btn" @click="closePreviewModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col form-group">
              <label class="form-label-view">Tên khách hàng</label>
              <div class="view-box-text">{{ selectedOrder?.customerName }}</div>
            </div>
            <div class="col form-group">
              <label class="form-label-view">Số điện thoại</label>
              <div class="view-box-text">
                {{ selectedOrder?.phone || "---" }}
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label-view">Địa chỉ</label>
            <div class="view-box-text">
              {{ selectedOrder?.address || "---" }}
            </div>
          </div>

          <!-- Danh sách sản phẩm chi tiết -->
          <div class="items-section-view">
            <h4
              style="margin-bottom: 0.75rem; font-size: 0.9rem; color: #334155"
            >
              Chi tiết đơn
            </h4>
            <table class="modal-inner-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th style="text-align: right">Giá</th>
                  <th style="text-align: center">Số lượng</th>
                  <th style="text-align: right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedOrder?.items" :key="idx">
                  <td>
                    <b>{{ item.productName }}</b>
                  </td>
                  <td>{{ item.classificationName }}</td>
                  <td style="text-align: right">
                    {{ item.price?.toLocaleString() }}đ
                  </td>
                  <td style="text-align: center">{{ item.quantity }}</td>
                  <td style="text-align: right">
                    <b>{{ (item.price * item.quantity).toLocaleString() }}đ</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="row" style="margin-top: 1rem">
            <div class="col form-group">
              <label class="form-label-view">Ngày chốt</label>
              <div class="view-box-text">{{ selectedOrder?.orderDate }}</div>
            </div>
            <div class="col form-group">
              <label class="form-label-view">Ngày giao</label>
              <div class="view-box-text">
                {{ selectedOrder?.deliveryDate || "---" }}
              </div>
            </div>
          </div>

          <!-- Khối hiển thị Ghi chú và Ảnh song song -->
          <div style="display: flex; gap: 1rem; margin-top: 1rem">
            <div style="flex: 1">
              <label class="form-label-view">Ghi chú</label>
              <div class="view-box-text text-area-view">
                {{ selectedOrder?.note || "Không có ghi chú." }}
              </div>
            </div>
            <div style="flex: 1">
              <label class="form-label-view">Ảnh</label>
              <div class="view-box-img">
                <img
                  v-if="selectedOrder?.noteImage"
                  :src="selectedOrder.noteImage"
                  alt="Bằng chứng đơn hàng"
                  class="modal-preview-img"
                />
                <span v-else style="color: #94a3b8; font-size: 0.85rem"
                  >Không có hình ảnh đính kèm.</span
                >
              </div>
            </div>
          </div>

          <div class="total-display-view">
            <span>TỔNG TIỀN:</span>
            <span class="price-big-view"
              >{{ selectedOrder?.totalPrice.toLocaleString() }} đ</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP XEM TRƯỚC ẢNH KHI TRỎ VÀO CHỮ ẢNH (Đúng chuẩn thẻ đóng cấu trúc DOM) -->
    <div
      v-if="previewImage"
      class="image-preview-overlay"
      @click="previewImage = ''"
    >
      <div class="preview-content" @click.stop>
        <img :src="previewImage" alt="Preview Order Note" />
        <button class="btn-close-preview" @click="previewImage = ''">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import html2pdf from "html2pdf.js";

const props = defineProps(["campaignId"]);
const emit = defineEmits(["navigate"]);

const campaign = ref(null);
const orders = ref([]);
const searchQuery = ref("");

const showModal = ref(false);
const selectedOrder = ref(null);

// ĐÃ THÊM: State quản lý mở ảnh xem trước
const previewImage = ref("");

const fetchData = async () => {
  try {
    const campRes = await fetch(
      `https://portfolio-api-cirb.onrender.com/campaigns/${props.campaignId}`,
    );
    campaign.value = await campRes.json();
    const orderRes = await fetch(
      `https://portfolio-api-cirb.onrender.com/orders?campaignId=${props.campaignId}`,
    );
    orders.value = await orderRes.json();
  } catch (error) {
    console.error(error);
  }
};

const getTotalQty = (order) =>
  order.items.reduce((sum, i) => sum + i.quantity, 0);

const filteredOrders = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return orders.value;
  return orders.value.filter(
    (o) =>
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.address.toLowerCase().includes(q),
  );
});

const goToCreateOrder = () => {
  emit("navigate", { view: "ThemDonHang", campaignId: props.campaignId });
};
const editOrder = (order) => {
  emit("navigate", {
    view: "SuaDonHang",
    campaignId: props.campaignId,
    orderData: order,
  });
};

const openPreviewModal = (order) => {
  selectedOrder.value = order;
  showModal.value = true;
};
const closePreviewModal = () => {
  showModal.value = false;
  selectedOrder.value = null;
};

const completeOrder = async (order) => {
  try {
    const res = await fetch(
      `https://portfolio-api-cirb.onrender.com/orders/${order.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Đã hoàn thành" }),
      },
    );
    if (res.ok) fetchData();
  } catch (error) {
    console.error(error);
  }
};

const deleteOrder = async (id) => {
  if (!confirm("Xác nhận xoá đơn hàng này?")) return;
  try {
    const res = await fetch(
      `https://portfolio-api-cirb.onrender.com/orders/${id}`,
      {
        method: "DELETE",
      },
    );
    if (res.ok) fetchData();
  } catch (error) {
    console.error(error);
  }
};

const exportToPDF = () => {
  const element = document.getElementById("pdf-report-content");
  const options = {
    margin: 10,
    filename: `Báo cáo ${campaign.value?.name || "Chiến dịch"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      ignoreElements: (el) => el.classList.contains("no-pdf-hide"),
    },
    jsPDF: { unit: "mm", format: "a3", orientation: "landscape" },
  };
  html2pdf().set(options).from(element).save();
};

onMounted(fetchData);
</script>

<style scoped>
.back-bar {
  margin-bottom: 1rem;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}
.card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.subtitle {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1px;
}
.card-header h2 {
  font-size: 1.25rem;
  color: var(--text-dark);
  margin-top: 0.25rem;
}
.actions-group {
  display: flex;
  gap: 0.75rem;
}
.search-box {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid var(--border-color);
}
.search-input {
  background-color: #fff;
}
.table-container {
  overflow-x: auto;
}
.premium-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.premium-table th {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid var(--border-color);
}
.premium-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}
.address-cell {
  max-width: 160px;
  white-space: normal;
  word-wrap: break-word;
}
.item-desc {
  font-size: 0.8rem;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
}
.badge-success {
  background: #ecfdf5;
  color: var(--success);
}
.badge-warning {
  background: #fffbeb;
  color: var(--warning);
}

/* ĐỒNG BỘ GIAO DIỆN CÁC NÚT BẤM (LINK ACTION) */
.table-actions {
  display: flex;
  gap: 0.85rem;
  justify-content: center;
  align-items: center;
}
.action-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}
.action-link:hover {
  text-decoration: underline;
}
.action-link.delete {
  color: var(--danger);
}
.action-link.success {
  color: var(--success);
}
.action-link.info-link {
  color: #475569;
}

.note-cell-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 140px;
}
.note-text-snippet {
  font-size: 0.8rem;
  color: #475569;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
.image-indicator-badge {
  display: inline-block;
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.75rem;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 500;
  width: fit-content;
  transition: all 0.2s ease;
}
.image-indicator-badge:hover {
  background: #dbeafe;
  transform: translateY(-1px);
}

/* MODAL PREVIEW */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}
.modal-window {
  background: #fff;
  width: 100%;
  max-width: 760px;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}
.modal-header h3 {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
}
.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #94a3b8;
  cursor: pointer;
}
.close-modal-btn:hover {
  color: #ef4444;
}
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}
.row {
  display: flex;
  gap: 1rem;
}
.col {
  flex: 1;
}
.form-group {
  margin-bottom: 1rem;
}
.form-label-view {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
  display: block;
}
.view-box-text {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #334155;
  min-height: 38px;
}
.text-area-view {
  height: 110px;
  overflow-y: auto;
  white-space: pre-wrap;
}
.items-section-view {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
}
.modal-inner-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}
.modal-inner-table th {
  background: #f1f5f9;
  padding: 0.5rem 0.75rem;
  color: #475569;
  font-weight: 600;
  text-align: left;
}
.modal-inner-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}
.view-box-img {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  overflow: hidden;
}
.modal-preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.total-display-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  margin-top: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}
.price-big-view {
  font-size: 1.25rem;
  color: var(--primary, #2563eb);
}

/* ĐÃ BỔ SUNG: CSS CHO OVERLAY PREVIEW ẢNH NỐI BẬT LÊN TRÊN HẾT */
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
  z-index: 10005; /* Đảm bảo z-index cao hơn hẳn z-index 9999 của Modal Chi tiết */
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
