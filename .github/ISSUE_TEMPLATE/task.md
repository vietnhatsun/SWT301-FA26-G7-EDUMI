---
name: "📌 Nhiệm vụ kiểm thử Module (Test Task)"
about: "Dùng để tạo công việc thiết kế và lập trình kiểm thử cho từng Module"
title: "[Task] [<Module>] <Tên công việc kiểm thử>"
labels: ["test-script"]
assignees: ""
---

### 1. Thông tin nhiệm vụ
- **Thành viên phụ trách:** @
- **Module:** [M1 / M2 / M3 / M4 / M5 / M6 / M7 / M8 / M9 / M10]
- **Milestone:** [W1-Design / W2-Implementation / W3-Closure]
- **Mục tiêu:** Hoàn thành 10 Test Cases tự động bằng Selenium + Vitest

---

### 2. Danh sách công việc cần làm (Checklist)
- [ ] Phân tích Business Rules & viết 10 Test Conditions
- [ ] Viết 10 Test Cases trong file BM03 (`docs/BM03_TestCases.xlsx`)
- [ ] Chuẩn bị file dữ liệu CSV `e2e/data/mXX_..._data.csv` (UTF-8, có header)
- [ ] Xây dựng Page Object `e2e/pages/...Page.ts` (Không có assertion)
- [ ] Viết kịch bản test `e2e/tests/...test.ts` (Data-driven lặp qua CSV)
- [ ] Chạy kiểm thử nội bộ trên máy local PASS 10/10
- [ ] Tạo Pull Request và nhờ thành viên khác review

---

### 3. Ghi chú & Thảo luận
*Ghi nhận những khó khăn về locator, wait hoặc câu hỏi cần thống nhất với nhóm tại đây...*

