// Funções específicas para a área administrativa
// Gerencia autenticação, CRUD de produtos, categorias e estatísticas

// Verificar se o usuário está logado
function isLoggedIn() {
    const logged = localStorage.getItem("ebfashion_admin_logged");
    const loginTime = localStorage.getItem("ebfashion_admin_login_time");
    
    // Se não estiver logado, retornar false
    if (!logged || logged !== "true") {
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
    localStorage.removeItem("ebfashion_admin_logged");
    localStorage.removeItem("ebfashion_admin_username");
    localStorage.removeItem("ebfashion_admin_login_time");
    window.location.href = "login.html";
}

// Carregar estatísticas do dashboard
function loadDashboardStats() {
    const products = getProducts(); // Função de main.js
    const categories = getCategories(); // Função de main.js
    
    // Obter contagem de pedidos por status
    const orders = getOrders();
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalCategories").textContent = categories.length;
    
    // Atualizar contadores de pedidos
    document.getElementById("pendingOrders").textContent = pendingOrders;
    document.getElementById("completedOrders").textContent = completedOrders;
    document.getElementById("cancelledOrders").textContent = cancelledOrders;
}

// Carregar produtos recentes para o dashboard
function loadRecentProducts() {
    const recentProductsTable = document.getElementById("recentProductsTable");
    if (!recentProductsTable) return;
    
    const products = getProducts(); // Função de main.js
    
    // Ordenar por data de criação (mais recentes primeiro)
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limitar a 5 produtos mais recentes
    const recentProducts = products.slice(0, 5);
    
    if (recentProducts.length === 0) {
        recentProductsTable.innerHTML = "<tr><td colspan=\"5\">Nenhum produto cadastrado.</td></tr>";
        return;
    }
    
    recentProductsTable.innerHTML = "";
    
    recentProducts.forEach(product => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td><img src="../${product.image}" alt="${product.name}" class="table-img" onerror="this.src='../images/products/no-image.png'"></td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td>
                <div class="action-btns">
                    <a href="add-product.html?id=${product.id}" class="btn btn-sm btn-edit"><i class="fas fa-edit"></i></a>
                    <button class="btn btn-sm btn-delete" onclick="confirmDeleteProduct(\'${product.id}\')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        recentProductsTable.appendChild(row);
    });
}

// Carregar tabela de produtos para a página de gerenciamento
function loadProductsTable() {
    const productsTable = document.getElementById("productsTable");
    const noProductsMessage = document.getElementById("noProductsMessage");
    
    if (!productsTable) return;
    
    let products = getProducts(); // Função de main.js
    
    // Aplicar filtros se existirem
    const categoryFilter = document.getElementById("filterCategory")?.value;
    const searchFilter = document.getElementById("searchProduct")?.value;
    
    if (categoryFilter && categoryFilter !== "all") {
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
        productsTable.innerHTML = "";
        if (noProductsMessage) {
            noProductsMessage.style.display = "block";
        }
        return;
    }
    
    if (noProductsMessage) {
        noProductsMessage.style.display = "none";
    }
    
    productsTable.innerHTML = "";
    
    products.forEach(product => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td><img src="../${product.image}" alt="${product.name}" class="table-img" onerror="this.src='../images/products/no-image.png'"></td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td> 
            <td>${product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td>
                <span class="badge ${product.available ? "badge-success" : "badge-danger"}">
                    ${product.available ? "Sim" : "Não"}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <a href="../product-details.html?id=${product.id}" class="btn btn-sm" target="_blank"><i class="fas fa-eye"></i></a>
                    <a href="add-product.html?id=${product.id}" class="btn btn-sm btn-edit"><i class="fas fa-edit"></i></a>
                    <button class="btn btn-sm btn-delete" onclick="confirmDeleteProduct(\'${product.id}\')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        productsTable.appendChild(row);
    });
}

