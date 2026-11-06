# DompetKu — Pembukuan Pemasukan & Pengeluaran

Aplikasi pembukuan pribadi modern untuk dicatat dari HP maupun PC. Dibangun dengan Next.js 16, TypeScript, Tailwind CSS, Prisma (SQLite), dan NextAuth. Cocok untuk self-host di Proxmox LXC/VM atau server Ubuntu.

## Fitur

- **Login aman** — password di-hash dengan bcrypt (NextAuth credentials provider)
- **Multi-perangkat** — UI responsif (mobile bottom-nav + desktop sidebar)
- **Ringkasan** harian, mingguan, bulanan, tahunan
- **Grafik** tren 7 hari, 6 bulan, dan breakdown kategori (pie chart)
- **Kategori** dapat dikustom (ikon + warna)
- **Dark/Light mode** dengan sistem preferensi
- **PWA-ready** (manifest + theme color)
- **Database SQLite** — tidak butuh database eksternal
- **Install di Proxmox/Ubuntu** dengan Docker (cara termudah)

## Kredensial Login

Saat pertama kali aplikasi dibuka, Anda akan diminta **membuat akun pertama** (mode "Daftar"). Setelah akun dibuat, kredensial tersebut yang dipakai untuk login.

**Akun default lokal (dev sandbox):**
- Email: `admin@dompetku.local`
- Password: `dompetku123`

> Pada deployment production Anda wajib membuat akun sendiri melalui layar "Daftar" saat pertama kali dijalankan. Akun default di atas hanya untuk preview.

## Cara Deploy di Proxmox / Ubuntu

### Cara 1: Docker (Rekomendasi)

#### A. Di Proxmox (LXC container Ubuntu 22.04/24.04)

1. Buat LXC container Ubuntu baru di Proxmox (mis. `ubuntu-24-04`, 1 CPU, 512 MB RAM, 4 GB disk sudah cukup).
2. Masuk ke container via Proxmox console.
3. Install Docker:
   ```bash
   apt update && apt upgrade -y
   apt install -y curl git
   curl -fsSL https://get.docker.com | sh
   ```
4. Clone/copy source code aplikasi ke container:
   ```bash
   git clone <repo-anda> /opt/dompetku
   cd /opt/dompetku
   ```
   Atau salin folder ini via `scp`/`rsync`.
5. Generate secret aman:
   ```bash
   openssl rand -base64 32
   ```
6. Edit `docker-compose.yml`, ganti:
   - `NEXTAUTH_URL` → URL akses Anda, mis. `http://192.168.1.50:3000` atau `https://dompetku.domain.com`
   - `NEXTAUTH_SECRET` → string hasil `openssl rand`
7. Jalankan:
   ```bash
   docker compose up -d --build
   ```
8. Cek status: `docker compose ps`. Aplikasi jalan di `http://<IP-CONTAINER>:3000`.
9. Akses dari HP/PC di jaringan yang sama: buka browser → `http://<IP-CONTAINER>:3000`.

#### B. Di Ubuntu server biasa (VM Proxmox atau VPS)

Langkah sama dengan LXC di atas. Pastikan port 3000 dibuka di firewall (`ufw allow 3000`).

### Cara 2: Tanpa Docker (Native Node.js)

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone & install
git clone <repo-anda> /opt/dompetku
cd /opt/dompetku
npm install --legacy-peer-deps

# Konfigurasi environment
cp .env.example .env
# Edit .env: set DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

# Build & start
npx prisma generate
npx prisma db push
npm run build
npm start
```

Untuk menjalankan sebagai service (auto-start saat boot):

```bash
# Buat systemd service
sudo tee /etc/systemd/system/dompetku.service > /dev/null <<'EOF'
[Unit]
Description=DompetKu
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/dompetku
EnvironmentFile=/opt/dompetku/.env
ExecStart=/usr/bin/node /opt/dompetku/.next/standalone/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now dompetku
```

### Akses dari HP

1. Pastikan HP & server di jaringan yang sama (atau setup VPN/Tailscale).
2. Buka browser HP → `http://<IP-SERVER>:3000`.
3. Login, lalu **"Add to Home Screen"** dari menu browser → ikon DompetKu muncul di home screen seperti aplikasi native.

### (Opsional) Reverse Proxy dengan HTTPS

Untuk akses via domain + HTTPS, gunakan Nginx Proxy Manager atau Caddy:

```bash
# Caddy (paling simple, auto HTTPS)
sudo apt install -y caddy
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
dompetku.domain.com {
    reverse_proxy localhost:3000
}
EOF
sudo systemctl reload caddy
```

Pastikan `NEXTAUTH_URL=https://dompetku.domain.com` di file env / docker-compose.

## Backup Data

Database SQLite ada di:
- Docker: volume `dompetku_data` → `/var/lib/docker/volumes/dompetku_data/_data/dompetku.db`
- Native: sesuai `DATABASE_URL` (default `/app/data/dompetku.db` atau `db/custom.db`)

Backup otomatis via cron:
```bash
# Crontab harian jam 3 pagi
0 3 * * * cp /var/lib/docker/volumes/dompetku_data/_data/dompetku.db /backup/dompetku-$(date +\%F).db
```

## Update Aplikasi

```bash
cd /opt/dompetku
git pull
docker compose up -d --build
# Database otomatis terjaga karena pakai volume
```

## Troubleshooting

- **Login tidak berhasil setelah deploy** → pastikan `NEXTAUTH_URL` sesuai dengan URL akses aktual (termasuk http/https).
- **"Email atau password salah" padahal yakin benar** → akun belum dibuat. Buka halaman daftar (link "Daftar di sini" di layar login) untuk buat akun pertama.
- **Database reset** → hapus volume: `docker compose down -v && docker compose up -d --build` (data hilang!).
- **Port sudah dipakai** → ubah `ports: "3000:3000"` jadi `"8080:3000"` di docker-compose.yml.

## Teknologi

| Bagian | Stack |
|---|---|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma + SQLite |
| Auth | NextAuth.js v4 (Credentials + bcrypt) |
| Chart | Recharts |
| Animasi | Framer Motion |

## Lisensi

Bebas digunakan untuk keperluan pribadi atau komersial.
