# Checklist manual de validação

## Setup
- [ ] `npm install`
- [ ] `cp .env.example .env`
- [ ] `npx prisma generate`
- [ ] `npx prisma migrate dev --name init`
- [ ] `npm run seed`
- [ ] `npm run dev`

## Prisma e SQLite
- [ ] Arquivo `dev.db` foi criado após migration.
- [ ] `npx prisma studio` abre e mostra tabelas (`Question`, `QuestionAttempt`, `Exam`, `ExamQuestion`, `Flashcard`, `FlashcardReview`).

## Questões (criar/editar/excluir)
- [ ] Criar questão em `/questions/new` salva no banco (`Question`).
- [ ] Editar questão via `PUT /api/questions/:id` atualiza dados no banco.
- [ ] Excluir questão via `DELETE /api/questions/:id?confirm=true` remove registro.
- [ ] Campos persistidos: enunciado, alternativas, correta, explicação, matéria, tema, dificuldade, tags.

## Treino
- [ ] Responder em `/train` cria `QuestionAttempt` com `mode=TRAIN`.
- [ ] Registro contém: `questionId`, `selectedOption`, `correct`, `createdAt`.

## Simulados
- [ ] Criar simulado em `/exams` gera `Exam`.
- [ ] Questões do simulado são gravadas em `ExamQuestion`.
- [ ] Finalizar simulado via `POST /api/exams/:id/submit` cria `QuestionAttempt` com `mode=EXAM`.
- [ ] Tentativas de simulado incluem `examId` vinculado ao `Exam`.
- [ ] Resposta da API retorna `total`, `correct`, `wrong`, `percentage`.

## Dashboard e estatísticas
- [ ] `/dashboard` e `/stats` refletem tentativas reais gravadas no banco.
- [ ] Taxas mudam após novas respostas de treino/simulado.

## Flashcards
- [ ] Criar flashcard em `/flashcards` salva em `Flashcard`.
- [ ] Revisar em `/flashcards/review` cria `FlashcardReview`.
- [ ] Revisão atualiza `intervalDays`, `easeFactor`, `nextReview`, `reviewCount`, `lapseCount` no `Flashcard`.
- [ ] Apenas cards vencidos/hoje aparecem em `/flashcards/review`.

## Importação de questões
- [ ] Import inválido em `/questions/import` não salva dados.
- [ ] Import válido salva lote completo.
- [ ] Salvamento do lote válido acontece em transação Prisma (sem persistência parcial).
