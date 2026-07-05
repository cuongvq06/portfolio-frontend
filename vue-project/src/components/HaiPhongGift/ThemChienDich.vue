<template>
  <div class="card form-card">
    <div class="card-body">
      <!-- Trường Tên chiến dịch -->
      <div class="form-group">
        <label class="form-label">Tên chương trình</label>
        <input type="text" class="form-control" v-model="form.name" />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>

      <!-- Khung Ngày tháng -->
      <div class="row">
        <div class="col font-group">
          <label class="form-label">Ngày bắt đầu</label>
          <input type="date" class="form-control" v-model="form.startDate" />
        </div>
        <div class="col font-group">
          <label class="form-label">Ngày kết thúc</label>
          <input type="date" class="form-control" v-model="form.endDate" />
        </div>
      </div>

      <!-- Quản lý cấu trúc Sản phẩm & Phân loại -->
      <div class="products-section">
        <div class="section-title">
          <h3>Sản phẩm</h3>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="addProduct"
          >
            Thêm Sản phẩm
          </button>
        </div>

        <div
          v-for="(prod, pIdx) in form.products"
          :key="pIdx"
          class="product-block"
        >
          <div class="product-row">
            <div class="flex-1">
              <label class="form-label">Tên sản phẩm</label>
              <input
                type="text"
                class="form-control"
                v-model="prod.productName"
              />
            </div>
            <button type="button" class="btn-del" @click="removeProduct(pIdx)">
              Xoá
            </button>
          </div>

          <div class="classifications-box">
            <div class="class-header">
              <span class="form-label-sub">Phân loại</span>
              <button
                type="button"
                class="btn-add-sub"
                @click="addClassification(pIdx)"
              >
                Thêm phân loại
              </button>
            </div>
            <div
              v-for="(cls, cIdx) in prod.classifications"
              :key="cIdx"
              class="class-row"
            >
              <input
                type="text"
                class="form-control flex-2"
                v-model="cls.name"
              />
              <input
                type="number"
                class="form-control flex-1"
                v-model.number="cls.price"
              />
              <button
                type="button"
                class="btn-del-sub"
                @click="removeClassification(pIdx, cIdx)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Khu vực Paste Ảnh thông minh -->
      <div class="form-group margin-top">
        <label class="form-label">Ảnh bìa</label>
        <div class="paste-zone" @paste="handlePaste" tabindex="0">
          <img
            v-if="form.coverImage"
            :src="form.coverImage"
            class="preview-img"
            alt="Preview"
          />
          <div v-else class="paste-placeholder"></div>
        </div>
      </div>

      <!-- Chức năng lưu -->
      <div class="form-actions">
        <button
          class="btn btn-secondary"
          @click="$emit('navigate', { view: 'DanhSach' })"
        >
          Huỷ bỏ
        </button>
        <button class="btn btn-primary" @click="submitForm">
          Tạo chương trình
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["navigate"]);

const form = ref({
  name: "",
  startDate: "",
  endDate: "",
  status: "Đang triển khai",
  coverImage: "",
  products: [
    {
      productName: "",
      classifications: [{ name: "", price: 0 }],
    },
  ],
});

const errors = ref({ name: "" });

const addProduct = () => {
  form.value.products.push({
    productName: "",
    classifications: [{ name: "", price: 0 }],
  });
};
const removeProduct = (idx) => {
  form.value.products.splice(idx, 1);
};
const addClassification = (pIdx) => {
  form.value.products[pIdx].classifications.push({ name: "", price: 0 });
};
const removeClassification = (pIdx, cIdx) => {
  form.value.products[pIdx].classifications.splice(cIdx, 1);
};

// Xử lý sự kiện Ctrl + V dán ảnh bóc dữ liệu chuỗi base64 hoặc URL trực tiếp
const handlePaste = (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === "file" && item.type.indexOf("image/") !== -1) {
      const blob = item.getAsFile();
      const reader = new FileReader();

      reader.onload = (event) => {
        // Tạo đối tượng ảnh ngầm để xử lý nén kích thước
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Giới hạn chiều rộng ảnh tối đa là 800px để giảm dung lượng
          const MAX_WIDTH = 600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Nén chất lượng xuống 60% -> File ảnh sẽ tự động giảm xuống dưới 50KB
          form.value.coverImage = canvas.toDataURL("image/jpeg", 0.4);
        };
      };
      reader.readAsDataURL(blob);
    } else if (item.kind === "string" && item.type === "text/plain") {
      item.getAsString((text) => {
        if (
          text.match(/\.(jpeg|jpg|gif|png|webp)$/) != null ||
          text.startsWith("http")
        ) {
          form.value.coverImage = text;
        }
      });
    }
  }
};

const submitForm = async () => {
  errors.value.name = "";
  if (!form.value.name.trim()) {
    errors.value.name = "Tên chiến dịch bắt buộc phải nhập.";
    return;
  }

  try {
    // 1. Lấy danh sách chiến dịch hiện tại để tính toán mã tăng dần
    const resExist = await fetch(
      "https://portfolio-api-1x58.onrender.com/campaigns",
    );
    const existingCampaigns = await resExist.json();

    let nextId = "CD_001";
    if (existingCampaigns.length > 0) {
      // Lọc ra các số từ mã ID (Ví dụ: "CD_002" -> 2)
      const ids = existingCampaigns.map((c) => {
        const num = parseInt(c.id.replace("CD_", ""), 10);
        return isNaN(num) ? 0 : num;
      });
      const maxId = Math.max(...ids);
      // Tăng số thứ tự lên 1 và đệm thêm số 0 ở trước cho đủ 3 chữ số
      nextId = "CD_" + String(maxId + 1).padStart(3, "0");
    }

    // 2. Tiến hành lưu chiến dịch với mã mới tự tăng
    const response = await fetch(
      "https://portfolio-api-1x58.onrender.com/campaigns",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form.value,
          id: nextId,
        }),
      },
    );

    if (response.ok) {
      emit("navigate", { view: "DanhSach" });
    }
  } catch (error) {
    console.error("Lỗi khi tạo mã chiến dịch tăng dần:", error);
  }
};
</script>

<style scoped>
.form-card {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.card-body {
  padding: 1.5rem;
}
.row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.col {
  flex: 1;
}
.products-section {
  border: 1px solid var(--border-color);
  padding: 1.25rem;
  border-radius: 6px;
  background-color: #f8fafc;
  margin-top: 1.5rem;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.section-title h3 {
  font-size: 0.95rem;
  color: var(--text-dark);
  font-weight: 600;
}
.product-block {
  background: #fff;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 1rem;
}
.product-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.btn-del {
  background: none;
  border: none;
  color: var(--danger);
  font-size: 0.85rem;
  cursor: pointer;
  padding-bottom: 0.5rem;
}
.classifications-box {
  border-left: 2px solid var(--primary);
  padding-left: 1rem;
  margin-top: 0.5rem;
}
.class-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.form-label-sub {
  font-size: 0.8rem;
  font-weight: 500;
}
.btn-add-sub {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.8rem;
  cursor: pointer;
}
.class-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}
.btn-del-sub {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
}
.btn-del-sub:hover {
  color: var(--danger);
}
.paste-zone {
  border: 2px dashed var(--border-color);
  border-radius: 6px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background: #fff;
  outline: none;
}
.paste-zone:focus {
  border-color: var(--primary);
  background: #f0fdf4;
}
.preview-img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
}
.paste-placeholder {
  color: #64748b;
  font-size: 0.85rem;
}
.margin-top {
  margin-top: 1.5rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>
