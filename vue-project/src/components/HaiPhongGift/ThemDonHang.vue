<template>
  <div class="card form-card">
    <div class="card-body">
      <div class="row">
        <div class="col form-group">
          <label class="form-label">Tên khách hàng</label>
          <input type="text" class="form-control" v-model="form.customerName" />
          <span v-if="errors.customerName" class="error-text">{{
            errors.customerName
          }}</span>
        </div>
        <div class="col form-group">
          <label class="form-label">Số điện thoại</label>
          <input type="text" class="form-control" v-model="form.phone" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Địa chỉ</label>
        <input type="text" class="form-control" v-model="form.address" />
      </div>

      <!-- Danh sách chọn sản phẩm động -->
      <div class="items-section">
        <div class="section-title">
          <h3>Sản phẩm</h3>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="addItem"
          >
            Thêm sản phẩm
          </button>
        </div>

        <div v-for="(item, index) in form.items" :key="index" class="item-row">
          <div class="flex-2">
            <label v-if="index === 0" class="form-label-sub">Sản phẩm</label>
            <select
              class="form-control"
              v-model="item.productName"
              @change="onProductChange(index)"
            >
              <option value="" disabled selected></option>
              <option
                v-for="p in campaign?.products"
                :key="p.productName"
                :value="p.productName"
              >
                {{ p.productName }}
              </option>
            </select>
            <span v-if="errors['prod_' + index]" class="error-text">{{
              errors["prod_" + index]
            }}</span>
          </div>

          <div class="flex-2">
            <label v-if="index === 0" class="form-label-sub">Phân loại</label>
            <select
              class="form-control"
              v-model="item.classificationName"
              @change="onClassChange(index)"
            >
              <option value="" disabled selected></option>
              <option
                v-for="c in getClassificationsForProd(item.productName)"
                :key="c.name"
                :value="c.name"
              >
                <!-- ĐÃ THAY ĐỔI: Chỉ giữ lại tên phân loại, loại bỏ text (Gốc: ...) -->
                {{ c.name }}
              </option>
            </select>
            <span v-if="errors['cls_' + index]" class="error-text">{{
              errors["cls_" + index]
            }}</span>
          </div>

          <!-- Cho phép chỉnh sửa linh hoạt mục giá bán thực tế -->
          <div class="flex-1">
            <label v-if="index === 0" class="form-label-sub">Giá</label>
            <input
              type="number"
              class="form-control"
              v-model.number="item.price"
              min="0"
              @input="calculateTotal"
            />
          </div>

          <div class="flex-1">
            <label v-if="index === 0" class="form-label-sub">Số lượng</label>
            <input
              type="number"
              class="form-control"
              v-model.number="item.quantity"
              min="1"
              @input="calculateTotal"
            />
          </div>

          <button
            type="button"
            class="btn-del-item"
            :class="{ 'has-label': index === 0 }"
            @click="removeItem(index)"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="row margin-top">
        <div class="col form-group">
          <label class="form-label">Ngày chốt</label>
          <input type="date" class="form-control" v-model="form.orderDate" />
          <span v-if="errors.orderDate" class="error-text">{{
            errors.orderDate
          }}</span>
        </div>
        <div class="col form-group">
          <label class="form-label">Ngày giao</label>
          <input type="date" class="form-control" v-model="form.deliveryDate" />
          <span v-if="errors.deliveryDate" class="error-text">{{
            errors.deliveryDate
          }}</span>
        </div>
      </div>

      <!-- Khối hiển thị Ghi chú và Ảnh bằng chứng -->
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem">
        <div style="flex: 1; display: flex; flex-direction: column">
          <label
            class="form-label"
            style="font-weight: bold; margin-bottom: 0.5rem"
            >Ghi chú</label
          >
          <textarea
            class="form-control"
            style="
              width: 100%;
              height: 110px;
              padding: 0.5rem;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              resize: none;
            "
            v-model="form.note"
            placeholder=""
          ></textarea>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column">
          <label
            class="form-label"
            style="font-weight: bold; margin-bottom: 0.5rem"
            >Ảnh</label
          >
          <div
            class="image-paste-zone"
            :class="{ 'has-img': form.noteImage }"
            style="
              border: 2px dashed #cbd5e1;
              border-radius: 6px;
              height: 110px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f8fafc;
              cursor: pointer;
              outline: none;
              overflow: hidden;
            "
            tabindex="0"
            @paste="handleImagePaste"
          >
            <div
              v-if="!form.noteImage"
              style="
                text-align: center;
                font-size: 0.85rem;
                color: #64748b;
                padding: 10px;
              "
            ></div>
            <div
              v-else
              style="
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <img
                :src="form.noteImage"
                style="max-width: 100%; max-height: 100%; object-fit: contain"
                alt="Bằng chứng"
              />
              <button
                type="button"
                @click="form.noteImage = ''"
                style="
                  position: absolute;
                  bottom: 4px;
                  right: 4px;
                  background: rgba(239, 68, 68, 0.9);
                  color: white;
                  border: none;
                  padding: 2px 8px;
                  font-size: 0.75rem;
                  border-radius: 4px;
                  cursor: pointer;
                "
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="total-display">
        <span>TỔNG TIỀN:</span>
        <span class="price-big">{{ form.totalPrice.toLocaleString() }} đ</span>
      </div>

      <div class="form-actions">
        <button
          class="btn btn-secondary"
          @click="
            $emit('navigate', { view: 'ChiTiet', campaignId: props.campaignId })
          "
        >
          Huỷ bỏ
        </button>
        <button class="btn btn-primary" @click="submitOrder">Tạo đơn</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps(["campaignId"]);
