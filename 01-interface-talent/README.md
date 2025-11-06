# Desafio 01 — Interface de Talentos

## Objetivos Implementados

Implementada uma interface de listagem de talentos com:
- **Paginação Server-Side:** A lógica é controlada pelo servidor, lendo os `searchParams` da URL.
- **Barra de Busca (com Debounce):** Busca por nome, sobrenome ou email do jovem/líder.
- **Filtros Dinâmicos (Server-Side):**
  - `department` (Departamento) - Carregado dinamicamente da API.
  - `current_status` (Status) - Carregado dinamicamente da API.
  - `pdi_plan_ready` (PDI Pronto?) - Filtro booleano (Sim/Não/Todos).
  - `target_role_id` (Cargo Alvo) - Filtro relacional carregado dinamicamente da API.
- **Contagem de Resultados:** Exibe o total de resultados encontrados.
- **Responsividade e Acessibilidade:** Uso de componentes `shadcn/ui` e Tailwind CSS.

## Stack e Decisões Tomadas no Projeto

- **Backend de dados:** Postgres (v15) + Directus (v10) (fornecidos via docker-compose).
- **Frontend:** Next.js (v14+ com App Router), TypeScript, Tailwind CSS (v3) e Shadcn/UI (implementando a stack bônus).
- **Integração:** A API REST do Directus é consumida diretamente pelos Server Components do Next.js (`app/page.tsx`), seguindo uma arquitetura de BFF (Backend for Frontend) integrada e segura.

- Arquitetura BFF (Integrada): A lógica de negócios e o consumo da API do Directus são feitos exclusivamente em Componentes de Servidor (Server Components), especificamente no app/page.tsx. Esta abordagem garante segurança , pois a URL do Directus, a lógica de construção de filtros e quaisquer chaves de API nunca são expostas ao navegador do lado do cliente.

- Estado Server-Side (URL): O estado dos filtros, busca e paginação é gerenciado 100% pelos Parâmetros de Busca da URL (searchParams).

- Gerenciamento de Cache: A atualização dos dados após a mudança de um filtro é feita pela combinação de router.push() (para mudar a URL) e router.refresh() (para invalidar o cache do cliente e forçar a re-execução do Server Component).

- Correção dos Scripts do Backend: Os scripts schema.sql e seed.sql fornecidos estavam quebrados (dependência circular, conflito de versão do Directus v10). Eles foram corrigidos e as instruções de setup no README.md (neste fork) refletem o processo manual necessário para popular o banco.

## Como rodar localmente (Instruções Corrigidas)

O processo de setup original continha erros de dependência circular. Siga esta sequência para garantir que o ambiente funcione.

### 1. Pré-requisitos

- **Docker Desktop:** Deve estar instalado e em execução.
- **Node.js:** v18.x ou superior.
- **Git:** Para clonar o repositório.

### 2. Setup do Back-end (Directus + Postgres)

**a. Configure as Variáveis de Ambiente (Backend)**

1.  Navegue até o diretório `01-interface-talent/directus/`.
2.  Crie um novo arquivo chamado `.env`.
3.  Adicione o seguinte conteúdo ao arquivo `.env`:

    ```ini
    # Configurações do Servidor Directus
    PORT=8055

    # URL pública (para o Directus saber seu próprio endereço)
    PUBLIC_URL=http://localhost:8055

    KEY=chave-secreta-para-o-desafio-leapy
    SECRET=segredo-secreto-para-o-desafio

    # Credenciais do Admin do Directus
    ADMIN_EMAIL=gabrielevancor@gmail.com
    ADMIN_PASSWORD=senha_cfg

    # Estas senhas são usadas internamente para o Directus se conectar ao Postgres
    POSTGRES_DB=leapy
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres_cfg
    ```

**b. Inicie os Contêineres (Docker)**

1.  Navegue de volta para a pasta `01-interface-talent`.
2.  Execute o Docker Compose para ligar o backend:
    ```bash
    docker compose -f directus/docker-compose.yml up -d --build
    ```
3.  Aguarde os serviços subirem.

**c. Setup Manual do Banco de Dados (Passos Cruciais)**

