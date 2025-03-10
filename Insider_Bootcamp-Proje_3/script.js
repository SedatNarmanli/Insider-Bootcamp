$(document).ready(function() {
    // Global değişkenler
    let allProducts = [];
    let cartItems = JSON.parse(localStorage.getItem('miniShopCart')) || {};
    let favoriteItems = JSON.parse(localStorage.getItem('miniShopFavorites')) || {};

    // Sepet ve Favorileri LocalStorage'dan yükle
    function loadCartAndFavorites() {
        updateCartDisplay();
        updateFavoritesDisplay();
    }

    // Sepeti LocalStorage'a kaydet
    function saveCart() {
        localStorage.setItem('miniShopCart', JSON.stringify(cartItems));
    }

    // Favorileri LocalStorage'a kaydet
    function saveFavorites() {
        localStorage.setItem('miniShopFavorites', JSON.stringify(favoriteItems));
    }

    // Sepet görünümünü güncelle
    function updateCartDisplay() {
        const $cart = $('#cart');
        $cart.empty();
        
        let totalCount = 0;
        let totalPrice = 0;
        
        if (Object.keys(cartItems).length === 0) {
            $cart.append('<div class="empty-cart">Sepetiniz boş</div>').fadeIn(300);
        } else {
            $.each(cartItems, function(productId, item) {
                const $cartItem = $('#cartItemTemplate').contents().clone(true);
                
                $cartItem.find('.cart-item-image img').attr('src', item.image);
                $cartItem.find('.cart-item-title').text(item.title);
                $cartItem.find('.cart-item-price').text(`${(item.price * item.quantity).toFixed(2)} ₺`);
                $cartItem.find('.quantity').text(item.quantity);
                $cartItem.attr('data-product-id', productId);
                
                $cart.append($cartItem);
                
                totalCount += item.quantity;
                totalPrice += item.price * item.quantity;
            });
        }
        
        $('.cart-count').text(totalCount);
        $('#cartTotal').text(`${totalPrice.toFixed(2)} ₺`);
    }

    // Favoriler görünümünü güncelle
    function updateFavoritesDisplay() {
        const $favorites = $('#favorites');
        $favorites.empty();

        if (Object.keys(favoriteItems).length === 0) {
            $favorites.append('<div class="empty-favorites">Favorileriniz boş</div>').fadeIn(300);
        } else {
            $.each(favoriteItems, function(productId, item) {
                const $favoriteItem = $('#favoriteItemTemplate').contents().clone(true);
                $favoriteItem.find('.favorite-item-image img').attr('src', item.image);
                $favoriteItem.find('.favorite-item-title').text(item.title);
                $favoriteItem.attr('data-product-id', productId);
                $favorites.append($favoriteItem);
            });
        }
    }

    // Sepete ürün ekleme
    function addToCart(product, quantity = 1) {
        const productId = product.id.toString();
        
        if (cartItems[productId]) {
            cartItems[productId].quantity += quantity;
        } else {
            cartItems[productId] = {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity
            };
        }
        
        $('.cart-icon').addClass('shake');
        setTimeout(() => $('.cart-icon').removeClass('shake'), 500);
        
        saveCart();
        updateCartDisplay();
    }

    // Favorilere ürün ekleme
    function addToFavorites(product) {
        const productId = product.id.toString();
        if (!favoriteItems[productId]) {
            favoriteItems[productId] = {
                id: product.id,
                title: product.title,
                image: product.image
            };
            saveFavorites();
            updateFavoritesDisplay();
        }
    }

    // Ürün adedini azaltma
    function decreaseQuantity(productId) {
        if (cartItems[productId]) {
            if (cartItems[productId].quantity > 1) {
                cartItems[productId].quantity -= 1;
            } else {
                removeFromCart(productId);
                return;
            }
            saveCart();
            updateCartDisplay();
        }
    }

    // Ürün adedini artırma
    function increaseQuantity(productId) {
        if (cartItems[productId]) {
            cartItems[productId].quantity += 1;
            saveCart();
            updateCartDisplay();
        }
    }

    // Sepetten ürün kaldırma
    function removeFromCart(productId) {
        if (cartItems[productId]) {
            const $item = $(`.cart-item[data-product-id="${productId}"]`);
            const $cartContainer = $item.closest('.cart-items');
            
            $item.slideUp(300, function() {
                delete cartItems[productId];
                saveCart();
                updateCartDisplay();
                if ($cartContainer.children().length === 0) {
                    $cartContainer.append('<div class="empty-cart">Sepetiniz boş</div>').fadeIn(300);
                }
            });
        }
    }

    // Favorilerden ürün kaldırma
    function removeFromFavorites(productId) {
        if (favoriteItems[productId]) {
            const $item = $(`.favorite-item[data-product-id="${productId}"]`);
            const $favoritesContainer = $item.parents('.favorites-items');
            
            $item.fadeOut(300, function() {
                delete favoriteItems[productId];
                saveFavorites();
                updateFavoritesDisplay();
                if ($favoritesContainer.children().length === 0) {
                    $favoritesContainer.append('<div class="empty-favorites">Favorileriniz boş</div>').fadeIn(300);
                }
            });
        }
    }

    // Sepeti tamamen temizleme
    function clearCart() {
        cartItems = {};
        saveCart();
        $('#cart').slideUp(300, function() {
            updateCartDisplay();
            $(this).slideDown(300);
        });
    }

    // Favorileri tamamen temizleme
    function clearFavorites() {
        favoriteItems = {};
        saveFavorites();
        $('#favorites').slideUp(300, function() {
            updateFavoritesDisplay();
            $(this).slideDown(300);
        });
    }

    // Ürünleri API'den çekme
    function fetchProducts() {
        $.ajax({
            url: 'https://fakestoreapi.com/products',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                allProducts = data;
                displayProducts(data);
            },
            error: function(error) {
                console.error('Ürünler çekilirken hata oluştu:', error);
                $('#productList').html('<div class="error">Ürünler yüklenirken hata oluştu.</div>');
            }
        });
    }

    // Belirli bir ID'ye sahip ürünü çekme
    function fetchProductById(id) {
        $('.loading').show();
        $.ajax({
            url: `https://fakestoreapi.com/products/${id}`,
            method: 'GET',
            dataType: 'json',
            success: function(product) {
                $('.loading').hide();
                showProductDetail(product);
            },
            error: function(error) {
                $('.loading').hide();
                alert('Bu ID ile ürün bulunamadı.');
            }
        });
    }

    // Ürünleri sayfada gösterme
    function displayProducts(products) {
        const $productList = $('#productList');
        $productList.empty();
        
        if (products.length === 0) {
            $productList.html('<div class="no-products">Bu kategoride ürün bulunmamaktadır.</div>');
            return;
        }
        
        $.each(products, function(index, product) {
            const $productCard = $('#productCardTemplate').contents().clone(true);
            
            $productCard.find('.product-image-link')
                .attr('href', product.image)
                .attr('data-fancybox', 'gallery')
                .attr('data-caption', product.title);
            $productCard.find('.product-image img')
                .attr('src', product.image)
                .attr('alt', product.title);
            $productCard.find('.product-title').text(product.title);
            $productCard.find('.product-price').text(`${product.price.toFixed(2)} ₺`);
            $productCard.find('.product-category').text(product.category);
            $productCard.attr('data-product-id', product.id);
            
            $productList.append($productCard);
            
            setTimeout(() => {
                $productCard.css({
                    'animation': 'fadeIn 0.5s forwards',
                    'animation-delay': `${index * 0.05}s`
                });
            }, 100);
        });
    }

    // Ürün detayını gösterme
    function showProductDetail(product) {
        const $modal = $('#productDetailModal');
        
        $modal.find('.product-title').text(product.title);
        $modal.find('.product-price').text(`${product.price.toFixed(2)} ₺`);
        $modal.find('.product-category').text(product.category);
        $modal.find('.product-description').text(product.description);
        $modal.find('.rating-value').text(`★ ${product.rating.rate}/5`);
        $modal.find('.rating-count').text(`(${product.rating.count} değerlendirme)`);
        
        const $carousel = $('<div class="carousel-container"></div>');
        for (let i = 0; i < 3; i++) {
            $carousel.append(`<div><img src="${product.image}" alt="${product.title}"></div>`);
        }
        $modal.find('.product-images').empty().append($carousel);
        
        $.fancybox.open({
            src: $modal,
            type: 'inline',
            opts: {
                animationEffect: 'fade',
                animationDuration: 300,
                afterShow: function() {
                    $('.carousel-container').slick({
                        dots: true,
                        infinite: true,
                        speed: 500,
                        slidesToShow: 1,
                        adaptiveHeight: true,
                        autoplay: true,
                        autoplaySpeed: 3000
                    });
                }
            }
        });
    }

    // Ürünleri kategoriye göre filtreleme
    function filterProductsByCategory(category) {
        if (category === 'all') {
            displayProducts(allProducts);
        } else {
            const filteredProducts = allProducts.filter(product => product.category === category);
            displayProducts(filteredProducts);
        }
        $('.filter-btn').removeClass('active');
        $(`.filter-btn[data-category="${category}"]`).addClass('active');
    }

    // Event Delegation ile dinamik elementler için olay yönetimi
    $('#productList').on('click', '.detail-btn', function() {
        const $card = $(this).closest('.product-card');
        const productId = $card.data('product-id');
        const product = allProducts.find(p => p.id === productId);
        showProductDetail(product);
    });

    $('#productList').on('click', '.add-to-cart-btn', function() {
        const $card = $(this).parents('.product-card');
        const productId = $card.data('product-id');
        const product = allProducts.find(p => p.id === productId);
        $(this).animate({ opacity: 0.5 }, 100).animate({ opacity: 1 }, 100);
        addToCart(product);
    });

    $('#productList').on('click', '.add-to-favorites-btn', function() {
        const $card = $(this).closest('.product-card');
        const productId = $card.data('product-id');
        const product = allProducts.find(p => p.id === productId);
        addToFavorites(product);
    });

    $('#cart').on('click', '.decrease-quantity', function() {
        const $item = $(this).closest('.cart-item');
        decreaseQuantity($item.data('product-id'));
    });

    $('#cart').on('click', '.increase-quantity', function() {
        const $item = $(this).closest('.cart-item');
        increaseQuantity($item.data('product-id'));
    });

    $('#cart').on('click', '.remove-item', function() {
        const $item = $(this).closest('.cart-item');
        removeFromCart($item.data('product-id'));
    });

    $('#favorites').on('click', '.remove-favorite', function() {
        const $item = $(this).closest('.favorite-item');
        removeFromFavorites($item.data('product-id'));
    });

    // Sepet ve Favoriler toggle
    $('.cart-icon').on('click', function() {
        $('.cart-sidebar').toggleClass('open');
        $('.favorites-sidebar').removeClass('open'); // Diğerini kapat
    });

    $('.favorites-icon').on('click', function() {
        $('.favorites-sidebar').toggleClass('open');
        $('.cart-sidebar').removeClass('open'); // Diğerini kapat
    });

    // Buton event'leri
    $('#clearCart').on('click', clearCart);
    $('#clearFavorites').on('click', clearFavorites);
    $('.filter-btn').on('click', function() {
        filterProductsByCategory($(this).data('category'));
    });

    // Arama sadece Ara tuşuna basınca çalışacak
    $('#searchBtn').on('click', function() {
        const productId = $('#productIdSearch').val().trim();
        if (productId) fetchProductById(productId);
        else alert('Lütfen bir ürün ID\'si girin.');
    });

    // Enter tuşu ile arama
    $('#productIdSearch').on('keypress', function(e) {
        if (e.which === 13) $('#searchBtn').click();
    });

    // Hover efekti için event delegation
    $(document).on('mouseenter', '.product-card', function() {
        $(this).find('.product-image img').css('transform', 'scale(1.05)');
    }).on('mouseleave', '.product-card', function() {
        $(this).find('.product-image img').css('transform', 'scale(1)');
    });

    // Sayfa yüklendiğinde
    fetchProducts();
    loadCartAndFavorites();
});