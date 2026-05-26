/**
   * SITE EIS O CORDEIRO - VERSÃO ULTRA-ESTÁVEL (API DIRECT)
   */

  // Usando o ID da planilha para exportação direta via CSV
  const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  async function updateDailyContent() {
      console.log("🚀 Conectando via API Direta...");
      try {
          // Adicionamos um timestamp para evitar cache do servidor
          const response = await fetch(`${SHEET_URL}&t=${new Date().getTime()}`);

          if (!response.ok) throw new Error(`Erro na planilha: ${response.status}`);

          const data = await response.text();
          const rows = parseCSV(data);

          const today = new Date();
          const dateString = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' +
  today.getFullYear();

          console.log("📅 Procurando data: " + dateString);

          const todayRow = rows.find(row => {
              if (!row[0]) return false;
              return row[0].replace(/"/g, '').trim() === dateString;
          });

          if (todayRow) {
              // 1. Versículo do Dia (Topo)
              const dailyVerseElem = document.getElementById('daily-verse');
              if (dailyVerseElem) dailyVerseElem.innerText = todayRow[1] ? todayRow[1].replace(/"/g, '') : '';

              // 2. Título da Mensagem
              const devTitleElem = document.getElementById('dev-title');
              if (devTitleElem) devTitleElem.innerText = 'Mensagem de Hoje';

              // 3. Mensagem + Versículo da Mensagem (Coluna D)
              const devTextElem = document.getElementById('dev-text');
              if (devTextElem) {
                  const mensagem = todayRow[2] ? todayRow[2].replace(/"/g, '') : '';
                  const versiculoMensagem = todayRow[3] ? todayRow[3].replace(/"/g, '') : '';

                  devTextElem.innerHTML = ''; // Limpa tudo (incluindo fixos do HTML)
                  devTextElem.innerHTML += `<p>${mensagem}</p>`;
                  if (versiculoMensagem) {
                      devTextElem.innerHTML += `<br><p style="font-style: italic; font-weight: bold; margin-top:
  15px;">${versiculoMensagem}</p>`;
                  }
              }
              console.log("✅ SUCESSO TOTAL!");
          } else {
              console.warn("⚠️  Data de hoje não encontrada na planilha.");
              if(rows.length > 1) {
                  document.getElementById('daily-verse').innerText = rows[1][1];
                  document.getElementById('dev-text').innerText = "Exibindo mensagem de exemplo (Data de hoje não encontrada na planilha).";              }
          }
      } catch (e) {
          console.error("❌ Erro fatal:", e);
          const devTextElem = document.getElementById('dev-text');
          if (devTextElem) devTextElem.innerText = "Erro ao carregar dados. Verifique se a planilha está compartilhada como 'Qualquer pessoa   com o link'.";
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

  document.addEventListener('DOMContentLoaded', updateDailyContent);
