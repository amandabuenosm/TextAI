/** - readline: permite que o terminal interaja com o usuário
 * - stdin e stdout: permite que o usuário digite, e o programa responda pelo terminal 
 * - @google/genai: SDK mais recente do Gemini*/
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config(); // carregar dados do arquivo .env

const APIChave = process.env.GEMINI_API_KEY;

if (!APIChave || APIChave === 'chaveInformada') {
  console.error('\nERRO: Chave da API do Gemini não configurada! Crie um arquivo .env com a variável GEMINI_API_KEY=Informe sua chave aqui! Acesse o para obter a chave: https://aistudio.google.com/\n');
  process.exit(1); // (1) = encerra o programa por erro
}

// inicialização do SDK do Gemini
const ai = new GoogleGenAI({ apiKey: APIChave });

// recebe um prompt, e usa um modelo de IA para receber a resposta
const gerarTexto = async (prompt) => { 
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: prompt,
  });
  return response.text;
};

// envia o texto inserido pelo usuário para a IA e solicita a correção
async function analisarTexto(textoDoUsuario) {
  const prompt = `Você é um revisor de texto altamente experiente. Analise o seguinte texto enviado pelo usuário: 
  """${textoDoUsuario}""". 

Responda estritamente com os seguintes 4 tópicos bem formatados:
1. ERROS ORTOGRÁFICOS E GRAMATICIAIS: Liste cada erro encontrado apontando o termo incorreto e o correto, ou diga "Nenhum erro encontrado." se estiver 100% correto. Não use Markdown complexo, LaTeX, comandos matemáticos ou códigos.
2. SUGESTÕES DE MELHORIA: Dê dicas sobre clareza, fluidez, vocabulário, coesão ou pontuação.
3. NOTA DE QUALIDADE (0 a 10): Dê uma nota numérica de 0 a 10 com uma justificativa curta.
4. TEXTO CORRIGIDO E RECOMENDADO: Apresente a versão final recomendada do texto.`;

  try {
    console.log('\nAnalisando o texto com a Inteligência Artificial, aguarde...\n');
    const resposta = await gerarTexto(prompt);
    return resposta;
  } catch (error) {
    console.dir(error, { depth: null });
    return null;
  }
}

// função responsável pela inicialização no terminal
async function iniciarAplicacao() {
  const rl = readline.createInterface({ input, output });

  console.log('=====================================================');
  console.log('           CORRETOR DE TEXTOS COM IA (GEMINI)        ');
  console.log('=====================================================');
  console.log('Digite ou cole o texto que deseja analisar. Caso deseje sair, digite "0" para encerrar o programa!\n');

  while (true) {
    const entrada = await rl.question('\nInsira o texto para correção:\n> ');

    // condição para encerrar a aplicação
    if (entrada.trim().toLowerCase() === '0') {
      console.log('\nEncerrando o Corretor de Textos...\n');
      rl.close();
      break;
    }

    // condição para o usuário digitar corretamente um texto
    if (!entrada.trim()) {
      console.log('Por favor, digite um texto válido para ser analisado.');
      continue;
    }

    // processando o texto com a IA
    const resultado = await analisarTexto(entrada);

    if (resultado) {
      console.log('================RESULTADO DA ANÁLISE=================');
      console.log(resultado);
      console.log('=====================================================');
    }
  }
}

iniciarAplicacao();