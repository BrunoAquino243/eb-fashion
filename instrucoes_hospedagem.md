# Instruções para Hospedagem do Site EB Fashion

Este documento contém instruções detalhadas para hospedar o seu site EB Fashion gratuitamente na internet.

## Conteúdo do Pacote

O ficheiro `eb_fashion_site.zip` contém o site completo da EB Fashion, incluindo:
- Páginas públicas (catálogo de produtos, detalhes, sobre nós, contacto)
- Área administrativa protegida por senha
- Imagens de produtos e categorias
- Todo o código necessário para o funcionamento do site

## Opções de Hospedagem Gratuita

Existem várias plataformas que oferecem hospedagem gratuita para sites estáticos. Abaixo estão as três opções mais recomendadas:

### 1. GitHub Pages (Recomendado para iniciantes)

**Passo a passo:**

1. Crie uma conta no [GitHub](https://github.com/) se ainda não tiver
2. Crie um novo repositório chamado `eb-fashion` ou outro nome à sua escolha
3. Faça upload dos ficheiros do site (extraídos do ZIP) para o repositório
4. Vá para "Settings" > "Pages"
5. Em "Source", selecione "main" e clique em "Save"
6. O seu site estará disponível em `https://seu-usuario.github.io/eb-fashion/`

### 2. Netlify (Recomendado para facilidade de uso)

**Passo a passo:**

1. Crie uma conta no [Netlify](https://www.netlify.com/)
2. Na página inicial, clique em "Add new site" > "Deploy manually"
3. Arraste a pasta com os ficheiros do site (extraídos do ZIP) para a área indicada
4. Aguarde o upload e processamento
5. O seu site estará disponível em um URL gerado automaticamente (ex: `https://eb-fashion-12345.netlify.app`)
6. Pode personalizar o domínio em "Site settings" > "Domain management"

### 3. Vercel (Recomendado para desempenho)

**Passo a passo:**

1. Crie uma conta no [Vercel](https://vercel.com/)
2. Na página inicial, clique em "New Project" > "Upload"
3. Arraste a pasta com os ficheiros do site (extraídos do ZIP)
4. Clique em "Deploy"
5. O seu site estará disponível em um URL gerado automaticamente (ex: `https://eb-fashion.vercel.app`)

## Acesso à Área Administrativa

Após a publicação do site, você pode aceder à área administrativa através do link no menu superior ou diretamente pelo endereço `/admin/login.html`.

**Credenciais padrão:**
- Utilizador: `admin`
- Senha: `admin123`

**Importante:** Recomendamos alterar a senha após o primeiro acesso por questões de segurança.

## Gestão de Produtos

Na área administrativa, você pode:

1. **Adicionar novos produtos:**
   - Clique em "Adicionar Produto"
   - Preencha os detalhes (nome, categoria, preço, descrição)
   - Faça upload de uma imagem
   - Clique em "Salvar Produto"

2. **Editar produtos existentes:**
   - Na lista de produtos, clique no ícone de edição
   - Atualize as informações necessárias
   - Clique em "Atualizar Produto"

3. **Remover produtos:**
   - Na lista de produtos, clique no ícone de exclusão
   - Confirme a exclusão

4. **Exportar/Importar dados:**
   - No Dashboard, use os botões "Exportar Dados" e "Importar Dados"
   - Isso permite transferir os produtos entre dispositivos diferentes

## Limitações e Considerações

- O site utiliza armazenamento local (localStorage) para guardar os dados dos produtos
- As imagens são armazenadas localmente no site
- Para usar em múltiplos dispositivos, utilize a função de exportar/importar dados
- O formulário de contacto é apenas demonstrativo e não envia emails reais

## Suporte e Ajuda

Se precisar de assistência adicional com o site, não hesite em contactar-nos.

---

© 2025 EB Fashion. Todos os direitos reservados.
