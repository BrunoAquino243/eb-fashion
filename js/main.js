// Funções principais para o site EB Fashion
// Gerencia produtos, categorias e interações do usuário

// Constantes
const STORAGE_KEY = 'ebfashion_products';
const CATEGORIES_KEY = 'ebfashion_categories'; // Chave para categorias
const VIEWS_KEY = 'ebfashion_views';
const CART_KEY = 'ebfashion_cart'; // Chave para o carrinho
const ORDERS_KEY = 'ebfashion_orders'; // Chave para pedidos
const ADMIN_KEY = 'ebfashion_admin'; // Chave para dados do admin
const DEMO_IMAGES = [
    'images/products/camisa1.jpg',
    'images/products/moletom1.jpg',
    'images/products/calca1.jpg',
    'images/products/blusa1.jpg',
    'images/products/camisa2.jpg',
    'images/products/moletom2.jpg',
    'images/products/calca2.jpg',
    'images/products/blusa2.jpg'
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Inicializar categorias e produtos de demonstração se não existirem
    initDemoData();
    
    // Incrementar contador de visualizações
    incrementPageView();

    // Atualizar contagem do carrinho no header
    updateCartCount();
});

// Funções de gerenciamento de dados (Produtos e Categorias)

// Obter todos os produtos
function getProducts() {
    const products = localStorage.getItem(STORAGE_KEY);
    return products ? JSON.parse(products) : [];
}

// Salvar produtos
function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// Obter produto por ID
function getProductById(id) {
    const products = getProducts();
    return products.find(product => product.id === id);
}

// Obter todas as categorias
function getCategories() {
    const categories = localStorage.getItem(CATEGORIES_KEY);
    // Retorna categorias salvas ou as padrão se não houver salvas
    return categories ? JSON.parse(categories) : [
        { slug: 'camisas', name: 'Camisas' },
        { slug: 'moletons', name: 'Moletons' },
        { slug: 'calcas', name: 'Calças' },
        { slug: 'blusas', name: 'Blusas' }
    ];
}

// Salvar categorias
function saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// Obter nome da categoria pelo slug
function getCategoryName(categorySlug) {
    const categories = getCategories();
    const category = categories.find(cat => cat.slug === categorySlug);
    return category ? category.name : categorySlug; // Retorna o nome ou o slug se não encontrar
}

// Inicializar dados de demonstração (Categorias e Produtos)
function initDemoData() {
    const products = getProducts();
    const categories = getCategories(); // Carrega categorias existentes ou padrão

    // Salva as categorias padrão se for a primeira vez
    if (!localStorage.getItem(CATEGORIES_KEY)) {
        saveCategories(categories);
    }
    
    // Se já existem produtos, não criar demonstração
    if (products.length > 0) {
        return;
    }
    
    // Produtos de demonstração
    const demoProducts = [
        {
            id: generateId(),
            name: 'Camisa Casual Azul',
            description: 'Camisa casual em algodão de alta qualidade, perfeita para o dia a dia ou ocasiões informais.',
            price: 39.99,
            category: 'camisas',
            image: DEMO_IMAGES[0],
            stock: 15,
            available: true,
            featured: true,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Moletom Cinza Básico',
            description: 'Moletom confortável e quente, ideal para os dias mais frios. Tecido macio e durável.',
            price: 59.99,
            category: 'moletons',
            image: DEMO_IMAGES[1],
            stock: 10,
            available: true,
            featured: true,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Calça Jeans Slim',
            description: 'Calça jeans de corte slim, moderna e confortável. Combina com diversos estilos.',
            price: 79.99,
            category: 'calcas',
            image: DEMO_IMAGES[2],
            stock: 8,
            available: true,
            featured: false,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Blusa Feminina Floral',
            description: 'Blusa leve com estampa floral, perfeita para a primavera e verão.',
            price: 45.99,
            category: 'blusas',
            image: DEMO_IMAGES[3],
            stock: 12,
            available: true,
            featured: true,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Camisa Social Branca',
            description: 'Camisa social de algodão egípcio, ideal para ocasiões formais e ambiente de trabalho.',
            price: 69.99,
            category: 'camisas',
            image: DEMO_IMAGES[4],
            stock: 7,
            available: true,
            featured: false,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Moletom com Capuz Preto',
            description: 'Moletom com capuz e bolso canguru, perfeito para um visual descontraído e confortável.',
            price: 65.99,
            category: 'moletons',
            image: DEMO_IMAGES[5],
            stock: 9,
            available: true,
            featured: false,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Calça de Alfaiataria',
            description: 'Calça de alfaiataria elegante e versátil, perfeita para ocasiões que exigem um visual mais sofisticado.',
            price: 89.99,
            category: 'calcas',
            image: DEMO_IMAGES[6],
            stock: 5,
            available: true,
            featured: false,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Blusa de Seda',
            description: 'Blusa de seda com acabamento premium, elegante e confortável para diversas ocasiões.',
            price: 99.99,
            category: 'blusas',
            image: DEMO_IMAGES[7],
            stock: 4,
            available: true,
            featured: true,
            createdAt: new Date().toISOString()
        }
    ];
    
    saveProducts(demoProducts);
}

