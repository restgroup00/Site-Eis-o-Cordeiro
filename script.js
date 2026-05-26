 const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  async function updateDailyContent() {
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
              const dailyVerseElem = document.getElementById('daily-verse');
              if (dailyVerseElem) dailyVerseElem.innerText = todayRow[1] ? todayRow[1].replace(/"/g, '') : '';

              const devTitleElem = document.getElementById('dev-title');
              if (devTitleElem) devTitleElem.innerText = 'Mensagem de Hoje';

              const devTextElem = document.getElementById('dev-text');
              if (devTextElem) devTextElem.innerText = todayRow[2] ? todayRow[2].replace(/"/g, '') : '';

              const devVerseElem = document.getElementById('dev-verse');
              if (devVerseElem) devVerseElem.innerText = todayRow[3] ? todayRow[3].replace(/"/g, '') : '';
          }
      } catch (e) {
          console.error("Erro na atualização:", e);
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
