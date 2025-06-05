// Funções principais para o site EB Fashion
// Gerencia produtos, categorias e interações do usuário

// Constantes
const STORAGE_KEY = 'ebfashion_products';
const CATEGORIES_KEY = 'ebfashion_categories'; // Chave para categorias
const CATEGORY_IMAGES_KEY = 'ebfashion_category_images'; // Chave para imagens de categorias
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
    
    // Carregar categorias no menu de navegação e rodapé
    loadCategoriesInNavigation();
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
        { slug: 'blusas', name: 'Blusas' },
        { slug: 'bone', name: 'Boné' }
    ];
}

// Salvar categorias
function saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// Obter imagens das categorias
function getCategoryImages() {
    const images = localStorage.getItem(CATEGORY_IMAGES_KEY);
    return images ? JSON.parse(images) : {};
}

// Salvar imagens das categorias
function saveCategoryImages(images) {
    localStorage.setItem(CATEGORY_IMAGES_KEY, JSON.stringify(images));
}

// Obter imagem de uma categoria específica
function getCategoryImage(categorySlug) {
    const images = getCategoryImages();
    return images[categorySlug] || '';
}

// Obter nome da categoria pelo slug
function getCategoryName(categorySlug) {
    const categories = getCategories();
    const category = categories.find(cat => cat.slug === categorySlug);
    return category ? category.name : categorySlug; // Retorna o nome ou o slug se não encontrar
}

// Carregar categorias no menu de navegação e rodapé
function loadCategoriesInNavigation() {
    // Carregar no rodapé em todas as páginas
    const categoryLinksList = document.querySelectorAll('#categoryLinks');
    if (categoryLinksList.length > 0) {
        const categories = getCategories();
        
        categoryLinksList.forEach(categoryLinks => {
            categoryLinks.innerHTML = '';
            
            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="products.html?category=${category.slug}">${category.name}</a>`;
                categoryLinks.appendChild(li);
            });
        });
    }
    
    // Carregar no filtro de categorias na página de produtos
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        const categories = getCategories();
        
        // Manter a opção "Todas" e adicionar as categorias
        let options = `<option value="all">Todas as Categorias</option>`;
        
        categories.forEach(category => {
            options += `<option value="${category.slug}">${category.name}</option>`;
        });
        
        categoryFilter.innerHTML = options;
        
        // Verificar se há um parâmetro de categoria na URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            categoryFilter.value = categoryParam;
        }
        
        // Carregar produtos com o filtro aplicado
        loadProducts();
    }
    
    // Carregar na seção de categorias da página inicial
    const categoriesSection = document.getElementById('categoriesSection');
    if (categoriesSection) {
        const categories = getCategories();
        categoriesSection.innerHTML = '';
        
        categories.forEach(category => {
            const categoryImage = getCategoryImage(category.slug) || 
                                 (category.slug === 'camisas' ? 'images/products/category-shirts.jpg' : 
                                  category.slug === 'moletons' ? 'images/products/category-hoodies.jpg' : 
                                  category.slug === 'calcas' ? 'images/products/category-pants.jpg' : 
                                  category.slug === 'blusas' ? 'images/products/category-blouses.jpg' : 
                                  'images/products/no-image.png');
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <a href="products.html?category=${category.slug}">
                    <img src="${categoryImage}" alt="${category.name}" class="category-img" onerror="this.src='images/products/no-image.png'">
                    <div class="category-info">
                        <h3>${category.name}</h3>
                        <p>Explore nossa coleção</p>
                    </div>
                </a>
            `;
            
            categoriesSection.appendChild(categoryCard);
        });
    }
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
            id: 'demo1',
            name: 'Camisa Lisa Azul',
            price: 95.00,
            category: 'camisas',
            description: 'Camisa lisa azul de algodão, confortável e elegante para diversas ocasiões.',
            image: 'images/products/camisa1.jpg',
            stock: 10,
            sizes: ['P', 'M', 'G', 'GG']
        },
        {
            id: 'demo2',
            name: 'Moletom Adidas',
            price: 150.00,
            category: 'moletons',
            description: 'Moletom Adidas preto com listras brancas, perfeito para dias frios.',
            image: 'images/products/moletom1.jpg',
            stock: 8,
            sizes: ['P', 'M', 'G']
        },
        {
            id: 'demo3',
            name: 'Calça Jeans Slim',
            price: 120.00,
            category: 'calcas',
            description: 'Calça jeans slim fit, moderna e confortável para o dia a dia.',
            image: 'images/products/calca1.jpg',
            stock: 15,
            sizes: ['38', '40', '42', '44']
        },
        {
            id: 'demo4',
            name: 'Blusa Feminina',
            price: 85.00,
            category: 'blusas',
            description: 'Blusa feminina leve e elegante, ideal para o verão.',
            image: 'images/products/blusa1.jpg',
            stock: 12,
            sizes: ['P', 'M', 'G']
        },
        {
            id: 'demo5',
            name: 'Camisa Teste',
            price: 75.00,
            category: 'camisas',
            description: 'Camisa teste para demonstração.',
            image: 'images/products/camisa2.jpg',
            stock: 5,
            sizes: ['P', 'M', 'G']
        },
        {
            id: 'demo6',
            name: 'Tênis Nike Air Frce',
            price: 300.00,
            category: 'tenis',
            description: 'Tênis Nike Air Force preto, confortável e estiloso.',
            image: 'images/products/tenis1.jpg',
            stock: 7,
            sizes: ['38', '40', '42', '44']
        },
        {
            id: 'demo7',
            name: 'Boné Internacional',
            price: 30.00,
            category: 'bone',
            description: 'Boné oficial do Internacional, vermelho com logo do clube.',
            image: 'images/products/bone1.jpg',
            stock: 20,
            sizes: ['Único']
        }
    ];
    
    // Salvar produtos de demonstração
    saveProducts(demoProducts);
}