// Carregar produtos em destaque na página inicial
function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featuredProducts');
    if (!featuredContainer) return;
    
    const products = getProducts();
    const featuredProducts = products.filter(product => product.featured && product.available);
    
    if (featuredProducts.length === 0) {
        featuredContainer.innerHTML = '<p class="no-products">Não há produtos em destaque no momento.</p>';
        return;
    }
    
    featuredContainer.innerHTML = '';
    
    // Limitar a 4 produtos em destaque
    const displayProducts = featuredProducts.slice(0, 4);
    
    displayProducts.forEach(product => {
        const productCard = createProductCard(product);
        featuredContainer.appendChild(productCard);
    });
}

// Carregar todos os produtos na página de produtos
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    const noProductsMessage = document.getElementById('noProducts');
    
    // Obter filtros
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let products = getProducts();
    
    // Aplicar filtro de categoria
    if (categoryFilter && categoryFilter !== 'all') {
        products = products.filter(product => product.category === categoryFilter);
    }
    
    // Filtrar apenas produtos disponíveis
    products = products.filter(product => product.available);
    
    // Aplicar ordenação
    switch (sortFilter) {
        case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'newest':
        default:
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    
    // Exibir mensagem se não houver produtos
    if (products.length === 0) {
        productsGrid.innerHTML = '';
        if (noProductsMessage) {
            noProductsMessage.style.display = 'block';
        }
        return;
    }
    
    if (noProductsMessage) {
        noProductsMessage.style.display = 'none';
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Criar card de produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Verificar se a imagem existe, caso contrário usar imagem padrão
    const imagePath = product.image || 'images/products/no-image.png';
    
    card.innerHTML = `
        <a href="product-details.html?id=${product.id}">
            <img src="${imagePath}" alt="${product.name}" class="product-img" onerror="this.src='images/products/no-image.png'">
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div class="product-actions">
                    <button class="btn btn-sm">Ver Detalhes</button>
                </div>
            </div>
        </a>
    `;
    
    return card;
}

// Carregar detalhes do produto
function loadProductDetails(productId) {
    const productContainer = document.getElementById('productContainer');
    const productNotFound = document.getElementById('productNotFound');
    
    if (!productContainer) return;
    
    const product = getProductById(productId);
    
    if (!product) {
        productContainer.style.display = 'none';
        if (productNotFound) {
            productNotFound.style.display = 'block';
        }
        return;
    }
    
    // Verificar se a imagem existe, caso contrário usar imagem padrão
    const imagePath = product.image || 'images/products/no-image.png';
    
    productContainer.innerHTML = `
        <div class="product-gallery">
            <img src="${imagePath}" alt="${product.name}" class="product-main-img" onerror="this.src='images/products/no-image.png'">
        </div>
        <div class="product-info-details">
            <span class="product-category">${getCategoryName(product.category)}</span>
            <h1 class="product-title">${product.name}</h1>
            <div class="product-price">${product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div class="product-description">
                ${product.description || 'Sem descrição disponível.'}
            </div>
            <div class="product-meta">
                <p><strong>Disponibilidade:</strong> ${product.stock > 0 ? 'Em estoque' : 'Esgotado'}</p>
                <p><strong>Categoria:</strong> ${getCategoryName(product.category)}</p>
            </div>
            <div class="quantity-control">
                <button onclick="decreaseQuantity()">-</button>
                <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" onchange="validateQuantity(${product.stock})">
                <button onclick="increaseQuantity(${product.stock})">+</button>
            </div>
            <div class="product-actions">
                <button class="btn" onclick="addToCartFromDetails('${product.id}')">Adicionar ao Carrinho</button> 
            </div>
        </div>
    `;
    
    // Inicializar controle de quantidade
    initQuantityControl();
}

// Funções para controle de quantidade
function initQuantityControl() {
    // Garantir que o valor inicial seja válido
    validateQuantity(document.getElementById('productQuantity')?.max || 999);
}

function increaseQuantity(max) {
    const quantityInput = document.getElementById('productQuantity');
    if (!quantityInput) return;
    
    let value = parseInt(quantityInput.value) || 0;
    value = Math.min(value + 1, max);
    quantityInput.value = value;
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    if (!quantityInput) return;
    
    let value = parseInt(quantityInput.value) || 0;
    value = Math.max(value - 1, 1);
    quantityInput.value = value;
}

function validateQuantity(max) {
    const quantityInput = document.getElementById('productQuantity');
    if (!quantityInput) return;
    
    let value = parseInt(quantityInput.value) || 0;
    value = Math.max(1, Math.min(value, max));
    quantityInput.value = value;
}

// Adicionar ao carrinho a partir da página de detalhes
function addToCartFromDetails(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    addToCart(productId, quantity);
}

// Carregar produtos relacionados
function loadRelatedProducts(productId) {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer) return;
    
    const currentProduct = getProductById(productId);
    if (!currentProduct) return;
    
    const products = getProducts();
    
    // Filtrar produtos da mesma categoria, excluindo o atual
    let relatedProducts = products.filter(product => 
        product.category === currentProduct.category && 
        product.id !== currentProduct.id &&
        product.available
    );
    
    // Se não houver suficientes da mesma categoria, adicionar outros produtos disponíveis
    if (relatedProducts.length < 3) {
        const otherProducts = products.filter(product => 
            product.category !== currentProduct.category && 
            product.id !== currentProduct.id &&
            product.available
        );
        
        relatedProducts = [...relatedProducts, ...otherProducts];
    }
    
    // Limitar a 4 produtos relacionados
    relatedProducts = relatedProducts.slice(0, 4);
    
    if (relatedProducts.length === 0) {
        // Não exibir a seção se não houver relacionados
         const relatedSection = document.querySelector('.related-products-section');
         if(relatedSection) relatedSection.style.display = 'none';
        return;
    }
    
    relatedContainer.innerHTML = '';
    
    relatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        relatedContainer.appendChild(productCard);
    });
}