Os scripts `seed/schema.sql` originais falham se rodados automaticamente. Eles precisam ser executados manualmente *após* o Directus ter sido inicializado e configurado.

1.  **Faça o Login no Directus (O "Sinal Verde")**
    * Abra `http://localhost:8055` no seu navegador.
    * Faça o login com as credenciais do seu `.env` (ex: `gabrielevancor@gmail.com` / `senha_cfg`).

2.  **Crie o "Role" Faltante**
    * O script de seed (`seed.sql`) precisa atribuir novos usuários ao "Role" `Authenticated`, que não é criado por padrão.
    * No painel do Directus, vá em **Settings (Configurações) > Roles & Permissions (Funções e Permissões)**.
    * Clique no ícone `+` (Mais) para criar uma nova "Role".
    * Dê o nome **exato**: `Authenticated`
    * Clique em "Save".

3.  **Execute os Scripts SQL Corrigidos**
    * Os arquivos `schema.sql` e `seed.sql` neste fork já contêm as correções de bugs.
    * Execute os seguintes comandos no seu terminal (na pasta `01-interface-talent`):

    ```bash
    # 1. Executa o Schema (Cria as tabelas)
    docker compose -f directus/docker-compose.yml exec postgres psql -U postgres -d leapy -f /tmp/seed/schema.sql
    
    # 2. Executa o Seed (Popula os 100+ talentos)
    docker compose -f directus/docker-compose.yml exec postgres psql -U postgres -d leapy -f /tmp/seed/seed.sql
    ```

4.  **Habilite a Visibilidade das Coleções**
    * Por padrão, o Directus esconde tabelas criadas manualmente.
    * No painel, vá em **Settings (Configurações) > Collections (Coleções)**.
    * Clique em `talents`, desative o *toggle switch* **"Hidden" (Oculto)** e salve.
    * Repita o processo para `internship_leaders` e `target_roles`.

5.  **Habilite o Acesso Público (Leitura)**
    * Para o frontend (Next.js) poder ler os dados.
    * Vá em **Settings (Configurações) > Roles & Permissions (Funções e Permissões)**.
    * Clique no "Role" **Public**.
    * Habilite a permissão de **Leitura** (primeiro ícone ✔️) para as seguintes coleções:
        * `talents`
        * `internship_leaders`
        * `target_roles`
    * Em "System Collections", habilite a leitura também para:
        * `directus_users` (para que a busca por nome/email funcione)

O seu **Backend** agora está 100% configurado e pronto em `http://localhost:8055`.

### 3. Setup do Front-end (Next.js)

1.  Navegue até a pasta `frontend` (de dentro de `01-interface-talent`):
    ```bash
    cd frontend
    ```
2.  Instale todas as dependências do projeto:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  Abra `http://localhost:3000` no seu navegador para ver a aplicação.

## Esquema e Dados

- Os schemas reais estão em `directus/seed/schema.sql`:
  - `public.talents`
  - `public.internship_leaders`
  - `public.target_roles`
  - (o Directus provisiona `directus_users`)
- **Nota:** Os scripts `schema.sql` e `seed.sql` neste fork foram **corrigidos** para resolver problemas de dependência circular (no `schema.sql`) e para serem compatíveis com a estrutura de `role` do Directus v10 (no `seed.sql`).

## Requisitos Técnicos Implementados

- **Debounce na busca:** Implementado no componente `SearchBar` (`/components/search-bar.tsx`) com um delay de 500ms usando `useEffect` e `setTimeout`.
- **Paginação server-side:** Implementada usando Server Components (`/app/page.tsx`) que leem os `searchParams`. A lógica de paginação é gerenciada pelo componente cliente (`/components/talent-pagination.tsx`) que atualiza a URL e força um `router.refresh()`.
- **Qualidade de código:** O projeto utiliza TypeScript e segue uma arquitetura de Componentes de Servidor (para busca de dados e lógica de filtros) e Componentes de Cliente (para interatividade), garantindo que a lógica sensível rode apenas no servidor.
- **Evitar N+1:** A busca de dados foi otimizada usando `Promise.all` em `app/page.tsx` para disparar as buscas de talentos e filtros dinâmicos (departamentos, status, cargos) em paralelo.

