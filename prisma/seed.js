const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main(){
  await prisma.question.createMany({data:[
    {statement:'Quanto é 2+2?',optionA:'1',optionB:'2',optionC:'3',optionD:'4',optionE:'5',correctOption:'D',explanation:'2+2=4',subject:'Matemática',theme:'Aritmética',difficulty:'EASY',tags:'soma'},
    {statement:'Capital do Brasil?',optionA:'SP',optionB:'RJ',optionC:'Brasília',optionD:'Salvador',optionE:'Recife',correctOption:'C',explanation:'Brasília',subject:'Geografia',theme:'Capitais',difficulty:'EASY',tags:'brasil'}
  ]});
  await prisma.flashcard.createMany({data:[{front:'Derivada de x²',back:'2x',subject:'Matemática',theme:'Cálculo',tags:'derivada'},{front:'Mitocôndria função',back:'Respiração celular',subject:'Biologia',theme:'Citologia',tags:'organelas'}]});
}
main().finally(()=>prisma.$disconnect());
