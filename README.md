# gestao-produtos

API REST para gerenciamento de produtos com testes automatizados e pipeline de integração contínua via GitHub Actions.

---

## Pipeline de CI — GitHub Actions

O arquivo de pipeline está em [.github/workflows/ci.yml](.github/workflows/ci.yml).

### Gatilhos (Triggers)

| Gatilho | Quando ocorre |
|---|---|
| `push` | A cada push nas branches `main` ou `master` |
| `workflow_dispatch` | Execução manual pela aba **Actions** no GitHub |
| `schedule` | Automaticamente toda segunda-feira às 06:00 UTC |

#### `workflow_dispatch` — Execução Manual

Permite acionar a pipeline sem precisar fazer um commit. Útil para re-executar testes após uma correção de ambiente, ou para validações pontuais. Basta acessar **Actions → CI → Run workflow** no repositório.

#### `schedule` — Agendamento com Cron

Usa a sintaxe cron padrão para definir a frequência:

```
┌── minuto (0–59)
│ ┌── hora (0–23)
│ │ ┌── dia do mês (1–31)
│ │ │ ┌── mês (1–12)
│ │ │ │ ┌── dia da semana (0=Dom … 6=Sáb)
│ │ │ │ │
0 6 * * 1   →  toda segunda-feira às 06:00 UTC
```

Execuções agendadas garantem que problemas silenciosos (dependências desatualizadas, regressões em ambiente limpo) sejam detectados mesmo sem atividade no repositório.

---

### Etapas da pipeline

```
Checkout → Setup Node.js → npm ci → mkdir reports
    → node:test (spec + JUnit XML)
    → Mocha (JUnit XML)
    → Publicar resultados (dorny/test-reporter)
    → Upload de artefato (actions/upload-artifact)
```

#### 1. Checkout e Setup

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
```

`actions/setup-node` com `cache: npm` armazena a pasta `~/.npm` entre execuções, acelerando o `npm ci`.

#### 2. Testes com node:test (múltiplos reporters)

```yaml
node --test \
  --test-reporter=spec --test-reporter-destination=stdout \
  --test-reporter=junit --test-reporter-destination=reports/node-results.xml \
  "test/GestaoProdutos.test.js" "test/produtoRepository.test.js"
```

O `node:test` (nativo do Node.js 22) suporta múltiplos reporters simultaneamente:
- `spec` → saída legível no console do Actions
- `junit` → arquivo XML para o relatório

#### 3. Testes com Mocha + mocha-junit-reporter

```yaml
env:
  MOCHA_FILE: reports/mocha-results.xml
run: npm run test:mocha:ci
```

A variável de ambiente `MOCHA_FILE` define o caminho de saída do `mocha-junit-reporter`. O reporter gera um XML no formato JUnit compatível com ferramentas de análise de testes.

#### 4. Publicação dos resultados — `dorny/test-reporter`

```yaml
- uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Resultados dos Testes
    path: reports/*.xml
    reporter: jest-junit
    fail-on-error: false
```

Lê os XMLs gerados e publica os resultados diretamente como um **Check** no commit ou PR. Isso permite visualizar quais testes passaram ou falharam sem precisar ler os logs.

`if: always()` garante que o relatório seja publicado **mesmo quando os testes falham**.

Permissões necessárias (declaradas no nível do workflow):

```yaml
permissions:
  checks: write        # criar checks no commit
  pull-requests: write # comentar em PRs
```

#### 5. Armazenamento do artefato — `actions/upload-artifact`

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-reports
    path: reports/
    retention-days: 30
```

Persiste os arquivos XML por 30 dias. O artefato pode ser baixado na aba **Actions → execução → Artifacts**. Útil para análise posterior, integração com ferramentas externas (SonarQube, etc.) ou auditoria.

---

## Scripts npm

| Script | Descrição |
|---|---|
| `npm test` | Testes node:test com saída no console |
| `npm run test:mocha` | Testes Mocha com saída no console |
| `npm run test:all` | Ambos os suítes no console |
| `npm run test:node:ci` | node:test gerando `reports/node-results.xml` |
| `npm run test:mocha:ci` | Mocha gerando `reports/mocha-results.xml` |
| `npm run test:ci` | Ambos os suítes com saída XML (usado na pipeline) |

---

## Estrutura do projeto

```
.github/
  workflows/
    ci.yml          # Pipeline de CI
src/
  GestaoProdutos.js
  JsonDataSource.js
  ProdutoRepository.js
  rotasProdutos.js
  server.js
test/
  GestaoProdutos.test.js        # Testes com node:test
  GestaoProdutos.mocha.test.js  # Testes com Mocha
  produtoRepository.test.js     # Testes com node:test
  fixtures/
    produtos.json
package.json
```

## Instalação e execução local

```bash
npm install
npm run test:all
```
