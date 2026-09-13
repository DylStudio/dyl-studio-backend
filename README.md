# DYL STUDIO — Backend Login Discord

Backend kecil ini cuma punya satu tugas: menangani proses login Discord
(OAuth2) dengan aman, karena `client_secret` tidak boleh ditaruh di kode
frontend (GitHub Pages).

## Langkah Deploy ke Vercel (gratis)

1. **Buat repo GitHub baru**, misalnya `dyl-studio-backend`, lalu upload
   semua isi folder ini (`api/discord-callback.js`, `package.json`,
   `README.md`).

2. **Buka [vercel.com](https://vercel.com)** → login pakai akun GitHub kamu.

3. Klik **"Add New Project"** → pilih repo `dyl-studio-backend` yang tadi
   kamu buat → klik **Import** → klik **Deploy** (biarkan pengaturan default).

4. Setelah deploy selesai, kamu akan dapat URL seperti:
   ```
   https://dyl-studio-backend.vercel.app
   ```
   Endpoint callback kamu jadi:
   ```
   https://dyl-studio-backend.vercel.app/api/discord-callback
   ```

5. Di dashboard Vercel, buka **Settings → Environment Variables**, tambahkan:

   | Key | Value |
   |---|---|
   | `DISCORD_CLIENT_ID` | Client ID dari Discord Developer Portal |
   | `DISCORD_CLIENT_SECRET` | Client Secret dari Discord Developer Portal |
   | `DISCORD_REDIRECT_URI` | `https://dyl-studio-backend.vercel.app/api/discord-callback` |
   | `FRONTEND_URL` | `https://dylstudio.github.io/AudioConverterRoblox/` |

   Setelah menambahkan, klik **Redeploy** supaya env variable terpakai.

## Langkah di Discord Developer Portal

1. Buka aplikasi **DYL STUDIO** kamu → tab **OAuth2**.
2. Di bagian **Redirects**, isi persis:
   ```
   https://dyl-studio-backend.vercel.app/api/discord-callback
   ```
   (Bukan URL GitHub Pages — redirect URI Discord harus mengarah ke backend, bukan ke frontend.)
3. Simpan (Save Changes).
4. Salin **Client ID** dan **Client Secret** dari tab yang sama, masukkan ke
   Environment Variables di Vercel (langkah di atas).

## Langkah di Frontend (GitHub Pages)

Ganti tombol "Masuk dengan Discord" yang tadinya `onclick="enterApp()"`
menjadi link biasa ke Discord:

```html
<a class="landing-login-btn" href="https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID_KAMU&redirect_uri=https%3A%2F%2Fdyl-studio-backend.vercel.app%2Fapi%2Fdiscord-callback&response_type=code&scope=identify">
  ...
</a>
```

Ganti `CLIENT_ID_KAMU` dengan Application ID kamu (yang tadi di-copy dari
halaman General Information).

Lalu tambahkan sedikit JavaScript di frontend untuk membaca hasil login
saat halaman dimuat kembali (kode contoh ada di `frontend-snippet.js`).

## Catatan keamanan

- Endpoint ini cuma mengirim `id`, `username`, dan `avatar` ke frontend lewat
  URL — bukan `access_token`. Access token tetap aman di server, tidak pernah
  dikirim ke browser.
- Untuk produksi jangka panjang, sebaiknya data user disimpan di database
  dan session dikelola pakai cookie/JWT yang ditandatangani, bukan sekadar
  parameter URL — supaya lebih aman dan tidak gampang dipalsukan.
