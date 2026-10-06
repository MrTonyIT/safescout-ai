# BỘ HỒ SƠ THIẾT KẾ MASCOT ĐỘI TRƯỞNG MILO (CAPTAIN MILO)
## The Secret Explorer Academy (KidsSafe AI) - Survival & Reflex Learning Engine

---

## 1. TỔNG QUAN HÌNH TƯỢNG VÀ NGUYÊN TẮC THIẾT KẾ

### 1.1. Mascot Concept & Định Vị Nhân Vật
- **Tên đầy đủ**: Đội Trưởng Milo (Captain Milo).
- **Loài linh vật**: Chú Rái Cá Cứu Hộ Á-Âu (Eurasian River Otter - *Lutra lutra*).
- **Tính cách**: Thông minh, dũng cảm, nhanh nhẹn, chu đáo và tạo cảm giác an toàn tuyệt đối cho trẻ nhỏ (5–12 tuổi).
- **Vai trò trong học tập**: Người dẫn đường kiêm Huấn luyện viên Sinh tồn Cấp cao tại Học viện Thám hiểm Bí mật (The Secret Explorer Academy). Milo vừa là người bạn đồng hành đáng yêu, vừa là tấm lá chắn phản xạ an toàn khi gặp tình huống nguy hiểm.
- **Tỉ lệ nhân vật**: Chibi 3D cân đối (tỉ lệ đầu/thân = 1:2.2), đôi tai tròn nhỏ, đôi mắt to tròn long lanh đầy biểu cảm và bộ ria mép sinh động.

---

## 2. BẢNG MÀU CHUẨN & TRANG BỊ ĐẶC TRƯNG

### 2.1. Bảng Màu Nhận Diện Thương Hiệu (Color Palette)

| Mã Màu | Tên Màu | Ứng Dụng Thiết Kế | Ý Nghĩa Tâm Lý Trẻ Em |
| :--- | :--- | :--- | :--- |
| `#FF6B35` | **Neon Safety Orange** | Áo phao cứu hộ chính, viền balo, dải cảnh báo | Kích thích phản xạ tập trung, năng động, dễ quan sát |
| `#004E89` | **Rescue Navy Blue** | Dây đai an toàn, nón bảo hiểm, họa tiết huy hiệu | Cảm giác vững chãi, tin cậy, bình tĩnh và an tâm |
| `#FFE66D` | **Quantum Luminescence Yellow** | Ánh đèn pin lượng tử (quét/suy nghĩ), hoa sao | Sự ấm áp, trí tuệ sáng tạo, phần thưởng vui tươi |
| `#8D5B4C` | **Warm Otter Chestnut Brown** | Màu lông nhung của Milo | Gần gũi thiên nhiên, thân thiện và ấm áp |
| `#F7F7F9` | **Soft Porcelain White** | Vùng ngực, bụng, ria mép, họa tiết phản quang | Trong sáng, sạch sẽ và an toàn |
| `#FF1E44` | **Emergency SOS Red** | Đèn chớp cảnh báo nguy hiểm, biển báo STOP | Báo hiệu khẩn cấp, ngăn chặn hành vi nguy hiểm tức thì |

### 2.2. Chi Tiết Trang Bị Cứu Hộ Lượng Tử

1. **Mũ Thám Hiểm Bảo Hộ (Quantum Safety Helmet)**:
   - Chất liệu polyme sinh học chịu lực cao, màu Xanh Cứu Hộ (`#004E89`) với dải phản quang Cam Neon (`#FF6B35`).
   - Gắn **Đèn Pin Lượng Tử (Quantum Headlamp)** ở chính giữa:
     - Bình thường: Chiếu ánh sáng ấm dịu.
     - Khi phân tích/quét: Chớp sáng nhịp điệu ánh vàng Cyan (`#FFE66D`).
     - Khi phát hiện nguy cơ: Tự động chuyển sang chế độ chớp đỏ SOS (`#FF1E44`).
