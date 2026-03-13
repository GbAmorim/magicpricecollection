# Magic Price Collection

Plataforma de gerenciamento de coleções de **Magic: The Gathering** com foco em **valuation em tempo real**, segurança via **Firebase** e ferramentas de **exportação de dados**.

Este projeto oferece uma solução robusta para colecionadores que desejam **organizar suas cartas, acompanhar o valor da coleção e analisar seus ativos no universo de MTG**.

---

# 🚀 Funcionalidades

A **Magic Price Collection** foi desenvolvida para proporcionar uma experiência completa e eficiente na gestão de coleções, integrando recursos essenciais para o colecionador moderno.

## 🔎 Busca de Cartas via Scryfall API

Integração direta com a **Scryfall API**, garantindo acesso a um vasto banco de dados de cartas.

Inclui:

- Informações detalhadas das cartas
- Imagens oficiais
- Preços atualizados
- Diferentes versões e edições

---

## 📚 Gestão de Múltiplas Coleções

O sistema permite que o usuário crie e organize **diversas coleções simultaneamente**, possibilitando separar cartas por:

- Decks
- Formatos
- Raridade
- Tipo de coleção
- Qualquer critério definido pelo usuário

Isso facilita a organização e análise da coleção.

---

## 👁️ Filtro de Visibilidade de Patrimônio

Uma funcionalidade importante do sistema permite **ocultar determinadas coleções do cálculo do valor total da coleção**.

Isso é útil para cartas que estão:

- Em negociação
- Emprestadas
- Separadas para venda
- Fora do patrimônio principal

Dessa forma, o valor total da coleção pode refletir apenas o patrimônio desejado.

---

## 💾 Persistência Inteligente de Busca

O sistema **memoriza automaticamente os parâmetros da última busca realizada**.

Quando o usuário retorna à tela de busca, o estado anterior é restaurado, incluindo:

- Termos pesquisados
- Filtros utilizados
- Resultados exibidos

Isso melhora o fluxo de trabalho e a experiência de navegação.

---

## 📤 Exportação de Dados

A aplicação permite exportar os dados das coleções em diferentes formatos, dependendo da necessidade do usuário.

### 📄 PDF

Geração de relatórios formatados para:

- Visualização
- Impressão
- Compartilhamento

---

### 📊 CSV

Exportação de dados estruturados para:

- Planilhas do Excel
- Google Sheets
- Ferramentas de análise de dados

---

### 📃 TXT

Listagem simples das cartas da coleção.

Ideal para:

- Compartilhamento rápido
- Importação em outros sistemas
- Arquivamento simples

---

## 💱 Conversão Automática USD → BRL

Os preços das cartas obtidos pela API estão originalmente em **Dólar Americano (USD)**.

O sistema realiza automaticamente a **conversão para Real Brasileiro (BRL)** utilizando taxas de câmbio atualizadas, permitindo que o usuário acompanhe o valor da coleção em sua moeda local.

---

# 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando um **stack moderno e eficiente**, garantindo performance, escalabilidade e facilidade de manutenção.

### Frontend

- **React.js**
- **Vite**

Framework para construção de interfaces reativas com ambiente de desenvolvimento rápido.

---

### Estilização

- **Tailwind CSS**

Framework utilitário que permite construir interfaces modernas e responsivas de forma rápida e flexível.

---

### Backend e Infraestrutura

**Firebase**

Utilizado para:

- Autenticação de usuários
- Armazenamento de dados com Firestore
- Monitoramento de uso com Analytics

---

### Interface

- **Lucide React**

Biblioteca de ícones leves e personalizáveis para enriquecer a interface da aplicação.

---

### Deploy

- **Vercel**

Plataforma de deploy contínuo e hospedagem serverless otimizada para aplicações React.

Principais benefícios:

- Deploy automático via GitHub
- Escalabilidade
- Alta disponibilidade

---

# 🔐 Configuração de Segurança

A segurança das credenciais é tratada utilizando **variáveis de ambiente**, evitando que dados sensíveis sejam expostos no repositório.

---

## Uso de Variáveis de Ambiente

Todas as chaves e credenciais são armazenadas em arquivos `.env`.

### `.env.local`

Arquivo utilizado para **ambiente de desenvolvimento local**.

Este arquivo **não deve ser enviado ao GitHub** e é ignorado pelo `.gitignore`.

---

### `.env.example`

Arquivo incluído no repositório apenas para documentar **quais variáveis precisam ser configuradas**, sem expor valores reais.

---

## Exemplo de `.env.local`

```env
VITE_FIREBASE_API_KEY=SUA_API_KEY_DO_FIREBASE
VITE_FIREBASE_AUTH_DOMAIN=SEU_AUTH_DOMAIN_DO_FIREBASE
VITE_FIREBASE_PROJECT_ID=SEU_PROJECT_ID_DO_FIREBASE
VITE_FIREBASE_STORAGE_BUCKET=SEU_STORAGE_BUCKET_DO_FIREBASE
VITE_FIREBASE_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID_DO_FIREBASE
VITE_FIREBASE_APP_ID=SEU_APP_ID_DO_FIREBASE
VITE_FIREBASE_MEASUREMENT_ID=SEU_MEASUREMENT_ID_DO_FIREBASE
```

---

## Configuração na Vercel

Durante o deploy da aplicação, as mesmas variáveis de ambiente utilizadas no desenvolvimento local devem ser configuradas no painel da **Vercel**.

Para realizar essa configuração:

1. Acesse o painel do projeto na Vercel.
2. Vá até **Project Settings**.
3. Clique na seção **Environment Variables**.
4. Adicione todas as variáveis presentes no arquivo `.env.local`.

Isso garante que o ambiente de produção utilize as credenciais corretas de forma segura, sem expor dados sensíveis no repositório.

https://magicpricecollection-m9h5.vercel.app/
