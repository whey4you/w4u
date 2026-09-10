# Hướng Dẫn Cấu Hình & Sử Dụng MCP Servers

Tệp cấu hình MCP đã được tạo sẵn tại [`mcp_config.json`](file:///Users/mathi/whey4you-ver2/mcp_config.json) và [`.agents/mcp_config.json`](file:///Users/mathi/whey4you-ver2/.agents/mcp_config.json).

---

## 1. Danh Sách MCP Servers Đã Cấu Hình

### A. `puppeteer` (Kiểm Thử & Chụp Ảnh Giao Diện)
- **Tác dụng:** Tự động mở trình duyệt headless để AI click, duyệt trang `http://localhost:3000`, bắt lỗi console và chụp screenshot kiểm tra UI.
- **Yêu cầu:** Không cần API key hay token nào, chạy hoàn toàn tự động qua `npx`.

### B. `fetch` (Cập Nhật Tài Liệu Web Chuẩn Xác)
- **Tác dụng:** Cho phép AI đọc tài liệu web trực tiếp, chuyển đổi trang web thành Markdown sạch để chống việc nhớ cú pháp cũ lỗi thời.
- **Yêu cầu:** Không cần API key.

### C. `postgres` (Kết Nối & Đọc Schema Cơ Sở Dữ Liệu)
- **Tác dụng:** Giúp AI đọc cấu trúc bảng, khóa ngoại, viết câu truy vấn và migration chuẩn chỉ.
- **Cấu hình:** Sửa lại chuỗi kết nối trong `mcp_config.json`:
  ```json
  "postgresql://username:password@localhost:5432/ten_database"
  ```

### D. `github` (Quản Lý Kho Code & PR)
- **Tác dụng:** Tạo branch, xem commit, mở Issue và Pull Request trực tiếp qua AI.
- **Cấu hình:** Thay `YOUR_GITHUB_TOKEN_HERE` bằng Personal Access Token (classic hoặc fine-grained) tạo từ GitHub Settings > Developer Settings.

---

## 2. Cách Kích Hoạt Trong IDE
- **Antigravity IDE:** Tự động phát hiện cấu hình MCP trong workspace. Bạn có thể kiểm tra danh sách tool kích hoạt tại biểu tượng MCP trong thanh công cụ.
- **Cursor IDE:** Vào **Settings > Features > MCP**, trỏ đường dẫn tới file `mcp_config.json` hoặc thêm từng server theo định dạng JSON trên.