// Carregar produto para edição
function loadProductForEdit(productId) {
    const product = getProductById(productId); // Função de main.js
    
    if (!product) {
        alert("Produto não encontrado!");
        window.location.href = "products.html";
        return;
    }
    
    // Preencher formulário
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock || 0;
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("productAvailable").checked = product.available;
    
    // Carregar tamanhos
    if (product.sizes && product.sizes.length > 0) {
        document.getElementById('productSizes').value = JSON.stringify(product.sizes);
        const sizesList = document.getElementById('sizesList');
        sizesList.innerHTML = '';
        
        // Definir o tipo de tamanho
        const sizeType = product.sizeType || 'letter';
        document.querySelector(`input[name="sizeType"][value="${sizeType}"]`).checked = true;
        document.getElementById('productSizeType').value = sizeType;
        
        // Atualizar presets de tamanho
        updateSizePresets();
        
        // Se for tamanho único, desabilitar entrada
        if (sizeType === 'unique') {
            document.getElementById('sizeInput').disabled = true;
        }
        
        product.sizes.forEach(size => {
            const sizeTag = document.createElement('span');
            sizeTag.className = 'size-tag';
            
            // Se for tamanho único, não permitir remover
            if (sizeType === 'unique') {
                sizeTag.innerHTML = `${size}`;
            } else {
                sizeTag.innerHTML = `${size} <span class="remove-size" onclick="removeSize('${size}')">&times;</span>`;
            }
            
            sizesList.appendChild(sizeTag);
        });
    }
    
    // Exibir imagem atual
    const imagePreview = document.getElementById("imagePreview");
    if (product.image && imagePreview) {
        imagePreview.src = "../" + product.image;
        imagePreview.style.display = "block";
        
        // Armazenar o caminho da imagem atual como atributo de dados
        imagePreview.setAttribute('data-current-image', product.image);
    }
}

// Salvar produto (novo ou edição)
function saveProduct() {
    const productId = document.getElementById("productId").value;
    const isEdit = !!productId;
    
    // Obter dados do formulário
    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value) || 0;
    const description = document.getElementById("productDescription").value;
    const available = document.getElementById("productAvailable").checked;
    const sizesValue = document.getElementById("productSizes").value;
    const sizes = sizesValue ? JSON.parse(sizesValue) : [];
    const sizeType = document.getElementById("productSizeType").value;
    
    // Validar campos obrigatórios
    if (!name || !category || isNaN(price)) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    
    if (sizes.length === 0) {
        alert("Por favor, adicione pelo menos um tamanho disponível.");
        return;
    }
    
    // Obter produtos existentes
    const products = getProducts(); // Função de main.js
    
    // Processar imagem
    const imageInput = document.getElementById("productImage");
    let imagePath = "";
    
    if (isEdit) {
        // Se é edição, manter a imagem atual se não foi alterada
        const existingProduct = getProductById(productId); // Função de main.js
        imagePath = existingProduct.image;
    }
    
    // Se uma nova imagem foi selecionada
    if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const fileName = file.name;
        const timestamp = new Date().getTime(); // Adiciona timestamp para evitar cache e garantir unicidade
        
        // Gerar um caminho único para a imagem baseado no nome do arquivo e timestamp
        // Em um ambiente real, aqui faria upload para o servidor
        // Para esta simulação, vamos criar um caminho único
        imagePath = `images/products/upload_${timestamp}_${fileName.replace(/\s+/g, '_')}`;
        
        // Aqui, em um ambiente real, faria o upload do arquivo para o servidor
        // Como estamos em uma simulação, apenas registramos o caminho
        
        // Converter a imagem para base64 e armazenar no localStorage para simular o upload
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageBase64 = e.target.result;
            localStorage.setItem(`ebfashion_image_${timestamp}_${fileName.replace(/\s+/g, '_')}`, imageBase64);
        };
        reader.readAsDataURL(file);
    }
    
    // Se não há imagem (novo produto sem upload), usar imagem padrão
    if (!imagePath) {
        imagePath = "images/products/no-image.png";
    }
    
    // Criar ou atualizar produto
    const product = {
        id: isEdit ? productId : generateId(), // Função de main.js
        name,
        description,
        price,
        category,
        image: imagePath,
        stock,
        available,
        sizes,
        sizeType,
        featured: isEdit ? getProductById(productId).featured : false, // Manter o status de destaque na edição
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
    saveProducts(products); // Função de main.js
    
    // Redirecionar para lista de produtos
    alert(isEdit ? "Produto atualizado com sucesso!" : "Produto adicionado com sucesso!");
    window.location.href = "products.html";
}

