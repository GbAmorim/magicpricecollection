# MTG Price Collection

Sistema de gestão de cards para colecionadores de Magic: The Gathering, focado em controle patrimonial e exportação de dados.

## Funcionalidades Principais

- Gestão de Coleções: Criação, edição e exclusão de múltiplas coleções.
- Controle de Patrimônio: Opção de ocultar coleções específicas do somatório global de ativos (recurso "excludeFromTotal").
- Busca Avançada: Importação de listas de cartas em lote com processamento automático de quantidades.
- Persistência de Dados: Recuperação automática do estado da última busca via parâmetros de URL/LocalStorage.
- Exportação de Dados: Geração de relatórios em PDF, CSV e Lista TXT (formato decklist).

## Stack Técnica

- Frontend: React.js + Vite
- Estilização: Tailwind CSS
- Ícones: Lucide React
- Backend: Firebase (Firestore & Auth)
- Hosting: Vercel

## Configuração e Instalação

1. Instale as dependências:
npm install

2. Configure as variáveis de ambiente (.env.local):
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

3. Inicie o ambiente de desenvolvimento:
npm run dev

## Segurança e Deploy

- Variáveis de Ambiente: O projeto utiliza o prefixo VITE_ para proteção de chaves no frontend.
- Authorized Domains: Para o funcionamento do login em produção, o domínio da Vercel deve ser cadastrado no console do Firebase Authentication.
- Git Compliance: Arquivos sensíveis (.env) são ignorados via .gitignore.

## Estrutura de Dados (Firestore)

- users/{userId}/collections: Metadados das coleções.
- users/{userId}/collections/{collectionId}/cards: Itens individuais e precificação.