// Carregar produtos na página de produtos
function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    // Limpar grid
    productGrid.innerHTML = '';
    
    // Obter produtos
    let products = getProducts();
    
    // Verificar filtro de categoria
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && categoryFilter.value !== 'all') {
        products = products.filter(product => product.category === categoryFilter.value);
    }
    
    // Verificar se há produtos
    if (products.length === 0) {
        productGrid.innerHTML = '<div class="no-products">Nenhum produto encontrado.</div>';
        return;
    }
    
    // Renderizar produtos
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Verificar se a imagem existe, caso contrário usar imagem padrão
        const imagePath = product.image || 'images/products/no-image.png';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imagePath}" alt="${product.name}" onerror="this.src='images/products/no-image.png'">
            </div>
            <div class="product-category">${getCategoryName(product.category)}</div>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            <a href="product-details.html?id=${product.id}" class="btn">Ver Detalhes</a>
        `;
        
        productGrid.appendChild(productCard);
    });
}

// Carregar detalhes do produto na página de detalhes
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
    
    // Gerar HTML para opções de tamanho
    let sizesHTML = '';
    if (product.sizes && product.sizes.length > 0) {
        sizesHTML = `
            <div class="product-sizes">
                <label>Tamanho:</label>
                <div class="size-options">
        `;
        
        product.sizes.forEach((size, index) => {
            sizesHTML += `
                <label class="size-option">
                    <input type="radio" name="size" value="${size}" ${index === 0 ? 'checked' : ''}>
                    <span>${size}</span>
                </label>
            `;
        });
        
        sizesHTML += `
                </div>
            </div>
        `;
    }
    
    productContainer.innerHTML = `
        <div class="product-image-container">
            <img src="${imagePath}" alt="${product.name}" class="product-detail-img" onerror="this.src='images/products/no-image.png'">
        </div>
        <div class="product-info-container">
            <h1 class="product-title">${product.name}</h1>
            <div class="product-category">Categoria: ${getCategoryName(product.category)}</div>
            <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            <div class="product-description">${product.description || 'Sem descrição disponível.'}</div>
            
            ${sizesHTML}
            
            <div class="product-quantity">
                <label>Quantidade:</label>
                <div class="quantity-control">
                    <button type="button" class="quantity-btn minus" onclick="decrementQuantity()">-</button>
                    <input type="number" id="quantity" value="1" min="1" max="${product.stock || 10}">
                    <button type="button" class="quantity-btn plus" onclick="incrementQuantity()">+</button>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="btn add-to-cart-btn" onclick="addToCart('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `;
    
    // Inicializar controle de quantidade
    document.getElementById('quantity').addEventListener('change', function() {
        const value = parseInt(this.value);
        const max = parseInt(this.max);
        
        if (isNaN(value) || value < 1) {
            this.value = 1;
        } else if (value > max) {
            this.value = max;
        }
    });
}

// Incrementar quantidade na página de detalhes do produto
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    const maxValue = parseInt(quantityInput.max);
    
    if (currentValue < maxValue) {
        quantityInput.value = currentValue + 1;
    }
}

