# 🌍 Trip Mate

Trip Mate, kullanıcıların seyahat planlarını kolayca oluşturup yönetebileceği bir tam kapsamlı web uygulamasıdır.  
Kullanıcılar giriş yaparak yeni seyahatler ekleyebilir, listeleyebilir ve geçmiş seyahatlerini düzenleyebilir.

---

## 🚀 Özellikler

- 🧾 Kullanıcı girişi ve kayıt (Sign In / Sign Up)
- ➕ Yeni seyahat ekleme, düzenleme ve silme
- 🧭 Ana sayfada seyahat listesi görünümü
- 🌙 Responsive ve kullanıcı dostu arayüz
- ⚙️ Rust tabanlı backend servisi

---

## 🛠️ Kullanılan Teknolojiler

### Frontend
- React.js
- JavaScript (JSX)
- CSS / Flexbox / Responsive Design

### Backend
- Rust
- Actix-web (veya başka framework varsa)
- JSON API / Local veri işleme

---

## 🖼️ Uygulama Görselleri

### Giriş Ekranı
![Giriş Ekranı](frontend/public/screenshots/signin.png)

### Anasayfa Ekranı
![Anasayfa](frontend/public/screenshots/homepage.png)



---

## 🧪 Kurulum Adımları

### 1. Repozitoyu Klonla
```bash
git clone https://github.com/keremsert54/keremsert-tripmate.git
cd keremsert-tripmate
```

### 2. Frontend'i Başlat
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend'i Başlat (Rust)
```bash
cd ../backend
cargo run
```

> Not: Rust yüklü değilse: https://www.rust-lang.org/tools/install

---

## 📦 Proje Yapısı

```
trip-mate/
├── backend/            # Rust backend
│   └── src/main.rs     # API endpointleri
├── frontend/           # React frontend
│   ├── src/pages/      # Sayfa bileşenleri
│   ├── src/components/ # UI bileşenleri
│   └── public/         # Statik dosyalar
└── README.md
```


## 👤 Geliştirici

**Kerem Sert**  
2.sınıf Bilişim Sistemleri Mühendisliği öğrencisi  
📌 [LinkedIn](https://www.linkedin.com/in/keremsert/)  
💻 [GitHub](https://github.com/keremsert54)

---

## 📄 Lisans

MIT Lisansı © 2025 Kerem Sert

---

> Bu dosya Trip Mate projesini açık ve profesyonel şekilde tanıtmak için hazırlanmıştır.
