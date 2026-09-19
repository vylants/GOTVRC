(function () {
  var WEBHOOKS = {
    character: 'https://discord.com/api/webhooks/1551000370745188473/WUEM-1Xuk2SzFs4OyziHg_uAroLVhpK-ani6crl9hmQZ2PsV594Y0gG_sRGs3mdTC_KB',
    house: 'https://discord.com/api/webhooks/1551000370745188473/WUEM-1Xuk2SzFs4OyziHg_uAroLVhpK-ani6crl9hmQZ2PsV594Y0gG_sRGs3mdTC_KB'
  };
  var MAX_BYTES = 8 * 1024 * 1024;

  function val(form, name) {
    var el = form.elements[name];
    if (!el) return '';
    return typeof el.value === 'string' ? el.value.trim() : '';
  }

  function trunc(value, max) {
    value = (value || '').trim();
    if (!value) return '\u2014';
    return value.length > max ? value.slice(0, max - 1) + '\u2026' : value;
  }

  function isVrchatUrl(v) {
    if (!v) return false;
    try {
      var u = new URL(v);
      return /^https?:$/.test(u.protocol) && /vrchat|vrc/i.test(u.host);
    } catch (e) {
      return false;
    }
  }

  function status(boxId, kind, html) {
    var box = document.getElementById(boxId);
    if (!box) return;
    box.className = 'form-result ' + kind;
    box.innerHTML = html;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function busy(btn, text) {
    btn.disabled = true;
    btn.setAttribute('data-label', btn.textContent);
    btn.textContent = text;
  }

  function ready(btn) {
    btn.disabled = false;
    btn.textContent = btn.getAttribute('data-label') || 'Submit';
  }

  function tabs() {
    var buttons = document.querySelectorAll('.tab');
    if (!buttons.length) return;
    function activate(name) {
      buttons.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === name); });
      document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === name);
      });
      if (location.hash !== '#' + name) {
        try { history.replaceState(null, '', '#' + name); } catch (e) {}
      }
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { activate(b.getAttribute('data-tab')); });
    });
    var start = (location.hash || '').replace('#', '');
    activate(start === 'house' ? 'house' : 'character');
  }

  function fillHouseSelect() {
    var select = document.querySelector('select[name="houseAllegiance"]');
    if (!select) return;
    var render = function () {
      (window.HOUSES || []).forEach(function (house) {
        var opt = document.createElement('option');
        opt.value = house.name;
        opt.textContent = house.name;
        select.appendChild(opt);
      });
    };
    if (window.loadHouses) window.loadHouses().then(render);
    else render();
  }

  function bindScreenshot() {
    var input = document.querySelector('input[name="screenshot"]');
    if (!input) return;
    var meta = document.getElementById('screenshot-meta');
    var thumb = document.getElementById('screenshot-thumb');
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) { meta.textContent = ''; thumb.innerHTML = ''; return; }
      var kb = (file.size / 1024).toFixed(0);
      meta.textContent = file.name + ' \u00b7 ' + kb + ' KB' + (file.size > MAX_BYTES ? ' \u2014 too large (max 8 MB)' : '');
      meta.style.color = file.size > MAX_BYTES ? '#b3202c' : '';
      if (file.type.indexOf('image/') === 0) {
        var url = URL.createObjectURL(file);
        thumb.innerHTML = '<img src="' + url + '" alt="screenshot preview">';
      } else {
        thumb.innerHTML = '';
      }
    });
  }

  function pushCharacter(e) {
    e.preventDefault();
    var form = e.currentTarget;
    if (val(form, 'website')) { status('result-character', 'ok', 'The raven is sent.'); form.reset(); return; }
    if (!val(form, 'name') || !val(form, 'contact') || !val(form, 'character') || !val(form, 'backstory') || !val(form, 'vrchat')) {
      status('result-character', 'err', 'Your petition is incomplete. Fill every required field.');
      return;
    }
    if (!isVrchatUrl(val(form, 'vrchat'))) {
      status('result-character', 'err', 'Please provide a valid VRChat profile link (a vrchat.com profile URL).');
      return;
    }
    if (!form.elements.agree.checked) {
      status('result-character', 'err', 'You must accept the laws of the realm before applying.');
      return;
    }

    var data = {
      name: val(form, 'name'), contact: val(form, 'contact'), vrchat: val(form, 'vrchat'),
      character: val(form, 'character'), house: val(form, 'houseAllegiance'), role: val(form, 'role'),
      experience: val(form, 'experience'), backstory: val(form, 'backstory'), goals: val(form, 'goals')
    };
    var embed = {
      title: 'Character Application \u2014 ' + trunc(data.character, 200),
      color: 0x3f6d8f,
      description: 'A new character seeks entry to the realm (VRChat).',
      fields: [
        { name: '\u2694 Applicant', value: trunc(data.name, 256), inline: true },
        { name: '\u{1F4AC} Discord', value: trunc(data.contact, 256), inline: true },
        { name: '\u{1F3AE} VRChat', value: trunc(data.vrchat, 256), inline: true },
        { name: '\u{1F3F0} House Allegiance', value: trunc(data.house, 256), inline: true },
        { name: '\u{1F3AD} Role / Title', value: trunc(data.role, 256), inline: true },
        { name: '\u{1F4DA} Experience', value: trunc(data.experience, 256), inline: true },
        { name: '\u{1F4D6} Backstory', value: trunc(data.backstory, 1024) },
        { name: '\u{1F3AF} Goals & Ambitions', value: trunc(data.goals, 1024) }
      ]
    };

    var btn = form.querySelector('button[type="submit"]');
    busy(btn, 'Dispatching raven\u2026');
    var body = new URLSearchParams();
    body.append('content', 'A character application has arrived.');
    body.append('embeds', JSON.stringify([embed]));
    fetch(WEBHOOKS.character, { method: 'POST', body: body })
      .then(function (r) {
        ready(btn);
        if (r.ok) { status('result-character', 'ok', 'The raven has arrived. Your character application was delivered to the moderation hall.'); form.reset(); }
        else status('result-character', 'err', 'The raven faltered (HTTP ' + r.status + '). Try again or reach a moderator on Discord.');
      })
      .catch(function () { ready(btn); status('result-character', 'err', 'The raven could not reach the sky. Check your connection and try again.'); });
  }

  function pushHouse(e) {
    e.preventDefault();
    var form = e.currentTarget;
    if (val(form, 'website')) { status('result-house', 'ok', 'The raven is sent.'); form.reset(); return; }
    if (!val(form, 'name') || !val(form, 'contact') || !val(form, 'vrchat') || !val(form, 'houseName') || !val(form, 'houseWords') || !val(form, 'houseLore')) {
      status('result-house', 'err', 'Your petition is incomplete. Fill every required field.');
      return;
    }
    if (!isVrchatUrl(val(form, 'vrchat'))) {
      status('result-house', 'err', 'Please provide a valid VRChat profile link (a vrchat.com profile URL).');
      return;
    }
    if (!form.elements.age18.checked) {
      status('result-house', 'err', 'House founders must confirm they are verified as 18+ on VRChat.');
      return;
    }
    var file = form.elements.screenshot.files && form.elements.screenshot.files[0];
    if (!file) {
      status('result-house', 'err', 'A screenshot showing at least 10 people is required.');
      return;
    }
    if (file.type.indexOf('image/') !== 0) {
      status('result-house', 'err', 'The proof must be an image file (PNG or JPG).');
      return;
    }
    if (file.size > MAX_BYTES) {
      status('result-house', 'err', 'That image is larger than 8 MB. Please compress it and try again.');
      return;
    }
    if (!form.elements.agree.checked) {
      status('result-house', 'err', 'You must accept the laws of the realm before applying.');
      return;
    }

    var data = {
      name: val(form, 'name'), contact: val(form, 'contact'), vrchat: val(form, 'vrchat'),
      houseName: val(form, 'houseName'), houseWords: val(form, 'houseWords'), houseSeat: val(form, 'houseSeat'),
      houseRegion: val(form, 'houseRegion'), allegiance: val(form, 'allegiance'), sigil: val(form, 'sigil'),
      houseLore: val(form, 'houseLore'), goals: val(form, 'goals')
    };
    var embed = {
      title: 'House Application \u2014 ' + trunc(data.houseName, 200),
      color: 0xc9a227,
      description: 'A new banner petitions to be raised in the realm (VRChat).',
      image: { url: 'attachment://' + file.name },
      fields: [
        { name: '\u2694 Applicant', value: trunc(data.name, 256), inline: true },
        { name: '\u{1F4AC} Discord', value: trunc(data.contact, 256), inline: true },
        { name: '\u{1F3AE} VRChat', value: trunc(data.vrchat, 256), inline: true },
        { name: '\u{1F51E} VRChat 18+ Verified', value: 'Confirmed', inline: true },
        { name: '\u{1F3F0} House', value: trunc(data.houseName, 256), inline: true },
        { name: '\u{1F58B} Words', value: trunc(data.houseWords, 256), inline: true },
        { name: '\u{1F4CD} Seat', value: trunc(data.houseSeat, 256), inline: true },
        { name: '\u{1F5FA} Region', value: trunc(data.houseRegion, 256), inline: true },
        { name: '\u{1F91D} Allegiance', value: trunc(data.allegiance, 256), inline: true },
        { name: '\u{1F52E} Sigil & Colors', value: trunc(data.sigil, 1024) },
        { name: '\u{1F4DC} House History', value: trunc(data.houseLore, 1024) },
        { name: '\u{1F3AF} Goals & Ambitions', value: trunc(data.goals, 1024) }
      ]
    };

    var btn = form.querySelector('button[type="submit"]');
    busy(btn, 'Dispatching raven\u2026');
    var payload = {
      content: 'A house application has arrived, with proof of numbers attached.',
      embeds: [embed],
      attachments: [{ id: 0, filename: file.name }]
    };
    var fd = new FormData();
    fd.append('payload_json', JSON.stringify(payload));
    fd.append('files[0]', file, file.name);

    fetch(WEBHOOKS.house, { method: 'POST', body: fd })
      .then(function (r) {
        ready(btn);
        if (r.ok) { status('result-house', 'ok', 'The raven has arrived. Your house application and proof were delivered to the moderation hall.'); form.reset(); document.getElementById('screenshot-meta').textContent = ''; document.getElementById('screenshot-thumb').innerHTML = ''; }
        else status('result-house', 'err', 'The raven faltered (HTTP ' + r.status + '). Try again or reach a moderator on Discord.');
      })
      .catch(function () { ready(btn); status('result-house', 'err', 'The raven could not reach the sky. Check your connection and try again.'); });
  }

  function init() {
    tabs();
    fillHouseSelect();
    bindScreenshot();
    var cf = document.getElementById('form-character');
    var hf = document.getElementById('form-house');
    if (cf) cf.addEventListener('submit', pushCharacter);
    if (hf) hf.addEventListener('submit', pushHouse);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();