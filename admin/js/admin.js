// Funções específicas para a área administrativa
// Gerencia autenticação, CRUD de produtos e estatísticas

// Verificar se o usuário está logado
function isLoggedIn() {
    const logged = localStorage.getItem('ebfashion_admin_logged');
    const loginTime = localStorage.getItem('ebfashion_admin_login_time');
    
    // Se não estiver logado, retornar false
    if (!logged || logged !== 'true') {
        return false;
    }
    
    // Verificar se o login expirou (24 horas)
    if (loginTime) {
        const now = new Date().getTime();
        const loginDate = parseInt(loginTime);
        const expireTime = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
        
        if (now - loginDate > expireTime) {
            // Login expirado, fazer logout
            logout();
            return false;
        }
    }
    
    return true;
}

// Fazer logout
function logout() {
    localStorage.removeItem('ebfashion_admin_logged');
    localStorage.removeItem('ebfashion_admin_username');
    localStorage.removeItem('ebfashion_admin_login_time');
    window.location.href = 'login.html';
}

// Carregar estatísticas do dashboard
function loadDashboardStats() {
    const products = getProducts();
    const categories = getUniqueCategories();
    const views = getTotalViews();
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalViews').textContent = views;
}

// Carregar produtos recentes para o dashboard
function loadRecentProducts() {
    const recentProductsTable = document.getElementById('recentProductsTable');
    if (!recentProductsTable) return;
    
    const products = getProducts();
    
    // Ordenar por data de criação (mais recentes primeiro)
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limitar a 5 produtos mais recentes
    const recentProducts = products.slice(0, 5);
    
    if (recentProducts.length === 0) {
        recentProductsTable.innerHTML = '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>';
        return;
    }
    
    recentProductsTable.innerHTML = '';
    
    recentProducts.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><img src="../${product.image}" alt="${product.name}" class="table-img"></td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>€${product.price.toFixed(2)}</td>
            <td>
                <div class="action-btns">
                    <a href="add-product.html?id=${product.id}" class="btn btn-sm btn-edit"><i class="fas fa-edit"></i></a>
                    <button class="btn btn-sm btn-delete" onclick="confirmDelete('${product.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        recentProductsTable.appendChild(row);
    });
}

// Carregar tabela de produtos para a página de gerenciamento
function loadProductsTable() {
    const productsTable = document.getElementById('productsTable');
    const noProductsMessage = document.getElementById('noProductsMessage');
    
    if (!productsTable) return;
    
    let products = getProducts();
    
    // Aplicar filtros se existirem
    const categoryFilter = document.getElementById('filterCategory')?.value;
    const searchFilter = document.getElementById('searchProduct')?.value;
    
    if (categoryFilter && categoryFilter !== 'all') {
        products = products.filter(product => product.category === categoryFilter);
    }
    
    if (searchFilter) {
        const searchLower = searchFilter.toLowerCase();
        products = products.filter(product => 
            product.name.toLowerCase().includes(searchLower) || 
            (product.description && product.description.toLowerCase().includes(searchLower))
        );
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (products.length === 0) {
        productsTable.innerHTML = '';
        if (noProductsMessage) {
            noProductsMessage.style.display = 'block';
        }
        return;
    }
    
    if (noProductsMessage) {
        noProductsMessage.style.display = 'none';
    }
    
    productsTable.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><img src="../${product.image}" alt="${product.name}" class="table-img"></td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>€${product.price.toFixed(2)}</td>
            <td>
                <span class="badge ${product.available ? 'badge-success' : 'badge-danger'}">
                    ${product.available ? 'Sim' : 'Não'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <a href="../product-details.html?id=${product.id}" class="btn btn-sm" target="_blank"><i class="fas fa-eye"></i></a>
                    <a href="add-product.html?id=${product.id}" class="btn btn-sm btn-edit"><i class="fas fa-edit"></i></a>
                    <button class="btn btn-sm btn-delete" onclick="confirmDelete('${product.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        productsTable.appendChild(row);
    });
}

