/**
   * SITE EIS O CORDEIRO - AJUSTE FINAL DE FUNCIONALIDADES
   */

  const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  // 1. ATUALIZAÇÃO DIÁRIA (MANTIDA)
  async function updateDailyContent() {
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
              if (document.getElementById('daily-verse')) document.getElementById('daily-verse').innerText = todayRow[1] ?
  todayRow[1].replace(/"/g, '') : '';
              if (document.getElementById('dev-title')) document.getElementById('dev-title').innerText = 'Mensagem de Hoje';
              if (document.getElementById('dev-text')) document.getElementById('dev-text').innerText = todayRow[2] ?
  todayRow[2].replace(/"/g, '') : '';
              if (document.getElementById('dev-verse')) document.getElementById('dev-verse').innerText = todayRow[3] ?
  todayRow[3].replace(/"/g, '') : '';
          }
      } catch (e) { console.error("Erro planilha:", e); }
  }

  // 2. CALENDÁRIO (CORRIGIDO PARA ABRIR O MODAL)
  async function openCalendar() {
      const modal = document.getElementById('calendarModal');
      if (modal) {
          modal.classList.remove('hidden');
          renderCalendar();
      }
  }

  async function renderCalendar() {
      const grid = document.querySelector('.calendar-grid');
      if (!grid) return;
      grid.innerHTML = '';
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
          const dayElem = document.createElement('div');
          dayElem.className = 'calendar-day';
          dayElem.innerText = i;
          dayElem.onclick = () => selectDate(i, now.getMonth() + 1, now.getFullYear());
          grid.appendChild(dayElem);
      }
  }

  async function selectDate(day, month, year) {
      const dateString = String(day).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year;
      try {
          const response = await fetch(`${SHEET_URL}&t=${new Date().getTime()}`);
          const data = await response.text();
          const rows = parseCSV(data);
          const selectedRow = rows.find(row => row[0] && row[0].replace(/"/g, '').trim() === dateString);
          if (selectedRow) {
              document.getElementById('dev-title').innerText = `Mensagem de ${dateString}`;
              document.getElementById('dev-text').innerText = selectedRow[2].replace(/"/g, '');
              document.getElementById('dev-verse').innerText = selectedRow[3] ? selectedRow[3].replace(/"/g, '') : '';
              document.getElementById('calendarModal').classList.add('hidden');
              window.scrollTo({ top: document.getElementById('devocionais').offsetTop - 100, behavior: 'smooth' });
          } else { alert("Não há mensagem para este dia."); }
      } catch (e) { console.error("Erro calendário:", e); }
  }

  // 3. BÍBLIA (CORRIGIDO PARA CARREGAR VERSÍCULOS)
  const bibleBooks = {
      "Genesis": 50, "Exodo": 40, "Levitico": 27, "Numeros": 36, "Deuteronomio": 34,
      "Josue": 24, "Juizes": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
      "1 Reis": 22, "2 Reis": 25, "1 Cronicas": 29, "2 Cronicas": 36, "Esdras": 10,
      "Neemias": 13, "Ester": 10, "Job": 42, "Salmos": 150, "Proverbios": 31,
      "Eclesiastes": 12, "Canticos": 8, "Isaías": 66, "Jeremias": 52, "Lamentacoes": 5,
      "Ezequiel": 48, "Daniel": 12, "Oseias": 14, "Joel": 3, "Amos": 9,
      "Obadias": 1, "Jonas": 4, "Miqueias": 7, "Naum": 3, "Habacuque": 3, "Sofonias": 3, "Ageu": 2, "Zacarias": 14, "Malaquias": 4
  };

  async function loadBible() {
      const book = document.getElementById('book-select').value;
      const chapter = document.getElementById('chapter-select').value;
      const viewport = document.getElementById('bible-viewport');
      if (!book || !chapter) return;
      viewport.innerHTML = '<p class="placeholder-msg">Carregando versículos...</p>';
      try {
          const response = await fetch(`https://bible-api.com/${book} ${chapter}?translation=almeida`);
          const data = await response.json();
          viewport.innerHTML = '';
          data.verses.forEach(v => {
              const div = document.createElement('div');
              div.className = 'bible-verse-item';
              div.innerHTML = `<span class="verse-number">${v.verse}</span><span class="verse-text">${v.text}</span>`;
              viewport.appendChild(div);
          });
      } catch (e) { viewport.innerHTML = '<p class="placeholder-msg">Erro ao carregar a Bíblia.</p>'; }
  }

  function updateChapters() {
      const book = document.getElementById('book-select').value;
      const chapterSelect = document.getElementById('chapter-select');
      chapterSelect.innerHTML = '';
      const totalChapters = bibleBooks[book] || 0;
      for (let i = 1; i <= totalChapters; i++) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.innerText = `Capítulo ${i}`;
          chapterSelect.appendChild(opt);
      }
  }

  // HELPERS E INICIALIZAÇÃO
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

  document.addEventListener('DOMContentLoaded', () => {
      updateDailyContent();
      const bookSelect = document.getElementById('book-select');
      if (bookSelect) {
          bookSelect.innerHTML = '<option value="">Selecione o Livro</option>';
          for (let book in bibleBooks) {
              const opt = document.createElement('option');
              opt.value = book;
              opt.innerText = book;
              bookSelect.appendChild(opt);
          }
          bookSelect.onchange = updateChapters;
      }
      const closeBtn = document.querySelector('.close-modal');
      if (closeBtn) closeBtn.onclick = () => document.getElementById('calendarModal').classList.add('hidden');
  });
