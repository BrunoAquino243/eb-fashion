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
            id: generateId(),
            name: 'Camisa Casual Azul',
            description: 'Camisa casual em algodão de alta qualidade, perfeita para o dia a dia ou ocasiões informais.',
            price: 39.99,
            category: 'camisas',
            image: DEMO_IMAGES[0],
            stock: 15,
            available: true,
            featured: true,
            sizes: ['P', 'M', 'G', 'GG'],
            sizeType: 'letter', // Tipo de tamanho: letra
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
            sizes: ['P', 'M', 'G', 'GG'],
            sizeType: 'letter', // Tipo de tamanho: letra
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
            sizes: ['38', '40', '42', '44'],
            sizeType: 'number', // Tipo de tamanho: número
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
            sizes: ['P', 'M', 'G'],
            sizeType: 'letter', // Tipo de tamanho: letra
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
            sizes: ['P', 'M', 'G', 'GG'],
            sizeType: 'letter', // Tipo de tamanho: letra
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
            sizes: ['P', 'M', 'G', 'GG'],
            sizeType: 'letter', // Tipo de tamanho: letra
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
            sizes: ['38', '40', '42', '44'],
            sizeType: 'number', // Tipo de tamanho: número
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
            sizes: ['P', 'M', 'G'],
            sizeType: 'letter', // Tipo de tamanho: letra
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Boné Preto Básico',
            description: 'Boné preto básico, ajustável e confortável para o dia a dia.',
            price: 29.99,
            category: 'bone',
            image: 'images/products/no-image.png',
            stock: 20,
            available: true,
            featured: false,
            sizes: ['Único'],
            sizeType: 'letter', // Tipo de tamanho: letra
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

// Função para obter a imagem correta do produto (seja local ou base64)
function getProductImage(product) {
    if (!product || !product.image) {
        return 'images/products/no-image.png';
    }
    
    // Se a imagem já é base64, retornar diretamente
    if (product.image.startsWith('data:')) {
        return product.image;
    }
    
    // Se não for base64, usar o caminho normal
    return product.image;
}

// Criar card de produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Obter a imagem correta (local ou base64)
    const imagePath = getProductImage(product);
    
    card.innerHTML = `
        <a href="product-details.html?id=${product.id}">
            <img src="${imagePath}" alt="${product.name}" class="product-img" onerror="this.src='images/products/no-image.png'">
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            </div>
        </a>
        <button class="btn view-details-btn" onclick="window.location.href='product-details.html?id=${product.id}'">Ver Detalhes</button>
    `;
    
    return card;
}

// Carregar detalhes do produto na página de detalhes
function loadProductDetails() {
    const productContainer = document.getElementById('productDetails');
    if (!productContainer) return;
    
    // Obter ID do produto da URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        productContainer.innerHTML = '<p class="error-message">Produto não encontrado.</p>';
        return;
    }
    
    const product = getProductById(productId);
    
    if (!product) {
        productContainer.innerHTML = '<p class="error-message">Produto não encontrado.</p>';
        return;
    }
    
    // Obter a imagem correta (local ou base64)
    const imagePath = getProductImage(product);
    
    // Atualizar título da página
    document.title = `${product.name} - EB Fashion`;
    
    // Criar HTML para tamanhos disponíveis
    let sizesHTML = '';
    if (product.sizes && product.sizes.length > 0) {
        sizesHTML = `
            <div class="product-sizes">
                <label>Tamanho:</label>
                <div class="size-options">
                    ${product.sizes.map(size => `
                        <div class="size-option">
                            <input type="radio" name="size" id="size-${size}" value="${size}">
                            <label for="size-${size}">${size}</label>
                        </div>
                    `).join('')}
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

// Adicionar produto ao carrinho
function addToCart(productId) {
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
        
        // Obter a imagem correta (local ou base64)
        const imagePath = getProductImage(product);
        
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${imagePath}" alt="${item.name}" onerror="this.src='images/products/no-image.png'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                ${item.size ? `<p class="cart-item-size">Tamanho: ${item.size}</p>` : ''}
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" onclick="updateCartItemQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateCartItemQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <p>R$ ${itemTotal.toFixed(2).replace('.', ',')}</p>
                <button class="remove-item-btn" onclick="removeCartItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Atualizar resumo do carrinho
    const shipping = subtotal > 0 ? 10 : 0; // Frete fixo de R$ 10
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('shipping').textContent = shipping > 0 ? `R$ ${shipping.toFixed(2).replace('.', ',')}` : 'Grátis';
    document.getElementById('total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Atualizar quantidade de um item no carrinho
function updateCartItemQuantity(index, change) {
    const cart = getCart();
    
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity += change;
    
    // Garantir que a quantidade não seja menor que 1
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    
    // Salvar carrinho atualizado
    saveCart(cart);
    
    // Recarregar itens do carrinho
    loadCartItems();
    
    // Atualizar contagem do carrinho
    updateCartCount();
}

// Remover item do carrinho
function removeCartItem(index) {
    const cart = getCart();
    
    if (index < 0 || index >= cart.length) return;
    
    // Remover item
    cart.splice(index, 1);
    
    // Salvar carrinho atualizado
    saveCart(cart);
    
    // Recarregar itens do carrinho
    loadCartItems();
    
    // Atualizar contagem do carrinho
    updateCartCount();
}

// Limpar carrinho
function clearCart() {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        saveCart([]);
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
    
    // Obter dados do formulário
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const size = document.getElementById('customerSize')?.value || '';
    const notes = document.getElementById('orderNotes')?.value || '';
    
    // Validar campos obrigatórios
    if (!name || !phone) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Calcular total
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0; // Frete fixo de R$ 10
    const total = subtotal + shipping;
    
    // Criar pedido
    const order = {
        id: 'ORD-' + generateId().substring(0, 8).toUpperCase(),
        date: new Date().toISOString(),
        customer: {
            name,
            phone,
            size,
            notes
        },
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size
        })),
        subtotal,
        shipping,
        total,
        status: 'pending' // pending, completed, cancelled
    };
    
    // Salvar pedido
    saveOrder(order);
    
    // Limpar carrinho
    saveCart([]);
    
    // Redirecionar para página de confirmação
    alert(`Pedido ${order.id} realizado com sucesso! Em breve entraremos em contato para confirmar os detalhes.`);
    window.location.href = 'index.html';
}

// Salvar pedido
function saveOrder(order) {
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Obter todos os pedidos
function getOrders() {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Incrementar contador de visualizações
function incrementPageView() {
    let views = localStorage.getItem(VIEWS_KEY);
    views = views ? parseInt(views) + 1 : 1;
    localStorage.setItem(VIEWS_KEY, views);
}

// Gerar ID único
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Inicializar páginas específicas
document.addEventListener('DOMContentLoaded', function() {
    // Página inicial
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
    
    // Página de produtos
    if (document.getElementById('productsGrid')) {
        // Event listeners para filtros
        document.getElementById('categoryFilter').addEventListener('change', loadProducts);
        document.getElementById('sortFilter').addEventListener('change', loadProducts);
    }
    
    // Página de detalhes do produto
    if (document.getElementById('productDetails')) {
        loadProductDetails();
    }
    
    // Página do carrinho
    if (document.getElementById('cartItems')) {
        loadCartItems();
        
        // Event listener para o formulário de checkout
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();
                checkout();
            });
        }
    }
});
