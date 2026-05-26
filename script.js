const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  async function runUpdateV2() {
      console.log("🚀 Iniciando runUpdateV2 - Modo Caçador...");
      try {
          const response = await fetch(`${SHEET_URL}&t=${new Date().getTime()}`);
          if (!response.ok) throw new Error(`Erro: ${response.status}`);
          const data = await response.text();
          const rows = parseCSV(data);
          const today = new Date();
          const dateString = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' +
  today.getFullYear();

          const todayRow = rows.find(row => row[0] && row[0].replace(/"/g, '').trim() === dateString);

          if (todayRow) {
              const vDia = todayRow[1] ? todayRow[1].replace(/"/g, '') : '';
              const mensagem = todayRow[2] ? todayRow[2].replace(/"/g, '') : '';
              const vMensagem = todayRow[3] ? todayRow[3].replace(/"/g, '') : '';

              // ESTRATÉGIA DE SUBSTITUIÇÃO GLOBAL
              // 1. Tenta atualizar pelos IDs (estratégia normal)
              const elVerse = document.getElementById('daily-verse');
              if (elVerse) elVerse.innerText = vDia;

              const elText = document.getElementById('dev-text');
              if (elText) {
                  elText.innerHTML = `<p style="margin-bottom: 20px;">${mensagem}</p>`;
                  if (vMensagem) elText.innerHTML += `<p style="font-style: italic; font-weight: bold; text-align: center; margin-top:
  20px;">${vMensagem}</p>`;
              }

              // 2. ESTRATÉGIA "MARTELO": Procura qualquer texto fixo e troca
              const allElements = document.querySelectorAll('p, span, div, h1, h2, h3');
              allElements.forEach(el => {
                  if (el.innerText.includes("O Senhor é a minha luz") || el.innerText.includes("Salmos 27:1")) {
                      el.innerHTML = `<p style="font-style: italic; font-weight: bold; text-align: center;">${vMensagem}</p>`;
                      console.log("🔨 Elemento fixo removido e substituído!");
                  }
                  if (el.innerText.includes("João 3:16")) {
                      el.innerText = vDia;
                      console.log("🔨 Versículo fixo substituído!");
                  }
              });

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

  document.addEventListener('DOMContentLoaded', runUpdateV2);
