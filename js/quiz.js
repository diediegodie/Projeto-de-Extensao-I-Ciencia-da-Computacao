// ==========================================================================
// QUIZ DE PERFIL DE APRENDIZADO: SUA MENTE NO CONTROLE
// Itens metodologicamente adaptados e inspirados nas escalas KAT / I-PACE
// Metáforas: Musculação Cognitiva e Copiloto vs. Piloto Automático
// ==========================================================================

const quizPerguntas = [
  {
    id: 1,
    pergunta: "Ao receber uma tarefa escolar desafiadora, qual costuma ser sua primeira ação com a IA?",
    alternativas: [
      {
        texto: "Copio a resposta gerada e entrego rápido para poupar tempo.",
        perfil: "Criativo",
        pontos: 0
      },
      {
        texto: "Peço tópicos estruturais e assumo o controle da escrita.",
        perfil: "Sobrevivência",
        pontos: 2
      },
      {
        texto: "Uso o texto inicial como base e mudo com meu estilo.",
        perfil: "Transicao",
        pontos: 1
      },
      {
        texto: "Peço para o sistema me fazer perguntas e testar meu nível.",
        perfil: "Sobrevivência",
        pontos: 2
      }
    ]
  },
  {
    id: 2,
    pergunta: "Quando a IA apresenta leis, dados ou citações desconhecidas, como você reage?",
    alternativas: [
      {
        texto: "Pesquiso no buscador apenas os termos que soaram mais estranhos.",
        perfil: "Transicao",
        pontos: 1
      },
      {
        texto: "Confio de primeira se o texto estiver bem escrito e formal.",
        perfil: "Criativo",
        pontos: 0
      },
      {
        texto: "Duvido por princípio e confiro as afirmações em fontes externas.",
        perfil: "Sobrevivência",
        pontos: 2
      },
      {
        texto: "Aceito a informação sem checar, priorizando a conclusão do trabalho.",
        perfil: "Criativo",
        pontos: 0
      }
    ]
  },
  {
    id: 3,
    pergunta: "Após a IA gerar uma sugestão de texto, redação ou código para você, como você lida com o conteúdo?",
    alternativas: [
      {
        texto: "Fecho a IA e redijo a entrega do zero usando apenas as ideias.",
        perfil: "Sobrevivência",
        pontos: 2
      },
      {
        texto: "Copio o arquivo pronto para economizar tempo.",
        perfil: "Criativo",
        pontos: 0
      },
      {
        texto: "Mantenho a estrutura principal, reescrevendo a introdução e o final.",
        perfil: "Transicao",
        pontos: 1
      },
      {
        texto: "Adiciono exemplos próprios e mudo algumas expressões do robô.",
        perfil: "Transicao",
        pontos: 1
      }
    ]
  },
  {
    id: 4,
    pergunta: "Se a IA apresenta um cálculo ou raciocínio que você não compreendeu de primeira, o que você faz?",
    alternativas: [
      {
        texto: "Ignoro a dúvida, pois o importante é ter o resultado coerente.",
        perfil: "Criativo",
        pontos: 0
      },
      {
        texto: "Peço que ela explique o passo a passo usando uma analogia simples.",
        perfil: "Sobrevivência",
        pontos: 2
      },
      {
        texto: "Tento ler de novo e, se continuar difícil, sigo com o que entendi.",
        perfil: "Transicao",
        pontos: 1
      },
      {
        texto: "Peço uma versão mais curta e simplificada para decorar rápido.",
        perfil: "Criativo",
        pontos: 0
      }
    ]
  },
  {
    id: 5,
    pergunta: "Como você organiza seus estudos de revisão ou preparação para exames e provas usando a IA?",
    alternativas: [
      {
        texto: "Estudo lendo apenas os resumos prontos gerados de forma automática.",
        perfil: "Criativo",
        pontos: 0
      },
      {
        texto: "Forço minha memória primeiro e depois peço para a IA achar pontos cegos.",
        perfil: "Sobrevivência",
        pontos: 2
      },
      {
        texto: "Uso o resumo automático para conferir se esqueci algo das minhas notas.",
        perfil: "Transicao",
        pontos: 1
      },
      {
        texto: "Peço para ela atuar como examinadora rigorosa fazendo perguntas difíceis.",
        perfil: "Sobrevivência",
        pontos: 2
      }
    ]
  },
  {
    id: 6,
    pergunta: "Qual é a sua percepção geral sobre a confiabilidade e o nível de atenção necessário ao usar sistemas de IA?",
    alternativas: [
      {
        texto: "Vigilância total, pois ela opera por probabilidades e pode inventar dados.",
        perfil: "Sobrevivência",
        pontos: 2
      },
      {
        texto: "Atenção moderada, pois sei que ela erra se a frase for contraditória.",
        perfil: "Transicao",
        pontos: 1
      },
      {
        texto: "Alta confiança, pois ferramentas modernas raramente erram conteúdos acadêmicos.",
        perfil: "Criativo",
        pontos: 0
      },
      {
        texto: "Confiança intermediária, checando apenas quando o resultado parece estranho.",
        perfil: "Transicao",
        pontos: 1
      }
    ]
  }
];

