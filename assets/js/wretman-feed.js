/* ============================================================
   WRETMAN ESTATE — wretman-feed.js
   Récupère les VRAIES annonces depuis l'API WordPress du site
   officiel (wp-json), et injecte photos / titres / lieux dans les
   cartes de biens et la fiche bien. Amélioration progressive :
   en cas d'échec (hors-ligne, API indispo), les visuels du
   prototype restent affichés. Aucune clé requise (CORS ouvert en GET).
   NB : en production, cette source sera le flux Apimo via le thème WP.
   ============================================================ */
(function () {
  'use strict';
  var API = 'https://www.wretmanestate.com/wp-json/wp/v2';
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function decode(html) {
    var t = document.createElement('textarea'); t.innerHTML = html || ''; return t.value;
  }
  function feat(p) {
    try { return p._embedded['wp:featuredmedia'][0].source_url || ''; } catch (e) { return ''; }
  }
  function term(p, tax) {
    var groups = (p._embedded && p._embedded['wp:term']) || [];
    for (var i = 0; i < groups.length; i++) {
      for (var j = 0; j < groups[i].length; j++) {
        if (groups[i][j].taxonomy === tax) return decode(groups[i][j].name);
      }
    }
    return '';
  }
  function place(p) { return term(p, 'ville') || term(p, 'secteur'); }
  function title(p) { return decode((p.title && p.title.rendered) || ''); }
  function surface(p) {
    var txt = ((p.content && p.content.rendered) || '').replace(/<[^>]+>/g, ' ');
    var m = txt.match(/(\d[\d.  ,]*)\s?m[²2]/i);
    return m ? m[1].replace(/[  ]/g, '').replace(',', '.') + ' m²' : '';
  }
  function specsHTML(p) {
    var parts = [term(p, 'chambres-test'), surface(p), term(p, 'type')].filter(Boolean);
    return parts.map(function (x) { return '<span>' + x + '</span>'; }).join('');
  }

  function fillCardLike(el, p) {
    if (!p) return;
    var im = el.querySelector('img');
    if (im) { im.removeAttribute('srcset'); im.src = feat(p); im.alt = title(p); }
    var v = el.querySelector('.prop-card-ville, .exclu-ville'); if (v) v.textContent = place(p);
    var t = el.querySelector('.prop-card-title, h3'); if (t) t.textContent = title(p);
    var pr = el.querySelector('.prop-card-prix, .exclu-prix'); if (pr) pr.textContent = 'Prix sur demande';
    var sp = el.querySelector('.prop-card-specs, .exclu-specs'); if (sp) sp.innerHTML = specsHTML(p);
    if (el.tagName === 'A') el.setAttribute('href', 'bien.html?id=' + p.id);
  }

  var _cache = null;
  function listings() {
    if (_cache) return Promise.resolve(_cache);
    return fetch(API + '/estate?per_page=24&_embed=1')
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (arr) { _cache = (arr || []).filter(feat); return _cache; });
  }

  /* Cartes de biens (carrousels / grilles) + bloc exclusivités */
  function fillCards(list) {
    $$('[data-wretman-cards]').forEach(function (cont) {
      var off = parseInt(cont.getAttribute('data-wretman-offset') || '0', 10);
      $$('.prop-card', cont).forEach(function (card, i) {
        fillCardLike(card, list[(off + i) % list.length]);
      });
    });
    var lead = document.querySelector('[data-wretman-lead]');
    if (lead) fillCardLike(lead, list[0]);
    $$('[data-wretman-mini]').forEach(function (el, i) { fillCardLike(el, list[i + 1]); });
  }

  /* Fiche bien : galerie réelle (photo à la une + médias attachés) + en-tête */
  function fillDetail(list) {
    var root = document.querySelector('[data-wretman-detail]');
    if (!root) return;
    var id = new URLSearchParams(location.search).get('id');
    var getProp = id
      ? fetch(API + '/estate/' + id + '?_embed=1').then(function (r) { return r.json(); })
      : Promise.resolve(list[0]);

    getProp.then(function (p) {
      if (!p || !p.id) return;
      var media = fetch(API + '/media?parent=' + p.id + '&per_page=8')
        .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
      return media.then(function (m) {
        var urls = [];
        var f = feat(p); if (f) urls.push(f);
        (m || []).forEach(function (x) { if (x.source_url && urls.indexOf(x.source_url) < 0) urls.push(x.source_url); });
        if (!urls.length) return;

        var main = root.querySelector('[data-gallery-main]');
        if (main) { main.removeAttribute('srcset'); main.src = urls[0]; main.alt = title(p); }
        $$('[data-gallery-thumb]', root).forEach(function (thumb, i) {
          var u = urls[(i + 1) % urls.length] || urls[0];
          thumb.setAttribute('data-full', u);
          var ti = thumb.querySelector('img'); if (ti) { ti.removeAttribute('srcset'); ti.src = u; }
        });

        var h1 = root.querySelector('.bien-head h1'); if (h1) h1.textContent = title(p);
        var lieu = root.querySelector('.bien-lieu');
        if (lieu) lieu.textContent = [place(p), term(p, 'type')].filter(Boolean).join(' — ');
        var prix = root.querySelector('.bien-prix'); if (prix) prix.textContent = 'Prix sur demande';
        var ref = root.querySelector('.bien-ref'); if (ref) ref.textContent = 'Réf. WE-' + p.id + ' · Honoraires à la charge du vendeur';
        var crumb = root.querySelector('.breadcrumbs [aria-current="page"]'); if (crumb) crumb.textContent = place(p);

        var specVals = [term(p, 'chambres-test'), surface(p), term(p, 'type')].filter(Boolean);
        var items = $$('.spec-row .spec-item', root);
        items.forEach(function (li, i) {
          if (i < specVals.length) { var s = li.querySelector('span'); if (s) s.textContent = specVals[i]; }
          else { li.hidden = true; }
        });

        var desc = root.querySelector('[data-wretman-desc]');
        if (desc) { var ex = decode((p.excerpt && p.excerpt.rendered) || '').replace(/<[^>]+>/g, '').trim(); if (ex) desc.textContent = ex; }
      });
    }).catch(function () { /* on garde le contenu du prototype */ });
  }

  function init() {
    var needsCards = document.querySelector('[data-wretman-cards], [data-wretman-lead], [data-wretman-mini]');
    var needsDetail = document.querySelector('[data-wretman-detail]');
    if (!needsCards && !needsDetail) return;
    listings().then(function (list) {
      if (needsCards && list.length) fillCards(list);
      if (needsDetail) fillDetail(list);
    }).catch(function () { /* hors-ligne : visuels du prototype conservés */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
