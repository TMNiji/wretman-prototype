/* ============================================================
   WRETMAN ESTATE — i18n.js
   Sélecteur de langue fonctionnel : FR · EN · SV · NO · DA.
   Traduit le "chrome" du site (nav, menus, CTA, pied de page) + les
   titres/kickers/boutons de la page d'accueil. Les contenus longs
   (descriptions, articles, témoignages) restent en FR : en production
   ils seront gérés par le CMS multilingue (Polylang) + traduction pro.
   Choix mémorisé (localStorage), <html lang> mis à jour.
   NB : traductions SV/NO/DA = première passe, à valider par un traducteur.
   ============================================================ */
(function () {
  'use strict';
  var LANGS = ['fr', 'en', 'sv', 'no', 'da'];
  var STORE = 'we-lang';
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Dictionnaire : chaîne FR source -> { en, sv, no, da } */
  var T = {
    // Navigation
    'Acheter': { en: 'Buy', sv: 'Köpa', no: 'Kjøpe', da: 'Køb' },
    'Vendre': { en: 'Sell', sv: 'Sälja', no: 'Selge', da: 'Sælg' },
    'Nos agences': { en: 'Our offices', sv: 'Våra kontor', no: 'Våre kontorer', da: 'Vores kontorer' },
    'Magazine': { en: 'Magazine', sv: 'Magasin', no: 'Magasin', da: 'Magasin' },
    'Nous appeler': { en: 'Call us', sv: 'Ring oss', no: 'Ring oss', da: 'Ring os' },
    // Sous-menus
    'Par types de biens': { en: 'By property type', sv: 'Efter fastighetstyp', no: 'Etter eiendomstype', da: 'Efter ejendomstype' },
    'Par secteurs': { en: 'By area', sv: 'Efter område', no: 'Etter område', da: 'Efter område' },
    "La Côte d'Azur": { en: 'The French Riviera', sv: 'Franska Rivieran', no: 'Den franske rivieraen', da: 'Den franske riviera' },
    'Voir tous nos biens': { en: 'See all properties', sv: 'Se alla objekt', no: 'Se alle eiendommer', da: 'Se alle ejendomme' },
    'Estimation': { en: 'Valuation', sv: 'Värdering', no: 'Verdivurdering', da: 'Vurdering' },
    'Nous rencontrer': { en: 'Meet us', sv: 'Träffa oss', no: 'Møt oss', da: 'Mød os' },
    'Notre histoire': { en: 'Our story', sv: 'Vår historia', no: 'Vår historie', da: 'Vores historie' },
    'Notre équipe': { en: 'Our team', sv: 'Vårt team', no: 'Vårt team', da: 'Vores team' },
    'Nos services': { en: 'Our services', sv: 'Våra tjänster', no: 'Våre tjenester', da: 'Vores ydelser' },
    'Carrières': { en: 'Careers', sv: 'Karriär', no: 'Karriere', da: 'Karriere' },
    'Contact': { en: 'Contact', sv: 'Kontakt', no: 'Kontakt', da: 'Kontakt' },
    'Articles': { en: 'Articles', sv: 'Artiklar', no: 'Artikler', da: 'Artikler' },
    'Presse & médias': { en: 'Press & media', sv: 'Press & media', no: 'Presse & media', da: 'Presse & medier' },
    'Événements & partenariats': { en: 'Events & partnerships', sv: 'Evenemang & partnerskap', no: 'Arrangementer & partnerskap', da: 'Begivenheder & partnerskaber' },
    'Nos guides': { en: 'Our guides', sv: 'Våra guider', no: 'Våre guider', da: 'Vores guider' },
    // Pied de page
    'Vendre & Services': { en: 'Sell & Services', sv: 'Sälja & Tjänster', no: 'Selge & Tjenester', da: 'Sælg & Ydelser' },
    'Newsletter': { en: 'Newsletter', sv: 'Nyhetsbrev', no: 'Nyhetsbrev', da: 'Nyhedsbrev' },
    'Tous nos biens': { en: 'All properties', sv: 'Alla objekt', no: 'Alle eiendommer', da: 'Alle ejendomme' },
    'La plus grande agence immobilière franco-scandinave de France.': { en: 'The largest French–Scandinavian real estate agency in France.', sv: 'Frankrikes största fransk-skandinaviska fastighetsbyrå.', no: 'Frankrikes største fransk-skandinaviske eiendomsmegler.', da: 'Frankrigs største fransk-skandinaviske ejendomsmægler.' },
    'Votre adresse email': { en: 'Your email address', sv: 'Din e-postadress', no: 'Din e-postadresse', da: 'Din e-mailadresse' },
    "S'abonner": { en: 'Subscribe', sv: 'Prenumerera', no: 'Abonner', da: 'Tilmeld' },
    'Recevoir notre brochure': { en: 'Get our brochure', sv: 'Få vår broschyr', no: 'Få vår brosjyre', da: 'Få vores brochure' },
    'Mentions légales': { en: 'Legal notice', sv: 'Juridisk information', no: 'Juridisk informasjon', da: 'Juridiske oplysninger' },
    'Politique de confidentialité': { en: 'Privacy policy', sv: 'Integritetspolicy', no: 'Personvernerklæring', da: 'Privatlivspolitik' },
    'Prototype, maquette non contractuelle': { en: 'Prototype — non-contractual mock-up', sv: 'Prototyp — icke bindande modell', no: 'Prototype — ikke-bindende modell', da: 'Prototype — ikke-bindende model' },
    // Hero
    "Agence franco-scandinave — Côte d'Azur & Provence": { en: 'French–Scandinavian agency — French Riviera & Provence', sv: 'Fransk-skandinavisk fastighetsbyrå — Franska Rivieran & Provence', no: 'Fransk-skandinavisk eiendomsmegler — Den franske rivieraen & Provence', da: 'Fransk-skandinavisk ejendomsmægler — Den franske riviera & Provence' },
    "L'art de vivre": { en: 'The art of', sv: 'Konsten att leva', no: 'Kunsten å leve', da: 'Kunsten at leve' },
    'la Riviera': { en: 'Riviera living', sv: 'på Rivieran', no: 'på Rivieraen', da: 'på Rivieraen' },
    "Villas, penthouses et domaines d'exception, choisis et accompagnés avec l'exigence scandinave.": { en: 'Exceptional villas, penthouses and estates, selected and guided with Scandinavian rigour.', sv: 'Exceptionella villor, takvåningar och egendomar, utvalda och hanterade med skandinavisk omsorg.', no: 'Eksepsjonelle villaer, toppleiligheter og eiendommer, valgt ut og fulgt opp med skandinavisk presisjon.', da: 'Exceptionelle villaer, penthouses og ejendomme, udvalgt og fulgt med skandinavisk omhu.' },
    'Explorer': { en: 'Explore', sv: 'Utforska', no: 'Utforsk', da: 'Udforsk' },
    // Barre de recherche
    'Lieu': { en: 'Location', sv: 'Plats', no: 'Sted', da: 'Sted' },
    'Type de bien': { en: 'Property type', sv: 'Fastighetstyp', no: 'Eiendomstype', da: 'Ejendomstype' },
    'Budget max (euros)': { en: 'Max budget (euros)', sv: 'Maxbudget (euro)', no: 'Maksbudsjett (euro)', da: 'Maks. budget (euro)' },
    'Rechercher': { en: 'Search', sv: 'Sök', no: 'Søk', da: 'Søg' },
    'Toutes les villes': { en: 'All cities', sv: 'Alla städer', no: 'Alle byer', da: 'Alle byer' },
    'Tous les types': { en: 'All types', sv: 'Alla typer', no: 'Alle typer', da: 'Alle typer' },
    'Tous les biens': { en: 'All properties', sv: 'Alla objekt', no: 'Alle eiendommer', da: 'Alle ejendomme' },
    'Appartement': { en: 'Apartment', sv: 'Lägenhet', no: 'Leilighet', da: 'Lejlighed' },
    'Villa / Maison': { en: 'Villa / House', sv: 'Villa / Hus', no: 'Villa / Hus', da: 'Villa / Hus' },
    'Penthouse': { en: 'Penthouse', sv: 'Takvåning', no: 'Toppleilighet', da: 'Penthouse' },
    'Bastide / Mas': { en: 'Bastide / Farmhouse', sv: 'Bastide / Lantgård', no: 'Bastide / Gårdshus', da: 'Bastide / Landhus' },
    'Terrain': { en: 'Land', sv: 'Tomt', no: 'Tomt', da: 'Grund' },
    'Domaine viticole': { en: 'Vineyard estate', sv: 'Vingård', no: 'Vingård', da: 'Vingård' },
    // Kickers / titres d'accueil
    'En quelques chiffres': { en: 'In figures', sv: 'I siffror', no: 'I tall', da: 'I tal' },
    'Exclusivités': { en: 'Exclusives', sv: 'Exklusivt', no: 'Eksklusivt', da: 'Eksklusivt' },
    'Nos biens en exclusivité': { en: 'Our exclusive properties', sv: 'Våra exklusiva objekt', no: 'Våre eksklusive eiendommer', da: 'Vores eksklusive ejendomme' },
    'Votre projet': { en: 'Your project', sv: 'Ditt projekt', no: 'Ditt prosjekt', da: 'Dit projekt' },
    'Acheter ou vendre, en toute sérénité': { en: 'Buying or selling, with complete peace of mind', sv: 'Köpa eller sälja, med fullständigt lugn', no: 'Kjøpe eller selge, med full trygghet', da: 'Køb eller salg, med fuldstændig ro i sindet' },
    'Découvrir nos biens': { en: 'Discover our properties', sv: 'Upptäck våra objekt', no: 'Oppdag våre eiendommer', da: 'Oplev vores ejendomme' },
    'Faire estimer mon bien': { en: 'Get a valuation', sv: 'Värdera mitt objekt', no: 'Få en verdivurdering', da: 'Få en vurdering' },
    'Sélection': { en: 'Selection', sv: 'Urval', no: 'Utvalg', da: 'Udvalg' },
    'Nos coups de cœur': { en: 'Our favourites', sv: 'Våra favoriter', no: 'Våre favoritter', da: 'Vores favoritter' },
    'Survol de la Riviera': { en: 'A flight over the Riviera', sv: 'En flygtur över Rivieran', no: 'En flytur over Rivieraen', da: 'En flyvetur over Rivieraen' },
    'Le film': { en: 'The film', sv: 'Filmen', no: 'Filmen', da: 'Filmen' },
    "La Riviera, comme vous ne l'avez jamais vue": { en: "The Riviera as you've never seen it", sv: 'Rivieran som du aldrig sett den', no: 'Rivieraen som du aldri har sett den', da: 'Rivieraen som du aldrig har set den' },
    'Notre regard': { en: 'Our eye', sv: 'Vår blick', no: 'Vårt blikk', da: 'Vores blik' },
    'Chaque bien, photographié comme une œuvre': { en: 'Every property, photographed like a work of art', sv: 'Varje objekt, fotograferat som ett konstverk', no: 'Hver eiendom, fotografert som et kunstverk', da: 'Hver ejendom, fotograferet som et kunstværk' },
    'Explorer nos intérieurs': { en: 'Explore our interiors', sv: 'Utforska våra interiörer', no: 'Utforsk våre interiører', da: 'Udforsk vores interiører' },
    'Notre ADN': { en: 'Our DNA', sv: 'Vårt DNA', no: 'Vårt DNA', da: 'Vores DNA' },
    'Découvrir Wretman': { en: 'Discover Wretman', sv: 'Upptäck Wretman', no: 'Oppdag Wretman', da: 'Oplev Wretman' },
    'Ils nous font confiance': { en: 'They trust us', sv: 'De litar på oss', no: 'De stoler på oss', da: 'De stoler på os' },
    "L'avis de nos clients": { en: 'What our clients say', sv: 'Vad våra kunder säger', no: 'Hva kundene våre sier', da: 'Hvad vores kunder siger' },
    'Visites privées': { en: 'Private tours', sv: 'Privata visningar', no: 'Private visninger', da: 'Private fremvisninger' },
    'Découvrez nos biens en vidéo': { en: 'Discover our properties on video', sv: 'Upptäck våra objekt i video', no: 'Oppdag våre eiendommer på video', da: 'Oplev vores ejendomme på video' },
    'Conseils, marché & art de vivre': { en: 'Advice, market & lifestyle', sv: 'Råd, marknad & livsstil', no: 'Råd, marked & livsstil', da: 'Råd, marked & livsstil' },
    'Tout le magazine': { en: 'The whole magazine', sv: 'Hela magasinet', no: 'Hele magasinet', da: 'Hele magasinet' },
    'Estimation offerte': { en: 'Free valuation', sv: 'Kostnadsfri värdering', no: 'Gratis verdivurdering', da: 'Gratis vurdering' },
    "Combien vaut votre bien aujourd'hui ?": { en: "What's your property worth today?", sv: 'Vad är ditt objekt värt idag?', no: 'Hva er eiendommen din verdt i dag?', da: 'Hvad er din ejendom værd i dag?' },
    'Estimer mon bien': { en: 'Value my property', sv: 'Värdera mitt objekt', no: 'Verdivurder eiendommen min', da: 'Vurder min ejendom' }
  };

  /* nœuds enregistrés : { node, fr, pre, suf } */
  var REG = [];
  var SELECTORS = [
    '.nav-link', '.dropdown a', '.header-cta',
    '.mobile-subtoggle', '.mobile-sub a', '.mobile-nav-list > li > a', '.mobile-nav-footer .btn',
    '.footer-title', '.footer-col ul a', '.footer-baseline', '.newsletter-form .form-label',
    '.newsletter-form button', '.footer-brochure', '.footer-legal a', '.footer-proto',
    '.kicker', '.btn', '.form-label', 'option',
    '.hero-v2-sub', '.scroll-cue',
    '.hero-v2 h1 .line-mask > span',
    '.section-head h2', '.riviera-step h2', '.showreel-caption h2', '.contact-sheet h2',
    '.split-body h2', '.editorial-text h2', '.image-card-content h3'
  ];

  function firstTextNode(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim()) return n;
    }
    return null;
  }

  function register() {
    var seen = [];
    SELECTORS.forEach(function (sel) {
      $$(sel).forEach(function (el) {
        var node = firstTextNode(el);
        if (!node || seen.indexOf(node) > -1) return;
        var m = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
        var core = m[2];
        if (!T[core]) return;            // on n'enregistre que ce qu'on sait traduire
        seen.push(node);
        REG.push({ node: node, fr: core, pre: m[1], suf: m[3] });
      });
    });
  }

  function apply(lang) {
    REG.forEach(function (r) {
      var val = lang === 'fr' ? r.fr : ((T[r.fr] && T[r.fr][lang]) || r.fr);
      r.node.nodeValue = r.pre + val + r.suf;
    });
    document.documentElement.setAttribute('lang', lang);
    // libellé du bouton langue (FR/EN/…)
    var btn = document.querySelector('.lang-btn');
    if (btn) { var t = firstTextNode(btn); if (t) t.nodeValue = lang.toUpperCase(); }
    // états actifs
    $$('.lang-option').forEach(function (o) {
      var on = o.getAttribute('lang') === lang;
      o.classList.toggle('is-current', on);
      if (on) o.setAttribute('aria-current', 'true'); else o.removeAttribute('aria-current');
    });
    $$('.mobile-nav-lang span').forEach(function (s) {
      s.classList.toggle('is-current', (s.getAttribute('lang') || '').toLowerCase() === lang);
    });
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  function enableSwitcher() {
    // Sélecteur desktop (.lang-option) + codes langue du menu mobile (.mobile-nav-lang span)
    $$('.lang-option, .mobile-nav-lang span[lang]').forEach(function (o) {
      o.removeAttribute('aria-disabled');
      o.removeAttribute('title');
      o.style.cursor = 'pointer';
      o.setAttribute('role', 'button');
      o.setAttribute('tabindex', '0');
      var choose = function () {
        var l = (o.getAttribute('lang') || 'fr').toLowerCase();
        if (LANGS.indexOf(l) < 0) return;
        apply(l);
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      };
      o.addEventListener('click', choose);
      o.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
      });
    });
  }

  function init() {
    register();
    enableSwitcher();
    var saved = 'fr';
    try { saved = localStorage.getItem(STORE) || 'fr'; } catch (e) {}
    if (LANGS.indexOf(saved) < 0) saved = 'fr';
    if (saved !== 'fr') apply(saved); else apply('fr');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
