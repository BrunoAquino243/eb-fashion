// Funções principais para o site EB Fashion
// Gerencia produtos, categorias e interações do usuário

// Constantes
const STORAGE_KEY = 'ebfashion_products';
const VIEWS_KEY = 'ebfashion_views';
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
    
    // Inicializar produtos de demonstração se não existirem
    initDemoProducts();
    
    // Incrementar contador de visualizações
    incrementPageView();
});

// Funções de gerenciamento de produtos

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

// Inicializar produtos de demonstração
function initDemoProducts() {
    const products = getProducts();
    
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
    
    card.innerHTML = `
        <a href="product-details.html?id=${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">€${product.price.toFixed(2)}</div>
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
    
    productContainer.innerHTML = `
        <div class="product-gallery">
            <img src="${product.image}" alt="${product.name}" class="product-main-img">
        </div>
        <div class="product-info-details">
            <span class="product-category">${getCategoryName(product.category)}</span>
            <h1 class="product-title">${product.name}</h1>
            <div class="product-price">€${product.price.toFixed(2)}</div>
            <div class="product-description">
                ${product.description || 'Sem descrição disponível.'}
            </div>
            <div class="product-meta">
                <p><strong>Disponibilidade:</strong> ${product.stock > 0 ? 'Em estoque' : 'Esgotado'}</p>
                <p><strong>Categoria:</strong> ${getCategoryName(product.category)}</p>
            </div>
            <div class="product-actions">
                <button class="btn">Adicionar ao Carrinho</button>
            </div>
        </div>
    `;
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
        relatedContainer.innerHTML = '<p class="no-products">Não há produtos relacionados disponíveis.</p>';
        return;
    }
    
    relatedContainer.innerHTML = '';
    
    relatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        relatedContainer.appendChild(productCard);
    });
}

// Funções utilitárias

// Gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Obter nome da categoria
function getCategoryName(categorySlug) {
    const categories = {
        'camisas': 'Camisas',
        'moletons': 'Moletons',
        'calcas': 'Calças',
        'blusas': 'Blusas'
    };
    
    return categories[categorySlug] || categorySlug;
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

// Obter categorias únicas
function getUniqueCategories() {
    const products = getProducts();
    const categories = [...new Set(products.map(product => product.category))];
    return categories;
}
