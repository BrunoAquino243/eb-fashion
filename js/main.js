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
    
    // Gerar opções de tamanho
    let sizeOptionsHTML = '';
    if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach((size, index) => {
            const isSelected = index === 0 ? 'selected' : '';
            sizeOptionsHTML += `<div class="size-option ${isSelected}" data-size="${size}" onclick="selectSize(this)">${size}</div>`;
        });
    } else {
        sizeOptionsHTML = '<div class="size-option selected" data-size="Único" onclick="selectSize(this)">Único</div>';
    }
    
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
            
            <div class="product-controls">
                <div class="size-selector">
                    <label>Tamanho:</label>
                    <div class="size-options" id="sizeOptions">
                        ${sizeOptionsHTML}
                    </div>
                    <input type="hidden" id="selectedSize" value="${product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Único'}">
                </div>
                
                <div class="quantity-control">
                    <label>Quantidade:</label>
                    <div class="quantity-buttons">
                        <button onclick="decreaseQuantity()">-</button>
                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" onchange="validateQuantity(${product.stock})">
                        <button onclick="increaseQuantity(${product.stock})">+</button>
                    </div>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="btn" onclick="addToCartFromDetails('${product.id}')">Adicionar ao Carrinho</button> 
            </div>
        </div>
    `;
}

// Função para selecionar tamanho
function selectSize(element) {
    // Remover classe 'selected' de todos os tamanhos
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Adicionar classe 'selected' ao tamanho clicado
    element.classList.add('selected');
    
    // Atualizar o valor do tamanho selecionado
    document.getElementById('selectedSize').value = element.getAttribute('data-size');
}

// Funções para controle de quantidade
function decreaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    let quantity = parseInt(quantityInput.value);
    if (quantity > 1) {
        quantityInput.value = quantity - 1;
    }
}

function increaseQuantity(maxStock) {
    const quantityInput = document.getElementById('productQuantity');
    let quantity = parseInt(quantityInput.value);
    if (quantity < maxStock) {
        quantityInput.value = quantity + 1;
    }
}

function validateQuantity(maxStock) {
    const quantityInput = document.getElementById('productQuantity');
    let quantity = parseInt(quantityInput.value);
    
    if (isNaN(quantity) || quantity < 1) {
        quantityInput.value = 1;
    } else if (quantity > maxStock) {
        quantityInput.value = maxStock;
    }
}

// Adicionar ao carrinho a partir da página de detalhes
function addToCartFromDetails(productId) {
    const product = getProductById(productId);
    if (!product) {
        alert('Produto não encontrado.');
        return;
    }
    
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const selectedSize = document.getElementById('selectedSize').value;
    
    if (!selectedSize) {
        alert('Por favor, selecione um tamanho.');
        return;
    }
    
    if (isNaN(quantity) || quantity < 1) {
        alert('Por favor, selecione uma quantidade válida.');
        return;
    }
    
    // Adicionar ao carrinho com tamanho
    addToCart(product, quantity, selectedSize);
    
    // Atualizar contador do carrinho
    updateCartCount();
    
    // Notificar usuário
    alert(`${quantity} unidade(s) de ${product.name} (Tamanho: ${selectedSize}) adicionado(s) ao carrinho!`);
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
function addToCart(product, quantity = 1, size = null) {
    if (typeof product === 'string') {
        product = getProductById(product);
        if (!product) {
            alert('Produto não encontrado.');
            return;
        }
    }
    
    if (product.stock < quantity) {
        alert(`Desculpe, temos apenas ${product.stock} unidades em estoque.`);
        return;
    }
    
    const cartItems = getCartItems();
    
    // Verificar se o produto já está no carrinho com o mesmo tamanho
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id && item.size === size);
    
    if (existingItemIndex > -1) {
        // Atualizar quantidade se já existe
        cartItems[existingItemIndex].quantity += quantity;
        
        // Verificar estoque
        if (cartItems[existingItemIndex].quantity > product.stock) {
            cartItems[existingItemIndex].quantity = product.stock;
            alert(`Quantidade ajustada para ${product.stock} unidades (máximo em estoque).`);
        }
    } else {
        // Adicionar novo item
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            size: size,
            category: product.category
        });
    }
    
    saveCartItems(cartItems);
    updateCartCount();
}

// Atualizar contagem de itens no carrinho
function updateCartCount() {
    const cartItems = getCartItems();
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Funções de Estatísticas

// Incrementar visualização de página
function incrementPageView() {
    let views = localStorage.getItem(VIEWS_KEY);
    views = views ? JSON.parse(views) : { total: 0, pages: {} };
    
    // Incrementar total
    views.total += 1;
    
    // Incrementar página específica
    const page = window.location.pathname.split('/').pop() || 'index.html';
    views.pages[page] = (views.pages[page] || 0) + 1;
    
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
}

// Obter total de visualizações
function getTotalViews() {
    const views = localStorage.getItem(VIEWS_KEY);
    if (!views) return 0;
    
    const viewsData = JSON.parse(views);
    return viewsData.total || 0;
}

// Funções de Autenticação do Admin

// Verificar credenciais do admin
function checkAdminLogin(username, password) {
    // Obter dados do admin
    const adminData = localStorage.getItem(ADMIN_KEY);
    
    // Se não existir, usar credenciais padrão
    if (!adminData) {
        // Credenciais padrão: admin / admin123
        const defaultAdmin = {
            username: 'admin',
            password: 'admin123'
        };
        
        // Salvar credenciais padrão
        localStorage.setItem(ADMIN_KEY, JSON.stringify(defaultAdmin));
        
        // Verificar com credenciais padrão
        return username === defaultAdmin.username && password === defaultAdmin.password;
    }
    
    // Se existir, verificar com dados salvos
    const admin = JSON.parse(adminData);
    return username === admin.username && password === admin.password;
}

// Alterar senha do admin
function changeAdminPassword(currentPassword, newPassword) {
    // Obter dados do admin
    const adminData = localStorage.getItem(ADMIN_KEY);
    if (!adminData) return false;
    
    const admin = JSON.parse(adminData);
    
    // Verificar senha atual
    if (currentPassword !== admin.password) {
        return false;
    }
    
    // Atualizar senha
    admin.password = newPassword;
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    
    return true;
}

// Funções Utilitárias

// Gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Obter parâmetro da URL
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Inicializar página de detalhes do produto
if (window.location.pathname.includes('product-details.html')) {
    const productId = getUrlParam('id');
    if (productId) {
        document.addEventListener('DOMContentLoaded', function() {
            loadProductDetails(productId);
            loadRelatedProducts(productId);
        });
    }
}

// Inicializar página de produtos
if (window.location.pathname.includes('products.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Configurar filtros
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', loadProducts);
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', loadProducts);
        }
        
        // Carregar produtos
        loadProducts();
    });
}

// Inicializar página inicial
if (window.location.pathname.endsWith('/') || window.location.pathname.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadFeaturedProducts();
    });
}
