---
name: "🐛 Báo cáo lỗi SUT (Defect Report)"
about: "Dùng để báo cáo lỗi của hệ thống EduMi được phát hiện khi chạy test tự động (Chuẩn ISTQB Ch.5.5)"
title: "[Defect] [<Module>] <Mô tả ngắn gọn lỗi>"
labels: ["bug", "priority:medium"]
assignees: ""
---

### 1. Thông tin chung
- **Mã Defect ID:** BUG-EDUMI-XX (Đối chiếu với file BM07)
- **Module liên quan:** [M1 / M2 / M3 / M4 / M5 / M6 / M7 / M8 / M9 / M10]
- **Business Rule (BR ID):** BR-M__-__
- **Test Case liên quan:** TC-M__-__
- **Mức độ nghiêm trọng (Severity):** [Critical / Major / Minor / Trivial]
- **Mức độ ưu tiên (Priority):** [High / Medium / Low]

---

### 2. Môi trường kiểm thử
- **URL trang web:** http://localhost:3000/...
- **Trình duyệt:** Google Chrome v130+
- **Hệ điều hành:** Windows 10/11
- **Kịch bản tự động:** `e2e/tests/<file>.test.ts` (Dòng CSV: __)

---

### 3. Điều kiện tiên quyết (Pre-conditions)
*Ví dụ: Đã đăng nhập bằng tài khoản student@edumi.vn, hoặc đang ở phòng thi...*

---

### 4. Các bước tái hiện (Steps to Reproduce)
1. Truy cập vào trang ...
2. Nhập dữ liệu ...
3. Bấm nút ...

---

### 5. Kết quả thực tế vs Kết quả mong đợi
- **Kết quả mong đợi (Expected):** 
- **Kết quả thực tế (Actual):** 

---

### 6. Bằng chứng kiểm thử (Evidence)
> Kéo thả ảnh chụp màn hình tự động từ thư mục `e2e-reports/screenshots/` vào đây:

---

### 7. Phân loại lỗi
- [ ] Lỗi chức năng của website EduMi (SUT Defect - Cần dev fix)
- [ ] Lỗi kiểm thử giao diện / Testability (Thiếu data-testid, trùng id...)
- [ ] Sai khác tài liệu yêu cầu (Requirement defect)

