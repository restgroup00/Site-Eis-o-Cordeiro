document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO GOOGLE SHEETS ---
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTH5882wd96tuXd-Qyr3SMisMNxSNK0QDtq4xS64cC5l9GRclyjpxcJKBWI4cVwPc_I9-FsHYn90mrt/pub?gid=0&single=true&output=csv';

    // Função robusta para processar CSV que aceita quebras de linha dentro de aspas
    function parseCSV(text) {
        const result = [];
        let row = [];
        let col = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"' && inQuotes && nextChar === '"') {
                col += '"';
                i++;
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(col);
                col = '';
            } else if ((char === '\\n' || char === '\\r') && !inQuotes) {
                if (col !== '' || row.length > 0) {
                    row.push(col);
                    result.push(row);
                    row = [];
                    col = '';
                }
            } else {
                col += char;
            }
        }
        if (col !== '' || row.length > 0) {
            row.push(col);
            result.push(row);
        }
        return result;
    }

    async function updateDailyContent() {
        const dailyVerseEl = document.getElementById('daily-verse');
        const devTitleEl = document.getElementById('dev-title');
        const devTextEl = document.getElementById('dev-text');
        const devVerseBoxEl = document.querySelector('.dev-verse-box p');

        try {
            // Adicionado timestamp para evitar cache do navegador
            const response = await fetch(SHEET_URL + '&t=' + new Date().getTime());
            if (!response.ok) throw new Error('Erro ao carregar a planilha');
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            if (rows.length < 2) {
                console.error('Planilha vazia ou sem dados');
                return;
            }

            const headers = rows[0].map(h => h.trim());
            const content = rows.slice(1).map(row => {
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i] ? row[i].trim() : '';
                });
                return obj;
            });

            const today = new Date();
            const todayStr = today.toLocaleDateString('pt-BR');

            console.log('Buscando data:', todayStr);

            // Tenta encontrar a data exata, se não, pega a última linha da planilha
            let todayData = content.find(item => item.Data === todayStr);

            if (!todayData) {
                console.log('Data de hoje não encontrada, usando a última entrada.');
                todayData = content[content.length - 1];
            }

            if (todayData) {
                if (dailyVerseEl) dailyVerseEl.textContent = todayData.VersiculoDia || 'Versículo não encontrado';
                if (devTitleEl) devTitleEl.textContent = todayData.TituloDevocional || 'Mensagem de Hoje';
                if (devTextEl) devTextEl.textContent = todayData.MensagemDevocional || 'Mensagem não encontrada';
                if (devVerseBoxEl) devVerseBoxEl.textContent = todayData.VersiculoDevocional || 'Versículo não encontrado';
                console.log('Conteúdo atualizado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao atualizar conteúdo dinâmico:', error);
            alert('Erro ao carregar mensagens da planilha. Verifique o console (F12).');
        }
    }

    updateDailyContent();

    // --- 1. Módulo de Bíblia de Leitura Fluida ---
    const bibleBooks = {
        "Gênesis": 50, "Êxodo": 40, "Levítico": 27, "Números": 36, "Deuteronômio": 34,
        "Josué": 24, "Juízes": 21, "Rute": 4, "1 Samuel": 31, "2 Samuel": 24,
        "1 Reis": 22, "2 Reis": 25, "1 Crônicas": 29, "2 Crônicas": 36, "Esdras": 10,
        "Neemias": 13, "Ester": 10, "Jó": 42, "Salmos": 150, "Provérbios": 31,
        "Eclesiastes": 12, "Cantares": 8, "Isaías": 66, "Jeremias": 52, "Lamentações": 5,
        "Ezequiel": 48, "Daniel": 12, "Oséias": 14, "Joel": 3, "Amós": 9,
        "Obadias": 1, "Jonas": 4, "Miqueias": 7, "Naum": 3, "Habacuque": 3,
        "Sofonias": 3, "Ageu": 2, "Zacarias": 14, "Malaquias": 4,
        "Mateus": 28, "Marcos": 16, "Lucas": 24, "João": 21, "Atos": 28,
        "Romanos": 16, "1 Coríntios": 16, "2 Coríntios": 13, "Gálatas": 6, "Efésios": 6,
        "Filipenses": 4, "Colossenses": 4, "1 Tessalonicenses": 5, "2 Tessalonicenses": 3,
        "1 Timóteo": 6, "2 Timóteo": 4, "Tito": 3, "Filemon": 1, "Hebreus": 13,
        "Tiago": 5, "1 Pedro": 5, "2 Pedro": 3, "1 João": 5, "2 João": 1,
        "3 João": 1, "Judas": 1, "Apocalipse": 22
    };

    const bookTranslation = {
        "Gênesis": "Genesis", "Êxodo": "Exodus", "Levítico": "Leviticus", "Números": "Numbers", "Deuteronômio": "Deuteronomy",
        "Josué": "Joshua", "Juízes": "Judges", "Rute": "Ruth", "1 Samuel": "1 Samuel", "2 Samuel": "2 Samuel",
        "1 Reis": "1 Kings", "2 Reis": "2 Kings", "1 Crônicas": "1 Chronicles", "2 Crônicas": "2 Chronicles", "Esdras": "Ezra",
        "Neemias": "Nehemiah", "Ester": "Esther", "Jó": "Job", "Salmos": "Psalms", "Provérbios": "Proverbs",
        "Eclesiastes": "Ecclesiastes", "Cantares": "Song of Solomon", "Isaías": "Isaiah", "Jeremias": "Jeremiah", "Lamentações": "Lamentations",
        "Ezequiel": "Ezekiel", "Daniel": "Daniel", "Oséias": "Hosea", "Joel": "Joel", "Amós": "Amos",
        "Obadias": "Obadiah", "Jonas": "Jonah", "Miqueias": "Micah", "Naum": "Nahum", "Habacuque": "Habakkuk",
        "Sofonias": "Zephaniah", "Ageu": "Haggai", "Zacarias": "Zechariah", "Malaquias": "Malachi",
        "Mateus": "Matthew", "Marcos": "Mark", "Lucas": "Luke", "João": "John", "Atos": "Acts",
        "Romanos": "Romans", "1 Coríntios": "1 Corinthians", "2 Coríntios": "2 Corinthians", "Gálatas": "Galatians", "Efésios": "Ephesians",
        "Filipenses": "Philippians", "Colossenses": "Colossians", "1 Tessalonicenses": "1 Thessalonians", "2 Tessalonicenses": "2 Thessalonians",
        "1 Timóteo": "1 Timothy", "2 Timóteo": "2 Timothy", "Tito": "Titus", "Filemon": "Philemon", "Hebreus": "Hebrews",
        "Tiago": "James", "1 Pedro": "1 Peter", "2 Pedro": "2 Peter", "1 João": "1 John", "2 João": "2 John",
        "3 João": "3 John", "Judas": "Jude", "Apocalipse": "Revelation"
    };

    const bookSelect = document.getElementById('bible-book');
    const chapterSelect = document.getElementById('bible-chapter');
    const readBtn = document.getElementById('btn-read');
    const bibleViewport = document.getElementById('bible-viewport');

    Object.keys(bibleBooks).forEach(book => {
        const option = document.createElement('option');
        option.value = book;
        option.textContent = book;
        bookSelect.appendChild(option);
    });

    bookSelect.addEventListener('change', () => {
        const book = bookSelect.value;
        chapterSelect.innerHTML = '<option value="">Selecione</option>';
        if (book) {
            const chapters = bibleBooks[book];
            for (let i = 1; i <= chapters; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                chapterSelect.appendChild(option);
            }
        }
    });

    async function readChapter() {
        const bookPT = bookSelect.value;
        const chapter = chapterSelect.value;

        if (!bookPT || !chapter) {
            bibleViewport.innerHTML = '<p style="color: red; text-align: center;">Por favor, selecione o Livro e o Capítulo.</p>';
            return;
        }

        const bookEN = bookTranslation[bookPT];
        bibleViewport.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Buscando a Palavra em Português...</p></div>';

        try {
            const response = await fetch(`https://bible-api.com/${encodeURIComponent(bookEN + ' ' + chapter)}?translation=almeida`);
            if (!response.ok) throw new Error('Não foi possível carregar este capítulo.');
            const data = await response.json();

            bibleViewport.innerHTML = `
                <h3 style="text-align:center; margin-bottom:30px; color: var(--primary-blue); font-size: 1.8rem;">${bookPT} ${chapter}</h3>
                <div class="bible-text-body">
                    ${data.verses.map(v => `
                        <div class="bible-verse-item">
                            <span class="verse-number">${v.verse}</span>
                            <span class="verse-text">${v.text}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            bibleViewport.innerHTML = `<p style="color: red; text-align: center;">Erro ao carregar versão em Português. Tentando fallback... ${error.message}</p>`;
        }
    }

    readBtn.addEventListener('click', readChapter);

    // --- 2. Módulo de Devocionais e Calendário ---
    const btnCalendar = document.getElementById('btn-calendar');
    const modal = document.getElementById('calendar-modal');
    const closeModal = document.querySelector('.close-modal');
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearText = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date();

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);
        monthYearText.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('calendar-day');
            dayEl.textContent = day;
            dayEl.onclick = () => alert(`Abrindo devocional de ${day}/${month + 1}/${year}...`);
            calendarGrid.appendChild(dayEl);
        }
    }

    btnCalendar.onclick = () => modal.classList.remove('hidden');
    closeModal.onclick = () => modal.classList.add('hidden');
    window.onclick = (e) => { if (e.target == modal) modal.classList.add('hidden'); };
    prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

    renderCalendar();

    // --- 3. Pedidos de Oração ---
    const prayerForm = document.getElementById('prayer-form');
    const prayerFeedback = document.getElementById('prayer-feedback');

    prayerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('p-name').value,
            phone: document.getElementById('p-phone').value,
            location: document.getElementById('p-location').value,
            request: document.getElementById('p-request').value
        };

        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbyYXuztV5G5rXkrdONKiYDeWOhJ6oIUtzrQZOCrCbpR877YuCMKlcK5C1ljQ-L32cG4IQ/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            prayerForm.classList.add('hidden');
            prayerFeedback.classList.remove('hidden');
            setTimeout(() => {
                prayerForm.classList.remove('hidden');
                prayerFeedback.classList.add('hidden');
                prayerForm.reset();
            }, 5000);
        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            alert('Houve um erro ao enviar seu pedido. Por favor, tente novamente.');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });
});
