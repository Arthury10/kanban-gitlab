# Kanban GitLab

Um sistema de Kanban integrado com GitLab para visualizar e gerenciar issues de forma intuitiva.

## 📋 Funcionalidades

### ✅ Implementadas

- **Seleção de Projetos**: Lista todos os projetos do GitLab do usuário
- **Visualização Kanban**: Issues organizadas em colunas (To Do, Doing, Review, Done)
- **Visualização em Lista**: Lista completa com filtros e ordenação
- **CRUD de Issues**:
  - ✅ Criar novas issues
  - ✅ Editar issues existentes
  - ✅ Fechar issues (mover para Done)
  - ✅ Reabrir issues fechadas
- **Movimento entre Colunas**: Arrastar e soltar ou menu de contexto
- **Filtros e Busca**: Filtrar por status, buscar por título/descrição
- **Labels**: Suporte completo a labels do GitLab
- **Interface Responsiva**: Funciona em desktop e mobile

## 🛠 Tecnologias Utilizadas

- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes de UI
- **Zustand**: Gerenciamento de estado
- **GitLab API**: Integração com GitLab

## 🚀 Como Usar

### Pré-requisitos

1. Token de acesso do GitLab (Personal Access Token)
2. Node.js 18+ instalado

### Configuração

1. Clone o repositório

```bash
git clone <repo-url>
cd kanban-gitlab
```

2. Instale as dependências

```bash
npm install
```

3. Configure seu token do GitLab

   - Edite o arquivo `src/lib/gitlabApi.ts`
   - Substitua o valor de `gitLabAccessToken` pelo seu token

4. Execute o projeto

```bash
npm run dev
```

5. Acesse http://localhost:3000

### Como obter um Token do GitLab

1. Acesse GitLab.com
2. Vá em User Settings > Access Tokens
3. Crie um novo token com as seguintes permissões:
   - `api` (acesso completo à API)
   - `read_user` (informações do usuário)
   - `read_repository` (acesso aos repositórios)

## 📱 Funcionalidades da Interface

### Tela de Seleção de Projetos

- Lista de todos os projetos do usuário
- Busca por nome do projeto
- Informações do projeto (nome, namespace, descrição)
- Link direto para o projeto no GitLab

### Tela do Kanban

- **4 Colunas**:
  - **To Do**: Issues abertas sem labels específicas
  - **Doing**: Issues com labels "doing" ou "in progress"
  - **Review**: Issues com labels "review" ou "testing"
  - **Done**: Issues fechadas

### Operações com Issues

- **Criar**: Botão "Nova Issue" abre modal com campos obrigatórios
- **Editar**: Clique no menu de contexto (⋯) e selecione "Editar"
- **Mover**: Menu de contexto permite mover entre colunas
- **Fechar**: Menu de contexto para fechar issue
- **Reabrir**: Issues fechadas podem ser reabertas

### Visualização em Lista

- Tabela completa de todas as issues
- Filtros por status (Todas, Abertas, Fechadas)
- Busca por título, descrição ou labels
- Ordenação por data de criação, atualização ou título
- Links diretos para o GitLab

## 🔧 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página inicial
│   └── globals.css         # Estilos globais
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   ├── ProjectSelector.tsx # Seleção de projetos
│   ├── KanbanBoard.tsx     # Board principal do Kanban
│   ├── IssueCard.tsx       # Card individual da issue
│   ├── IssueDialog.tsx     # Modal para criar/editar
│   └── IssueList.tsx       # Visualização em lista
└── lib/
    ├── gitlabApi.ts        # Cliente da API GitLab
    ├── store.ts            # Store Zustand
    └── utils.ts            # Utilitários
```

## 🎨 Customização

### Colunas do Kanban

Para modificar as colunas do Kanban, edite a lógica em `KanbanBoard.tsx`:

```typescript
// Exemplo: adicionar nova coluna "Testing"
const testingIssues = openIssues.filter((issue) =>
  issue.labels.some((label) => ["testing", "qa"].includes(label.toLowerCase()))
);
```

### Labels e Status

O sistema usa labels do GitLab para categorizar issues:

- **Sem labels específicas**: To Do
- **"doing", "in progress"**: Doing
- **"review", "testing"**: Review
- **Issues fechadas**: Done

## 🐛 Solução de Problemas

### Token inválido

- Verifique se o token tem as permissões corretas
- Confirme se o token não expirou

### Projetos não carregam

- Verifique sua conexão com a internet
- Confirme se você tem acesso aos projetos no GitLab

### Issues não aparecem

- Verifique se o projeto tem issues
- Confirme se você tem permissão para visualizar issues

## 📝 Próximas Funcionalidades

- [ ] Drag & Drop entre colunas
- [ ] Assignees nas issues
- [ ] Milestone support
- [ ] Comentários nas issues
- [ ] Notificações em tempo real
- [ ] Múltiplos projetos no mesmo board
- [ ] Exportar relatórios
- [ ] Tema escuro/claro
- [ ] PWA (Progressive Web App)

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
