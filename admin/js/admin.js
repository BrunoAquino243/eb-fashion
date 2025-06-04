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
        // Obter a imagem correta (local ou base64)
        const imagePath = getProductImage(product);
        
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td><img src="${imagePath}" alt="${product.name}" class="table-img" onerror="this.src='../images/products/no-image.png'"></td>
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
        // Obter a imagem correta (local ou base64)
        const imagePath = getProductImage(product);
        
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td><img src="${imagePath}" alt="${product.name}" class="table-img" onerror="this.src='../images/products/no-image.png'"></td>
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
    const imagePlaceholder = document.getElementById("imagePlaceholder");
    
    // Obter a imagem correta (local ou base64)
    const imagePath = getProductImage(product);
    
    if (imagePath && imagePath !== 'images/products/no-image.png') {
        imagePreview.src = imagePath;
        imagePreview.style.display = "block";
        if (imagePlaceholder) {
            imagePlaceholder.style.display = "none";
        }
        
        // Armazenar o caminho da imagem atual como atributo de dados
        imagePreview.setAttribute('data-current-image', product.image);
    } else {
        // Se não houver imagem, mostrar o placeholder
        imagePreview.style.display = "none";
        if (imagePlaceholder) {
            imagePlaceholder.style.display = "flex";
        }
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
                } else {
                    window.location.reload();
                }
            }
        } catch (error) {
            alert("Erro ao importar dados: " + error.message);
        }
    };
    reader.readAsText(file);
}

// Carregar categorias para a tabela
function loadCategoriesTable() {
    const categoriesTable = document.getElementById("categoriesTable");
    if (!categoriesTable) return;
    
    const categories = getCategories(); // Função de main.js
    
    if (categories.length === 0) {
        categoriesTable.innerHTML = "<tr><td colspan=\"4\">Nenhuma categoria cadastrada.</td></tr>";
        return;
    }
    
    categoriesTable.innerHTML = "";
    
    categories.forEach(category => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.slug}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-edit" onclick="editCategory('${category.slug}', '${category.name}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-delete" onclick="confirmDeleteCategory('${category.slug}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        categoriesTable.appendChild(row);
    });
}

// Adicionar nova categoria
function addCategory() {
    const categoryName = document.getElementById("categoryName").value.trim();
    
    if (!categoryName) {
        alert("Por favor, insira um nome para a categoria.");
        return;
    }
    
    // Gerar slug a partir do nome (simplificado)
    const slug = categoryName.toLowerCase()
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    // Verificar se já existe uma categoria com este slug
    const categories = getCategories(); // Função de main.js
    if (categories.some(cat => cat.slug === slug)) {
        alert("Já existe uma categoria com este nome.");
        return;
    }
    
    // Adicionar nova categoria
    categories.push({
        name: categoryName,
        slug: slug
    });
    
    // Salvar categorias
    saveCategories(categories); // Função de main.js
    
    // Limpar campo e recarregar tabela
    document.getElementById("categoryName").value = "";
    loadCategoriesTable();
    
    alert("Categoria adicionada com sucesso!");
}

// Editar categoria
function editCategory(slug, name) {
    const newName = prompt("Editar nome da categoria:", name);
    
    if (!newName || newName.trim() === "") {
        return; // Cancelado ou vazio
    }
    
    const categories = getCategories(); // Função de main.js
    const categoryIndex = categories.findIndex(cat => cat.slug === slug);
    
    if (categoryIndex === -1) {
        alert("Categoria não encontrada.");
        return;
    }
    
    // Atualizar apenas o nome, mantendo o slug original
    categories[categoryIndex].name = newName.trim();
    
    // Salvar categorias
    saveCategories(categories); // Função de main.js
    
    // Recarregar tabela
    loadCategoriesTable();
    
    alert("Categoria atualizada com sucesso!");
}

