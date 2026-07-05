import { createRouter, createWebHistory } from "vue-router";

// Cập nhật đường dẫn chính xác theo tên các component mới quy hoạch
import HPGDanhSach from "@/components/HaiPhongGift/DanhSach.vue";
import HPGThemMoi from "@/components/HaiPhongGift/ThemChienDich.vue";
import HPGChiTiet from "@/components/HaiPhongGift/ChiTiet.vue";
import HPGDonHang from "@/components/HaiPhongGift/ThemDonHang.vue";

const routes = [
  {
    path: "/",
    redirect: "/haiphonggift/danh-sach",
  },
  {
    path: "/haiphonggift/danh-sach",
    name: "HPGDanhSach",
    component: HPGDanhSach,
  },
  {
    path: "/haiphonggift/them-chuong-trinh",
    name: "HPGThemMoi",
    component: HPGThemMoi,
  },
  {
    path: "/haiphonggift/chi-tiet/:id",
    name: "HPGChiTiet",
    component: HPGChiTiet,
    props: true,
  },
  {
    path: "/haiphonggift/don-hang",
    name: "HPGDonHang",
    component: HPGDonHang,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
