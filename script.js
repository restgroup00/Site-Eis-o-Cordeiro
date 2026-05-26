const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  async function runUpdateV2() {
      console.log("🚀 Iniciando runUpdateV2...");
      try {
          const response = await fetch(`${SHEET_URL}&t=${new Date().getTime()}`);
          if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

          const data = await response.text();
          const rows = parseCSV(data);
          console.log("📊 Total de linhas lidas da planilha: " + rows.length);

          const today = new Date();
          const dateString = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' +
  today.getFullYear();
          console.log("📅 Procurando data exata: " + dateString);

          // Busca a data
          let todayRow = rows.find(row => {
              if (!row[0]) return false;
              const val = row[0].replace(/"/g, '').trim();
              console.log("Checando linha: " + val);
              return val === dateString;
          });

          // SE NÃO ACHAR A DATA, PEGA A SEGUNDA LINHA (Primeiro dado após cabeçalho)
          if (!todayRow && rows.length > 1) {
              console.warn("⚠️  Data de hoje não encontrada. Usando a primeira mensagem disponível para teste.");
              todayRow = rows[1];
          }

          if (todayRow) {
              console.log("✨ DADO ENCONTRADO! Atualizando tela...");

              const dailyVerseElem = document.getElementById('daily-verse');
              if (dailyVerseElem) dailyVerseElem.innerText = todayRow[1] ? todayRow[1].replace(/"/g, '') : 'Versículo não encontrado';

              const devTitleElem = document.getElementById('dev-title');
              if (devTitleElem) devTitleElem.innerText = 'Mensagem de Hoje';

              const devTextElem = document.getElementById('dev-text');
              if (devTextElem) {
                  const mensagem = todayRow[2] ? todayRow[2].replace(/"/g, '') : 'Mensagem não encontrada';
                  const versiculoMensagem = todayRow[3] ? todayRow[3].replace(/"/g, '') : '';

                  devTextElem.innerHTML = `<p style="margin-bottom: 20px;">${mensagem}</p>`;
                  if (versiculoMensagem) {
                      devTextElem.innerHTML += `<p style="font-style: italic; font-weight: bold; text-align: center; margin-top:
  20px;">${versiculoMensagem}</p>`;
                  }
              }
              console.log("✅ SUCESSO TOTAL!");
          } else {
              console.error("❌ Erro: A planilha está vazia.");
          }
      } catch (e) {
          console.error("❌ Erro fatal:", e);
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

  document.addEventListener('DOMContentLoaded', runUpdateV2);
