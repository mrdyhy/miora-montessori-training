# MIORA · Training Trợ tá Montessori

Ứng dụng Next.js mobile-first dành cho đào tạo nội bộ trợ tá Montessori tại MIORA Preschool.

## Yêu cầu

- Node.js 22.x
- npm

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Kiểm tra trước khi deploy

```bash
npm run typecheck
npm run build
```

## Deploy lên Vercel

Project dùng Next.js chuẩn và không cần biến môi trường, database hoặc dịch vụ backend.

1. Đẩy toàn bộ thư mục project lên một repository GitHub.
2. Trong Vercel, chọn **Add New → Project**.
3. Chọn repository vừa tạo và bấm **Import**.
4. Giữ framework là **Next.js** và các lệnh build mặc định.
5. Bấm **Deploy**.

Mỗi lần push mới lên nhánh production, Vercel sẽ tự động build và deploy lại.

## Dữ liệu

Nguồn câu hỏi nằm tại `data/montessori-assistant-training-v2.json`. Nội dung được đọc trực tiếp từ JSON, không hard-code trong component.