// Confirmar exclusão de produto
function confirmDeleteProduct(productId) {
    if (confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
        deleteProduct(productId);
    }
}

// Fechar modal de confirmação
function closeDeleteModal() {
    const deleteModal = document.getElementById("deleteModal");
    if (deleteModal) {
        deleteModal.style.display = "none";
    }
}

// Excluir produto
function deleteProduct(productId) {
    let products = getProducts(); // Função de main.js
    products = products.filter(product => product.id !== productId);
    saveProducts(products); // Função de main.js
    
    // Recarregar tabela ou página
    if (document.getElementById("productsTable")) {
        loadProductsTable();
    } else if (document.getElementById("recentProductsTable")) {
        loadRecentProducts();
    } else {
        // Se estiver em outra página, apenas recarrega
        // window.location.reload(); 
        // Melhor não recarregar automaticamente, apenas atualizar a tabela
    }
    alert("Produto excluído com sucesso!");
}

// Exportar dados (Produtos)
function exportData() {
    const products = getProducts(); // Função de main.js
    const dataStr = JSON.stringify(products, null, 2); // Formatação para leitura
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = "ebfashion_products_" + new Date().toISOString().slice(0, 10) + ".json";
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
}

// Importar dados (Produtos)
function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedProducts = JSON.parse(e.target.result);
            
            // Validar se é um array
            if (!Array.isArray(importedProducts)) {
                throw new Error("Formato inválido. O arquivo deve conter um array de produtos.");
            }
            
            // Validar estrutura básica de um produto (opcional, mas recomendado)
            if (importedProducts.length > 0) {
                const firstProduct = importedProducts[0];
                if (!firstProduct.id || !firstProduct.name || !firstProduct.price || !firstProduct.category) {
                     throw new Error("Formato inválido. Produtos devem ter id, name, price e category.");
                }
            }
            
            // Confirmar importação
            if (confirm(`Importar ${importedProducts.length} produtos? Isso substituirá todos os produtos existentes.`)) {
                saveProducts(importedProducts); // Função de main.js
                alert("Produtos importados com sucesso!");
                // Recarregar para refletir mudanças
                if (document.getElementById("productsTable")) {
                    loadProductsTable();
                } else if (document.getElementById("recentProductsTable")) {
                    loadRecentProducts();
                    loadDashboardStats();
                } else {
                     window.location.reload();
                }
            }
        } catch (error) {
            alert("Erro ao importar arquivo: " + error.message);
        }
    };
    reader.readAsText(file);
    // Limpar o input para permitir importar o mesmo arquivo novamente se necessário
    input.value = null;
}

// --- Funções de Gerenciamento de Categorias ---

// Gerar slug a partir do nome da categoria
function generateSlug(name) {
    return name.toLowerCase()
               .replace(/\s+/g, "-") // Substitui espaços por hífens
               .replace(/[^\[a-z0-9\-]/g, "") // Remove caracteres inválidos
               .replace(/\-\-+/g, "-") // Substitui múltiplos hífens por um único
               .replace(/^-+/, "") // Remove hífens do início
               .replace(/-+$/, ""); // Remove hífens do fim
}

// Carregar tabela de categorias
function loadCategoriesTable() {
    const categoriesTable = document.getElementById("categoriesTable");
    if (!categoriesTable) return;

    const categories = getCategories(); // Função de main.js
    categoriesTable.innerHTML = ""; // Limpa a tabela

    if (categories.length === 0) {
        categoriesTable.innerHTML = "<tr><td colspan=\"3\">Nenhuma categoria cadastrada.</td></tr>";
        return;
    }

    categories.forEach(category => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.slug}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-edit" onclick="editCategory('${category.slug}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-delete" onclick="confirmDeleteCategory('${category.slug}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        categoriesTable.appendChild(row);
    });
}

