/**
   * SITE EIS O CORDEIRO - VERSÃO COMPLETA E RESTAURADA
   * Funcionalidades: Planilha Diária, Calendário de Mensagens e Leitor de Bíblia
   */

  // --- CONFIGURAÇÕES DA PLANILHA ---
  const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  // --- LÓGICA DA PLANILHA DIÁRIA ---
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
              const dailyVerseElem = document.getElementById('daily-verse');
              if (dailyVerseElem) dailyVerseElem.innerText = todayRow[1] ? todayRow[1].replace(/"/g, '') : '';
              const devTitleElem = document.getElementById('dev-title');
              if (devTitleElem) devTitleElem.innerText = 'Mensagem de Hoje';
              const devTextElem = document.getElementById('dev-text');
              if (devTextElem) {
                  const msg = todayRow[2] ? todayRow[2].replace(/"/g, '') : '';
                  const vMsg = todayRow[3] ? todayRow[3].replace(/"/g, '') : '';
                  devTextElem.innerHTML = `<p>${msg}</p>`;
                  if (vMsg) devTextElem.innerHTML += `<br><p style="font-style: italic; font-weight: bold; text-align: center; margin-top:
  20px;">${vMsg}</p>`;
              }
          }
      } catch (e) { console.error("Erro planilha:", e); }
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

  // --- LÓGICA DO CALENDÁRIO ---
  const modal = document.getElementById('calendarModal');
  const closeBtn = document.querySelector('.close-modal');

  if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add('hidden');
  }

  window.onclick = (event) => {
      if (event.target == modal) modal.classList.add('hidden');
  };

  async function openCalendar() {
      if (modal) modal.classList.remove('hidden');
      renderCalendar();
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
              document.getElementById('dev-text').innerHTML = `<p>${selectedRow[2].replace(/"/g, '')}</p>`;
              if (selectedRow[3]) {
                  document.getElementById('dev-text').innerHTML += `<br><p style="font-style: italic; font-weight: bold; text-align: center;   margin-top: 20px;">${selectedRow[3].replace(/"/g, '')}</p>`;
              }
              if (modal) modal.classList.add('hidden');
              window.scrollTo({ top: document.getElementById('devocionais').offsetTop - 100, behavior: 'smooth' });
          } else {
              alert("Não há mensagem para este dia.");
          }
      } catch (e) { console.error("Erro calendário:", e); }
  }

  // --- LÓGICA DA BÍBLIA ---
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
      } catch (e) {
          viewport.innerHTML = '<p class="placeholder-msg">Erro ao carregar a Bíblia. Tente novamente.</p>';
      }
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

  // Inicialização Geral
  document.addEventListener('DOMContentLoaded', () => {
      updateDailyContent();

      // Configura Bíblia
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

      // Ativa botão de calendário
      const calBtn = document.getElementById('openCalendarBtn');
      if (calBtn) calBtn.onclick = openCalendar;
  });
