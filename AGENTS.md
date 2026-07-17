# Guia do Desenvolvedor (AGENTS.md) - Calculadora de Contratipos

Este documento serve como referência de arquitetura, banco de dados, regras de negócio e rotas para agentes de IA e desenvolvedores trabalhando no projeto.

---

## 1. Tecnologias Utilizadas
- **Framework**: Next.js 15 (App Router, React Server Components e Server Actions)
- **Estilização**: Tailwind CSS com variáveis HSL para temas (Claro/Escuro)
- **Banco de Dados**: SQLite local, manipulado através do **Prisma ORM**
- **Validação**: Zod para esquemas de validação de formulários (schemas)
- **Ícones**: Lucide React

---

## 2. Estrutura do Banco de Dados (Prisma Models)
O arquivo de definição de modelos é [schema.prisma](file:///c:/Users/andremartins/Desktop/calc-contratipo/app/prisma/schema.prisma). Principais modelos:

- **Supplier (Fornecedor)**: Cadastro de fornecedores de insumos e frascos.
- **Ingredient (Matéria-prima)**: Essências, fixadores (ex: Hedione), álcoois, solventes, etc.
  - Possui `purchaseVolume` (volume comprado), `purchasePrice` (preço pago) e `unit` (`ml`, `g` ou `un`).
- **Base (Base Universal)**: Composição percentual de ingredientes usada como solvente para diluir a essência (ex: "Base Premium" em ml).
- **BaseIngredient**: Tabela de associação N:N entre `Base` e `Ingredient` definindo o percentual (`percentage` de 0 a 1) do ingrediente na base.
- **Bottle (Frasco/Embalagem)**: Cadastro de frascos com volumes específicos em ml (`volumeMl`) e preço (`price`).
- **Perfume**: Produto final cadastrado no catálogo. Associa uma Essência, uma Base, um Frasco, o percentual de essência (`essencePercentage`), percentual opcional de Hedione (`hedionePercentage`) e uma margem alvo (`marginTarget`).
- **Project (Projeto/Rascunho)**: Permite simular fórmulas de perfume, custeio e margem antes de promovê-los a Perfumes do catálogo.
- **ProjectMaterialCost**: Sobrescreve o custo de uma matéria-prima dentro de um projeto específico para simulação (`manualUnitCost`).

---

## 3. Rotas da Aplicação (App Router)
As páginas estão localizadas sob `app/src/app/`:

- **`/` (Dashboard)**: Métricas gerais (total de perfumes, custo médio, preço médio, margem média) e catálogo de perfumes.
- **`/perfumes`**: Catálogo e listagem de perfumes.
- **`/perfumes/novo`**: Formulário para criar novo perfume.
- **`/perfumes/[id]`**: Detalhes do perfume, ficha técnica, e precificação detalhada.
- **`/projetos`**: Listagem de projetos/simulações salvos.
- **`/projetos/novo`**: Criar novo rascunho de projeto.
- **`/projetos/[id]`**: Visualizador do projeto com a calculadora dinâmica de custos e botão para "Promover a Perfume".
- **`/materias-primas`**: Listagem de matérias-primas cadastradas.
- **`/materias-primas/novo`**: Formulário de cadastro de nova matéria-prima.
- **`/materias-primas/[id]/editar`**: Formulário de edição de matéria-prima.
- **`/bases`**: Listagem de bases universais.
- **`/bases/novo`**: Formulário de cadastro de base.
- **`/fornecedores`**: Listagem de fornecedores.
- **`/fornecedores/novo`**: Criação de fornecedores.
- **`/frascos`**: Listagem de frascos cadastrados.
- **`/frascos/novo`**: Criação de frascos.

---

## 4. Regras de Negócio e Fórmulas de Cálculo
A lógica de negócios de custos está concentrada em `app/src/lib/calculations/`:

### Custo Unitário do Ingrediente (`calculateUnitCost`)
O custo unitário de qualquer matéria-prima (como essência, base ou solvente) é calculado por:
$$\text{Custo Unitário (R\$/unidade)} = \frac{\text{Preço de Compra (purchasePrice)}}{\text{Volume Comprado (purchaseVolume)}}$$

### Custo do Perfume/Projeto (`calculatePerfumeCost`)
Para um determinado volume total do frasco (\(V_{\text{total}}\) em ml), e dados:
- \% Essência (\(P_{\text{ess}}\))
- \% Hedione (\(P_{\text{hed}}\))
- Custo unitário da Essência (\(C_{\text{ess}}\))
- Custo unitário do Hedione (\(C_{\text{hed}}\))
- Custo unitário da Base/Solvente (\(C_{\text{base}}\))
- Preço do Frasco (\(P_{\text{frasco}}\))

Os volumes individuais consumidos são:
- \(\text{Volume Essência} = V_{\text{total}} \times P_{\text{ess}}\)
- \(\text{Volume Hedione} = V_{\text{total}} \times P_{\text{hed}}\)
- \(\text{Volume Base} = V_{\text{total}} \times (1 - P_{\text{ess}} - P_{\text{hed}})\)

Os custos são somados:
- \(\text{Custo Essência} = \text{Volume Essência} \times C_{\text{ess}}\)
- \(\text{Custo Hedione} = \text{Volume Hedione} \times C_{\text{hed}}\)
- \(\text{Custo Base} = \text{Volume Base} \times C_{\text{base}}\)
- \(\text{Custo Total} = \text{Custo Essência} + \text{Custo Hedione} + \text{Custo Base} + P_{\text{frasco}}\)

### Precificação e Margem
Com base em uma margem alvo de lucro desejada (\(M_{\text{alvo}}\), ex: `0.65` para 65%):
- **Preço de Venda Sugerido**:
  $$\text{Preço de Venda} = \frac{\text{Custo Total}}{1 - M_{\text{alvo}}}$$
- **Lucro**: \(\text{Lucro} = \text{Preço de Venda} - \text{Custo Total}\)
- **Margem Efetiva**: \(\text{Margem} = \frac{\text{Lucro}}{\text{Preço de Venda}}\)
- **Markup**: \(\text{Markup} = \frac{\text{Preço de Venda}}{\text{Custo Total}}\)
- **ROI**: \(\text{ROI} = \frac{\text{Lucro}}{\text{Custo Total}}\)