// Helper functions for backend communication
async function sendProfileToBackend(profile) {
  try {
    const response = await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to send profile to backend:', error);
    throw error;
  }
}

async function fetchStatsAndUpdateChart() {
  try {
    const response = await fetch('/stats');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const stats = await response.json();
    updateChartWithStats(stats);
  } catch (error) {
    console.error('Failed to fetch stats from backend:', error);
  }
}

function updateChartWithStats(stats) {
  const chart = Chart.getChart("metricsChart");
  if (chart && chart.data && chart.data.datasets[0]) {
    chart.data.datasets[0].data = [
      stats.total_passivo || 0,
      stats.total_transicao || 0,
      stats.total_ativo || 0
    ];
    chart.update();
  }
}

let perguntaAtualIndex = 0;
let respostasUsuario = [];

// -------------------------------------------------
// Renderiza o Quiz na tela passo a passo
function renderizarQuiz() {
  const container = document.getElementById("quizContainer");
  if (!container) return;

  if (perguntaAtualIndex < quizPerguntas.length) {
    const dadosPergunta = quizPerguntas[perguntaAtualIndex];
    let htmlContent = `
      <div class="quiz-pergunta-card" style="color: #1a1a1a !important; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #007bff; background: rgba(0, 123, 255, 0.1); padding: 4px 10px; border-radius: 20px;">
            Questão ${perguntaAtualIndex + 1} de ${quizPerguntas.length}
          </span>
          <span style="font-size: 0.85rem; color: #666;">
            Progresso: ${Math.round(((perguntaAtualIndex) / quizPerguntas.length) * 100)}%
          </span>
        </div>
        <p style="color: #1a1a1a !important; font-size: 1.15rem; font-weight: 700; margin: 15px 0 20px 0; line-height: 1.45;">
          ${dadosPergunta.pergunta}
        </p>
    `;

    dadosPergunta.alternativas.forEach((alt, idx) => {
      htmlContent += `
        <label class="quiz-alternativa" style="color: #2b2b2b !important; display: flex; align-items: flex-start; background: #f8f9fa; padding: 14px 16px; margin: 10px 0; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">
          <input type="radio" name="opcaoQuiz" value="${idx}" style="margin-top: 4px; margin-right: 12px; accent-color: #007bff; cursor: pointer;">
          <span style="line-height: 1.5; font-size: 0.98rem;">${alt.texto}</span>
        </label>
      `;
    });

    htmlContent += `
        <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
          <button id="btnProxima" onclick="processarResposta()" class="btn-quiz" style="background: linear-gradient(135deg, #007bff, #00d2ff); color: white; border: none; padding: 12px 28px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,123,255,0.25);">
            ${perguntaAtualIndex === quizPerguntas.length - 1 ? "Concluir Avaliação" : "Avançar ->"}
          </button>
        </div>
      </div>
    `;

    container.innerHTML = htmlContent;
  } else {
    exibirResultadoFinal();
  }
}

