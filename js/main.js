(function () {
  var uid = 0;
  function nextUid() { return ++uid; }

  function renderSigilInto(el) {
    var id = el.getAttribute('data-house') || el.getAttribute('data-emblem') || 'placeholder';
    var house = null;
    for (var i = 0; i < HOUSES.length; i++) {
      if (HOUSES[i].id === id) { house = HOUSES[i]; break; }
    }
    if (!house) { house = { name: 'Sigil', device: { type: 'empty', field: ['#14120f', '#0c0b09'] } }; }
    el.innerHTML = sigilSvg(house, nextUid());
  }

  document.querySelectorAll('[data-render="sigil"]').forEach(renderSigilInto);

  document.querySelectorAll('a[data-house-link]').forEach(function (a) {
    var id = a.getAttribute('data-house');
    a.setAttribute('href', 'houses.html#house-' + id);
  });

  var PAGE_HOUSE = null;
  var m = window.location.hash.match(/house-([a-z]+)/);
  if (m) PAGE_HOUSE = m[1];

  function renderHouseCards() {
    var grid = document.getElementById('houses-grid');
    if (!grid) return;
    if (!HOUSES.length) {
      grid.innerHTML = '<div class="empty-state"><span class="glyph">&#x2666;</span><p>No houses have sworn their banners yet.</p><p class="hint">Custom houses will appear here once they are added.</p></div>';
      return;
    }
    HOUSES.forEach(function (house) {
      var h = document.createElement('div');
      h.className = 'card';
      h.setAttribute('data-house-id', house.id);
      h.innerHTML =
        '<div class="shield-box" data-render="sigil" data-house="' + house.id + '"></div>' +
        '<h4>' + house.name + '</h4>' +
        '<div class="words">"' + house.words + '"</div>';
      h.addEventListener('click', function () {
        showHouseDetail(house.id);
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      grid.appendChild(h);
    });
    grid.querySelectorAll('[data-render="sigil"]').forEach(renderSigilInto);
  }

  function showHouseDetail(id) {
    var panel = document.getElementById('house-detail');
    if (!panel) return;
    var house = null;
    for (var i = 0; i < HOUSES.length; i++) {
      if (HOUSES[i].id === id) { house = HOUSES[i]; break; }
    }
    if (!house) return;
    var big = panel.querySelector('[data-house-sigil]');
    big.setAttribute('data-house', house.id);
    big.innerHTML = '';
    renderSigilInto(big);

    panel.querySelector('[data-house-name]').textContent = house.name;
    panel.querySelector('[data-house-words]').textContent = house.words;
    panel.querySelector('[data-house-seat]').textContent = house.seat;
    panel.querySelector('[data-house-region]').textContent = house.region;
    panel.querySelector('[data-house-lore]').textContent = house.lore;
    panel.querySelector('[data-house-id]').textContent = house.id;
    panel.classList.add('open');
    try { history.replaceState(null, '', '#house-' + house.id); } catch (e) {}
  }

  function renderFooterSigils() {
    var row = document.getElementById('footer-sigils');
    if (!row) return;
    var visible = HOUSES.slice(0, 12);
    visible.forEach(function (house) {
      var span = document.createElement('span');
      span.className = 'ss';
      span.id = 'foot-' + house.id;
      var a = document.createElement('a');
      a.href = 'houses.html#house-' + house.id;
      a.title = house.name;
      a.appendChild(span);
      row.appendChild(a);
    });
    row.querySelectorAll('.ss').forEach(renderSigilInto);
  }

  var FALLBACK_ANNOUNCEMENTS = [];

  var ANNOUNCEMENTS = [];

  function announcementHtml(a) {
    var day = a.date || '';
    var d = day ? day.replace(/-/g, '.') : '';
    return '<article class="post">' +
      '<div class="top">' +
      '<span class="small-caps date">' + d + '</span>' +
      (a.tag ? '<span class="tag' + (a.tag === 'Official' ? ' crimson' : '') + '">' + a.tag + '</span>' : '') +
      '</div>' +
      '<h4>' + a.title + '</h4>' +
      '<p class="body">' + a.body + '</p>' +
      '</article>';
  }

  function renderFeed(id, limit) {
    var feed = document.getElementById(id);
    if (!feed) return;
    var list = ANNOUNCEMENTS;
    if (limit) list = list.slice(0, limit);
    if (!list.length) {
      feed.innerHTML = '<p>No ravens have arrived yet. The maester snores.</p>';
      return;
    }
    feed.innerHTML = list.map(announcementHtml).join('');
  }

  function loadAnnouncements() {
    fetch('announcements.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('nope');
        return r.json();
      })
      .then(function (data) {
        ANNOUNCEMENTS = data.announcements || data.items || data || [];
      })
      .catch(function () {
        ANNOUNCEMENTS = FALLBACK_ANNOUNCEMENTS.slice();
      })
      .then(function () {
        renderFeed('feed-home', 3);
        renderFeed('feed-all');
      });
  }

  function setBrand() {
    document.querySelectorAll('[data-brand-name]').forEach(function (el) { el.textContent = SITE.name; });
    document.querySelectorAll('[data-brand-short]').forEach(function (el) { el.textContent = SITE.short; });
    document.querySelectorAll('[data-tagline]').forEach(function (el) { el.textContent = SITE.tagline; });
    document.querySelectorAll('[data-discord]').forEach(function (el) {
      el.setAttribute('href', SITE.discord);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
    document.title = SITE.name + ' — ' + SITE.short;
  }

  function populateId(elId, keySelector, value, attr) {
    var el = document.getElementById(elId);
    if (!el || !value) return;
    var target = attr ? el.querySelector('[' + keySelector + ']') : el;
    if (!target) return;
    if (attr) target.setAttribute(attr, value); else target.textContent = value;
  }

  function pageSpecific() {
    var h = document.getElementById('house-detail');
    if (h && PAGE_HOUSE) showHouseDetail(PAGE_HOUSE);
  }

  function initBackground() {
    var VIDEO_ID = 's7L2PVdrb_8';
    var stage = document.createElement('div');
    stage.className = 'bg-stage';
    stage.id = 'bg-stage';
    stage.innerHTML = '<div id="bg-player"></div><div class="scrim"></div>';
    document.body.insertBefore(stage, document.body.firstChild);

    var controls = document.createElement('div');
    controls.className = 'bg-controls';
    controls.innerHTML =
      '<button id="bg-sound" type="button" data-on="0" title="Toggle intro sound">Sound: Off</button>' +
      '<button id="bg-toggle" type="button" title="Hide or show the intro">Hide Intro</button>';
    document.body.appendChild(controls);

    var ytPlayer = null;
    var ready = false;

    function createPlayer() {
      ytPlayer = new YT.Player('bg-player', {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: VIDEO_ID,
          modestbranding: 1, rel: 0, disablekb: 1, playsinline: 1, iv_load_policy: 3, fs: 0
        },
        events: {
          onReady: function (e) {
            ready = true;
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: function (e) {
            if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(0); e.target.playVideo(); }
          },
          onError: function () {
            stage.style.display = 'none';
            if (window.console) console.log('Background intro could not be embedded.');
          }
        }
      });
    }

    function loadApi() {
      if (window.YT && window.YT.Player) { createPlayer(); return; }
      var prior = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prior) prior(); createPlayer(); };
      if (!document.querySelector('script[data-yt-api]')) {
        var s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.setAttribute('data-yt-api', '1');
        document.head.appendChild(s);
      }
    }

    document.getElementById('bg-sound').addEventListener('click', function () {
      if (!ready) return;
      if (this.getAttribute('data-on') === '1') {
        ytPlayer.mute();
        this.setAttribute('data-on', '0');
        this.textContent = 'Sound: Off';
      } else {
        ytPlayer.unMute();
        ytPlayer.setVolume(70);
        this.setAttribute('data-on', '1');
        this.textContent = 'Sound: On';
      }
    });

    document.getElementById('bg-toggle').addEventListener('click', function () {
      var hidden = stage.classList.toggle('off');
      this.textContent = hidden ? 'Show Intro' : 'Hide Intro';
    });

    loadApi();
  }

  function init() {
    setBrand();
    initBackground();
    loadAnnouncements();
    loadHouses().then(function () {
      renderHouseCards();
      renderFooterSigils();
      pageSpecific();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();