// Funções do Carrinho

// Obter itens do carrinho
function getCartItems() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Salvar itens no carrinho
function saveCartItems(cartItems) {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

// Adicionar item ao carrinho
function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product || !product.available || product.stock < quantity) {
        alert('Produto indisponível ou quantidade insuficiente em estoque.');
        return;
    }

    let cartItems = getCartItems();
    const existingItemIndex = cartItems.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        // Atualiza quantidade se já existe
        cartItems[existingItemIndex].quantity += quantity;
        // Verifica se a quantidade não excede o estoque
        if (cartItems[existingItemIndex].quantity > product.stock) {
            alert(`Quantidade máxima em estoque para ${product.name} é ${product.stock}.`);
            cartItems[existingItemIndex].quantity = product.stock;
        }
    } else {
        // Adiciona novo item
        cartItems.push({ 
            id: productId, 
            name: product.name,
            price: product.price,
            image: product.image || 'images/products/no-image.png',
            quantity: quantity 
        });
    }

    saveCartItems(cartItems);
    updateCartCount(); // Atualiza o contador no header
    alert(`${product.name} adicionado ao carrinho!`);
}

// Atualizar contagem de itens no ícone do carrinho
function updateCartCount() {
    const cartCountElement = document.getElementById('cartItemCount');
    if (cartCountElement) {
        const cartItems = getCartItems();
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Carregar itens do carrinho na página do carrinho
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCartMessage = document.getElementById('emptyCart');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (!cartItemsContainer) return;
    
    const cartItems = getCartItems();
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        if (checkoutForm) checkoutForm.style.display = 'none';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    if (checkoutForm) checkoutForm.style.display = 'block';
    
    cartItemsContainer.innerHTML = '';
    
    let subtotal = 0;
    
    cartItems.forEach(item => {
        const product = getProductById(item.id);
        if (!product) return; // Skip if product not found
        
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        // Verificar se a imagem existe, caso contrário usar imagem padrão
        const imagePath = item.image || 'images/products/no-image.png';
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${imagePath}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/products/no-image.png'">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Categoria: ${getCategoryName(product.category)}</p>
            </div>
            <div class="cart-item-price">${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div class="cart-item-quantity">
                <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <input type="number" value="${item.quantity}" min="1" max="${product.stock}" 
                       onchange="updateCartItemQuantity('${item.id}', this.value)">
                <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-total">${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <button class="cart-item-remove" onclick="removeCartItem('${item.id}')"><i class="fas fa-trash"></i></button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Atualizar resumo do carrinho
    if (cartSummary) {
        const subtotalElement = document.getElementById('cartSubtotal');
        const totalElement = document.getElementById('cartTotal');
        
        if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (totalElement) totalElement.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}

// Atualizar quantidade de um item no carrinho
function updateCartItemQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
    
    const product = getProductById(productId);
    if (product && newQuantity > product.stock) {
        alert(`Quantidade máxima em estoque para ${product.name} é ${product.stock}.`);
        newQuantity = product.stock;
    }
    
    let cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cartItems[itemIndex].quantity = newQuantity;
        saveCartItems(cartItems);
        loadCartItems(); // Recarregar itens
        updateCartCount(); // Atualizar contador
    }
}

// Remover item do carrinho
function removeCartItem(productId) {
    let cartItems = getCartItems();
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCartItems(cartItems);
    loadCartItems(); // Recarregar itens
    updateCartCount(); // Atualizar contador
}

// Limpar carrinho
function clearCart() {
    saveCartItems([]);
    loadCartItems(); // Recarregar itens
    updateCartCount(); // Atualizar contador
}

// Finalizar pedido
function checkout() {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    
    if (!nameInput || !phoneInput) return;
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    if (!name || !phone) {
        alert('Por favor, preencha seu nome e telefone para finalizar o pedido.');
        return;
    }
    
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }
    
    // Criar pedido
    const order = {
        id: generateId(),
        customerName: name,
        customerPhone: phone,
        items: cartItems,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    // Salvar pedido
    saveOrder(order);
    
    // Limpar carrinho
    clearCart();
    
    // Mostrar mensagem de sucesso
    alert('Pedido finalizado com sucesso! Entraremos em contato em breve.');
    
    // Redirecionar para a página inicial
    window.location.href = 'index.html';
}

// Obter pedidos
function getOrders() {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Salvar pedido
function saveOrder(order) {
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Funções utilitárias

// Gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Incrementar contador de visualizações
function incrementPageView() {
    let views = localStorage.getItem(VIEWS_KEY);
    views = views ? parseInt(views) + 1 : 1;
    localStorage.setItem(VIEWS_KEY, views);
}

// Obter total de visualizações
function getTotalViews() {
    const views = localStorage.getItem(VIEWS_KEY);
    return views ? parseInt(views) : 0;
}

// Obter categorias únicas dos produtos atuais (pode ser útil para filtros)
function getUniqueProductCategories() {
    const products = getProducts();
    const categories = [...new Set(products.map(product => product.category))];
    return categories;
}

// Funções de autenticação do admin
function getAdminData() {
    const adminData = localStorage.getItem(ADMIN_KEY);
    if (!adminData) {
        // Dados padrão do admin
        const defaultAdmin = {
            username: 'admin',
            password: 'admin123'
        };
        localStorage.setItem(ADMIN_KEY, JSON.stringify(defaultAdmin));
        return defaultAdmin;
    }
    return JSON.parse(adminData);
}

// Atualizar senha do admin
function updateAdminPassword(currentPassword, newPassword) {
    const adminData = getAdminData();
    
    if (adminData.password !== currentPassword) {
        return false; // Senha atual incorreta
    }
    
    adminData.password = newPassword;
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    
    // Atualizar também no localStorage para persistir o login
    if (localStorage.getItem("ebfashion_admin_logged") === "true") {
        localStorage.setItem("ebfashion_admin_password", newPassword);
    }
    
    return true;
}

// Verificar login do admin
function checkAdminLogin(username, password) {
    const adminData = getAdminData();
    return adminData.username === username && adminData.password === password;
}
