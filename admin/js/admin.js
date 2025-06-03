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
    const views = getTotalViews(); // Função de main.js
    
    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalCategories").textContent = categories.length;
    document.getElementById("totalViews").textContent = views;
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
            <td><img src="../${product.image}" alt="${product.name}" class="table-img"></td>
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
            <td><img src="../${product.image}" alt="${product.name}" class="table-img"></td>
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
    
    // Validar campos obrigatórios
    if (!name || !category || isNaN(price)) {
        alert("Por favor, preencha todos os campos obrigatórios.");
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
        
        console.log("Nova imagem selecionada:", imagePath);
        
        // Aqui, em um ambiente real, faria o upload do arquivo para o servidor
        // Como estamos em uma simulação, apenas registramos o caminho
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
    const newSlug = generateSlug(categoryName);

    if (existingSlug) { // Modo Edição
        // Verifica se o novo nome/slug já existe (excluindo a própria categoria sendo editada)
        if (categories.some(cat => cat.slug === newSlug && cat.slug !== existingSlug)) {
            alert("Já existe uma categoria com este nome.");
            return;
        }

        // Atualiza a categoria existente
        const index = categories.findIndex(cat => cat.slug === existingSlug);
        if (index !== -1) {
            categories[index] = {
                name: categoryName,
                slug: newSlug
            };
        }
    } else { // Modo Adição
        // Verifica se o nome/slug já existe
        if (categories.some(cat => cat.slug === newSlug)) {
            alert("Já existe uma categoria com este nome.");
            return;
        }

        // Adiciona nova categoria
        categories.push({
            name: categoryName,
            slug: newSlug
        });
    }

    // Salva as alterações
    saveCategories(categories); // Função de main.js

    // Limpa o formulário e recarrega a tabela
    categoryNameInput.value = "";
    categorySlugInput.value = "";
    document.getElementById("categoryFormTitle").textContent = "Adicionar Nova Categoria";
    document.getElementById("saveCategoryBtn").textContent = "Adicionar Categoria";
    
    loadCategoriesTable();
    
    // Atualiza o select de categorias em add-product.html se estiver na mesma página
    updateCategorySelects();
    
    alert(existingSlug ? "Categoria atualizada com sucesso!" : "Categoria adicionada com sucesso!");
}

// Editar categoria
function editCategory(slug) {
    const categories = getCategories(); // Função de main.js
    const category = categories.find(cat => cat.slug === slug);
    
    if (category) {
        document.getElementById("categoryName").value = category.name;
        document.getElementById("categorySlug").value = category.slug;
        document.getElementById("categoryFormTitle").textContent = "Editar Categoria";
        document.getElementById("saveCategoryBtn").textContent = "Atualizar Categoria";
        
        // Scroll para o formulário
        document.getElementById("categoryForm").scrollIntoView({ behavior: 'smooth' });
    }
}

// Confirmar exclusão de categoria
function confirmDeleteCategory(slug) {
    if (confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
        deleteCategory(slug);
    }
}

// Excluir categoria
function deleteCategory(slug) {
    // Verificar se há produtos usando esta categoria
    const products = getProducts(); // Função de main.js
    const productsWithCategory = products.filter(product => product.category === slug);
    
    if (productsWithCategory.length > 0) {
        if (!confirm(`Existem ${productsWithCategory.length} produtos associados a esta categoria. Deseja continuar e remover a categoria destes produtos?`)) {
            return;
        }
        
        // Atualizar produtos para usar categoria padrão
        productsWithCategory.forEach(product => {
            product.category = "sem-categoria";
        });
        
        saveProducts(products); // Função de main.js
    }
    
    // Remover categoria
    let categories = getCategories(); // Função de main.js
    categories = categories.filter(category => category.slug !== slug);
    saveCategories(categories); // Função de main.js
    
    // Recarregar tabela
    loadCategoriesTable();
    
    // Atualizar selects de categorias
    updateCategorySelects();
    
    alert("Categoria excluída com sucesso!");
}

