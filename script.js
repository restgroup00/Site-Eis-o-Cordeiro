const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTH5882wd96tuXd-Qyr3SMisMNxSNK0QDtq4xS64cC5l9GRclyjpxcJKBWI4cVwPc_I9-Fs  HYn90mrt/pub?output=csv';

  async function load() {
      try {
          const res = await fetch(SHEET_URL);
          const text = await res.text();
          console.log("CONECTADO!");
          alert("Conectado com sucesso à planilha!");
      } catch (e) {
          console.error("Erro:", e);
      }
  }

  window.onload = load;
