// =============================================
// LV3 – Zadatak 3.1 + 3.2 + 3.3
// =============================================

let sviFilmovi = [];
let kosarica   = [];

document.addEventListener('DOMContentLoaded', () => {
  ucitajFilmove();
  postaviFiltere();
  postaviKosaricu();
});


// 3.1 – Dohvat i parsiranje CSV-a

function ucitajFilmove() {
  fetch('movies.csv')
    .then(res => res.text())
    .then(csv => {
      const rezultat = Papa.parse(csv, { header: true, skipEmptyLines: true });

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
      console.error('Greška:', err);
      const tbody = document.querySelector('#filmovi-tablica tbody');
      if (tbody) tbody.innerHTML =
        '<tr><td colspan="9" class="loading-cell" style="color:red;">❌ Greška pri učitavanju.</td></tr>';
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
    tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">Nema filmova za odabrane filtre.</td></tr>';
    return;
  }

  filmovi.forEach((film, index) => {
    const row = document.createElement('tr');

    // Provjeri je li film već u košarici
    const uKorarici = kosarica.some(k => k.naslov === film.naslov);

    row.innerHTML = `
      <td class="redni-broj">${index + 1}</td>
      <td class="naslov-cell">${film.naslov}</td>
      <td>${film.zanr}</td>
      <td>${film.godina}</td>
      <td>${film.trajanje} min</td>
      <td>${film.reziser}</td>
      <td>${film.zemlja}</td>
      <td style="color:#2980b9; font-weight:bold;">⭐ ${film.ocjena.toFixed(1)}</td>
      <td>
        <button class="btn-dodaj ${uKorarici ? 'btn-dodaj--aktivan' : ''}"
                onclick="dodajUKosaricu(${index}, this)"
                ${uKorarici ? 'disabled' : ''}>
          ${uKorarici ? '✓ Dodano' : '+ Košarica'}
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// --------------------------------------------------
// 3.2 – Filteri
// --------------------------------------------------
function postaviFiltere() {
  const slider    = document.getElementById('filter-ocjena');
  const sliderVal = document.getElementById('ocjena-vrijednost');

  if (slider && sliderVal) {
    slider.addEventListener('input', () => {
      sliderVal.textContent = Number(slider.value).toFixed(1);
    });
  }

  document.getElementById('btn-filtriraj')?.addEventListener('click', filtriraj);

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    document.getElementById('filter-naslov').value = '';
    slider.value = 8.5;
    sliderVal.textContent = '8.5';
    document.querySelector('input[name="filter-zemlja"][value=""]').checked = true;
    prikaziTablicu(sviFilmovi);
    const info = document.getElementById('film-count-info');
    if (info) info.textContent = `Ukupno filmova: ${sviFilmovi.length}`;
  });
}

function filtriraj() {
  const naslov = document.getElementById('filter-naslov').value.trim().toLowerCase();
  const ocjena = parseFloat(document.getElementById('filter-ocjena').value);
  const zemlja = document.querySelector('input[name="filter-zemlja"]:checked')?.value || '';

  const filtrirani = sviFilmovi.filter(film => {
    const naslovMatch = !naslov || film.naslov.toLowerCase().includes(naslov);
    const ocjenaMatch = film.ocjena >= ocjena;
    const zemljaMatch = !zemlja || film.zemlja.includes(zemlja);
    return naslovMatch && ocjenaMatch && zemljaMatch;
  });

  prikaziTablicu(filtrirani);

  const info = document.getElementById('film-count-info');
  if (info) info.textContent = `Pronađeno: ${filtrirani.length} od ${sviFilmovi.length} filmova`;
}

// --------------------------------------------------
// 3.3 – Košarica
// --------------------------------------------------
function postaviKosaricu() {
  // Otvori modal
  document.getElementById('btn-otvori-kosaricu')?.addEventListener('click', () => {
    osvjeziModalKosaricu();
    document.getElementById('modal-kosarica').classList.add('modal--otvoren');
  });

 
  document.getElementById('btn-zatvori-modal')?.addEventListener('click', zatvoriModal);

  document.getElementById('modal-kosarica')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-kosarica') zatvoriModal();
  });

}

function zatvoriModal() {
  document.getElementById('modal-kosarica').classList.remove('modal--otvoren');
}

function dodajUKosaricu(index, gumb) {
  
  const tbodyRedovi = document.querySelectorAll('#filmovi-tablica tbody tr');
  const redak = gumb.closest('tr');
  const naslov = redak.querySelector('.naslov-cell').textContent;

  const film = sviFilmovi.find(f => f.naslov === naslov);
  if (!film) return;

  // Sprječava duplikate
  if (kosarica.some(k => k.naslov === film.naslov)) return;

  kosarica.push(film);

  // Ažuriraj gumb u tablici
  gumb.textContent = '✓ Dodano';
  gumb.disabled = true;
  gumb.classList.add('btn-dodaj--aktivan');

  // Ažuriraj badge na gumbu košarice
  osvjeziBadge();
}

function ukloniIzKosarice(naslov) {
  kosarica = kosarica.filter(f => f.naslov !== naslov);
  osvjeziModalKosaricu();
  osvjeziBadge();

  // Vrati gumb u tablici na "dodaj"
  const tbodyCells = document.querySelectorAll('#filmovi-tablica tbody .naslov-cell');
  tbodyCells.forEach(cell => {
    if (cell.textContent === naslov) {
      const gumb = cell.closest('tr').querySelector('.btn-dodaj');
      if (gumb) {
        gumb.textContent = '+ Košarica';
        gumb.disabled = false;
        gumb.classList.remove('btn-dodaj--aktivan');
      }
    }
  });
}

function osvjeziBadge() {
  const badge = document.getElementById('kosarica-badge');
  if (badge) {
    badge.textContent = kosarica.length;
    badge.style.display = kosarica.length > 0 ? 'inline-block' : 'none';
  }
}

function osvjeziModalKosaricu() {
  const lista  = document.getElementById('kosarica-lista');
  const prazan = document.getElementById('kosarica-prazan');
  const footer = document.getElementById('kosarica-footer');

  if (!lista) return;

  lista.innerHTML = '';

  if (kosarica.length === 0) {
    prazan.style.display = 'block';
    footer.style.display = 'none';
    return;
  }

  prazan.style.display = 'none';
  footer.style.display = 'block';

  kosarica.forEach(film => {
    const li = document.createElement('li');
    li.className = 'kosarica-item';
    li.innerHTML = `
      <div class="kosarica-item-info">
        <span class="kosarica-item-naslov">${film.naslov}</span>
        <span class="kosarica-item-detalji">${film.zanr} · ${film.godina} · ⭐ ${film.ocjena.toFixed(1)}</span>
      </div>
      <button class="btn-ukloni" onclick="ukloniIzKosarice('${film.naslov.replace(/'/g, "\\'")}')">✕</button>
    `;
    lista.appendChild(li);
  });
}

function potvrdiPosudbu() {
  if (kosarica.length === 0) return;

  const broj = kosarica.length;

  // Poruka potvrde unutar modala
  const sadrzaj = document.getElementById('modal-sadrzaj');
  sadrzaj.innerHTML = `
    <div class="potvrda-poruka">
      <div class="potvrda-ikona">🎬</div>
      <h3>Uspješno!</h3>
      <p>Odabrali ste <strong>${broj} ${broj === 1 ? 'film' : 'filma'}</strong> za vikend maraton!</p>
      <button class="btn-filtriraj" style="margin-top:16px;" onclick="zatvoriIResetiraj()">Zatvori</button>
    </div>
  `;

  // Resetiraj košaricu
  kosarica = [];
  osvjeziBadge();

  // Vrati sve gumbe u tablici
  document.querySelectorAll('.btn-dodaj--aktivan').forEach(gumb => {
    gumb.textContent = '+ Košarica';
    gumb.disabled = false;
    gumb.classList.remove('btn-dodaj--aktivan');
  });
}

function zatvoriIResetiraj() {
  zatvoriModal();
 
  setTimeout(() => {
    const sadrzaj = document.getElementById('modal-sadrzaj');
    sadrzaj.innerHTML = `
      <p id="kosarica-prazan" style="color:#888; text-align:center; padding: 20px 0;">
        Košarica je prazna. Dodajte filmove iz tablice.
      </p>
      <ul id="kosarica-lista"></ul>
      <div id="kosarica-footer">
        <button class="btn-filtriraj" id="btn-potvrdi">🎬 Potvrdi posudbu</button>
      </div>
    `;
    document.getElementById('btn-potvrdi')?.addEventListener('click', potvrdiPosudbu);
  }, 300);
}