/**
   * SITE EIS O CORDEIRO - Versão de Diagnóstico
   */

  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTH5882wd96tuXd-Qyr3SMisMNxSNK0QDtq4xS64cC5l9GRclyjpxcJKBWI4cVwPc_I9-Fs  HYn90mrt/pub?output=csv';

  async function updateDailyContent() {
      console.log("🚀 Iniciando atualização de conteúdo...");
      try {
          const response = await fetch(SHEET_URL);
          if (!response.ok) throw new Error(`Erro na resposta do servidor: ${response.status}`);

          const data = await response.text();
          console.log("✅ Planilha baixada com sucesso!");

          const rows = parseCSV(data);
          console.log(`📊 Total de linhas encontradas na planilha: ${rows.length}`);

          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          const dateString = `${day}/${month}/${year}`;

          console.log(`📅 Buscando data: ${dateString}`);

          // Tenta encontrar a linha de hoje
          let todayRow = rows.find(row => row[0] && row[0].trim() === dateString);

          if (!todayRow && rows.length > 1) {
              console.warn("⚠️  Data de hoje não encontrada. Usando a primeira linha disponível como fallback.");
              todayRow = rows[1]; // Pega a primeira linha de dados (pulando o cabeçalho)
          }

          if (todayRow) {
              console.log("✨ Conteúdo encontrado! Atualizando elementos...");

              if (document.getElementById('daily-verse')) {
                  document.getElementById('daily-verse').innerText = todayRow[1] || "Versículo não encontrado";
              }
              if (document.getElementById('dev-title')) {
                  document.getElementById('dev-title').innerText = "Mensagem de Hoje";
              }
              if (document.getElementById('dev-text')) {
                  document.getElementById('dev-text').innerText = todayRow[2] || "Mensagem não encontrada";
              }
              const devTextElem = document.getElementById('dev-text');
              if (devTextElem && todayRow[3]) {
                  devTextElem.innerHTML += `<br><br><strong>${todayRow[3]}</strong>`;
              }
              console.log("✅ Site atualizado com sucesso!");
          } else {
              console.error("❌ Erro crítico: Planilha vazia ou sem dados.");
          }
      } catch (error) {
          console.error("❌ Erro fatal no script:", error);
          if (document.getElementById('dev-text')) {
              document.getElementById('dev-text').innerText = "Erro ao carregar mensagem. Verifique o console.";
          }
      }
  }

  function parseCSV(text) {
      const result = [];
      let row = [];
      let col = "";
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];
          if (char === '"' && inQuotes && nextChar === '"') { col += '"'; i++; }
          else if (char === '"') { inQuotes = !inQuotes; }
          else if (char === ',' && !inQuotes) { row.push(col); col = ""; }
          else if (char === '\r' || char === '\n') {
              if (inQuotes) { col += char; }
              else {
                  if (row.length > 0 || col !== "") { row.push(col); result.push(row); }
                  row = []; col = "";
                  if (char === '\r' && nextChar === '\n') i++;
              }
          } else { col += char; }
      }
      if (row.length > 0 || col !== "") { row.push(col); result.push(row); }
      return result;
  }

  document.addEventListener('DOMContentLoaded', () => {
      updateDailyContent();
  });