// Atualizar selects de categorias em todas as páginas relevantes
function updateCategorySelects() {
    const categorySelects = document.querySelectorAll('select[id="productCategory"], select[id="filterCategory"]');
    
    if (categorySelects.length === 0) return;
    
    const categories = getCategories(); // Função de main.js
    
    categorySelects.forEach(select => {
        const isFilter = select.id === "filterCategory";
        const currentValue = select.value;
        
        // Limpar opções existentes, mantendo apenas a primeira (placeholder ou "todas")
        while (select.options.length > (isFilter ? 1 : 0)) {
            select.remove(isFilter ? 1 : 0);
        }
        
        // Adicionar categorias
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.slug;
            option.textContent = category.name;
            select.appendChild(option);
        });
        
        // Restaurar valor selecionado se possível
        if (currentValue) {
            select.value = currentValue;
            
            // Se o valor não existe mais (categoria foi excluída), selecionar o primeiro
            if (select.value !== currentValue) {
                select.selectedIndex = 0;
            }
        }
    });
}

// Carregar pedidos para a página de gerenciamento
function loadOrders() {
    const ordersTable = document.getElementById("ordersTable");
    const noOrdersMessage = document.getElementById("noOrdersMessage");
    
    if (!ordersTable) return;
    
    const orders = getOrders(); // Função de main.js
    
    if (orders.length === 0) {
        ordersTable.innerHTML = "";
        if (noOrdersMessage) {
            noOrdersMessage.style.display = "block";
        }
        return;
    }
    
    if (noOrdersMessage) {
        noOrdersMessage.style.display = "none";
    }
    
    // Ordenar por data (mais recentes primeiro)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    ordersTable.innerHTML = "";
    
    orders.forEach(order => {
        const row = document.createElement("tr");
        
        // Formatar data
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('pt-BR') + ' ' + 
                             orderDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        
        // Calcular valor total
        const totalValue = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.customerPhone}</td>
            <td>${formattedDate}</td>
            <td>${order.items.length} item(ns)</td>
            <td>${totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        `;
        
        ordersTable.appendChild(row);
    });
}

// Ver detalhes do pedido
function viewOrderDetails(orderId) {
    const orders = getOrders(); // Função de main.js
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert("Pedido não encontrado!");
        return;
    }
    
    // Preencher modal com detalhes do pedido
    const modal = document.getElementById("orderDetailsModal");
    const orderIdElement = document.getElementById("orderDetailsId");
    const orderDateElement = document.getElementById("orderDetailsDate");
    const customerNameElement = document.getElementById("orderDetailsCustomerName");
    const customerPhoneElement = document.getElementById("orderDetailsCustomerPhone");
    const orderItemsTable = document.getElementById("orderItemsTable");
    const orderTotalElement = document.getElementById("orderDetailsTotal");
    
    if (!modal || !orderIdElement || !orderDateElement || !customerNameElement || 
        !customerPhoneElement || !orderItemsTable || !orderTotalElement) {
        console.error("Elementos do modal não encontrados!");
        return;
    }
    
    // Formatar data
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('pt-BR') + ' ' + 
                         orderDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    
    // Preencher informações básicas
    orderIdElement.textContent = order.id;
    orderDateElement.textContent = formattedDate;
    customerNameElement.textContent = order.customerName;
    customerPhoneElement.textContent = order.customerPhone;
    
    // Preencher itens
    orderItemsTable.innerHTML = "";
    let totalValue = 0;
    
    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalValue += itemTotal;
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="../${item.image}" alt="${item.name}" class="table-img"></td>
            <td>${item.name}</td>
            <td>${item.size || 'Único'}</td>
            <td>${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${item.quantity}</td>
            <td>${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        `;
        
        orderItemsTable.appendChild(row);
    });
    
    // Preencher total
    orderTotalElement.textContent = totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Exibir modal
    modal.style.display = "block";
}

// Fechar modal de detalhes do pedido
function closeOrderDetailsModal() {
    const modal = document.getElementById("orderDetailsModal");
    if (modal) {
        modal.style.display = "none";
    }
}
