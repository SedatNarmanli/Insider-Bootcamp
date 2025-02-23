// Hamburger menüyü açıp kapatan fonksiyon
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

 document.addEventListener("DOMContentLoaded", function () {
    const favoriteBtn = document.getElementById("favorite-btn");

    // Daha önce favorilere eklendiyse, butonun class'ını ekle
    if (localStorage.getItem("isFavorite") === "true") {
        favoriteBtn.classList.add("added");
    }

    favoriteBtn.addEventListener("click", function () {
        this.classList.toggle("added");

        // Favori durumu kaydediliyor
        if (this.classList.contains("added")) {
            localStorage.setItem("isFavorite", "true");
        } else {
            localStorage.setItem("isFavorite", "false");
        }
    });
});

 
