const PART1 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTH5882wd96tuXd-Qyr3SMisMNxSNK0QDtq4xS64cC5l9GRclyjpxcJKBWI4cVwPc_I9-Fs';
  const PART2 = 'HYn90mrt/pub?output=csv';

  async function updateDailyContent() {
      const fullURL = PART1 + PART2;
      console.log("🔗 Link reconstruído: " + fullURL);

      try {
          const response = await fetch(fullURL + '&cachebust=' + Math.random());
          if (!response.ok) throw new Error('Erro na planilha');

          const data = await response.text();
          const rows = parseCSV(data);
          const today = new Date();
          const dateString = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' +
  today.getFullYear();

          console.log("📅 Procurando por: " + dateString);

          const todayRow = rows.find(row => row[0] && row[0].replace(/"/g, '').trim() === dateString);

          if (todayRow) {
              document.getElementById('daily-verse').innerText = todayRow[1].replace(/"/g, '');
              document.getElementById('dev-title').innerText = 'Mensagem de Hoje';
              document.getElementById('dev-text').innerHTML = todayRow[2].replace(/"/g, '') + '<br><br><strong>' + (todayRow[3] ?
  todayRow[3].replace(/"/g, '') : '') + '</strong>';
              console.log("✅ SUCESSO!");
          } else {
              console.log("SISTEMA: Data não encontrada na planilha.");
              if(rows.length > 1) {
                  document.getElementById('daily-verse').innerText = rows[1][1];
                  document.getElementById('dev-text').innerText = "Exibindo mensagem de exemplo (Data de hoje não encontrada).";
              }
          }
      } catch (e) {
          console.error("❌ Erro:", e);
          document.getElementById('dev-text').innerText = "Erro ao conectar com a planilha.";
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
              if (row.length > 0 > 0 || col !== "") { row.push(col); result.push(row); }
              row = []; col = "";
              if (char === '\r' && next === '\n') i++;
          } else { col += char; }
      }
      if (row.length > 0 || col !== "") { row.push(col); result.push(row); }
      return result;
  }

  document.addEventListener('DOMContentLoaded', updateDailyContent);
