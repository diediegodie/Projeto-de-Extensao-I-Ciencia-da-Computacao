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

      const chartData = [
        stats.total_passivo,
        stats.total_transicao,
        stats.total_ativo
      ];
      console.log('chartData:', chartData);
      if (chartData.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
        throw new Error('Invalid chart data: expected finite numbers');
      }

      chart.data.datasets[0].data = chartData;
      chart.update();

      // Update total participants display
      const totalCountElement = document.getElementById('totalCount');
      if (totalCountElement) {
        totalCountElement.textContent = stats.total_participantes;
      }
    } catch (error) {
      console.error('Failed to fetch or update stats chart; showing visual fallback data:', error);
    }
  } catch (error) {
    console.error('Failed to create chart:', error);
    // Optionally show error state
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await renderMetricsChart();
  } catch (error) {
    console.error('Top-level error in metrics initialization:', error);
  }
});