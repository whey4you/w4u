# Hướng Dẫn Vận Hành AI Agent Chuyên Nghiệp (AI Agent Workflow)

Tài liệu này hướng dẫn cách làm việc với các AI Coding Agent (Antigravity, Cursor, Claude Code, Copilot) để giữ codebase luôn sạch sẽ, ngăn ngừa code rối (spaghetti code) và nợ kỹ thuật.

---

## 1. Công Thức Ra Lệnh (Prompting Formula)
Khi giao một task lớn hoặc tính năng mới, hãy dùng công thức **C-C-S-V**:

> **[Bối Cảnh / File] + [Ràng Buộc Kỹ Thuật] + [Yêu Cầu Lên Kế Hoạch] + [Tiêu Chí Kiểm Thử]**

### Ví dụ thực tế:
> "Tôi muốn bổ sung tính năng X.  
> 1. Hãy đọc file `A` và `B` để nắm flow hiện tại.  
> 2. **Ràng buộc:** Tách logic ra service riêng, không viết trực tiếp vào component UI. Dùng early return, không if-else lồng nhau quá 2 cấp.  
> 3. **Lên Plan trước**, liệt kê các file sẽ sửa và ĐỢI TÔI DUYỆT mới code.  
> 4. Kiểm tra type check và lint sau khi sửa."

---

## 2. Quy Trình 3 Bước Mỗi Task
1. **Pha 1: Khảo sát & Kế hoạch (Read-Only)**
   - Yêu cầu AI đọc codebase và lên kế hoạch (Plan).
   - Bạn duyệt qua: Nếu thấy hợp lý thì gõ `OK, tiến hành`, nếu thấy AI đề xuất cồng kềnh thì nhắc AI sửa lại plan.
2. **Pha 2: Thực thi từng bước (Atomic Execution)**
   - Nhắc AI làm từng file / từng tính năng nhỏ một.
   - Tránh để AI sửa một lúc 5-10 file lớn.
3. **Pha 3: Xác minh (Verification)**
   - Chạy lệnh kiểm tra: `npm run lint`, `tsc --noEmit`, hoặc `npm run build`.

---

## 3. Các File Cấu Hình Quy Tắc Đã Thiết Lập
- [`AGENTS.md`](file:///Users/mathi/whey4you-ver2/AGENTS.md): Bản quy tắc chuẩn chung cho toàn bộ các công cụ AI.
- [`.agents/rules/agent_guardrails.md`](file:///Users/mathi/whey4you-ver2/.agents/rules/agent_guardrails.md): Quy tắc tự động nạp của Antigravity IDE.
- [`.cursorrules`](file:///Users/mathi/whey4you-ver2/.cursorrules): Tương thích với Cursor IDE và các plugin hỗ trợ.