// Adicionar ou atualizar categoria
function saveCategory() {
    const categoryNameInput = document.getElementById("categoryName");
    const categorySlugInput = document.getElementById("categorySlug"); // Hidden input para edição
    const categoryName = categoryNameInput.value.trim();
    const existingSlug = categorySlugInput.value;

    if (!categoryName) {
        alert("Por favor, insira o nome da categoria.");
        return;
    }

    const categories = getCategories(); // Função de main.js
    const newSlug = existingSlug || generateSlug(categoryName);

    // Verificar se já existe uma categoria com este slug (exceto se for edição)
    if (!existingSlug && categories.some(cat => cat.slug === newSlug)) {
        alert("Já existe uma categoria com este nome ou slug.");
        return;
    }

    if (existingSlug) {
        // Edição: atualizar categoria existente
        const index = categories.findIndex(cat => cat.slug === existingSlug);
        if (index !== -1) {
            categories[index] = { name: categoryName, slug: newSlug };
        }
    } else {
        // Adição: nova categoria
        categories.push({ name: categoryName, slug: newSlug });
    }

    // Salvar alterações
    saveCategories(categories); // Função de main.js

    // Limpar formulário e recarregar tabela
    categoryNameInput.value = "";
    categorySlugInput.value = "";
    document.getElementById("categoryFormTitle").textContent = "Adicionar Categoria";
    document.getElementById("saveCategoryBtn").textContent = "Adicionar";
    document.getElementById("cancelEditBtn").style.display = "none";

    loadCategoriesTable();
    loadCategoriesForSelect(); // Atualizar select de categorias se existir
}

// Editar categoria
function editCategory(slug) {
    const categories = getCategories(); // Função de main.js
    const category = categories.find(cat => cat.slug === slug);

    if (!category) {
        alert("Categoria não encontrada.");
        return;
    }

    // Preencher formulário para edição
    document.getElementById("categoryName").value = category.name;
    document.getElementById("categorySlug").value = category.slug;
    document.getElementById("categoryFormTitle").textContent = "Editar Categoria";
    document.getElementById("saveCategoryBtn").textContent = "Atualizar";
    document.getElementById("cancelEditBtn").style.display = "inline-block";

    // Scroll para o formulário
    document.getElementById("categoryForm").scrollIntoView({ behavior: "smooth" });
}

// Cancelar edição de categoria
function cancelEditCategory() {
    document.getElementById("categoryName").value = "";
    document.getElementById("categorySlug").value = "";
    document.getElementById("categoryFormTitle").textContent = "Adicionar Categoria";
    document.getElementById("saveCategoryBtn").textContent = "Adicionar";
    document.getElementById("cancelEditBtn").style.display = "none";
}

// Confirmar exclusão de categoria
function confirmDeleteCategory(slug) {
    if (confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
        deleteCategory(slug);
    }
}

// Excluir categoria
function deleteCategory(slug) {
    let categories = getCategories(); // Função de main.js
    categories = categories.filter(cat => cat.slug !== slug);
    saveCategories(categories); // Função de main.js
    loadCategoriesTable();
}

// Carregar categorias para select
function loadCategoriesForSelect() {
    const categorySelect = document.getElementById("filterCategory") || document.getElementById("productCategory");
    if (!categorySelect) return;

    const categories = getCategories(); // Função de main.js

    // Manter apenas a primeira opção (Todas ou Selecione)
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }

    // Adicionar categorias ao select
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.slug;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Obter pedidos
function getOrders() {
    const orders = localStorage.getItem('ebfashion_orders');
    return orders ? JSON.parse(orders) : [];
}
