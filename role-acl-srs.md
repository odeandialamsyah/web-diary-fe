## 9. UAT Test Case Referensi

| Test Case ID | Feature | Role | Precondition | Action | Expected Result | Status | Notes |
|---|---|---|---|---|---|---|---|
| UAT-FE001 | Login Page | Guest | User belum login | Buka `login.html` dan submit email/password valid | Login berhasil, token JWT tersimpan, redirect ke `index.html` | Not Tested | Pastikan token berisi `role` dan `user_id` jika backend sudah mendukung |
| UAT-FE002 | Login Page - invalid credentials | Guest | User belum login | Submit email/password salah | Menampilkan pesan error `Login gagal` atau `Email not found / Wrong password` | Not Tested | Cek response API jika validasi gagal |
| UAT-FE003 | Register Page | Guest | User belum login | Buka `register.html`, isi form valid, submit | Akun baru dibuat, redirect ke `login.html` | Not Tested | Validasi password minimal dan email unik required |
| UAT-FE004 | Register Page - duplicate email | Guest | Email sudah terdaftar | Submit form dengan email yang sudah ada | Menampilkan pesan error `Email already exists` | Not Tested | Pastikan tidak membuat duplikasi akun |
| UAT-FE005 | Diary Page access | User/Admin | Token JWT valid tersimpan | Buka `index.html` | Halaman terbuka, entri diary termuat, tombol `Simpan Entri` muncul | Not Tested | Jika tidak ada entri, tampil pesan `Belum ada entri diary.` |
| UAT-FE006 | Diary Page access denied | Guest | Tidak ada token | Buka `index.html` | Redirect ke `login.html` | Not Tested | Pastikan halaman tidak menampilkan konten diary sama sekali |
| UAT-FE007 | Create Diary Entry | User/Admin | Token JWT valid | Isi form diary dan submit | Entri baru tersimpan, muncul di daftar, sentiment chart terupdate | Not Tested | Pastikan `content` tidak boleh kosong |
| UAT-FE008 | Trends Page access | User/Admin | Token JWT valid | Buka `tren.html` | Grafik tren sentimen tampil jika ada data | Not Tested | Jika tidak ada data, tampil `noChartDataMessage` |
| UAT-FE009 | Riwayat Page access | User/Admin | Token JWT valid | Buka `riwayat.html` | Riwayat entri muncul sesuai data user | Not Tested | Pastikan data hanya milik user yang login |
| UAT-FE010 | Logout | User/Admin | Token JWT valid | Klik tombol `Logout` | Token dihapus dari `localStorage`, redirect ke `login.html` | Not Tested | Logout frontend hanya menghapus token |
| UAT-FE011 | Invalid token handling | User/Admin | Token kadaluarsa/invalid di localStorage | Buka halaman terproteksi atau fetch API | Hapus token, tampilkan pesan error, redirect ke `login.html` | Not Tested | Cek response status `401` dari API |
| UAT-FE012 | Admin Panel (future) | Admin | Role `admin` di token | Buka halaman admin | Menu Admin Panel tampil | Planned | Implementasi backend JWT role claim diperlukan |

## 10. Checklist QA

- [ ] Verifikasi akses halaman berdasarkan role `guest`, `user`, `admin`.
- [ ] Verifikasi redirect ketika token tidak ada atau tidak valid.
- [ ] Verifikasi tampilan navigasi sesuai role.
- [ ] Verifikasi fungsi login/register dengan pesan error jelas.
- [ ] Verifikasi enkripsi dan validasi input form diary.
- [ ] Verifikasi bahwa user tidak dapat melihat atau mengubah data diary milik user lain.
- [ ] Verifikasi logout menghapus token dan mengarahkan ke `login.html`.
- [ ] Verifikasi fallback saat tidak ada data diary (pesan `Belum ada entri diary.`).
- [ ] Verifikasi grafik tren muncul atau pesan `noChartDataMessage` jika data kosong.

## 11. Catatan Implementasi QA

- Frontend saat ini belum membaca klaim role dari JWT; untuk UAT role-based ACL, backend harus menyertakan klaim `role`.
- UAT dapat dimulai dengan verifikasi kontrol akses token JWT dasar terlebih dahulu.
- Jika klaim `role` belum tersedia, QA dapat menggunakan `user` sebagai default role untuk semua user terautentikasi.

