/**
   * SITE EIS O CORDEIRO - VERSÃO FINAL COMPLETA (AT + NT)
   * Funcionalidades: Planilha Diária, Calendário e Bíblia Completa
   */

  const SHEET_ID = '1XW0mlGqAMyqW-5YdkYSDsO7J1Jza9HSgnw66kswbcnQ';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  // --- MAPEAMENTO COMPLETO DA BÍBLIA (Antigo e Novo Testamento) ---
  const bibleBooks = {
      // Antigo Testamento
      "Genesis": 50, "Exodo": 40, "Levitico": 27, "Numeros": 36, "Deuteronomio": 34,
      "Josue": 24, "Juizes": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
      "1 Reis": 22, "2 Reis": 25, "1 Cronicas": 29, "2 Cronicas": 36, "Esdras": 10,
      "Neemias": 13, "Ester": 10, "Job": 42, "Salmos": 150, "Proverbios": 31,
      "Eclesiastes": 12, "Canticos": 8, "Isaías": 66, "Jeremias": 52, "Lamentacoes": 5,
      "Ezequiel": 48, "Daniel": 12, "Oseias": 14, "Joel": 3, "Amos": 9,
      "Obadias": 1, "Jonas": 4, "Miqueias": 7, "Naum": 3, "Habacuque": 3, "Sofonias": 3, "Ageu": 2, "Zacarias": 14, "Malaquias": 4,
      // Novo Testamento
      "Mateus": 28, "Marcos": 16, "Lucas": 24, "Joao": 21, "Atos": 28,
      "Romanos": 16, "1 Corintios": 16, "2 Corintios": 13, "Galatas": 6, "Efesios": 6,
      "Filipenses": 4, "Colossenses": 4, "1 Tessalonicenses": 5, "2 Tessalonicenses": 3, "1 Timoteo": 6,
      "2 Timoteo": 4, "Tito": 3, "Filemon": 1, "Hebreus": 13, "Tiago": 5,
      "1 Pedro": 5, "2 Pedro": 3, "1 Joao": 5, "2 Joao": 1, "3 Joao": 1, "Judas": 1, "Apocalipse": 22
  };

  // --- FUNÇÕES GLOBAIS (LIGADAS AOS BOTÕES DO HTML) ---

  window.openCalendarModal = function() {
      const modal = document.getElementById('calendarModal');
      if (modal) {
          modal.classList.remove('hidden');
          renderCalendar();
      }
  };

  window.loadBibleVerses = async function() {
      const book = document.getElementById('book-select');
      const chapter = document.getElementById('chapter-select');
      const viewport = document.getElementById('bible-viewport');
      if (!book || !chapter || !viewport) return;
      if (!book.value || !chapter.value) { alert("Selecione o livro e o capítulo!"); return; }

      viewport.innerHTML = '<p style="text-align:center">Carregando versículos...</p>';
      try {
          const response = await fetch(`https://bible-api.com/${book.value} ${chapter.value}?translation=almeida`);
          const data = await response.json();
          viewport.innerHTML = '';
          data.verses.forEach(v => {
              const div = document.createElement('div');
              div.className = 'bible-verse-item';
              div.innerHTML = `<span class="verse-number">${v.verse}</span><span class="verse-text">${v.text}</span>`;
              viewport.appendChild(div);
          });
      } catch (e) { viewport.innerHTML = '<p>Erro ao carregar. Tente novamente.</p>'; }
  };

  window.updateChapters = function() {
      const book = document.getElementById('book-select');
      const chapterSelect = document.getElementById('chapter-select');
      if (!book || !chapterSelect) return;
      const bookName = book.value;
      chapterSelect.innerHTML = '';
      const totalChapters = bibleBooks[bookName] || 0;
      for (let i = 1; i <= totalChapters; i++) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.innerText = `Capítulo ${i}`;
          chapterSelect.appendChild(opt);
      }
  };

  // --- LÓGICA DE CONTEÚDO DIÁRIO E CALENDÁRIO ---

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
              if (document.getElementById('dev-title')) document.getElementById('dev-title').innerText = `Mensagem de ${dateString}`;
              if (document.getElementById('dev-text')) document.getElementById('dev-text').innerText = selectedRow[2].replace(/"/g, '');
              if (document.getElementById('dev-verse')) document.getElementById('dev-verse').innerText = selectedRow[3] ?
  selectedRow[3].replace(/"/g, '') : '';
              const modal = document.getElementById('calendarModal');
              if (modal) modal.classList.add('hidden');
              window.scrollTo({ top: document.getElementById('devocionais')?.offsetTop - 100 || 0, behavior: 'smooth' });
          } else { alert("Não há mensagem para este dia."); }
      } catch (e) { console.error("Erro calendário:", e); }
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

  // --- INICIALIZAÇÃO ---
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
      if (closeBtn) {
          closeBtn.onclick = () => {
              const modal = document.getElementById('calendarModal');
              if (modal) modal.classList.add('hidden');
          };
      }
  });
// --- LÓGICA DE ENVIO DE ORAÇÕES PARA WHATSAPP ---
  document.addEventListener('DOMContentLoaded', () => {
      const prayerForm = document.getElementById('prayer-form');
      if (prayerForm) {
          prayerForm.onsubmit = function(e) {
              e.preventDefault(); // Impede a página de recarregar

              // --- COLOQUE SEU NÚMERO AQUI (Exemplo: 5511999999999) ---
              const meuNumero = '11930993881';

              const nome = prayerForm.querySelector('input').value;
              const pedido = prayerForm.querySelector('textarea').value;

              // Monta a mensagem formatada para o WhatsApp
              const mensagem = `Olá! Gostaria de pedir oração:\n\n*Nome:* ${nome}\n*Pedido:* ${pedido}`;
              const urlWhatsapp = `https://wa.me/${meuNumero}?text=${encodeURIComponent(mensagem)}`;

              // Abre o WhatsApp em uma nova aba
              window.open(urlWhatsapp, '_blank');
          };
      }
  });