// Confirmar exclusão de categoria
function confirmDeleteCategory(slug) {
    // Verificar se há produtos usando esta categoria
    const products = getProducts(); // Função de main.js
    const productsUsingCategory = products.filter(product => product.category === slug);
    
    if (productsUsingCategory.length > 0) {
        alert(`Não é possível excluir esta categoria. Existem ${productsUsingCategory.length} produtos associados a ela.`);
        return;
    }
    
    if (confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
        deleteCategory(slug);
    }
}

// Excluir categoria
function deleteCategory(slug) {
    let categories = getCategories(); // Função de main.js
    categories = categories.filter(category => category.slug !== slug);
    saveCategories(categories); // Função de main.js
    
    // Recarregar tabela
    loadCategoriesTable();
    
    alert("Categoria excluída com sucesso!");
}

// Carregar pedidos para a tabela
function loadOrdersTable() {
    const ordersTable = document.getElementById("ordersTable");
    if (!ordersTable) return;
    
    const orders = getOrders(); // Função de main.js
    
    if (orders.length === 0) {
        ordersTable.innerHTML = "<tr><td colspan=\"6\">Nenhum pedido registrado.</td></tr>";
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    ordersTable.innerHTML = "";
    
    orders.forEach(order => {
        const row = document.createElement("tr");
        
        // Formatar data
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('pt-BR');
        
        // Status em português
        let statusText = "Pendente";
        let statusClass = "badge-warning";
        
        if (order.status === "completed") {
            statusText = "Concluído";
            statusClass = "badge-success";
        } else if (order.status === "cancelled") {
            statusText = "Cancelado";
            statusClass = "badge-danger";
        }
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${formattedDate}</td>
            <td>${order.customer.name}</td>
            <td>${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
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
        alert("Pedido não encontrado.");
        return;
    }
    
    // Preencher modal com detalhes do pedido
    const modal = document.getElementById("orderDetailsModal");
    const modalContent = document.getElementById("orderDetailsContent");
    
    if (!modal || !modalContent) return;
    
    // Formatar data
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('pt-BR');
    
    // Status em português
    let statusText = "Pendente";
    
    if (order.status === "completed") {
        statusText = "Concluído";
    } else if (order.status === "cancelled") {
        statusText = "Cancelado";
    }
    
    // Gerar HTML para itens do pedido
    let itemsHtml = "";
    order.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td>${item.name}</td>
                <td>${item.size || 'Não especificado'}</td>
                <td>${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>${item.quantity}</td>
                <td>${(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
        `;
    });
    
    // Preencher conteúdo do modal
    modalContent.innerHTML = `
        <div class="order-details-header">
            <h3>Detalhes do Pedido</h3>
            <button class="close-btn" onclick="closeOrderDetailsModal()">&times;</button>
        </div>
        
        <div class="order-info">
            <h4>Informações do Pedido</h4>
            <p><strong>ID do Pedido:</strong> ${order.id}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Status:</strong> ${statusText}</p>
            
            <h4>Informações do Cliente</h4>
            <p><strong>Nome:</strong> ${order.customer.name}</p>
            <p><strong>Telefone:</strong> ${order.customer.phone}</p>
            <p><strong>Tamanho:</strong> ${order.customer.size || 'Não especificado'}</p>
            <p><strong>Observações:</strong> ${order.customer.notes || 'Nenhuma observação'}</p>
            
            <h4>Itens do Pedido</h4>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Tamanho</th>
                            <th>Preço</th>
                            <th>Quantidade</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4"><strong>Total do Pedido:</strong></td>
                            <td><strong>${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="order-actions">
                ${order.status === "pending" ? `
                    <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">Cancelar Pedido</button>
                    <button class="btn btn-success" onclick="completeOrder('${order.id}')">Marcar como Concluído</button>
                ` : ''}
                <button class="btn" onclick="closeOrderDetailsModal()">Fechar</button>
            </div>
        </div>
    `;
    
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

// Cancelar pedido
function cancelOrder(orderId) {
    if (confirm("Tem certeza que deseja cancelar este pedido?")) {
        updateOrderStatus(orderId, "cancelled");
        closeOrderDetailsModal();
    }
}

// Marcar pedido como concluído
function completeOrder(orderId) {
    if (confirm("Marcar este pedido como concluído?")) {
        updateOrderStatus(orderId, "completed");
        closeOrderDetailsModal();
    }
}

// Atualizar status do pedido
function updateOrderStatus(orderId, status) {
    const orders = getOrders(); // Função de main.js
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        alert("Pedido não encontrado.");
        return;
    }
    
    orders[orderIndex].status = status;
    saveOrders(orders); // Função de main.js
    
    // Recarregar tabela
    loadOrdersTable();
    
    // Atualizar estatísticas do dashboard se estiver na página inicial
    if (document.getElementById("totalProducts")) {
        loadDashboardStats();
    }
    
    alert("Status do pedido atualizado com sucesso!");
}

// Inicializar página de login
function initLoginPage() {
    // Se já estiver logado, redirecionar para o dashboard
    if (isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }
    
    // Adicionar event listener para o formulário de login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            
            // Verificar credenciais (simplificado para demonstração)
            // Em um ambiente real, isso seria feito com autenticação segura no servidor
            if (username === "admin" && password === "admin") {
                // Salvar estado de login
                localStorage.setItem("ebfashion_admin_logged", "true");
                localStorage.setItem("ebfashion_admin_username", username);
                localStorage.setItem("ebfashion_admin_login_time", new Date().getTime());
                
                // Redirecionar para o dashboard
                window.location.href = "index.html";
            } else {
                alert("Credenciais inválidas. Tente novamente.");
            }
        });
    }
}

// Inicializar página de dashboard
function initDashboardPage() {
    loadDashboardStats();
    loadRecentProducts();
}

// Inicializar página de produtos
function initProductsPage() {
    loadProductsTable();
    
    // Adicionar event listeners para filtros
    const filterCategory = document.getElementById("filterCategory");
    const searchProduct = document.getElementById("searchProduct");
    
    if (filterCategory) {
        // Carregar categorias para o filtro
        const categories = getCategories(); // Função de main.js
        
        // Adicionar opção "Todas"
        let options = `<option value="all">Todas as Categorias</option>`;
        
        // Adicionar categorias
        categories.forEach(category => {
            options += `<option value="${category.slug}">${category.name}</option>`;
        });
        
        filterCategory.innerHTML = options;
        
        // Adicionar event listener
        filterCategory.addEventListener("change", loadProductsTable);
    }
    
    if (searchProduct) {
        // Adicionar event listener para busca com debounce
        let timeout = null;
        searchProduct.addEventListener("input", function() {
            clearTimeout(timeout);
            timeout = setTimeout(loadProductsTable, 500);
        });
    }
}

// Inicializar página de categorias
function initCategoriesPage() {
    loadCategoriesTable();
    
    // Adicionar event listener para o formulário de categoria
    const categoryForm = document.getElementById("categoryForm");
    if (categoryForm) {
        categoryForm.addEventListener("submit", function(e) {
            e.preventDefault();
            addCategory();
        });
    }
}

// Inicializar página de pedidos
function initOrdersPage() {
    loadOrdersTable();
}

// Verificar qual página está sendo carregada e inicializar adequadamente
document.addEventListener("DOMContentLoaded", function() {
    // Verificar login em todas as páginas exceto login.html
    if (!window.location.pathname.includes("login.html") && !isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }
    
    const currentPage = window.location.pathname.split("/").pop();
    
    switch (currentPage) {
        case "index.html":
        case "":
            initDashboardPage();
            break;
        case "products.html":
            initProductsPage();
            break;
        case "add-product.html":
            // Já inicializado no próprio HTML
            break;
        case "categories.html":
            initCategoriesPage();
            break;
        case "orders.html":
            initOrdersPage();
            break;
        case "login.html":
            initLoginPage();
            break;
    }
});
