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
    
    // Verificar se a imagem existe no localStorage (imagem carregada pelo usuário)
    let imagePath = product.image || 'images/products/no-image.png';
    
    // Se o caminho da imagem contém "upload_", verificar se existe no localStorage
    if (imagePath.includes('upload_')) {
        const imageKey = imagePath.split('/').pop(); // Pega apenas o nome do arquivo
        const storedImage = localStorage.getItem(`ebfashion_image_${imageKey}`);
        
        if (storedImage) {
            // Se a imagem existe no localStorage, usar o base64 diretamente
            imagePath = storedImage;
        }
    }
    
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
    
    // Verificar se a imagem existe no localStorage (imagem carregada pelo usuário)
    let imagePath = product.image || 'images/products/no-image.png';
    
    // Se o caminho da imagem contém "upload_", verificar se existe no localStorage
    if (imagePath.includes('upload_')) {
        const imageKey = imagePath.split('/').pop(); // Pega apenas o nome do arquivo
        const storedImage = localStorage.getItem(`ebfashion_image_${imageKey}`);
        
        if (storedImage) {
            // Se a imagem existe no localStorage, usar o base64 diretamente
            imagePath = storedImage;
        }
    }
    
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
    
    // Se não houver produtos suficientes da mesma categoria, adicionar outros produtos disponíveis
    if (relatedProducts.length < 4) {
        const otherProducts = products.filter(product => 
            product.category !== currentProduct.category && 
            product.id !== currentProduct.id &&
            product.available
        );
        
        // Adicionar outros produtos até ter 4 ou o máximo possível
        relatedProducts = [...relatedProducts, ...otherProducts].slice(0, 4);
    } else {
        // Limitar a 4 produtos relacionados
        relatedProducts = relatedProducts.slice(0, 4);
    }
    
    if (relatedProducts.length === 0) {
        relatedContainer.innerHTML = '<p class="no-products">Não há produtos relacionados no momento.</p>';
        return;
    }
    
    relatedContainer.innerHTML = '';
    
    relatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        relatedContainer.appendChild(productCard);
    });
}

// Funções de Carrinho de Compras

// Obter carrinho
function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Salvar carrinho
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Adicionar produto ao carrinho
function addToCart(product, quantity = 1, size = 'Único') {
    const cart = getCart();
    
    // Verificar se o produto já está no carrinho com o mesmo tamanho
    const existingItemIndex = cart.findIndex(item => 
        item.productId === product.id && item.size === size
    );
    
    if (existingItemIndex !== -1) {
        // Atualizar quantidade se já existe
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Adicionar novo item ao carrinho
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            size: size,
            category: product.category
        });
    }
    
    // Salvar carrinho atualizado
    saveCart(cart);
    
    // Atualizar contador do carrinho
    updateCartCount();
}

// Atualizar contador do carrinho no header
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;
    
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElement.textContent = totalItems;
    
    // Mostrar ou esconder o contador
    if (totalItems > 0) {
        cartCountElement.style.display = 'flex';
    } else {
        cartCountElement.style.display = 'none';
    }
}