// -------------------------------------------------
// Configurações e atualização do Chart.js
function configurarChartDashboard(chart) {
  const cores = {
    criativo: "#ff4d4d",
    transicao: "#f1c40f",
    sobrevivencia: "#2ecc71"
  };

  if (chart && chart.data && chart.data.datasets[0]) {
    chart.data.labels = ['Uso Passivo da IA', 'Modo em Transição', 'Uso Ativo da IA'];
    chart.data.datasets[0].backgroundColor = [cores.criativo, cores.transicao, cores.sobrevivencia];
    chart.data.datasets[0].borderColor = '#1a1a1a';
    chart.data.datasets[0].borderWidth = 2;
  }

  if (chart && chart.options && chart.options.scales && chart.options.scales.y) {
    const yAxis = chart.options.scales.y;
    yAxis.beginAtZero = true;
    yAxis.ticks = yAxis.ticks || {};
    yAxis.ticks.stepSize = 1;
  }

  chart.update();
}

// -------------------------------------------------
// Bloco de feedback dinâmico, empático e calibrado
function criarFeedbackPerfil(perfilCategoria, contagem, pontuacaoTotal) {
  let container = document.getElementById("feedbackPerfilContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "feedbackPerfilContainer";
    const resultadoTxt = document.getElementById("quizResult");
    if (resultadoTxt && resultadoTxt.parentNode) {
      resultadoTxt.parentNode.insertBefore(container, resultadoTxt.nextSibling);
    } else {
      return;
    }
  }

  let corPrincipal = "#2ecc71";
  let tituloFeedback = "";
  let corpoFeedback = "";

  if (perfilCategoria === "Sobrevivência") {
    corPrincipal = "#2ecc71";
    tituloFeedback = "Uso Ativo da IA: Copiloto Ativo & Musculação Cognitiva";
    corpoFeedback = `
      <p style="margin: 8px 0; color: #ffffff !important; font-size: 1.02rem; line-height: 1.6;">
        <strong>Excelente postura!</strong> Você não terceiriza sua capacidade de raciocínio. Ao assumir o controle dos prompts e questionar as respostas, você mantém ativa a sua <em>Carga Cognitiva Germativa</em> e usa a IA como um verdadeiro <strong>andaime pedagógico (Scaffolding)</strong>.
      </p>
      <div style="margin-top: 14px; padding: 14px; background: rgba(46, 204, 113, 0.12); border-radius: 8px; border: 1px dashed #2ecc71;">
        <strong style="color: #2ecc71;">Dica para elevar ainda mais seu jogo:</strong>
        <p style="margin: 6px 0 0 0; color: #d0f5e0 !important; font-size: 0.95rem; line-height: 1.5;">
          Pratique o <strong>Feynman Technique Testing</strong>: tente redigir seus resumos com suas palavras antes e use a IA como uma "banca socrática" para caçar suas falhas lógicas, viés de confirmação e pontos cegos conceituais.
        </p>
      </div>
    `;
  } else if (perfilCategoria === "Transicao") {
    corPrincipal = "#f1c40f";
    tituloFeedback = "Modo em Transição: Copiloto em Treinamento (Uso Misto & Consciente)";
    corpoFeedback = `
      <p style="margin: 8px 0; color: #ffffff !important; font-size: 1.02rem; line-height: 1.6;">
        <strong>Belo diagnóstico de equilíbrio e honestidade!</strong> Você já possui senso crítico: não engole tudo o que a tela te devolve e costuma conferir pontos duvidosos. Porém, em momentos de cansaço ou pressa, ainda liga o "piloto automático" e deixa a IA carregar boa parte do trabalho pesado.
      </p>
      <div style="margin-top: 14px; padding: 14px; background: rgba(241, 196, 15, 0.12); border-radius: 8px; border: 1px dashed #f1c40f;">
        <strong style="color: #f1c40f;">Estratégia dos 30 Segundos de Reflexão:</strong>
        <p style="margin: 6px 0 0 0; color: #fff3cd !important; font-size: 0.95rem; line-height: 1.5;">
          Antes de aceitar qualquer sugestão gerada pela ferramenta, faça a si mesmo uma pergunta rápida: <em>"Eu conseguiria defender essa ideia se o professor me perguntasse agora?"</em> Se a resposta for não, peça para a IA: <em>"Explique o porquê dessa conclusão em 2 frases simples"</em> antes de usar.
        </p>
      </div>
    `;
  } else {
    corPrincipal = "#ff4d4d";
    tituloFeedback = "Uso Passivo da IA: Alerta de Piloto Automático (Uso Passivo)";
    corpoFeedback = `
      <p style="margin: 8px 0; color: #ffffff !important; font-size: 1.02rem; line-height: 1.6;">
        <strong>Aviso amigável de parceria:</strong> É natural buscar velocidade e atalzos quando o volume de tarefas é alto. Contudo, pesquisas recentes do MIT (Kosmyna et al., 2025) indicam que o uso passivo da IA gera <em>descarregamento cognitivo excessivo</em>, reduzindo a conectividade neural em até 55% e gerando dívida de retenção.
      </p>
      <div style="margin-top: 14px; padding: 14px; background: rgba(255, 77, 77, 0.12); border-radius: 8px; border: 1px dashed #ff4d4d;">
        <strong style="color: #ff4d4d;">Como ligar a Musculação Cognitiva sem sofrimento:</strong>
        <p style="margin: 6px 0 0 0; color: #ffdede !important; font-size: 0.95rem; line-height: 1.5;">
          Não precisa parar de usar IA! Mude apenas o comando: em vez de pedir o trabalho pronto, experimente dizer: <em>"Atue como meu tutor: me dê apenas o primeiro passo e me faça uma pergunta para eu pensar no resto"</em>. É assim que o 'grind' do cérebro começa a dar frutos.
        </p>
      </div>
    `;
  }

  // Converte hex para rgba suave
  const hex = corPrincipal.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const bg = `rgba(${r}, ${g}, ${b}, 0.14)`;

  container.innerHTML = `
    <div style="border-left: 6px solid ${corPrincipal}; background-color: ${bg}; border-radius: 10px; padding: 22px; margin: 24px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.35); font-family: sans-serif;">
      <h3 style="margin-top: 0; color: ${corPrincipal} !important; font-size: 1.25rem; display: flex; align-items: center; gap: 8px; line-height: 1.4;">${tituloFeedback}</h3>
      <div style="font-size: 0.88rem; color: #e0e0e0; margin-bottom: 12px;">
        Pontuação de Autonomia: <strong>${pontuacaoTotal} de 12 pontos</strong> (Distr.: Uso Ativo da IA: ${contagem.Sobrevivência}, Modo em Transição: ${contagem.Transicao}, Uso Passivo da IA: ${contagem.Criativo})
      </div>
      ${corpoFeedback}
    </div>
  `;
}

