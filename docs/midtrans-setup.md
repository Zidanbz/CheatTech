# Midtrans Snap Setup (Sandbox & Production)

## 1) Ambil kredensial
- Login ke dashboard Midtrans: https://dashboard.sandbox.midtrans.com (atau https://dashboard.midtrans.com untuk production).
- Menu **Settings → Access keys**: catat **Server Key** (pakai untuk server). Tidak perlu Client Key karena kita memakai hosted Snap redirect.

## 2) Atur URL callback & webhook
- Pastikan domain publik mengarah ke deployment Anda.
- **Payment Notification URL**: `https://<domain>/api/midtrans/webhook`
- Kita juga mengirim `callbacks.finish` saat membuat transaksi, jadi setel `MIDTRANS_CALLBACK_URL` di environment ke halaman sukses Anda, misalnya `https://<domain>/sukses`.

## 3) Isi environment variable
Salin `.env.example` menjadi `.env.local` lalu isi:
```
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_IS_PRODUCTION=false  # true untuk go-live
MIDTRANS_CALLBACK_URL=https://<domain>/sukses
MIDTRANS_CALLBACK_URL_ERROR=https://<domain>/checkout   # opsional
MIDTRANS_CALLBACK_URL_PENDING=https://<domain>/checkout # opsional
FIREBASE_SERVICE_ACCOUNT_JSON={...}
```
- `FIREBASE_SERVICE_ACCOUNT_JSON` tetap wajib agar API route bisa baca/tulis Firestore dan verifikasi ID token.

## 4) Uji end-to-end (sandbox)
1. Jalankan app (`npm run dev`) dan buka halaman produk → checkout.
2. Isi form lalu klik bayar; Anda akan diarahkan ke halaman pembayaran Midtrans Snap.
3. Selesaikan pembayaran dengan kartu/VA/e-wallet sandbox.
4. Midtrans mengirim webhook ke `/api/midtrans/webhook`; status order di Firestore berubah menjadi `Completed` jika berhasil.
5. Cek koleksi `orders` untuk melihat field `midtransTransactionStatus`, `invoiceNumber`, dan `paymentUrl`.

## 5) Go-live checklist
- Ganti `MIDTRANS_IS_PRODUCTION=true` dan pakai **Server Key** production.
- Perbarui Notification URL di dashboard ke domain produksi.
- Uji kanal pembayaran production sesuai ketentuan Midtrans.
- Pastikan service account memiliki akses Firestore di project produksi.
