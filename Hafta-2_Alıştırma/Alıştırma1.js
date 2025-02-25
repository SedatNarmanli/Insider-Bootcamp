// Kullanıcı bilgilerini almak için prompt
let user = {
    name: prompt("Adınız nedir?"),
    age: parseInt(prompt("Yaşınız kaç?")),
    job: prompt("Mesleğiniz nedir?")
};

console.log(`Merhaba, ${user.name}! (${user.age} yaşında, ${user.job})`);

// Sepet dizisi (Ürünleri saklamak için)
let cart = [];

// Ürün ekleme fonksiyonu
function addProduct() {
    let name = prompt("Ürün adı:");
    let price = parseFloat(prompt("Ürün fiyatı:"));

    if (name && !isNaN(price)) {
        cart.push({ name, price });
        console.log(`"${name}" sepete eklendi.`);
    } else {
        console.log("Hatalı giriş yaptınız. Lütfen tekrar deneyin.");
    }
}

// Sepeti listeleme fonksiyonu
function listCart() {
    if (cart.length === 0) {
        console.log("Sepetiniz boş.");
        return;
    }

    console.log("\n--- Sepetiniz ---");
    cart.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - ${item.price.toFixed(2)} TL`);
    });

    let totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    console.log(`Toplam Fiyat: ${totalPrice.toFixed(2)} TL\n`);
}

// Ürün çıkarma fonksiyonu
function removeProduct() {
    listCart(); // Önce mevcut sepeti gösterme

    if (cart.length === 0) {
        return;
    }

    let index = parseInt(prompt("Silmek istediğiniz ürün numarası:")) - 1;

    if (!isNaN(index) && index >= 0 && index < cart.length) {
        let removedItem = cart.splice(index, 1);
        console.log(`"${removedItem[0].name}" sepetten çıkarıldı.`);
    } else {
        console.log("Geçersiz giriş! Lütfen tekrar deneyin.");
    }
}

// Kullanıcının ürün eklemesi
while (confirm("Sepete ürün eklemek ister misiniz?")) {
    addProduct();
}

// Sepeti listele
listCart();

// Kullanıcı ürün çıkarmak isterse
if (cart.length > 0 && confirm("Sepetten ürün çıkarmak ister misiniz?")) {
    removeProduct();
    listCart(); // Güncellenmiş sepeti gösterelim
}