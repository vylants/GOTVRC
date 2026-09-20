(function () {
  var uid = 0;
  function nextUid() { return ++uid; }

  function renderSigilInto(el) {
    var house = { name: 'Sigil', device: { type: 'empty', field: ['#14120f', '#0c0b09'] } };
    el.innerHTML = sigilSvg(house, nextUid());
  }

  document.querySelectorAll('[data-render="sigil"]').forEach(renderSigilInto);

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
