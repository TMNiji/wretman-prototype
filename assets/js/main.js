/* ============================================================
   WRETMAN ESTATE — main.js
   Prototype statique — refonte wretmanestate.com
   13 comportements (§5 du brief). Tout est défensif :
   chaque init vérifie l'existence des éléments avant de s'exécuter.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const formatPrix = (n) => n.toLocaleString('fr-FR') + ' €';

  const SVG_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10.5"></circle><path d="M7 12.5l3.2 3.2L17 9"></path></svg>';

  /* ============================================================
     DONNÉES CARTES LEAFLET (§5, §6, §8 du brief)
     Biens : cercles APPROXIMATIFS (rayon 800-1500 m), jamais de
     point précis — exigence CDC de confidentialité des adresses.
     ============================================================ */
  const COORDS = {
    cannes: [43.5528, 7.0174],
    nice: [43.7102, 7.262],
    antibes: [43.5808, 7.1251],
    menton: [43.7745, 7.5029],
    vence: [43.722, 7.114],
    valbonne: [43.6419, 7.0089],
    montauroux: [43.6186, 6.7654],
    lorgues: [43.493, 6.3614]
  };

  /* Les deux biens cannois sont légèrement décalés l'un de l'autre
     pour distinguer leurs zones (toujours approximatives). */
  const BIENS = [
    { ref: 'WE-2841', titre: 'Villa contemporaine vue mer panoramique', ville: 'Cannes (Californie)', prix: '4 850 000 €', lat: 43.5536, lng: 7.0322, rayon: 1200 },
    { ref: 'WE-2756', titre: 'Penthouse face à la Croisette', ville: 'Cannes', prix: '3 200 000 €', lat: 43.5528, lng: 7.0174, rayon: 900 },
    { ref: 'WE-2933', titre: 'Mas provençal entièrement rénové', ville: 'Valbonne', prix: '2 450 000 €', lat: 43.6419, lng: 7.0089, rayon: 1500 },
    { ref: 'WE-2812', titre: 'Appartement bourgeois — vieille ville', ville: 'Antibes', prix: '890 000 €', lat: 43.5808, lng: 7.1251, rayon: 800 },
    { ref: 'WE-2901', titre: 'Villa pieds dans l’eau', ville: 'Cap de Nice', prix: '6 900 000 €', lat: 43.7102, lng: 7.262, rayon: 1000 },
    { ref: 'WE-2877', titre: 'Bastide au cœur des vignes', ville: 'Lorgues', prix: '3 750 000 €', lat: 43.493, lng: 6.3614, rayon: 1500 },
    { ref: 'WE-2864', titre: 'Penthouse contemporain sur le port', ville: 'Menton', prix: '1 590 000 €', lat: 43.7745, lng: 7.5029, rayon: 900 },
    { ref: 'WE-2790', titre: 'Villa californienne vue collines', ville: 'Vence', prix: '1 950 000 €', lat: 43.722, lng: 7.114, rayon: 1100 }
  ];

  const AGENCES = [
    { ville: 'Cannes', adresse: '12 rue d’Antibes', coords: COORDS.cannes },
    { ville: 'Nice', adresse: '4 promenade des Anglais', coords: COORDS.nice },
    { ville: 'Antibes', adresse: '8 bd Albert 1er', coords: COORDS.antibes },
    { ville: 'Menton', adresse: '15 av. Félix Faure', coords: COORDS.menton },
    { ville: 'Vence', adresse: '3 place du Grand Jardin', coords: COORDS.vence },
    { ville: 'Valbonne', adresse: '2 rue Alexis Julien', coords: COORDS.valbonne },
    { ville: 'Montauroux', adresse: '1 place du Clos', coords: COORDS.montauroux },
    { ville: 'Lorgues', adresse: '6 cours de la République', coords: COORDS.lorgues }
  ];

  /* ============================================================
     1. HEADER — toggle .is-scrolled au scroll
     ============================================================ */
  function initHeaderScroll() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     2. BURGER MOBILE + accordéons des sous-menus
     ============================================================ */
  function initBurger() {
    const burger = $('.burger');
    const panel = $('.mobile-nav');
    if (!burger || !panel) return;

    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('no-scroll', open);
    };

    burger.addEventListener('click', () => {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    const closeBtn = $('.mobile-nav-close', panel);
    if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

    // Fermer au clic sur un lien interne du panneau
    $$('a', panel).forEach((a) => a.addEventListener('click', () => setOpen(false)));

    // Fermer à ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
    });

    // Accordéons des sous-menus
    $$('.mobile-subtoggle', panel).forEach((btn) => {
      const sub = document.getElementById(btn.getAttribute('aria-controls') || '');
      if (!sub) return;
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        sub.hidden = expanded;
      });
    });
  }

  /* ============================================================
     3. FLÈCHE SCROLL-TO-TOP (visible après 600 px)
     ============================================================ */
  function initScrollTop() {
    const btn = $('.scroll-top');
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     4. CAROUSELS GÉNÉRIQUES [data-carousel]
        scroll-snap horizontal + boutons prev/next
     ============================================================ */
  function initCarousels() {
    $$('[data-carousel]').forEach((carousel) => {
      const track = $('.carousel-track', carousel);
      if (!track) return;
      const prev = $('[data-carousel-prev]', carousel);
      const next = $('[data-carousel-next]', carousel);

      const step = () => Math.max(track.clientWidth * 0.85, 280);
      const nav = $('.carousel-nav', carousel);

      const updateState = () => {
        const maxScroll = track.scrollWidth - track.clientWidth - 2;
        /* Toutes les cartes tiennent dans le conteneur : on masque la nav
           plutôt que d'afficher deux flèches définitivement inertes */
        if (nav) nav.hidden = track.scrollWidth <= track.clientWidth + 4;
        if (prev) prev.toggleAttribute('disabled', track.scrollLeft <= 2);
        if (next) next.toggleAttribute('disabled', track.scrollLeft >= maxScroll);
      };

      if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
      if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

      track.addEventListener('scroll', updateState, { passive: true });
      window.addEventListener('resize', updateState);
      updateState();
    });
  }

  /* ============================================================
     5. TOGGLE "+ DE CRITÈRES" (panneau filtres secondaires)
        Bouton : [data-toggle-criteria] avec aria-controls
     ============================================================ */
  function initCriteriaToggle() {
    $$('[data-toggle-criteria]').forEach((btn) => {
      const panel = document.getElementById(btn.getAttribute('aria-controls') || 'filters-secondary');
      if (!panel) return;
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
        const label = $('[data-criteria-label]', btn);
        if (label) label.textContent = expanded ? '+ de critères' : '− de critères';
      });
    });
  }

  /* ============================================================
     6. DOUBLE SLIDER BUDGET synchronisé avec 2 inputs numériques
        Conteneur : [data-range-slider]
        Ranges    : [data-range-min] / [data-range-max]
        Numériques: [data-input-min] / [data-input-max]
        Remplissage: [data-range-fill]
        + slider simple synchronisé : [data-budget-sync]
     ============================================================ */
  function initRangeSliders() {
    $$('[data-range-slider]').forEach((wrap) => {
      const rMin = $('input[data-range-min]', wrap);
      const rMax = $('input[data-range-max]', wrap);
      const nMin = $('input[data-input-min]', wrap);
      const nMax = $('input[data-input-max]', wrap);
      const fill = $('[data-range-fill]', wrap);
      if (!rMin || !rMax) return;

      const lo = parseInt(rMin.min, 10) || 0;
      const hi = parseInt(rMin.max, 10) || 10000000;
      const gap = parseInt(rMin.step, 10) || 50000;

      const paint = () => {
        if (!fill) return;
        const a = ((parseInt(rMin.value, 10) - lo) / (hi - lo)) * 100;
        const b = ((parseInt(rMax.value, 10) - lo) / (hi - lo)) * 100;
        fill.style.left = a + '%';
        fill.style.width = Math.max(b - a, 0) + '%';
      };

      const syncFromRanges = () => {
        let vMin = parseInt(rMin.value, 10);
        let vMax = parseInt(rMax.value, 10);
        if (vMin > vMax - gap) {
          vMin = Math.min(vMin, vMax - gap);
          rMin.value = vMin;
        }
        if (vMax < vMin + gap) {
          vMax = Math.max(vMax, vMin + gap);
          rMax.value = vMax;
        }
        if (nMin) nMin.value = rMin.value;
        if (nMax) nMax.value = rMax.value;
        paint();
      };

      const syncFromNumbers = () => {
        if (nMin && nMin.value !== '') {
          rMin.value = Math.min(Math.max(parseInt(nMin.value, 10) || lo, lo), hi);
        }
        if (nMax && nMax.value !== '') {
          rMax.value = Math.min(Math.max(parseInt(nMax.value, 10) || hi, lo), hi);
        }
        syncFromRanges();
      };

      rMin.addEventListener('input', syncFromRanges);
      rMax.addEventListener('input', syncFromRanges);
      if (nMin) nMin.addEventListener('change', syncFromNumbers);
      if (nMax) nMax.addEventListener('change', syncFromNumbers);
      syncFromRanges();
    });

    /* Slider simple : un range + un input numérique, deux sens */
    $$('[data-budget-sync]').forEach((wrap) => {
      const range = $('input[type="range"]', wrap);
      const num = $('input[type="number"]', wrap);
      if (!range || !num) return;
      range.addEventListener('input', () => { num.value = range.value; });
      num.addEventListener('change', () => {
        const lo = parseInt(range.min, 10) || 0;
        const hi = parseInt(range.max, 10) || 10000000;
        range.value = Math.min(Math.max(parseInt(num.value, 10) || lo, lo), hi);
      });
    });
  }

  /* ============================================================
     7. FILTRAGE CLIENT DES BIENS (page acheter.html)
        Cartes : .prop-card[data-ville][data-type][data-prix]
        dans [data-filter-grid]. Déclenché par RECHERCHER
        (submit de [data-filter-form]) ou par les paramètres
        d'URL ?lieu=&type=&budget= envoyés par le hero de index.html.
        Compteur : [data-results-count].
        NB : seuls Lieu / Type / Budget filtrent réellement (brief §5.7) ;
        les critères secondaires sont visuels dans le prototype.
     ============================================================ */
  function getFilterValues() {
    const lieu = $('#filter-lieu');
    const type = $('#filter-type');
    const budget = $('#filter-budget');
    const panel = $('#filters-secondary');
    const panelOpen = panel && !panel.hidden;
    const nMin = panel ? $('input[data-input-min]', panel) : null;
    const nMax = panel ? $('input[data-input-max]', panel) : null;

    /* Budget : le max retenu est le plus restrictif entre la barre
       principale et le panneau secondaire (s'il est ouvert). */
    let min = 0;
    let max = Infinity;
    if (budget && budget.value !== '') {
      max = Math.min(max, parseInt(budget.value, 10) || Infinity);
    }
    if (panelOpen && nMin && nMin.value !== '') min = parseInt(nMin.value, 10) || 0;
    if (panelOpen && nMax && nMax.value !== '') {
      max = Math.min(max, parseInt(nMax.value, 10) || Infinity);
    }

    return {
      ville: lieu ? lieu.value : '',
      villeLabel: lieu && lieu.selectedIndex > -1 ? lieu.options[lieu.selectedIndex].text : '',
      type: type ? type.value : '',
      typeLabel: type && type.selectedIndex > -1 ? type.options[type.selectedIndex].text : '',
      min: min,
      max: max
    };
  }

  function applyPropertyFilter() {
    const grid = $('[data-filter-grid]');
    if (!grid) return;
    const cards = $$('.prop-card[data-prix]', grid);
    const counter = $('[data-results-count]');
    const f = getFilterValues();
    let n = 0;

    cards.forEach((card) => {
      const prix = parseInt(card.dataset.prix, 10) || 0;
      let ok = true;
      if (f.ville && card.dataset.ville !== f.ville) ok = false;
      if (f.type && card.dataset.type !== f.type) ok = false;
      if (prix < f.min || prix > f.max) ok = false;
      card.hidden = !ok;
      if (ok) n += 1;
    });

    if (counter) {
      counter.textContent =
        n === 0
          ? 'Aucun bien ne correspond à vos critères'
          : n + ' bien' + (n > 1 ? 's' : '');
    }
  }

  function initPropertyFilter() {
    const grid = $('[data-filter-grid]');
    if (!grid) return;

    const form = $('[data-filter-form]');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        applyPropertyFilter();
      });
    }

    /* Pré-remplissage depuis la recherche du hero (index.html) :
       acheter.html?lieu=&type=&budget= via GET. */
    const params = new URLSearchParams(location.search);
    let hasParam = false;

    const lieu = $('#filter-lieu');
    if (lieu && params.has('lieu') && params.get('lieu') !== '') {
      lieu.value = params.get('lieu');
      hasParam = true;
    }

    const type = $('#filter-type');
    if (type && params.has('type') && params.get('type') !== '') {
      type.value = params.get('type');
      hasParam = true;
    }

    const budget = $('#filter-budget');
    if (budget && params.has('budget') && params.get('budget') !== '') {
      budget.value = params.get('budget');
      /* Synchronise la barre de budget (handler posé en section 6). */
      budget.dispatchEvent(new Event('change'));
      hasParam = true;
    }

    if (hasParam) applyPropertyFilter();
  }

  /* ============================================================
     7 bis. FILTRES CATÉGORIES MAGAZINE (boutons .cat-filters)
        Boutons : [data-cat-filter="categorie|all"]
        Cartes  : [data-categorie] dans [data-cat-grid]
     ============================================================ */
  function initCategoryFilter() {
    const grid = $('[data-cat-grid]');
    const btns = $$('[data-cat-filter]');
    if (!grid || !btns.length) return;
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.catFilter;
        btns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        $$('[data-categorie]', grid).forEach((card) => {
          card.hidden = cat !== 'all' && card.dataset.categorie !== cat;
        });
      });
    });
  }

  /* ============================================================
     8. TOGGLE VUE LISTE / VUE CARTE (page acheter.html)
        Boutons : [data-view-btn="liste|carte"]
        Panneaux: [data-view-panel="liste|carte"]
     ============================================================ */
  function initViewToggle() {
    const btns = $$('[data-view-btn]');
    const panels = $$('[data-view-panel]');
    if (!btns.length || !panels.length) return;

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.viewBtn;
        btns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        panels.forEach((p) => { p.hidden = p.dataset.viewPanel !== target; });
        // Leaflet a besoin d'un recalcul quand son conteneur devient visible
        if (target === 'carte' && window._wretmanMaps && window._wretmanMaps.acheter) {
          window.setTimeout(() => {
            const map = window._wretmanMaps.acheter;
            map.invalidateSize();
            if (map._wretmanBounds) map.fitBounds(map._wretmanBounds, { padding: [30, 30] });
          }, 220);
        }
      });
    });
  }

  /* ============================================================
     9. ACCORDÉON FAQ
        .faq-item > button.faq-question[aria-expanded][aria-controls]
                  + .faq-answer[hidden]
     ============================================================ */
  function initFaq() {
    $$('.faq-question').forEach((btn) => {
      const answer = document.getElementById(btn.getAttribute('aria-controls') || '');
      if (!answer) return;
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        answer.hidden = expanded;
      });
    });
  }

  /* ============================================================
     10. MODALS (alerte recherche, brochure)
         Déclencheur : [data-modal-open="id-du-modal"]
         Fermeture   : [data-modal-close], ESC, clic overlay
     ============================================================ */
  let lastFocusedElement = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    window.requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.classList.add('no-scroll');

    // Modal alerte : récapitulatif des critères en cours si présents
    if (modal.id === 'modal-alerte') {
      const recap = $('[data-alert-recap]', modal);
      if (recap) {
        const f = getFilterValues();
        const parts = [];
        parts.push(f.ville ? 'Lieu : ' + f.villeLabel : 'Lieu : toutes les villes');
        parts.push(f.type ? 'Type : ' + f.typeLabel : 'Type : tous les biens');
        parts.push(
          f.max !== Infinity ? 'Budget max : ' + formatPrix(f.max) : 'Budget : sans limite'
        );
        recap.textContent = 'Vos critères — ' + parts.join(' · ');
      }
    }

    const focusable = $(
      '.modal-close, button, [href], input, select, textarea',
      modal
    );
    if (focusable) focusable.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    window.setTimeout(() => { modal.hidden = true; }, 220);
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function initModals() {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-modal-open]');
      if (opener) {
        const modal = document.getElementById(opener.dataset.modalOpen);
        if (modal) {
          e.preventDefault();
          openModal(modal);
          return;
        }
      }
      const closer = e.target.closest('[data-modal-close]');
      if (closer) {
        const modal = closer.closest('.modal');
        if (modal) closeModal(modal);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const open = $('.modal.is-open');
        if (open) closeModal(open);
      }
    });
  }

  /* ============================================================
     11. GALERIE FICHE BIEN — clic vignette → swap image principale
         Conteneur : [data-gallery]
         Principale: img[data-gallery-main]
         Vignettes : button[data-gallery-thumb][data-full="url"]
     ============================================================ */
  function initGallery() {
    $$('[data-gallery]').forEach((gallery) => {
      const main = $('img[data-gallery-main]', gallery);
      const thumbs = $$('[data-gallery-thumb]', gallery);
      if (!main || !thumbs.length) return;

      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const full = thumb.dataset.full;
          const img = $('img', thumb);
          if (full) main.src = full;
          if (img && img.alt) main.alt = img.alt;
          thumbs.forEach((t) => {
            t.classList.toggle('is-active', t === thumb);
            t.setAttribute('aria-pressed', String(t === thumb));
          });
        });
      });
    });
  }

  /* ============================================================
     12. FORMULAIRES FACTICES — form[data-fake-submit]
         preventDefault + remplacement par un message de succès.
         Message personnalisable via data-success-message.
     ============================================================ */
  function initFakeForms() {
    $$('form[data-fake-submit]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg =
          form.dataset.successMessage ||
          'Merci ! Votre demande a bien été envoyée. Un conseiller Wretman Estate vous recontactera très rapidement.';
        const success = document.createElement('div');
        success.className = 'form-success';
        success.setAttribute('role', 'status');
        success.setAttribute('tabindex', '-1');
        success.innerHTML = SVG_CHECK + '<p>' + msg + '</p>';
        form.replaceWith(success);
        success.focus();
      });
    });
  }

  /* ============================================================
     13. CARTES LEAFLET — init UNIQUEMENT si l'élément existe
         #map-acheter : cercles approximatifs autour des biens
         #map-agences : 8 marqueurs agences
     ============================================================ */
  function initMaps() {
    if (typeof window.L === 'undefined') return; // Leaflet non chargé sur cette page
    const L = window.L;
    window._wretmanMaps = window._wretmanMaps || {};

    /* Vue de secours centrée Côte d'Azur : fitBounds échoue si le
       conteneur est masqué (ex. page acheter ouverte en vue liste),
       d'où le setView préalable + fitBounds protégé. Les bounds sont
       mémorisés pour être réappliqués à l'affichage de la vue carte. */
    const FALLBACK_VIEW = { center: [43.62, 6.95], zoom: 9 };

    const mapAcheter = document.getElementById('map-acheter');
    if (mapAcheter && !window._wretmanMaps.acheter) {
      const map = L.map(mapAcheter, { scrollWheelZoom: false })
        .setView(FALLBACK_VIEW.center, FALLBACK_VIEW.zoom);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; les contributeurs <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(map);

      const shapes = [];
      BIENS.forEach((b) => {
        const circle = L.circle([b.lat, b.lng], {
          radius: b.rayon,
          color: '#7A1523',
          weight: 1,
          fillColor: '#7A1523',
          fillOpacity: 0.25
        }).addTo(map);
        circle.bindPopup(
          '<strong>' + b.titre + '</strong><br>' +
          b.ville + ' — ' + b.prix + '<br>' +
          '<a href="bien.html">Voir le bien</a>'
        );
        shapes.push(circle);
      });
      map._wretmanBounds = L.featureGroup(shapes).getBounds().pad(0.2);
      try { map.fitBounds(map._wretmanBounds); } catch (err) { /* conteneur masqué */ }
      window._wretmanMaps.acheter = map;
    }

    const mapAgences = document.getElementById('map-agences');
    if (mapAgences && !window._wretmanMaps.agences) {
      const map = L.map(mapAgences, { scrollWheelZoom: false })
        .setView(FALLBACK_VIEW.center, FALLBACK_VIEW.zoom);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; les contributeurs <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(map);

      const markers = [];
      AGENCES.forEach((a) => {
        const marker = L.marker(a.coords, {
          title: 'Wretman Estate — ' + a.ville,
          alt: 'Agence Wretman Estate de ' + a.ville
        }).addTo(map);
        marker.bindPopup(
          '<strong>Wretman Estate — ' + a.ville + '</strong><br>' +
          a.adresse + '<br>' +
          '<a href="tel:+33493000000">+33 4 93 00 00 00</a>'
        );
        markers.push(marker);
      });
      map._wretmanBounds = L.featureGroup(markers).getBounds().pad(0.2);
      try { map.fitBounds(map._wretmanBounds); } catch (err) { /* conteneur masqué */ }
      window._wretmanMaps.agences = map;
    }
  }

  /* ============================================================
     14. PRÉLOADER + TRANSITION DE PAGE
         Voile injecté en JS (présent sur toutes les pages).
         Chargement : couvre puis se retire. Navigation interne :
         redescend pour couvrir, puis navigue. Respecte reduced-motion.
     ============================================================ */
  function initPageTransitions() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let veil = $('.page-veil');
    if (!veil) {
      veil = document.createElement('div');
      veil.className = 'page-veil';
      veil.setAttribute('aria-hidden', 'true');
      veil.innerHTML =
        '<span class="logo"><span class="logo-name">Wretman</span><span class="logo-estate">Estate</span></span>';
      document.body.insertBefore(veil, document.body.firstChild);
    }

    const reveal = () => veil.classList.add('page-veil--hidden');
    const now = () => (window.performance && performance.now ? performance.now() : Date.now());

    if (reduce) {
      reveal();
    } else {
      const t0 = now();
      const minShow = 650; // laisse respirer le logo
      const doReveal = () => window.setTimeout(reveal, Math.max(0, minShow - (now() - t0)));
      if (document.readyState === 'complete') doReveal();
      else window.addEventListener('load', doReveal, { once: true });
      window.setTimeout(reveal, 3200); // filet de sécurité
    }

    // Retour navigateur (bfcache) : ne pas rester couvert
    window.addEventListener('pageshow', (e) => { if (e.persisted) veil.classList.add('page-veil--hidden'); });

    /* Pageswitcher retiré : plus d'interception des liens ni de voile à la navigation.
       Seul le préchargeur (voile au chargement, puis retrait) est conservé. */
  }

  /* ============================================================
     INIT GLOBALE
     ============================================================ */
  function init() {
    initPageTransitions(); // 14 — voile en premier
    initHeaderScroll();    // 1
    initBurger();          // 2
    initScrollTop();       // 3
    initCarousels();       // 4
    initCriteriaToggle();  // 5
    initRangeSliders();    // 6
    initPropertyFilter();  // 7
    initCategoryFilter();  // 7 bis (magazine)
    initViewToggle();      // 8
    initFaq();             // 9
    initModals();          // 10
    initGallery();         // 11
    initFakeForms();       // 12
    initMaps();            // 13
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
