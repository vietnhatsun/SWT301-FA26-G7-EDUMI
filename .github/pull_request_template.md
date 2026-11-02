## 📋 Mô tả thay đổi (Pull Request Description)
- **Module phụ trách:** [M1 / M2 / M3 / M4 / M5 / M6 / M7 / M8 / M9 / M10]
- **Tác giả:** @
- **Gắn với Issue:** Closes #

### 🎯 Các Test Cases được triển khai / sửa đổi:
- [ ] TC-M__-01: ...
- [ ] TC-M__-02: ...
- [ ] TC-M__-03: ...

---

### ✅ Checklist tự kiểm tra trước khi yêu cầu Review (BẮT BUỘC):
- [ ] Đã chạy lệnh kiểm thử trên máy cá nhân: `npm run test:e2e -- <file_test>` $\rightarrow$ Kết quả **PASS**
- [ ] Đã chạy `npm test` $\rightarrow$ Bộ Unit test vẫn XANH, không bị xung đột
- [ ] **Quy tắc POM:** Page class KHÔNG chứa `expect`/assertion; Test class KHÔNG chứa `By` hay `findElement`
- [ ] **Quy tắc Wait:** Tuyệt đối KHÔNG dùng `sleep()` hay `setTimeout()`, chỉ dùng `waitVisible`, `until`
- [ ] **Data-driven:** Dữ liệu 100% lấy từ file CSV, KHÔNG hard-code dữ liệu trong file test
- [ ] Đã cập nhật file BM03 tương ứng

---

### 📊 Kết quả chạy thử nghiệm:
```text
Tests run: __ | Pass: __ | Fail: __ | Thời gian: __s
```
*(Đính kèm ảnh chụp màn hình terminal hoặc báo cáo nếu có)*