const emit = defineEmits(["navigate"]);

const campaign = ref(null);
const form = ref({
  campaignId: props.campaignId,
  customerName: "",
  phone: "",
  address: "",
  items: [{ productName: "", classificationName: "", quantity: 1, price: 0 }],
  totalPrice: 0,
  orderDate: new Date().toISOString().split("T")[0],
  deliveryDate: "",
  status: "Đang xử lý",
  note: "",
  noteImage: "",
});

const errors = ref({});

onMounted(async () => {
  try {
    const res = await fetch(
      `https://portfolio-api-1x58.onrender.com/campaigns/${props.campaignId}`,
    );
    campaign.value = await res.json();
  } catch (error) {
    console.error(error);
  }
});

const getClassificationsForProd = (prodName) => {
  const p = campaign.value?.products.find((x) => x.productName === prodName);
  return p ? p.classifications : [];
};

const addItem = () => {
  form.value.items.push({
    productName: "",
    classificationName: "",
    quantity: 1,
    price: 0,
  });
};
const removeItem = (idx) => {
  form.value.items.splice(idx, 1);
  calculateTotal();
};
const onProductChange = (index) => {
  form.value.items[index].classificationName = "";
  form.value.items[index].price = 0;
  calculateTotal();
};

const onClassChange = (index) => {
  const item = form.value.items[index];
  const classes = getClassificationsForProd(item.productName);
  const target = classes.find((c) => c.name === item.classificationName);
  if (target) item.price = target.price;
  calculateTotal();
};

const calculateTotal = () => {
  form.value.totalPrice = form.value.items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );
};

const handleImagePaste = (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === "file" && item.type.indexOf("image/") !== -1) {
      e.preventDefault();
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 500;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          form.value.noteImage = canvas.toDataURL("image/jpeg", 0.4);
        };
      };
      reader.readAsDataURL(blob);
    }
  }
};

