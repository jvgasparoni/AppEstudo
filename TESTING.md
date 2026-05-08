# Checklist manual de validacao

## Setup
- [ ] `npm install`
- [ ] `cp .env.example .env`
- [ ] `npx prisma generate`
- [ ] `npx prisma migrate deploy`
- [ ] `npm run seed`
- [ ] `npm run dev`
- [ ] Se aparecer erro de chunk ausente em `.next`, parar o servidor e rodar `npm run dev:clean`.

## Prisma e SQLite
- [ ] Arquivo `dev.db` foi criado apos migration.
- [ ] `npx prisma studio` abre e mostra tabelas (`Question`, `QuestionAttempt`, `Exam`, `ExamQuestion`, `Flashcard`, `FlashcardReview`).

## Questoes
- [ ] Criar questao em `/questions/new` salva no banco.
- [ ] Excluir questao em `/questions` remove registro e vinculos.
- [ ] Import invalido em `/questions/import` nao salva dados.
- [ ] Import valido salva lote completo.

## Praticar
- [ ] Responder em `/train` cria `QuestionAttempt` com `mode=TRAIN`.
- [ ] Registro contem `questionId`, `selectedOption`, `correct` e `createdAt`.
- [ ] Filtro por dominio mostra apenas questoes daquele dominio.
- [ ] Filtro "Todos os dominios" mistura questoes de todos os dominios.
- [ ] Ao errar, a tela mostra alternativa correta e explicacao.

## Simulados
- [ ] Criar simulado prova em `/exams` gera `Exam` seguindo a proporcao Security+.
- [ ] Criar simulado personalizado por dominio em `/exams` gera `Exam` com mais de um dominio.
- [ ] Solicitar mais questoes do que um dominio possui mostra mensagem clara e nao cria simulado.
- [ ] Questoes do simulado sao gravadas em `ExamQuestion`.
- [ ] Finalizar simulado via `POST /api/exams/:id/submit` cria `QuestionAttempt` com `mode=EXAM`.
- [ ] `/exams/history` lista simulados concluidos.
- [ ] Abrir revisao mostra estatisticas gerais, por dominio e respostas marcadas/corretas.
- [ ] Excluir simulado realizado remove `Exam`, `ExamQuestion` e tentativas vinculadas.

## Dashboard
- [ ] `/dashboard` reflete tentativas reais gravadas no banco.
- [ ] Taxas mudam apos novas respostas de treino/simulado.
- [ ] Contadores resetaveis podem ser zerados sem apagar historico geral.
- [ ] Analise por periodo combina filtro de 7/15/30 dias/desde sempre com origem Tudo/Simulados/Praticar.
- [ ] Resetar respondidas no Praticar remove tentativas antigas do Praticar tambem no filtro "Tudo".

## Flashcards
- [ ] Criar flashcard em `/flashcards` salva em `Flashcard`.
- [ ] Excluir flashcard remove revisoes vinculadas.
- [ ] Revisar em `/flashcards/review` cria `FlashcardReview`.
- [ ] Revisao atualiza `intervalDays`, `easeFactor`, `nextReview`, `reviewCount`, `lapseCount` no `Flashcard`.
