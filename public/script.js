// =============================================
// LV3 – Zadatak 3.1 + 3.2
// =============================================

let sviFilmovi = [];

document.addEventListener('DOMContentLoaded', () => {
  ucitajFilmove();
  postaviFiltere();
});

// --------------------------------------------------
// 3.1 – Dohvat i parsiranje CSV-a
// --------------------------------------------------
function ucitajFilmove() {
  fetch('movies.csv')
    .then(res => res.text())
    .then(csv => {
      const rezultat = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
      });

      sviFilmovi = rezultat.data.map(film => ({
        naslov:   film.Naslov,
        zanr:     film.Zanr,
        godina:   Number(film.Godina),
        trajanje: Number(film.Trajanje_min),
        ocjena:   Number(film.Ocjena),
        reziser:  film.Reziser,
        zemlja:   film.Zemlja_porijekla
      }));

      prikaziTablicu(sviFilmovi);

      const info = document.getElementById('film-count-info');
      if (info) info.textContent = `Ukupno filmova: ${sviFilmovi.length}`;
    })
    .catch(err => {
      console.error('Greška pri dohvaćanju CSV-a:', err);
      const tbody = document.querySelector('#filmovi-tablica tbody');
      if (tbody) tbody.innerHTML =
        '<tr><td colspan="8" class="loading-cell" style="color:red;">❌ Greška pri učitavanju.</td></tr>';
    });
}

// --------------------------------------------------
// 3.1 – Prikaz filmova u tablici
// --------------------------------------------------
function prikaziTablicu(filmovi) {
  const tbody = document.querySelector('#filmovi-tablica tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (filmovi.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">Nema filmova za odabrane filtre.</td></tr>';
    return;
  }

  filmovi.forEach((film, index) => {
    const row = document.createElement('tr');
    const ocjenaKlasa = film.ocjena >= 9   ? 'ocjena-visoka'
                      : film.ocjena >= 8.5 ? 'ocjena-srednja'
                      : 'ocjena-niska';

    row.innerHTML = `
      <td class="redni-broj">${index + 1}</td>
      <td class="naslov-cell">${film.naslov}</td>
      <td>${film.zanr}</td>
      <td>${film.godina}</td>
      <td>${film.trajanje} min</td>
      <td>${film.reziser}</td>
      <td>${film.zemlja}</td>
      <td class="${ocjenaKlasa}">⭐ ${film.ocjena.toFixed(1)}</td>
    `;

    tbody.appendChild(row);
  });
}

// --------------------------------------------------
// 3.2 – Postavljanje event listenera na filtere
// --------------------------------------------------
function postaviFiltere() {
  // Slider – dinamički prikaz vrijednosti pored slidera
  const slider = document.getElementById('filter-ocjena');
  const sliderVal = document.getElementById('ocjena-vrijednost');
  if (slider && sliderVal) {
    slider.addEventListener('input', () => {
      sliderVal.textContent = Number(slider.value).toFixed(1);
    });
  }

  // Gumb "Filtriraj" – pokreće filtriranje
  const btn = document.getElementById('btn-filtriraj');
  if (btn) btn.addEventListener('click', filtriraj);

  // Gumb "Resetiraj" – vraća sve na početak
  const reset = document.getElementById('btn-reset');
  if (reset) {
    reset.addEventListener('click', () => {
      document.getElementById('filter-naslov').value = '';
      document.getElementById('filter-ocjena').value = 8.5;
      sliderVal.textContent = '8.5';
      document.querySelector('input[name="filter-zemlja"][value=""]').checked = true;
      prikaziTablicu(sviFilmovi);
      const info = document.getElementById('film-count-info');
      if (info) info.textContent = `Ukupno filmova: ${sviFilmovi.length}`;
    });
  }
}

// --------------------------------------------------
// 3.2 – Logika filtriranja
// --------------------------------------------------
function filtriraj() {
  // 1. Dohvati vrijednosti iz sva tri filtera
  const naslov  = document.getElementById('filter-naslov').value.trim().toLowerCase();
  const ocjena  = parseFloat(document.getElementById('filter-ocjena').value);
  const zemlja  = document.querySelector('input[name="filter-zemlja"]:checked')?.value || '';

  // 2. filter() prolazi kroz sviFilmovi i vraća samo one koji prolaze SVE uvjete
  const filtrirani = sviFilmovi.filter(film => {

    // Ako je polje prazno (!naslov) → uvjet se preskače (propušta sve)
    const naslovMatch  = !naslov || film.naslov.toLowerCase().includes(naslov);

    // Ocjena mora biti >= odabrane vrijednosti na slideru
    const ocjenaMatch  = film.ocjena >= ocjena;

    // Ako nije odabrana zemlja ('') → propusti sve; inače provjeri sadrži li
    const zemljaMatch  = !zemlja || film.zemlja.includes(zemlja);

    return naslovMatch && ocjenaMatch && zemljaMatch;
  });

  // 3. Prikaži filtrirane rezultate
  prikaziTablicu(filtrirani);

  // 4. Ažuriraj info tekst
  const info = document.getElementById('film-count-info');
  if (info) info.textContent = `Pronađeno: ${filtrirani.length} od ${sviFilmovi.length} filmova`;
}