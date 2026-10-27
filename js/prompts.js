// Copia o texto do prompt; usa execCommand quando a Clipboard API não está disponível.
function copiarTexto(texto, btn) {
  const prom = (navigator.clipboard && window.isSecureContext)
    ? navigator.clipboard.writeText(texto)
    : new Promise((resolve, reject) => {
        const area = document.createElement('textarea');
        area.value = texto;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        ok ? resolve() : reject(new Error('copy failed'));
      });

  const botao = btn || (typeof event !== 'undefined' && event?.target?.closest ? event.target.closest('.btn-copy') : null);
  if (botao) {
    const rotulo = botao.textContent;
    prom
      .then(() => {
        botao.textContent = 'Copiado!';
        botao.classList.add('copied');
      })
      .catch(() => {
        botao.textContent = 'Selecione e copie manualmente';
      })
      .finally(() => {
        setTimeout(() => {
          botao.textContent = rotulo;
          botao.classList.remove('copied');
        }, 2000);
      });
  }

  return prom;
}

document.querySelectorAll('.btn-copy[data-copy-target]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const alvo = document.getElementById(btn.dataset.copyTarget);
    if (!alvo) return;
    const rotulo = btn.textContent;
    copiarTexto(alvo.textContent)
      .then(() => {
        btn.textContent = 'Copiado!';
        btn.classList.add('copied');
      })
      .catch(() => {
        btn.textContent = 'Selecione e copie manualmente';
      })
      .finally(() => {
        setTimeout(() => {
          btn.textContent = rotulo;
          btn.classList.remove('copied');
        }, 2000);
      });
  });
});

const itensChecklist = document.querySelectorAll('.checklist input[type="checkbox"]');
const resultadoChecklist = document.getElementById('checklistResultado');
if (itensChecklist.length && resultadoChecklist) {
  const atualizar = () => {
    const marcados = [...itensChecklist].filter((i) => i.checked).length;
    resultadoChecklist.textContent = marcados === itensChecklist.length
      ? 'Tudo marcado: você está no comando.'
      : `${marcados} de ${itensChecklist.length} itens marcados.`;
  };
  itensChecklist.forEach((i) => i.addEventListener('change', atualizar));
}
