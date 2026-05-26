/**
   * SITE EIS O CORDEIRO - Versão Final Corrigida
   */

  // URL de publicação direta do Google Sheets CSV
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTH5882wd96tuXd-Qyr3SMisMNxSNK0QDtq4xS64cC5l9GRclyjpxcJKBWI4cVwPc_I9-Fs  HYn90mrt/pub?output=csv';

  async function updateDailyContent() {
      console.log("🚀 Iniciando atualização de conteúdo...");
      try {
          // Adicionamos um timestamp para evitar cache do servidor
          const response = await fetch(`${SHEET_URL}&t=${new Date().getTime()}`);

          if (!response.ok) {
              throw new Error(`Erro HTTP: ${response.status} - Verifique se a planilha está 'Publicada na Web'`);
          }

          const data = await response.text();
          console.log("✅ Planilha baixada com sucesso!");

          const rows = parseCSV(data);
          console.log(`📊 Linhas encontradas: ${rows.length}`);

          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          const dateString = `${day}/${month}/${year}`;

          console.log(`📅 Procurando por: ${dateString}`);

          // Busca a data ignorando espaços e aspas
          const todayRow = rows.find(row => {
              if (!row[0]) return false;
              const cellValue = row[0].replace(/"/g, '').trim();
              return cellValue === dateString;
          });

          if (todayRow) {
              console.log("✨ Conteúdo encontrado!");

              if (document.getElementById('daily-verse')) {
                  document.getElementById('daily-verse').innerText = todayRow[1] ? todayRow[1].replace(/"/g, '') : "Versículo não
  encontrado";
              }
              if (document.getElementById('dev-title')) {
                  document.getElementById('dev-title').innerText = "Mensagem de Hoje";
              }
              if (document.getElementById('dev-text')) {
                  const msg = todayRow[2] ? todayRow[2].replace(/"/g, '') : "Mensagem não encontrada";
                  const verseMsg = todayRow[3] ? todayRow[3].replace(/"/g, '') : "";
                  document.getElementById('dev-text').innerHTML = `${msg}<br><br><strong>${verseMsg}</strong>`;
              }
              console.log("✅ Site atualizado!");
          } else {
              console.warn("⚠️  Data não encontrada na planilha. Verifique se a data de hoje está escrita como DD/MM/AAAA.");
          }
      } catch (error) {
          console.error("❌ Erro:", error);
          if (document.getElementById('dev-text')) {
              document.getElementById('dev-text').innerText = "Erro ao conectar com a planilha.";
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