2. **Áo Phao Phản Quang Kép (Neon Dual-Safety Life Vest)**:
   - Phối màu Cam Neon (`#FF6B35`) và Xanh Cứu Hộ (`#004E89`).
   - Tích hợp còi cứu hộ siêu thanh mini ở ngực áo bên trái và huy hiệu Học viện Thám hiểm ở ngực áo bên phải.
3. **Balo Cứu Hộ Lượng Tử (Quantum Rescue Pack)**:
   - Balo sinh tồn công nghệ cao sau lưng, chứa các công cụ: dây cứu hộ nano, bộ lọc nước lượng tử, hộp sơ cứu mini, và màn hình chiếu Hologram bản đồ 10 Vùng Đất Sinh Tồn.

---

## 3. MA TRẬN TRẠNG THÁI & BIỂU CẢM (STATE & ANIMATION MATRIX)

| Trạng Thái (State) | Biểu Cảm & Dáng Điệu (Pose & Emotion) | Hiệu Ứng Ánh Sáng & Đèn Mũ | Âm Thanh / Audio Cue | Trigger Kích Hoạt |
| :--- | :--- | :--- | :--- | :--- |
| **`IDLE` / `NEUTRAL`** | Đứng thăng bằng thoải mái, một tay vẫy chào bé, mắt to tròn thân thiện, miệng cười mỉm ấm áp. Đuôi rái cá vẫy nhẹ sang 2 bên. | Đèn pin sáng nhẹ màu vàng ấm dịu (`#FFE66D`), ánh sáng khuếch tán. | `sfx_milo_greeting.mp3`<br/>*Âm còi bong bóng nhẹ nhàng* | Khi bé đang đọc bài học hoặc ở màn hình chờ bản đồ. |
| **`THINKING` / `SCANNING`** | Một tay chống cằm, mắt hơi nheo nhìn tập trung về phía vật thể/màn hình quét, đầu hơi nghiêng 15 độ tò mò. | Đèn pin trên mũ quét tia sáng nón Hologram nhấp nháy theo nhịp điệu. | `sfx_milo_scanning.mp3`<br/>*Tiếng bíp bíp công nghệ tần số cao* | Khi bé kích hoạt Vision Scanner để chụp và gửi ảnh môi trường. |
| **`CHEERING` / `SUCCESS`** | Nhảy bật lên cao vui sướng, hai tay giơ ngón cái (Thumbs Up), miệng cười rạng rỡ, xung quanh tung hoa giấy (confetti) và sao vàng lấp lánh. | Đèn pin sáng rực rỡ kèm hiệu ứng hào quang lấp lánh xung quanh mũ. | `sfx_milo_cheer.mp3`<br/>*Tiếng kèn chiến thắng + chuông sao rơi* | Khi bé trả lời đúng câu hỏi phản xạ hoặc hoàn thành Checkpoint. |
| **`DANGER_ALERT`** | Nét mặt nghiêm nghị, đứng trụ vững vàng, một tay giơ biển báo **STOP** phản quang màu đỏ, tay kia chỉ hướng lùi lại an toàn. | Đèn pin trên mũ chớp sáng liên tục màu Đỏ SOS (`#FF1E44`) tần số 2Hz. | `sfx_milo_alert_sos.mp3`<br/>*Tiếng còi báo động khẩn cấp nhịp đôi* | Khi phát hiện nguy cơ cao (lửa, điện hở, nước sâu, người lạ, vật nhọn). |

---

## 4. BỘ PROMPT RENDER ĐỒNG BỘ 3D PIXAR / CLAY STYLE

> **Phong cách tổng thể (Master Art Style)**: 
> *3D animated cartoon, Pixar & Disney Animation style, tactile clay texture finish, soft rounded proportions, octane render, volumetric lighting, Ray Tracing, Unreal Engine 5 aesthetic, 8k resolution, child-friendly educational art, clean solid pastel studio background.*

### 4.1. Prompt State 1: IDLE / NEUTRAL (Chào Đón Thân Thiện)

