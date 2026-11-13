async function renderMetricsChart() {
  const canvas = document.getElementById('metricsChart');
  if (!canvas || typeof Chart === 'undefined') {
    return;
  }

  const bounds = canvas.getBoundingClientRect();
  const styles = getComputedStyle(canvas);
  console.log('Canvas encontrado', {
    id: canvas.id,
    width: canvas.width,
    height: canvas.height,
    bounds: { width: bounds.width, height: bounds.height },
    styles: {
      display: styles.display,
      width: styles.width,
      height: styles.height,
      maxWidth: styles.maxWidth,
      maxHeight: styles.maxHeight,
      overflow: styles.overflow,
      opacity: styles.opacity,
      visibility: styles.visibility,
      transform: styles.transform
    }
  });

  try {
    console.log('Criando gráfico');
    const chart = new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['Uso Passivo da IA', 'Modo em Transição', 'Uso Ativo da IA'],
        datasets: [{
          label: 'Participantes',
          data: [10, 20, 30],
          backgroundColor: ['#ff4d4d', '#f1c40f', '#2ecc71'],
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#ffffff', font: { size: 13, family: 'Inter, sans-serif' }, padding: 18 }
          }
        }
      }
    });
    console.log(chart);

    try {
      const response = await fetch('/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stats = await response.json();
      console.log('stats JSON:', JSON.stringify(stats));

      aplicarEstatisticas(stats);
    } catch (error) {
      console.error('Failed to fetch or update stats chart; showing visual fallback data:', error);
    }
  } catch (error) {
    console.error('Failed to create chart:', error);
    // Optionally show error state
  }
}

const PERFIS_ESTATISTICAS = ['passivo', 'transicao', 'ativo'];
let filtroFaixaAtual = 'todos';
let ultimoStatsRecebido = null;

// "Todos" usa os totais históricos + novos; cada faixa usa o cruzamento por_faixa_etaria.
function obterDadosFiltrados(stats, filtro) {
  if (filtro === 'todos') {
    return [stats.total_passivo, stats.total_transicao, stats.total_ativo];
  }
  const faixa = (stats.por_faixa_etaria && stats.por_faixa_etaria[filtro]) || {};
  return PERFIS_ESTATISTICAS.map(perfil => faixa[perfil] || 0);
}

function atualizarEstadoFiltro(total) {
  const canvas = document.getElementById('metricsChart');
  const estado = document.getElementById('estadoVazioFaixa');
  const botaoAtivo = document.querySelector(`.filtro-faixa-btn[data-faixa="${filtroFaixaAtual}"]`);
  const nomeFiltro = botaoAtivo ? botaoAtivo.textContent.trim() : 'Todos';

  if (canvas) {
    canvas.setAttribute('aria-label',
      `Gráfico de pizza com a distribuição entre Uso Passivo da IA, Transição e Uso Ativo da IA. Filtro: ${nomeFiltro}`);
  }
  if (estado) {
    const vazio = filtroFaixaAtual !== 'todos' && total === 0;
    estado.hidden = !vazio;
    estado.textContent = vazio
      ? 'Ainda não há respostas registradas para esta faixa etária — responda o quiz para contribuir'
      : '';
  }
}

function aplicarEstatisticas(stats) {
  ultimoStatsRecebido = stats;
  const chart = Chart.getChart('metricsChart');
  if (!chart) {
    return;
  }

  const dados = obterDadosFiltrados(stats, filtroFaixaAtual);
  if (dados.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error('Invalid chart data: expected finite numbers');
  }
  const total = dados.reduce((soma, valor) => soma + valor, 0);

  chart.data.datasets[0].data = dados;
  chart.update();

  const totalCountElement = document.getElementById('totalCount');
  if (totalCountElement) {
    totalCountElement.textContent = filtroFaixaAtual === 'todos' ? stats.total_participantes : total;
  }
  atualizarEstadoFiltro(total);
}

function selecionarFiltroFaixa(filtro) {
  filtroFaixaAtual = filtro;
  document.querySelectorAll('.filtro-faixa-btn').forEach(botao => {
    const ativo = botao.dataset.faixa === filtro;
    botao.setAttribute('aria-pressed', String(ativo));
    botao.classList.toggle('is-active', ativo);
  });
  if (ultimoStatsRecebido) {
    aplicarEstatisticas(ultimoStatsRecebido);
  }
}

function bindFiltrosFaixa() {
  document.querySelectorAll('.filtro-faixa-btn').forEach(botao => {
    botao.addEventListener('click', () => selecionarFiltroFaixa(botao.dataset.faixa));
  });
}

// Chamado pelo quiz.js após registrar uma resposta, para respeitar o filtro ativo.
window.atualizarGraficoPerfil = function (stats) {
  aplicarEstatisticas(stats);
};

document.addEventListener('DOMContentLoaded', async () => {
  bindFiltrosFaixa();
  try {
    await renderMetricsChart();
  } catch (error) {
    console.error('Top-level error in metrics initialization:', error);
  }
});