
```markdown
# Web Booking Gedung – BKPP Diklat Kota Semarang

Sebuah aplikasi web untuk pemesanan gedung dan ruang pertemuan di lingkungan BKPP Diklat Kota Semarang.  
Frontend dibangun dengan **React.js**, backend menggunakan **MySQL** (digabung dengan Express/Node.js) untuk operasi API, booking, pembayaran, dan manajemen admin.

---

## 🎯 Fitur Utama

- Registrasi dan login user (klien) serta panel admin
- Halaman daftar tempat/gedung/ruang pertemuan (places)
- Halaman detail tempat (PlaceDetail) dengan opsi pemesanan
- Sistem pemesanan:
  - Pilih tanggal/hari (dan jika diterapkan: waktu)
  - Pilih quantity (jumlah kamar/ruang) sesuai tipe
  - Total harga otomatis dihitung
- Checkout & pembayaran dengan integrasi QR Code (API QRIS)
- Admin dashboard untuk:
  - Mengelola user, booking, payment, laporan keuangan
  - Mengatur blocked dates (tanggal yang tidak tersedia)
  - Logika booking khusus: pemesanan ruang kecil menonaktifkan ruang besar/dedikasi dan sebaliknya
- Backend modular Express + MySQL: controller booking, payment, laporan, block-date
- Frontend React + routing (AllRoutes.jsx) + layanan (services) untuk memanggil API
- Upload gambar ke backend (`public/uploads`)
- Integrasi pengiriman OTP via email (Nodemailer + Gmail) dan/atau WhatsApp/SMS (Zenziva) untuk verifikasi nomor telepon

## 🛠️ Setup & Instalasi

### Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- MySQL (versi 8 atau kompatibel)
- Docker (opsional, jika memakai containerisasi)
- Akun Gmail dengan App Password (untuk SMTP)
- Akun Zenziva (jika memakai layanan WhatsApp/SMS)

### Instalasi

1. Clone repo:
   ```bash
   git clone <URL-repo>  
   cd web-booking
````

2. Setup backend:

   ```bash
   cd backend-express
   npm install
   ```

   Buat file `.env`, contoh:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=booking_db
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=your_app_password
   ZENVIVA_APIKEY=your_zenviva_key
   ZENVIVA_SENDER=your_sender_id
   ```

   Jalankan migrasi/skema MySQL (sesuaikan dengan script atau gunakan Docker-compose).

   ```bash
   npm run migrate
   ```

   Jalankan server:

   ```bash
   npm run dev     # atau npm start
   ```

3. Setup frontend:

   ```bash
   cd ../frontend-react
   npm install
   npm start       # aplikasi akan berjalan di http://localhost:3000
   ```

---

## 🔧 Konfigurasi

* Untuk menghubungkan layanan email OTP, pastikan konfigurasi SMTP di `.env` sudah benar.
* Untuk layanan WhatsApp/SMS via Zenziva, input API key dan sender ID di `.env`.
* Untuk pembayaran via QRIS: pastikan endpoint backend sudah meng-generate QR code sesuai nominal dan menyimpan record pembayaran.
* Untuk upload gambar: pastikan folder `public/uploads` punya izin yang sesuai dan path di frontend merujuk ke URL yang benar.

---

## ✅ Ringkasan Proses Alur

1. User registrasi → verifikasi OTP via email/WA/SMS.
2. User login → memilih gedung/ruang → pilih tanggal/hari (+ waktu jika ada) → pilih quantity → total harga muncul.
3. Klik **Pesan** → data booking ke backend disimpan → di checkout user mengisi data manual → diarahkan ke halaman payment.
4. Backend membuat record booking → membuat pembayaran dengan QRIS → user memindai QR → status pembayaran diperbarui.
5. Admin login ke dashboard → melihat daftar booking/pembayaran/user → bisa blok tanggal tertentu → laporan keuangan otomatis.

---

## 🧪 Testing

* Jalankan unit test (jika ada) di backend/frontend.
* Coba skenario pemesanan normal dan blok tanggal overlapping.
* Pastikan upload gambar berjalan, OTP terkirim, QR code muncul dan pembayaran terekam.

---

## 🚀 Deploy

* Backend dapat dijalankan di server (misalnya DigitalOcean, AWS EC2) atau container Docker.
* Frontend dapat dibuild (`npm run build`) dan di-serve lewat layanan hosting (Netlify, Vercel, atau di server sendiri).
* Pastikan environment production `.env` hanya berisi variabel aman.
* Pastikan database MySQL dalam mode production dan backup rutin.

## 📄 Lisensi

Lisensi MIT — silakan melihat file `LICENSE` untuk detail.

---

## 📝 Catatan

* Proyek ini dikembangkan khusus untuk sistem pemesanan gedung di lingkungan BKPP Diklat Kota Semarang, namun dapat disesuaikan untuk institusi lain.
* Perlu dikaji kembali keamanan terkait pengiriman OTP, manajemen pembayaran, serta validasi form secara menyeluruh.
* Jika ada modul tambahan (misalnya integrasi CI/CD, monitoring, analitik) mohon ditambahkan ke dokumentasi ini.

---

