// =============================================
// LV3 – Zadatak 3.1: Dohvat i prikaz podataka
// =============================================

// Globalna varijabla – dostupna svim funkcijama (treba za filtriranje u 3.2)
let sviFilmovi = [];

// Čekamo da se DOM učita pa tek onda dohvaćamo CSV
document.addEventListener('DOMContentLoaded', () => {
  ucitajFilmove();
});

// --------------------------------------------------
// 1. Dohvat CSV-a s poslužitelja i parsiranje
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
        naslov:  film.Naslov,
        zanr:    film.Zanr,
        godina:  Number(film.Godina),
        trajanje: Number(film.Trajanje_min),
        ocjena:  Number(film.Ocjena),
        reziser: film.Reziser,
        zemlja:  film.Zemlja_porijekla
      }));

    
      prikaziTablicu(sviFilmovi);

      // Info tekst s brojem filmova
      const info = document.getElementById('film-count-info');
      if (info) info.textContent = `Ukupno filmova: ${sviFilmovi.length}`;
    })
    .catch(err => {
      console.error('Greška pri dohvaćanju CSV-a:', err);
      const tbody = document.querySelector('#filmovi-tablica tbody');
      if (tbody) tbody.innerHTML =
        '<tr><td colspan="8" class="loading-cell" style="color:red;">❌ Greška pri učitavanju podataka.</td></tr>';
    });
}


function prikaziTablicu(filmovi) {
  const tbody = document.querySelector('#filmovi-tablica tbody');
  if (!tbody) return;

  tbody.innerHTML = ''; 

  if (filmovi.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">Nema filmova za prikaz.</td></tr>';
    return;
  }

  filmovi.forEach((film, index) => {
    const row = document.createElement('tr');

    // CSS klasa za boju ocjene
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