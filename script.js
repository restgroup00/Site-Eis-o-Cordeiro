/**
   * SITE EIS O CORDEIRO - VERSÃO COM FORÇAMENTO de ATUALIZAÇÃO
   */

  const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  // Mudamos o nome da função para 'runUpdateV2' para forçar o navegador a ignorar o cache
  async function runUpdateV2() {
      console.log("🚀 Iniciando runUpdateV2...");

      try {
          const response = await fetch(`${SHEET_URL}&t=${new Date().getTime()}`);
          if (!response.ok) throw new Error(`Erro: ${response.status}`);

          const data = await response.text();
          const rows = parseCSV(data);

          const today = new Date();
          const dateString = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' +
  today.getFullYear();

          const todayRow = rows.find(row => {
              if (!row[0]) return false;
              return row[0].replace(/"/g, '').trim() === dateString;
          });

          if (todayRow) {
              // Atualiza Versículo do Topo
              const dailyVerseElem = document.getElementById('daily-verse');
              if (dailyVerseElem) dailyVerseElem.innerText = todayRow[1] ? todayRow[1].replace(/"/g, '') : '';

              // Atualiza Título
              const devTitleElem = document.getElementById('dev-title');
              if (devTitleElem) devTitleElem.innerText = 'Mensagem de Hoje';

              // Atualiza Mensagem e Versículo D
              const devTextElem = document.getElementById('dev-text');
              if (devTextElem) {
                  const mensagem = todayRow[2] ? todayRow[2].replace(/"/g, '') : '';
                  const versiculoMensagem = todayRow[3] ? todayRow[3].replace(/"/g, '') : '';

                  // Substituição segura para não quebrar layout
                  devTextElem.innerHTML = `<p style="margin-bottom: 20px;">${mensagem}</p>`;
                  if (versiculoMensagem) {
                      devTextElem.innerHTML += `<p style="font-style: italic; font-weight: bold; text-align: center; margin-top:
  20px;">${versiculoMensagem}</p>`;
                  }
              }
              console.log("✅ SUCESSO TOTAL!");
          }
      } catch (e) {
          console.error("❌ Erro:", e);
      }
  }

  function parseCSV(text) {
      const result = [];
      let row = [], col = "", inQuotes = false;
      for (let i = 0; i < text.length; i++) {
          const char = text[i], next = text[i+1];
          if (char === '"' && inQuotes && next === '"') { col += '"'; i++; }
          else if (char === '"') { inQuotes = !inQuotes; }
          else if (char === ',' && !inQuotes) { row.push(col); col = ""; }
          else if ((char === '\r' || char === '\n') && !inQuotes) {
              if (row.length > 0 || col !== "") { row.push(col); result.push(row); }
              row = []; col = "";
              if (char === '\r' && next === '\n') i++;
          } else { col += char; }
      }
      if (row.length > 0 || col !== "") { row.push(col); result.push(row); }
      return result;
  }

  // Chamada da função com novo nome
  document.addEventListener('DOMContentLoaded', runUpdateV2);