// Carregar itens do carrinho na página do carrinho
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummaryContainer = document.getElementById('cartSummary');
    const emptyCartMessage = document.getElementById('emptyCart');
    
    if (!cartItemsContainer || !cartSummaryContainer) return;
    
    const cart = getCart();
    
    // Exibir mensagem se o carrinho estiver vazio
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        cartSummaryContainer.style.display = 'none';
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        return;
    }
    
    // Esconder mensagem de carrinho vazio
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    
    // Mostrar resumo do carrinho
    cartSummaryContainer.style.display = 'block';
    
    // Limpar container
    cartItemsContainer.innerHTML = '';
    
    // Adicionar cada item do carrinho
    cart.forEach((item, index) => {
        // Verificar se a imagem existe no localStorage (imagem carregada pelo usuário)
        let imagePath = item.image || 'images/products/no-image.png';
        
        // Se o caminho da imagem contém "upload_", verificar se existe no localStorage
        if (imagePath.includes('upload_')) {
            const imageKey = imagePath.split('/').pop(); // Pega apenas o nome do arquivo
            const storedImage = localStorage.getItem(`ebfashion_image_${imageKey}`);
            
            if (storedImage) {
                // Se a imagem existe no localStorage, usar o base64 diretamente
                imagePath = storedImage;
            }
        }
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        const itemTotal = item.price * item.quantity;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${imagePath}" alt="${item.name}" onerror="this.src='images/products/no-image.png'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-meta">Categoria: ${getCategoryName(item.category)}</p>
                <p class="cart-item-meta">Tamanho: ${item.size}</p>
                <p class="cart-item-price">${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="decreaseCartQuantity(${index})">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)">
                <button onclick="increaseCartQuantity(${index})">+</button>
            </div>
            <div class="cart-item-total">
                ${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div class="cart-item-remove">
                <button onclick="removeCartItem(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Atualizar resumo do carrinho
    updateCartSummary();
}

// Atualizar resumo do carrinho
function updateCartSummary() {
    const subtotalElement = document.getElementById('cartSubtotal');
    const totalElement = document.getElementById('cartTotal');
    
    if (!subtotalElement || !totalElement) return;
    
    const cart = getCart();
    
    // Calcular subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Exibir valores
    subtotalElement.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalElement.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Aumentar quantidade de um item no carrinho
function increaseCartQuantity(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += 1;
        saveCart(cart);
        loadCartItems();
        updateCartCount();
    }
}

// Diminuir quantidade de um item no carrinho
function decreaseCartQuantity(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            saveCart(cart);
            loadCartItems();
            updateCartCount();
        }
    }
}

// Atualizar quantidade de um item no carrinho
function updateCartQuantity(index, newQuantity) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        const quantity = parseInt(newQuantity);
        if (!isNaN(quantity) && quantity > 0) {
            cart[index].quantity = quantity;
            saveCart(cart);
            loadCartItems();
            updateCartCount();
        }
    }
}

// Remover item do carrinho
function removeCartItem(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(cart);
        loadCartItems();
        updateCartCount();
    }
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
    const notes = document.getElementById('customerNotes').value;
    
    // Validar campos obrigatórios
    if (!name || !phone) {
        alert('Por favor, preencha seu nome e telefone.');
        return;
    }
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Gerar ID do pedido
    const orderId = 'ORD-' + generateId().substring(0, 8).toUpperCase();
    
    // Criar pedido
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        customer: {
            name,
            phone,
            notes
        },
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size
        })),
        total,
        status: 'pending' // pending, completed, cancelled
    };
    
    // Salvar pedido
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
    
    // Limpar carrinho
    saveCart([]);
    
    // Redirecionar para página de confirmação
    alert(`Pedido ${orderId} realizado com sucesso! Entraremos em contato em breve.`);
    window.location.href = 'index.html';
}

// Obter pedidos
function getOrders() {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Salvar pedidos
function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Funções de Visualizações e Estatísticas

// Incrementar contador de visualizações
function incrementPageView() {
    let views = getTotalViews();
    views++;
    localStorage.setItem(VIEWS_KEY, views);
}

// Obter total de visualizações
function getTotalViews() {
    const views = localStorage.getItem(VIEWS_KEY);
    return views ? parseInt(views) : 0;
}

// Funções Utilitárias

// Gerar ID único
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Obter parâmetros da URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Inicializar página de detalhes do produto
function initProductDetails() {
    const productId = getUrlParameter('id');
    if (productId) {
        loadProductDetails(productId);
        loadRelatedProducts(productId);
    } else {
        const productContainer = document.getElementById('productContainer');
        const productNotFound = document.getElementById('productNotFound');
        
        if (productContainer) {
            productContainer.style.display = 'none';
        }
        
        if (productNotFound) {
            productNotFound.style.display = 'block';
        }
    }
}

// Inicializar página de produtos
function initProductsPage() {
    // Carregar produtos
    loadProducts();
    
    // Adicionar event listeners para filtros
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadProducts);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', loadProducts);
    }
}

// Inicializar página inicial
function initHomePage() {
    loadFeaturedProducts();
}

// Inicializar página do carrinho
function initCartPage() {
    loadCartItems();
    
    // Adicionar event listener para o formulário de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            checkout();
        });
    }
}

// Verificar qual página está sendo carregada e inicializar adequadamente
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'products.html':
            initProductsPage();
            break;
        case 'product-details.html':
            initProductDetails();
            break;
        case 'cart.html':
            initCartPage();
            break;
    }
});
