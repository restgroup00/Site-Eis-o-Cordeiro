const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTH5882wd96tuXd-Qyr3SMisMNxSNK0QDtq4xS64cC5l9GRclyjpxcJKBWI4cVwPc_I9-Fs  HYn90mrt/pub?output=csv';                                                                                                                 

  async function updateDailyContent() {
      try {
          const response = await fetch(SHEET_URL + '&t=' + new Date().getTime());
          if (!response.ok) throw new Error('Erro HTTP: ' + response.status);
          const data = await response.text();
          const rows = parseCSV(data);
          const today = new Date();
          const dateString = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' +
  today.getFullYear();
          const todayRow = rows.find(row => row[0] && row[0].replace(/"/g, '').trim() === dateString);
          if (todayRow) {
              if (document.getElementById('daily-verse')) document.getElementById('daily-verse').innerText = todayRow[1] ?
  todayRow[1].replace(/"/g, '') : '';
              if (document.getElementById('dev-title')) document.getElementById('dev-title').innerText = 'Mensagem de Hoje';
              if (document.getElementById('dev-text')) {
                  const msg = todayRow[2] ? todayRow[2].replace(/"/g, '') : '';
                  const vMsg = todayRow[3] ? todayRow[3].replace(/"/g, '') : '';
                  document.getElementById('dev-text').innerHTML = msg + '<br><br><strong>' + vMsg + '</strong>';
              }
          }
      } catch (e) {
          console.error('Erro:', e);
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