const submitOrder = async () => {
  errors.value = {};
  let valid = true;

  if (!form.value.customerName.trim()) {
    errors.value.customerName = "Vui lòng điền tên khách hàng.";
    valid = false;
  }
  form.value.items.forEach((item, i) => {
    if (!item.productName) {
      errors.value["prod_" + i] = "Yêu cầu chọn sản phẩm.";
      valid = false;
    }
    if (!item.classificationName) {
      errors.value["cls_" + i] = "Yêu cầu chọn phân loại.";
      valid = false;
    }
  });

  if (form.value.orderDate && form.value.deliveryDate) {
    if (new Date(form.value.deliveryDate) < new Date(form.value.orderDate)) {
      errors.value.deliveryDate =
        "Ngày giao hàng không được phép trước ngày chốt đơn.";
      valid = false;
    }
  }
  if (!valid) return;

  // --- ĐOẠN XỬ LÝ TẠO ID THÔNG MINH ĐÃ ĐƯỢC FIX LỖI ---
  try {
    const dateStripped = form.value.orderDate.replace(/-/g, ""); // Xoá dấu gạch ngang[cite: 1]
    let suffix = 0; // Mặc định đơn đầu tiên là 0[cite: 1]

    try {
      // Gọi lên server kiểm tra xem ngày hôm đó có đơn nào chưa[cite: 1]
      const resOrders = await fetch(
        `https://portfolio-api-1x58.onrender.com/orders?orderDate=${form.value.orderDate}`,
      );

      // Nếu server trả về kết quả thành công (mã 200)
      if (resOrders.ok) {
        const ordersToday = await resOrders.json(); //[cite: 1]
        if (ordersToday && ordersToday.length > 0) {
          //[cite: 1]
          const suffixes = ordersToday.map((o) => {
            //[cite: 1]
            const parts = o.id.split("_"); //[cite: 1]
            return parseInt(parts[parts.length - 1], 10) || 0; //[cite: 1]
          });
          suffix = Math.max(...suffixes) + 1; // Tìm số lớn nhất và cộng thêm 1[cite: 1]
        }
      }
    } catch (e) {
      // Nếu server báo lỗi 404 (do chưa có mảng orders), bỏ qua và giữ suffix = 0
      console.log("Chưa có dữ liệu orders trên server, khởi tạo đơn đầu tiên.");
    }

    // Ghép chuỗi tạo ID mong muốn của bạn[cite: 1]
    const finalOrderId = `DH_${dateStripped}_${suffix}`; //[cite: 1]

    // Gửi dữ liệu đơn hàng lên để lưu[cite: 1]
    const res = await fetch("https://portfolio-api-1x58.onrender.com/orders", {
      //[cite: 1]
      method: "POST", //[cite: 1]
      headers: { "Content-Type": "application/json" }, //[cite: 1]
      body: JSON.stringify({ ...form.value, id: finalOrderId }), //[cite: 1]
    });

    if (res.ok) {
      // Thành công thì chuyển hướng về trang Chi Tiết[cite: 1]
      emit("navigate", { view: "ChiTiet", campaignId: props.campaignId }); //[cite: 1]
    } else {
      alert("Không thể lưu đơn hàng, vui lòng thử lại!");
    }
  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    alert("Lỗi kết nối mạng đến Server Render!");
  }
};
</script>

<style scoped>
/* Toàn bộ CSS giữ nguyên từ source 13, bổ sung căn chỉnh nút xóa */
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
}
.col {
  flex: 1;
}
.items-section {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  margin: 1.5rem 0;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.section-title h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-dark);
}
.item-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  background: #fff;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.form-label-sub {
  font-size: 0.75rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
  color: #475569;
}
.btn-del-item {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.35rem;
  padding: 0.25rem;
}
.btn-del-item.has-label {
  margin-top: 1.5rem;
}
.btn-del-item:hover {
  color: var(--danger);
}
.total-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin-top: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
}
.price-big {
  font-size: 1.35rem;
  color: var(--primary);
}
.image-paste-zone {
  transition: all 0.2s ease;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.error-text {
  color: var(--danger);
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}
</style>
