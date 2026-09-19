(function () {
  var LS_CONFIG = 'got-admin-config';
  var SS_TOKEN = 'got-admin-token';
  var API = 'https://api.github.com';

  var state = {
    token: '',
    owner: '',
    repo: '',
    branch: 'main',
    path: 'houses.json',
    houses: [],
    sha: null,
    user: '',
    dirty: false
  };

  function $(id) { return document.getElementById(id); }

  function encodeBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function decodeBase64(b64) {
    var bin = atob((b64 || '').replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function loadConfig() {
    var cfg = (window.ADMIN_CONFIG || {});
    try {
      var saved = JSON.parse(localStorage.getItem(LS_CONFIG) || '{}');
      cfg = Object.assign({}, cfg, saved);
    } catch (e) {}
    state.owner = cfg.owner || '';
    state.repo = cfg.repo || '';
    state.branch = cfg.branch || 'main';
    state.path = cfg.path || 'houses.json';
    state.token = sessionStorage.getItem(SS_TOKEN) || '';
    $('gh-owner').value = state.owner;
    $('gh-repo').value = state.repo;
    $('gh-branch').value = state.branch;
    $('gh-path').value = state.path;
  }

  function saveConfig() {
    state.owner = $('gh-owner').value.trim();
    state.repo = $('gh-repo').value.trim();
    state.branch = $('gh-branch').value.trim() || 'main';
    state.path = $('gh-path').value.trim() || 'houses.json';
    localStorage.setItem(LS_CONFIG, JSON.stringify({
      owner: state.owner, repo: state.repo, branch: state.branch, path: state.path
    }));
  }

  async function gh(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + state.token,
      'X-GitHub-Api-Version': '2022-11-28'
    }, opts.headers || {});
    var res = await fetch(url, opts);
    var data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      var err = new Error((data && data.message) || ('HTTP ' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function contentsUrl() {
    return API + '/repos/' + encodeURIComponent(state.owner) + '/' + encodeURIComponent(state.repo) +
      '/contents/' + state.path.split('/').map(encodeURIComponent).join('/');
  }

  async function getUser() {
    return gh(API + '/user');
  }

  async function getFile() {
    try {
      var data = await gh(contentsUrl() + '?ref=' + encodeURIComponent(state.branch));
      var text = data.content ? decodeBase64(data.content) : '';
      state.sha = data.sha;
      return text;
    } catch (e) {
      if (e.status === 404) { state.sha = null; return null; }
      throw e;
    }
  }

  async function putFile(text, message) {
    var body = { message: message, content: encodeBase64(text), branch: state.branch };
    if (state.sha) body.sha = state.sha;
    try {
      return await gh(contentsUrl(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      if (e.status === 409) {
        await getFile();
        body.sha = state.sha;
        return gh(contentsUrl(), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      throw e;
    }
  }

  function slugify(name) {
    return (name || 'house').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'house';
  }

  function uniqueId(name) {
    var base = slugify(name);
    var id = base, n = 2;
    while (state.houses.some(function (h) { return h.id === id; })) { id = base + '-' + n; n++; }
    return id;
  }

  function currentHouse() {
    var device = $('hf-device').value;
    var h = {
      id: state.editingId || uniqueId($('hf-name').value),
      name: $('hf-name').value.trim() || 'House Unnamed',
      words: $('hf-words').value.trim(),
      seat: $('hf-seat').value.trim(),
      region: $('hf-region').value.trim(),
      lore: $('hf-lore').value.trim(),
      device: { field: [$('hf-top').value, $('hf-bottom').value] }
    };
    if (device === 'custom') {
      h.device.svg = $('hf-svg').value.trim();
    } else {
      h.device.type = device;
    }
    return h;
  }

  var previewUid = 900;

  function refreshPreview() {
    var box = $('sigil-preview');
    if (!box) return;
    box.innerHTML = sigilSvg(currentHouse(), previewUid++);
  }

  function toggleCustom() {
    var isCustom = $('hf-device').value === 'custom';
    $('hf-svg-field').style.display = isCustom ? '' : 'none';
  }

  function fillForm(house) {
    $('hf-name').value = house.name || '';
    $('hf-words').value = house.words || '';
    $('hf-seat').value = house.seat || '';
    $('hf-region').value = house.region || '';
    $('hf-lore').value = house.lore || '';
    var field = (house.device && house.device.field) || ['#14120f', '#0c0b09'];
    $('hf-top').value = field[0];
    $('hf-bottom').value = field[1];
    if (house.device && house.device.svg) {
      $('hf-device').value = 'custom';
      $('hf-svg').value = house.device.svg;
    } else {
      $('hf-device').value = (house.device && house.device.type) || 'empty';
      $('hf-svg').value = '';
    }
    toggleCustom();
    refreshPreview();
  }

  function resetForm() {
    state.editingId = null;
    $('house-form').reset();
    $('hf-top').value = '#14120f';
    $('hf-bottom').value = '#0c0b09';
    $('hf-svg').value = '';
    toggleCustom();
    refreshPreview();
    $('hf-name').focus();
  }

  function renderList() {
    var list = $('admin-house-list');
    if (!list) return;
    if (!state.houses.length) {
      list.innerHTML = '<p style="color:var(--silver);">No houses published yet.</p>';
      return;
    }
    list.innerHTML = state.houses.map(function (h) {
      return '<div class="admin-item" data-id="' + h.id + '">' +
        '<div class="ai-sigil">' + sigilSvg(h, 'li-' + h.id) + '</div>' +
        '<div class="ai-body"><b>' + h.name + '</b><span>' + (h.words ? '\u201c' + h.words + '\u201d' : '') + '</span>' +
        '<small>' + [h.seat, h.region].filter(Boolean).join(' \u00b7 ') + '</small></div>' +
        '<div class="ai-actions">' +
        '<button class="btn btn-mini" data-act="edit" data-id="' + h.id + '">Edit</button>' +
        '<button class="btn btn-mini btn-crimson" data-act="del" data-id="' + h.id + '">Remove</button>' +
        '</div></div>';
    }).join('');
  }

  function markDirty() {
    state.dirty = true;
    $('publish-status').textContent = 'Unpublished changes. Publish to update the site for everyone.';
    $('publish-status').className = 'status-line warn';
  }

  function addOrUpdate(e) {
    e.preventDefault();
    if (!$('hf-name').value.trim()) { setStatus('publish-status', 'err', 'A house needs a name.'); return; }
    var house = currentHouse();
    if (state.editingId) {
      state.houses = state.houses.map(function (h) { return h.id === state.editingId ? house : h; });
    } else {
      state.houses.push(house);
    }
    renderList();
    resetForm();
    markDirty();
  }

  function onListClick(e) {
    var btn = e.target.closest('button[data-act]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var house = state.houses.filter(function (h) { return h.id === id; })[0];
    if (btn.getAttribute('data-act') === 'edit' && house) {
      state.editingId = id;
      fillForm(house);
      $('house-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (btn.getAttribute('data-act') === 'del') {
      if (!confirm('Remove ' + house.name + ' from the list?')) return;
      state.houses = state.houses.filter(function (h) { return h.id !== id; });
      if (state.editingId === id) resetForm();
      renderList();
      markDirty();
    }
  }

  function setStatus(id, kind, msg) {
    var el = $(id);
    if (!el) return;
    el.textContent = msg;
    el.className = 'status-line ' + kind;
  }

  async function publish() {
    var btn = $('btn-publish');
    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = 'Publishing\u2026';
    try {
      var text = JSON.stringify({ houses: state.houses }, null, 2);
      var res = await putFile(text, 'Update houses.json via admin panel');
      state.sha = res.content ? res.content.sha : state.sha;
      state.dirty = false;
      setStatus('publish-status', 'ok', 'Published. The site will show ' + state.houses.length + ' house(s) for everyone.');
    } catch (err) {
      setStatus('publish-status', 'err', 'Publish failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  async function login() {
    saveConfig();
    state.token = $('gh-token').value.trim();
    if (!state.token || !state.owner || !state.repo) {
      setStatus('login-status', 'err', 'Owner, repository and token are required.');
      return;
    }
    var btn = $('btn-login');
    btn.disabled = true;
    btn.textContent = 'Signing in\u2026';
    try {
      var user = await getUser();
      state.user = user.login;
      sessionStorage.setItem(SS_TOKEN, state.token);
      var text = await getFile();
      state.houses = text ? (JSON.parse(text).houses || []) : [];
      state.dirty = false;
      showAdmin();
      setStatus('publish-status', '', state.houses.length + ' house(s) loaded from ' + state.owner + '/' + state.repo + '.');
      renderList();
      resetForm();
    } catch (err) {
      setStatus('login-status', 'err', 'Sign-in failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  }

  function showAdmin() {
    $('login-view').style.display = 'none';
    $('admin-view').style.display = '';
    $('admin-user').textContent = state.user;
    $('admin-repo').textContent = state.owner + '/' + state.repo + ' \u00b7 ' + state.path;
  }

  function logout() {
    sessionStorage.removeItem(SS_TOKEN);
    state.token = '';
    state.user = '';
    $('gh-token').value = '';
    $('admin-view').style.display = 'none';
    $('login-view').style.display = '';
  }

  function init() {
    if (!$('login-view')) return;
    loadConfig();
    $('btn-login').addEventListener('click', login);
    $('btn-logout').addEventListener('click', logout);
    $('house-form').addEventListener('submit', addOrUpdate);
    $('house-form').addEventListener('input', refreshPreview);
    $('house-form').addEventListener('change', refreshPreview);
    $('hf-device').addEventListener('change', function () { toggleCustom(); refreshPreview(); });
    $('admin-house-list').addEventListener('click', onListClick);
    $('btn-publish').addEventListener('click', publish);
    $('btn-reset-house').addEventListener('click', resetForm);
    toggleCustom();
    refreshPreview();
    if (state.token) {
      $('gh-token').value = state.token;
      login();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();