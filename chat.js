/* rytisbalys.com chat widget. Kalba su rb-chat workeriu. Be biblioteku. */
(function(){
  if (window.__rbChat) return; window.__rbChat = true;
  var API = 'https://rb-chat.formos-ops.workers.dev/';
  var GREETING = "Hi, I'm Rytis's AI assistant. Ask about prices, timelines, or whether your tracking problem is something he fixes.";
  var css = ''
  + '.rbc-btn{position:fixed;right:18px;bottom:18px;z-index:60;display:flex;align-items:center;gap:8px;padding:12px 18px;border:0;border-radius:999px;background:#111;color:#fff;font:600 14px/1 -apple-system,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.22)}'
  + '.rbc-btn:hover{background:#333}'
  + '.rbc{position:fixed;right:18px;bottom:18px;z-index:61;width:min(380px,calc(100vw - 36px));height:min(540px,calc(100vh - 36px));display:none;flex-direction:column;overflow:hidden;background:#fff;border:1px solid #ddd;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.25);font-family:-apple-system,system-ui,sans-serif;color:#111}'
  + '.rbc.on{display:flex}'
  + '.rbc-top{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #eee;background:#fafafa}'
  + '.rbc-top b{font-size:15px}.rbc-top span{display:block;font-size:12px;color:#666;margin-top:2px}'
  + '.rbc-x{border:0;background:none;cursor:pointer;color:#666;font-size:22px;line-height:1;padding:0 4px}'
  + '.rbc-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}'
  + '.rbc-m{max-width:88%;padding:9px 12px;border-radius:12px;font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}'
  + '.rbc-m.bot{align-self:flex-start;background:#f3f3f3}.rbc-m.me{align-self:flex-end;background:#111;color:#fff}.rbc-m.err{align-self:flex-start;background:#fff1ee;color:#a33}'
  + '.rbc-m a{color:inherit;text-decoration:underline}'
  + '.rbc-wait{align-self:flex-start;padding:10px 12px;color:#888;font-size:13px}'
  + '.rbc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fafafa}'
  + '.rbc-form textarea{flex:1;font:inherit;font-size:16px;line-height:1.4;padding:8px 10px;border:1px solid #ccc;border-radius:9px;resize:none;min-height:40px;max-height:110px}'
  + '.rbc-form button{border:0;border-radius:9px;background:#111;color:#fff;font:600 14px/1 inherit;padding:0 14px;cursor:pointer}'
  + '.rbc-form button:disabled{opacity:.5}'
  + '.rbc-note{margin:0;padding:0 12px 10px;font-size:11px;color:#777;background:#fafafa}'
  + '@media(max-width:520px){.rbc{right:8px;left:8px;bottom:8px;width:auto;height:min(80vh,520px)}.rbc-btn{right:10px;bottom:10px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button'); btn.className = 'rbc-btn'; btn.type = 'button';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6a8 8 0 1 1 18-5z"/></svg>Quick question';
  var box = document.createElement('div'); box.className = 'rbc';
  box.innerHTML = '<div class="rbc-top"><div><b>Ask about tracking</b><span>Prices, timelines, whether it is fixable</span></div><button class="rbc-x" type="button" aria-label="Close">&times;</button></div>'
    + '<div class="rbc-log"></div>'
    + '<form class="rbc-form"><textarea rows="1" placeholder="e.g. Meta shows 142 purchases, Shopify 76" aria-label="Your question"></textarea><button type="submit">Send</button></form>'
    + '<p class="rbc-note">AI answers, kept 90 days so Rytis can improve them. Every form and call goes to Rytis himself.</p>';
  document.body.appendChild(btn); document.body.appendChild(box);

  var log = box.querySelector('.rbc-log'), form = box.querySelector('form'), ta = form.querySelector('textarea'), send = form.querySelector('button');
  var hist = [];
  try { hist = JSON.parse(sessionStorage.getItem('rbc') || '[]'); } catch (e) {}

  function linkify(t){
    var e = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return e.replace(/(https?:\/\/[^\s)]*[^\s).,;:!?])([.,;:!?]*)/g, function(_, u, tail){
      var own = u.indexOf('https://rytisbalys.com') === 0;
      var label = u.indexOf('calendar.google') > -1 ? 'book 30 min' : (u.indexOf('#start') > -1 ? 'the form' : (own ? 'the guide' : u));
      return '<a href="' + u + '"' + (own ? '' : ' target="_blank" rel="noopener"') + '>' + label + '</a>' + tail;
    });
  }
  function add(role, text){ var d = document.createElement('div'); d.className = 'rbc-m ' + role; d.innerHTML = linkify(text); log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function render(){ log.innerHTML = ''; add('bot', GREETING); hist.forEach(function(m){ add(m.role === 'assistant' ? 'bot' : 'me', m.text); }); }
  function save(){ try { sessionStorage.setItem('rbc', JSON.stringify(hist.slice(-20))); } catch (e) {} }

  btn.addEventListener('click', function(){ box.classList.add('on'); btn.style.display = 'none'; render(); ta.focus(); });
  box.querySelector('.rbc-x').addEventListener('click', function(){ box.classList.remove('on'); btn.style.display = ''; });
  ta.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var q = ta.value.trim(); if (!q) return;
    hist.push({ role: 'user', text: q }); save(); add('me', q); ta.value = ''; send.disabled = true;
    var w = document.createElement('div'); w.className = 'rbc-wait'; w.textContent = 'Thinking...'; log.appendChild(w); log.scrollTop = log.scrollHeight;
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist, page: location.pathname }) })
      .then(function(r){ return r.json(); })
      .then(function(j){
        w.remove();
        if (!j.reply) throw new Error(j.error || 'no_reply');
        hist.push({ role: 'assistant', text: j.reply }); save(); add('bot', j.reply);
        if (j.done) { ta.disabled = true; hist = []; save(); }
      })
      .catch(function(){ w.remove(); add('err', 'That did not go through. Email work@rytisbalys.com and Rytis will reply himself.'); })
      .then(function(){ send.disabled = false; ta.focus(); });
  });
})();