// Carregar produto para edição
function loadProductForEdit(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        alert('Produto não encontrado!');
        window.location.href = 'products.html';
        return;
    }
    
    // Preencher formulário
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productAvailable').checked = product.available;
    
    // Exibir imagem atual
    if (product.image) {
        document.getElementById('imagePreview').src = '../' + product.image;
    }
}

// Salvar produto (novo ou edição)
function saveProduct() {
    const productId = document.getElementById('productId').value;
    const isEdit = !!productId;
    
    // Obter dados do formulário
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const description = document.getElementById('productDescription').value;
    const available = document.getElementById('productAvailable').checked;
    
    // Validar campos obrigatórios
    if (!name || !category || isNaN(price)) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Obter produtos existentes
    const products = getProducts();
    
    // Processar imagem
    const imageInput = document.getElementById('productImage');
    let imagePath = '';
    
    if (isEdit) {
        // Se é edição, manter a imagem atual se não foi alterada
        const existingProduct = getProductById(productId);
        imagePath = existingProduct.image;
    }
    
    // Se uma nova imagem foi selecionada
    if (imageInput.files && imageInput.files[0]) {
        // Em um ambiente real, aqui faria upload para um serviço como Cloudinary
        // Para esta demonstração, usaremos uma das imagens de exemplo
        const randomIndex = Math.floor(Math.random() * DEMO_IMAGES.length);
        imagePath = DEMO_IMAGES[randomIndex];
    }
    
    // Se não há imagem (novo produto sem upload), usar imagem padrão
    if (!imagePath) {
        imagePath = 'images/products/default.jpg';
    }
    
    // Criar ou atualizar produto
    const product = {
        id: isEdit ? productId : generateId(),
        name,
        description,
        price,
        category,
        image: imagePath,
        stock,
        available,
        featured: false, // Por padrão, novos produtos não são destaque
        createdAt: isEdit ? getProductById(productId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (isEdit) {
        // Atualizar produto existente
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        // Adicionar novo produto
        products.push(product);
    }
    
    // Salvar alterações
    saveProducts(products);
    
    // Redirecionar para lista de produtos
    alert(isEdit ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
    window.location.href = 'products.html';
}

// Confirmar exclusão de produto
function confirmDelete(productId) {
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    
    // Exibir modal
    deleteModal.style.display = 'block';
    
    // Configurar botão de confirmação
    confirmDeleteBtn.onclick = function() {
        deleteProduct(productId);
        closeDeleteModal();
    };
    
    // Configurar botão de fechar
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = closeDeleteModal;
    }
    
    // Fechar ao clicar fora do modal
    window.onclick = function(event) {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    };
}

// Fechar modal de confirmação
function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'none';
}

// Excluir produto
function deleteProduct(productId) {
    let products = getProducts();
    products = products.filter(product => product.id !== productId);
    saveProducts(products);
    
    // Recarregar tabela ou página
    if (document.getElementById('productsTable')) {
        loadProductsTable();
    } else if (document.getElementById('recentProductsTable')) {
        loadRecentProducts();
    } else {
        window.location.reload();
    }
}

// Exportar dados
function exportData() {
    const products = getProducts();
    const dataStr = JSON.stringify(products);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'ebfashion_products_' + new Date().toISOString().slice(0, 10) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Importar dados
function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const products = JSON.parse(e.target.result);
            
            // Validar se é um array
            if (!Array.isArray(products)) {
                throw new Error('Formato inválido');
            }
            
            // Confirmar importação
            if (confirm(`Importar ${products.length} produtos? Isso substituirá todos os produtos existentes.`)) {
                saveProducts(products);
                alert('Produtos importados com sucesso!');
                window.location.reload();
            }
        } catch (error) {
            alert('Erro ao importar arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
}
