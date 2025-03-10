# Mini E-Ticaret Uygulaması

Bu proje, jQuery ve AJAX kullanılarak geliştirilmiş basit bir e-ticaret/ürün kataloğu uygulamasıdır. Sahte bir API (`fakestoreapi.com`) üzerinden ürün verilerini çeker, dinamik bir şekilde görüntüler ve kullanıcıların ürünleri sepete eklemesine veya favorilere kaydetmesine olanak tanır.

## Özellikler
- **Ürün Listesi**: Ürünler `https://fakestoreapi.com/products` adresinden AJAX ile çekilir ve dinamik olarak kartlar halinde gösterilir.
- **Sepet Yönetimi**: Ürünler sepete eklenebilir, miktar artırılıp azaltılabilir ve sepet temizlenebilir. Sepet verileri `localStorage` ile saklanır.
- **Favoriler**: Kullanıcılar ürünleri favorilere ekleyebilir ve favori listesinden kaldırabilir. Favoriler de `localStorage` ile korunur.
- **Ürün Detayı**: Ürün kartlarındaki "Detay Göster" butonu ile FancyBox modalında ürün bilgileri ve bir carousel ile resimler gösterilir.
- **Kategori Filtreleme**: Ürünler kategorilere göre filtrelenebilir.
- **Arama**: Ürün ID'si ile spesifik ürün aranabilir (Ara butonu ile çalışır).
- **Animasyonlar**: Ürün kartları `fadeIn`, sepet işlemleri `slideUp`/`slideDown` ve butonlar için `animate` efektleri içerir.
- **Toggle Paneller**: Sepet ve favoriler, header'daki ikonlarla açılıp kapanabilen yan paneller olarak tasarlandı.
- **Responsive Tasarım**: Mobil ve masaüstü cihazlarda uyumlu çalışır.

## Kullanılan Teknolojiler
- **HTML/CSS**: Temel yapı ve stil.
- **jQuery**: DOM manipülasyonu, event handling ve AJAX çağrıları.
- **FancyBox**: Ürün detayları için modal.
- **Slick Carousel**: Ürün resimlerini kaydırmak için.
- **LocalStorage**: Sepet ve favoriler verilerini saklamak için.


   👤 **Mustafa Sedat Narmanlı**
- GitHub: [@SedatNarmanli](https://github.com/SedatNarmanli)
- LinkedIn: [Sedat Narmanlı](https://www.linkedin.com/in/sedat-narmanli/)