// Decrementar quantidade na página de detalhes do produto
function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

// Verificar credenciais de login do admin
function checkAdminLogin(username, password) {
    // Credenciais padrão
    return (username === 'admin' && password === 'admin123');
}

// Adicionar produto ao carrinho
function addToCart(productId) {
    // Buscar o produto pelo ID
    const product = getProductById(productId);
    
    if (!product) {
        alert('Produto não encontrado.');
        return;
    }
    
    // Verificar se tamanho foi selecionado (se aplicável)
    if (product.sizes && product.sizes.length > 0) {
        const selectedSize = document.querySelector('input[name="size"]:checked');
        
        if (!selectedSize) {
            alert('Por favor, selecione um tamanho.');
            return;
        }
        
        // Obter tamanho selecionado
        const size = selectedSize.value;
        
        // Obter quantidade
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        
        // Adicionar ao carrinho
        addItemToCart(product, quantity, size);
    } else {
        // Produto sem tamanhos
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        addItemToCart(product, quantity);
    }
    
    // Atualizar contagem do carrinho
    updateCartCount();
    
    // Feedback visual
    alert('Produto adicionado ao carrinho!');
}

// Adicionar item ao carrinho (lógica interna)
function addItemToCart(product, quantity, size = null) {
    // Obter carrinho atual
    let cart = getCart();
    
    // Verificar se o produto já está no carrinho com o mesmo tamanho
    const existingItemIndex = cart.findIndex(item => 
        item.productId === product.id && item.size === size
    );
    
    if (existingItemIndex !== -1) {
        // Atualizar quantidade
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Adicionar novo item
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            size: size
        });
    }
    
    // Salvar carrinho
    saveCart(cart);
}

// Obter carrinho
function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Salvar carrinho
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Atualizar contagem de itens no carrinho
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;
    
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCount.textContent = totalItems;
    
    // Mostrar ou ocultar o contador
    if (totalItems > 0) {
        cartCount.style.display = 'inline-block';
    } else {
        cartCount.style.display = 'none';
    }
}

// Carregar itens do carrinho na página do carrinho
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    
    if (!cartItemsContainer || !cartSummary) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        cartSummary.style.display = 'none';
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        return;
    }
    
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    
    cartSummary.style.display = 'block';
    cartItemsContainer.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const product = getProductById(item.productId);
        
        // Se o produto não existe mais, pular
        if (!product) return;
        
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        // Verificar se a imagem existe, caso contrário usar imagem padrão
        const imagePath = item.image || 'images/products/no-image.png';
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${imagePath}" alt="${item.name}" onerror="this.src='images/products/no-image.png'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-meta">
                    ${item.size ? `<span class="cart-item-size">Tamanho: ${item.size}</span>` : ''}
                    <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="cart-item-quantity">
                    <button type="button" class="quantity-btn" onclick="updateCartItemQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="quantity-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
                <button type="button" class="remove-btn" onclick="removeCartItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Atualizar subtotal
    const subtotalElement = document.getElementById('subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
    
    // Atualizar total
    const totalElement = document.getElementById('total');
    if (totalElement) {
        // Adicionar frete ou outros custos aqui se necessário
        const total = subtotal;
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// Atualizar quantidade de um item no carrinho
function updateCartItemQuantity(index, change) {
    const cart = getCart();
    
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity += change;
    
    // Remover item se quantidade <= 0
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    // Salvar carrinho
    saveCart(cart);
    
    // Atualizar interface
    loadCartItems();
    updateCartCount();
}

// Remover item do carrinho
function removeCartItem(index) {
    const cart = getCart();
    
    if (index < 0 || index >= cart.length) return;
    
    cart.splice(index, 1);
    
    // Salvar carrinho
    saveCart(cart);
    
    // Atualizar interface
    loadCartItems();
    updateCartCount();
}

// Limpar carrinho
function clearCart() {
    // Confirmar com o usuário
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        // Limpar carrinho
        saveCart([]);
        
        // Atualizar interface
        loadCartItems();
        updateCartCount();
    }
}

// Finalizar compra
function checkout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }
    
    // Obter informações do cliente
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const notes = document.getElementById('orderNotes').value;
    
    if (!name || !phone) {
        alert('Por favor, preencha seu nome e telefone.');
        return;
    }
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Criar pedido
    const order = {
        id: 'ORD-' + generateId().substring(0, 8).toUpperCase(),
        date: new Date().toLocaleDateString(),
        status: 'Pendente',
        customer: {
            name: name,
            phone: phone,
            notes: notes
        },
        items: cart,
        total: total
    };
    
    // Salvar pedido
    saveOrder(order);
    
    // Limpar carrinho
    saveCart([]);
    
    // Redirecionar para página de confirmação
    window.location.href = 'order-confirmation.html?id=' + order.id;
}