```text
Full-body 3D cartoon Eurasian River otter mascot named Captain Milo, Pixar style, tactile claymorphic smooth finish. Cute chubby otter with rich warm chestnut brown fur, soft cream belly. Wearing an explorer rescue helmet with a warm glowing yellow quantum headlamp, safety life vest in vivid Neon Orange (#FF6B35) and Rescue Navy Blue (#004E89) with reflective silver safety stripes, wearing a compact high-tech adventure rescue backpack. Standing in a welcoming pose, right paw happily waving to the viewer, big sparkling warm brown expressive eyes, friendly gentle smile, cheerful confident posture. Clean soft lighting, studio background in soft pastel teal, 3D character design for children education app, octane render, hyper-detailed, 8k, cinematic Disney Pixar look --ar 1:1 --stylize 250 --v 6.0
```

### 4.2. Prompt State 2: THINKING / SCANNING (Phân Tích & Quét Môi Trường)

```text
Full-body 3D cartoon Eurasian River otter mascot named Captain Milo, Pixar style, clay texture finish. Cute otter wearing an explorer rescue helmet and vivid Neon Orange (#FF6B35) and Navy Blue (#004E89) rescue vest. Pose: one paw resting under his chin in deep thinking, slight tilt of head, curious focused smart expression, looking attentively forward. The quantum headlamp on his helmet emits a glowing pulsating cone of cyan-yellow holographic scanning light beams towards the ground. High-tech rescue backpack with a tiny rotating antenna. Soft volumetric rim lighting, studio background in soft lavender, 8k, octane render, charming kids educational AI companion character --ar 1:1 --stylize 250 --v 6.0
```

### 4.3. Prompt State 3: SUCCESS / CHEERING (Chiến Thắng & Khen Ngợi)

```text
Full-body 3D cartoon Eurasian River otter mascot named Captain Milo jumping in mid-air celebration, Pixar style, tactile clay finish. Wearing Neon Orange (#FF6B35) and Rescue Blue (#004E89) life vest, explorer safety helmet with headlamp glowing bright golden star light. Both paws giving energetic thumbs up, wide joyful open-mouthed smile, sparkling happy eyes. Dynamic celebration atmosphere with colorful floating confetti, shiny golden star particles, and floating rescue badge shards around him. Uplifting vibrant lighting, soft pastel sky-blue studio background, high dynamic range, 8k, joyful energetic kids game reward screen --ar 1:1 --stylize 250 --v 6.0
```

### 4.4. Prompt State 4: DANGER_ALERT (Cảnh Báo Nguy Cấp)

```text
Full-body 3D cartoon Eurasian River otter mascot named Captain Milo in an urgent defensive safety alert pose, Pixar style, tactile clay texture. Wearing Neon Orange (#FF6B35) and Rescue Blue (#004E89) rescue vest, explorer helmet. The headlamp on his helmet is flashing intense bright emergency SOS Red light (#FF1E44) with warning light flares. Pose: standing firmly grounded, holding up a bright red reflective octagon STOP sign in one paw, the other paw firmly gesturing to step back. Serious, determined, protective yet caring facial expression, wide urgent eyes warning the child to stay safe. Dramatic warm rim light, soft neutral studio backdrop, 8k octane render, child safety emergency visual --ar 1:1 --stylize 250 --v 6.0
```

---

## 5. HƯỚNG DẪN TÍCH HỢP UI/UX CLIENT APP

1. **Sprite & Lottie Animation Mapping**:
   - `milo_idle.json` -> Gắn ở Header hoặc Home Dashboard.
   - `milo_scanning.json` -> Hiển thị đè lên Camera View khi chụp Vision Scanner.
   - `milo_success.json` -> Hiển thị Modal Popup khi vượt qua Checkpoint.
   - `milo_danger_alert.json` -> Toàn màn hình kèm rung điện thoại (Haptic Feedback) và âm còi `sfx_milo_alert_sos.mp3`.
2. **Text-To-Speech (TTS) Profile**:
   - Tone giọng: Giọng nam trẻ ấm áp, âm vang trong trẻo, tốc độ nói 1.0x, ngữ điệu hào hứng và đầy an tâm.
