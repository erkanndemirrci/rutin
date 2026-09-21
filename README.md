# Günlük Rutin: APK'ya çevirme

Bu klasör, uygulamanı GitHub'ın ücretsiz derleme sunucusunda APK'ya çevirmek için hazır. Bilgisayarına Android Studio kurman gerekmez.

## Adımlar

1. **github.com**'da ücretsiz bir hesap aç ya da giriş yap.
2. Sağ üstte **+ → New repository**. Adı `gunluk-rutin` olsun, **Private** seçebilirsin. **Create repository**'ye bas.
3. Açılan sayfada **uploading an existing file** bağlantısına tıkla. Bu klasörün **içindeki her şeyi** (`www`, `assets`, `.github`, `package.json`, `capacitor.config.json`, `.gitignore`) sürükleyip bırak, sonra **Commit changes**.
   - `.github` klasörü gizli görünebilir. Mac'te Finder'da `Cmd + Shift + .`, Windows'ta Görünüm → Gizli öğeler ile göster. Bu klasör olmadan derleme başlamaz.
4. Üstteki **Actions** sekmesine geç. Derleme kendiliğinden başlar. Başlamadıysa soldan **APK derle → Run workflow**'a bas. Yaklaşık 5-10 dakika sürer.
5. Yeşil tik çıkınca çalıştırmaya tıkla, sayfanın en altındaki **Artifacts** bölümünden **gunluk-rutin-apk**'yı indir. İndirdiğin zip'in içinde `app-debug.apk` var.
6. `app-debug.apk`'yı telefona gönder (Drive, kablo, e-posta) ve aç. Android "bilinmeyen kaynaklardan yükleme" izni isteyecek, izin ver. Play Protect uyarırsa **Yine de yükle**'ye bas.

## Bilmen gerekenler

- Verilerin yalnızca o telefonda saklanır. Uygulamayı kaldırırsan silinir.
- Bu APK "debug" imzalıdır: kişisel kullanım için uygundur, Play Store'a yüklenemez.
- Uygulama tamamen APK'nın içinde çalışır, internet gerekmez.
- Derleme kırmızı biterse hata satırını kopyalayıp bana gönder.
