# Nguồn tài nguyên

- `milo-mark.svg`: hình vector mới tạo trong đợt sửa 26/09/2026, chữ M và sách, không lấy từ bộ logo bên ngoài. Nguồn để dựng icon, adaptive-icon, splash và favicon.
- Bốn PNG tương ứng được render bằng `scripts/render-brand-assets.cjs`; kích thước 1024×1024, riêng favicon 64×64. Chưa kiểm tra crop/adaptive icon trên bản cài Android/iOS.
- Ảnh cún Milo PNG/JPG có sẵn từ trước chưa có hồ sơ nguồn/quyền. Bản giao diện game ngày 27/09/2026 đang dùng lại `milo_rescue_pup.png` và `milo_thinking.png` để giữ nhân vật gốc trong bản nội bộ. Hai ảnh này có trong bundle hiện tại; cần xác minh quyền trước phát hành. Ghi chú trước đó rằng bundle chỉ mang icon chữ M đã hết hiệu lực.
- `mobile/src/components/game/LessonScene.tsx`: minh họa SVG mới tạo trong workspace cho H01, gồm cảnh quan sát và người lớn trợ giúp. Không tải từ bộ tranh/sách bên ngoài. Cảnh và mô tả vẫn là bản nháp chờ duyệt nội dung.
- `Scenery` trong `JourneyMap.tsx`: SVG phong cảnh mới; `CartoonIslandStageNode.tsx`: đảo SVG kế thừa từ dự án. [Sổ route, asset và điều kiện phát hành](../../docs/ui-implementation-2026-09-27/ASSETS-AND-ROUTES.md).