// -------------------------------------------------
// Processa a escolha do usuário
function processarResposta() {
  const opcoes = document.getElementsByName("opcaoQuiz");
  let selecionadaIdx = -1;
  for (let i = 0; i < opcoes.length; i++) {
    if (opcoes[i].checked) {
      selecionadaIdx = parseInt(opcoes[i].value);
      break;
    }
  }
  if (selecionadaIdx === -1) {
    alert("Por favor, selecione uma das opções para avançar!");
    return;
  }

  const escolha = quizPerguntas[perguntaAtualIndex].alternativas[selecionadaIdx];
  respostasUsuario.push(escolha);
  perguntaAtualIndex++;

  if (perguntaAtualIndex >= quizPerguntas.length) {
    exibirResultadoFinal();
  } else {
    renderizarQuiz();
  }
}

// -------------------------------------------------
// Finaliza e exibe o resultado formatado
function exibirResultadoFinal() {
  const container = document.getElementById("quizContainer");
  const resultadoTxt = document.getElementById("quizResult");

  const contagem = { Criativo: 0, Transicao: 0, Sobrevivência: 0 };
  let pontuacaoTotal = 0;

  respostasUsuario.forEach(r => {
    if (contagem[r.perfil] !== undefined) {
      contagem[r.perfil]++;
    }
    pontuacaoTotal += (r.pontos !== undefined ? r.pontos : 0);
  });

  // Calibração dos perfis:
  // 9 a 12 pts: Uso Ativo da IA
  // 5 a 8 pts: Modo em Transição
  // 0 a 4 pts: Uso Passivo da IA
  let perfilCategoria = "Criativo";
  let perfilNomeFormatado = "Uso Passivo da IA";
  let classeResultado = "perfil-criativo";

  if (pontuacaoTotal >= 9) {
    perfilCategoria = "Sobrevivência";
    perfilNomeFormatado = "Uso Ativo da IA";
    classeResultado = "perfil-sobrevivencia";
  } else if (pontuacaoTotal >= 5) {
    perfilCategoria = "Transicao";
    perfilNomeFormatado = "Modo em Transição";
    classeResultado = "perfil-transicao";
  }

  if (resultadoTxt) {
    resultadoTxt.innerHTML = `Seu perfil predominante é: <strong>${perfilNomeFormatado}</strong>`;
    resultadoTxt.className = classeResultado;
  }

  if (container) {
    container.innerHTML = `
      <div style="color: #1a1a1a; text-align: center; padding: 25px 20px; font-family: sans-serif;">
        <h3 style="color: #1a1a1a; margin-bottom: 10px; font-size: 1.4rem;">Avaliação Concluída!</h3>
        <p style="color: #444444; max-width: 580px; margin: 0 auto 20px auto; font-size: 1rem; line-height: 1.5;">
          Parabéns pela sinceridade! Sua autoavaliação ajuda a mapear como a nossa comunidade escolar está se relacionando com a inteligência artificial.
        </p>
        <button onclick="reiniciarQuiz()" style="background: transparent; color: #007bff; border: 2px solid #007bff; padding: 8px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">
           Refazer Autoavaliação
        </button>
      </div>
    `;
  }

  // Send profile to backend and then update chart from backend
  if (typeof Chart !== "undefined") {
    // Map perfilCategoria to backend profile string
    let backendProfile;
    if (perfilCategoria === "Sobrevivência") {
      backendProfile = "ativo";
    } else if (perfilCategoria === "Transicao") {
      backendProfile = "transicao";
    } else {
      backendProfile = "passivo";
    }

    sendProfileToBackend(backendProfile)
      .then(() => {
        // After sending, fetch stats to update chart
        return fetchStatsAndUpdateChart();
      })
      .catch(error => {
        console.error('Error in quiz submission flow:', error);
      });
  }

  // Bloco de feedback dinâmico
  criarFeedbackPerfil(perfilCategoria, contagem, pontuacaoTotal);

  // GA4 – evento anônimo
  if (typeof gtag !== "undefined") {
    gtag('event', 'quiz_completed_anonymous', {
      criativo: contagem.Criativo,
      transicao: contagem.Transicao,
      sobrevivencia: contagem.Sobrevivência,
      pontuacao: pontuacaoTotal
    });
  }
}

// -------------------------------------------------
// Reinicia o quiz
function reiniciarQuiz() {
  perguntaAtualIndex = 0;
  respostasUsuario = [];
  const resultadoTxt = document.getElementById("quizResult");
  if (resultadoTxt) {
    resultadoTxt.innerHTML = "";
    resultadoTxt.className = "";
  }
  const feedbackContainer = document.getElementById("feedbackPerfilContainer");
  if (feedbackContainer) {
    feedbackContainer.innerHTML = "";
  }
  renderizarQuiz();
}

// -------------------------------------------------
// Inicialização ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  try {
    renderizarQuiz();
    if (typeof Chart !== "undefined") {
      const chart = Chart.getChart("metricsChart");
      if (chart) {
        configurarChartDashboard(chart);
      }
    }
  } catch (error) {
    console.error('Error in quiz initialization:', error);
  }
});