// Salvar pedido
function saveOrder(order) {
    // Obter pedidos existentes
    const orders = getOrders();
    
    // Adicionar novo pedido
    orders.push(order);
    
    // Salvar pedidos
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Obter todos os pedidos
function getOrders() {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Obter pedido por ID
function getOrderById(id) {
    const orders = getOrders();
    return orders.find(order => order.id === id);
}

// Carregar detalhes do pedido na página de confirmação
function loadOrderConfirmation() {
    const orderDetailsContainer = document.getElementById('orderDetails');
    if (!orderDetailsContainer) return;
    
    // Obter ID do pedido da URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        orderDetailsContainer.innerHTML = '<p>Pedido não encontrado.</p>';
        return;
    }
    
    // Buscar pedido
    const order = getOrderById(orderId);
    
    if (!order) {
        orderDetailsContainer.innerHTML = '<p>Pedido não encontrado.</p>';
        return;
    }
    
    // Exibir detalhes do pedido
    const orderIdElement = document.getElementById('orderId');
    if (orderIdElement) {
        orderIdElement.textContent = order.id;
    }
    
    // Exibir itens do pedido
    const orderItemsContainer = document.getElementById('orderItems');
    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = '';
        
        order.items.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            
            orderItem.innerHTML = `
                <div class="order-item-name">
                    ${item.name} ${item.size ? `(${item.size})` : ''}
                </div>
                <div class="order-item-quantity">
                    ${item.quantity}x
                </div>
                <div class="order-item-price">
                    R$ ${item.price.toFixed(2).replace('.', ',')}
                </div>
                <div class="order-item-total">
                    R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </div>
            `;
            
            orderItemsContainer.appendChild(orderItem);
        });
    }
    
    // Exibir total do pedido
    const orderTotalElement = document.getElementById('orderTotal');
    if (orderTotalElement) {
        orderTotalElement.textContent = `R$ ${order.total.toFixed(2).replace('.', ',')}`;
    }
    
    // Exibir informações do cliente
    const customerNameElement = document.getElementById('customerName');
    if (customerNameElement) {
        customerNameElement.textContent = order.customer.name;
    }
    
    const customerPhoneElement = document.getElementById('customerPhone');
    if (customerPhoneElement) {
        customerPhoneElement.textContent = order.customer.phone;
    }
}

// Incrementar contador de visualizações
function incrementPageView() {
    let views = localStorage.getItem(VIEWS_KEY);
    views = views ? parseInt(views) : 0;
    views++;
    localStorage.setItem(VIEWS_KEY, views);
}

// Obter total de visualizações
function getTotalViews() {
    const views = localStorage.getItem(VIEWS_KEY);
    return views ? parseInt(views) : 0;
}

// Gerar ID único
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Verificar se o usuário está logado como admin
function isLoggedIn() {
    const logged = localStorage.getItem('ebfashion_admin_logged');
    if (!logged || logged !== 'true') {
        return false;
    }
    
    // Verificar tempo de login (expirar após 24 horas)
    const loginTime = localStorage.getItem('ebfashion_admin_login_time');
    if (!loginTime) {
        return false;
    }
    
    const now = new Date().getTime();
    const loginDate = parseInt(loginTime);
    
    // Se passou mais de 24 horas, expirar login
    if (now - loginDate > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('ebfashion_admin_logged');
        localStorage.removeItem('ebfashion_admin_username');
        localStorage.removeItem('ebfashion_admin_login_time');
        return false;
    }
    
    return true;
}

// Função para adicionar produto ao carrinho a partir da página de detalhes
function addToCartFromDetails(productId) {
    // Buscar o produto pelo ID
    const product = getProductById(productId);
    
    if (!product) {
        alert('Produto não encontrado.');
        return;
    }
    
    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
    const selectedSize = document.getElementById('selectedSize').value;
    
    // Adicionar ao carrinho
    addItemToCart(product, quantity, selectedSize);
    
    // Atualizar contador do carrinho
    updateCartCount();
    
    // Notificar usuário
    alert(`${quantity} unidade(s) de ${product.name} (Tamanho: ${selectedSize}) adicionado(s) ao carrinho!`);
}
