(function () {
  "use strict";
  var root = document.documentElement;
  var base = document.body.getAttribute("data-root") || "";
  var onHome = base === "";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }

  /* theme */
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var light = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  root.setAttribute("data-theme", saved || (light ? "light" : "dark"));
  var tbtn = $("#theme-toggle");
  function paintTheme() { if (tbtn) tbtn.textContent = root.getAttribute("data-theme") === "light" ? "☾" : "☀"; }
  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    paintTheme();
  }
  paintTheme();
  if (tbtn) tbtn.addEventListener("click", toggleTheme);

  /* mobile menu */
  var mbtn = $("#menu-btn"), links = $("#nav-links");
  if (mbtn && links) {
    mbtn.addEventListener("click", function () { links.classList.toggle("open"); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
  }

  /* reading progress */
  var bar = $("#progress");
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* reveal + trace rail */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  var railLinks = $$("#rail a");
  if (railLinks.length && "IntersectionObserver" in window) {
    var spans = $$("[data-span]");
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          railLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-for") === en.target.id); });
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    spans.forEach(function (s) { ro.observe(s); });
  }

  /* typed prompt */
  var typed = $("#typed");
  if (typed && !reduce) {
    var full = typed.textContent; typed.textContent = "";
    var i = 0;
    (function tick() { typed.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(tick, 38); })();
  }

  /* agent run simulation */
  var rows = $$("#spans .sp");
  if (rows.length) {
    var logEl = $("#run-log"), runB = $("#run"), failB = $("#run-fail"), apprB = $("#approve"), rejB = $("#reject");
    var timer = null;
    var labels = ["1", "2", "3", "4", "5"];
    function say(t) { logEl.textContent = t; }
    function setRow(i, cls, sym) { rows[i].className = "sp " + cls; rows[i].querySelector(".b").textContent = sym || labels[i]; }
    function reset() {
      clearTimeout(timer);
      rows.forEach(function (r, i) { r.className = "sp"; r.querySelector(".b").textContent = labels[i]; });
      apprB.hidden = true; rejB.hidden = true; runB.disabled = false; failB.disabled = false;
    }
    function run(fail) {
      reset(); runB.disabled = true; failB.disabled = true; say("run started (simulated)");
      var i = 0, step = reduce ? 200 : 750;
      (function next() {
        if (i > 2) { setRow(3, "wait", "!"); apprB.hidden = false; rejB.hidden = false; say("waiting for human approval: preview is ready, nothing is live yet"); return; }
        setRow(i, "run", "…");
        timer = setTimeout(function () {
          if (i === 2 && fail) {
            setRow(2, "bad", "✕");
            say("check failed: output is empty. The agent stopped and reported the failure instead of saying done.");
            runB.disabled = false; failB.disabled = false; return;
          }
          setRow(i, "ok", "✓");
          say(["plan created", "change saved and result generated", "check passed: output exists and is not empty"][i]);
          i++; next();
        }, step);
      })();
    }
    runB.addEventListener("click", function () { run(false); });
    failB.addEventListener("click", function () { run(true); });
    apprB.addEventListener("click", function () {
      apprB.hidden = true; rejB.hidden = true; setRow(3, "ok", "✓"); setRow(4, "run", "…"); say("approved by a person, going live");
      timer = setTimeout(function () { setRow(4, "ok", "✓"); say("live after human approval. Report sent."); runB.disabled = false; failB.disabled = false; }, reduce ? 150 : 700);
    });
    rejB.addEventListener("click", function () {
      apprB.hidden = true; rejB.hidden = true; setRow(3, "bad", "✕");
      say("rejected by a person: nothing went live. The agent can revise and ask again.");
      runB.disabled = false; failB.disabled = false;
    });
  }

  /* command palette */
  var home = onHome ? "" : base + "index.html";
  var items = [
    { t: "Profile", g: "section", h: home + "#profile" },
    { t: "Case studies", g: "section", h: home + "#work" },
    { t: "How I build agents", g: "section", h: home + "#how" },
    { t: "Experience", g: "section", h: home + "#experience" },
    { t: "Stack", g: "section", h: home + "#stack" },
    { t: "Ask my profile", g: "section", h: home + "#ask" },
    { t: "Writing and awards", g: "section", h: home + "#writing" },
    { t: "Contact", g: "section", h: home + "#contact" },
    { t: "Case study: Making AI agents safe to run on live stores", g: "case study", h: base + "case-studies/safe-agents.html" },
    { t: "Case study: Face-Forward", g: "case study", h: base + "case-studies/face-forward.html" },
    { t: "Case study: SmartLeads-AI CRM", g: "case study", h: base + "case-studies/smartleads-ai.html" },
    { t: "Resume", g: "page", h: base + "resume.html" },
    { t: "Email gibrailzaidi@gmail.com", g: "contact", h: "mailto:gibrailzaidi@gmail.com" },
    { t: "LinkedIn", g: "link", h: "https://www.linkedin.com/in/gibrailzaidi/", ext: true },
    { t: "GitHub", g: "link", h: "https://github.com/Gibrail404", ext: true },
    { t: "Medium", g: "link", h: "https://medium.com/@gibrailzaidi", ext: true },
    { t: "Medium article: Why an AI agent should never say done", g: "link", h: "https://medium.com/@gibrailzaidi/why-an-ai-agent-should-never-say-done-until-it-has-checked-b7a6f9748ed5", ext: true },
    { t: "Toggle light and dark theme", g: "action", a: toggleTheme }
  ];
  var back = $("#pal-back"), pin = $("#pal-input"), plist = $("#pal-list"), pbtn = $("#pal-open");
  var sel = 0, shown = [], lastFocus = null;
  function score(q, s) {
    q = q.toLowerCase(); s = s.toLowerCase();
    if (!q) return 1;
    if (s.indexOf(q) >= 0) return 100 - s.indexOf(q);
    var j = 0, k;
    for (k = 0; k < s.length && j < q.length; k++) { if (s[k] === q[j]) j++; }
    return j === q.length ? 10 : 0;
  }
  function render() {
    var q = pin.value.trim();
    shown = items.map(function (it) { return { it: it, s: score(q, it.t + " " + it.g) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (x) { return x.it; });
    if (sel >= shown.length) sel = 0;
    plist.innerHTML = "";
    if (!shown.length) { plist.innerHTML = '<li class="empty">No match. Try "case", "resume" or "email".</li>'; return; }
    shown.forEach(function (it, idx) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "option"); b.setAttribute("aria-selected", idx === sel ? "true" : "false");
      b.innerHTML = "<span></span><span class='t'></span>";
      b.firstChild.textContent = it.t; b.lastChild.textContent = it.g;
      b.addEventListener("click", function () { choose(it); });
      b.addEventListener("mousemove", function () { sel = idx; mark(); });
      li.appendChild(b); plist.appendChild(li);
    });
  }
  function mark() { $$("#pal-list button").forEach(function (b, i) { b.setAttribute("aria-selected", i === sel ? "true" : "false"); }); }
  function openPal() {
    if (!back) return;
    lastFocus = document.activeElement; back.classList.add("open"); pin.value = ""; sel = 0; render(); setTimeout(function () { pin.focus(); }, 0);
  }
  function closePal() { if (!back) return; back.classList.remove("open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function choose(it) {
    closePal();
    if (it.a) { it.a(); return; }
    if (it.ext) { window.open(it.h, "_blank", "noopener"); return; }
    window.location.href = it.h;
  }
  if (back) {
    if (pbtn) pbtn.addEventListener("click", openPal);
    back.addEventListener("click", function (e) { if (e.target === back) closePal(); });
    pin.addEventListener("input", function () { sel = 0; render(); });
    pin.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); mark(); scrollSel(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); scrollSel(); }
      else if (e.key === "Enter") { e.preventDefault(); if (shown[sel]) choose(shown[sel]); }
      else if (e.key === "Tab") { e.preventDefault(); }
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); back.classList.contains("open") ? closePal() : openPal(); }
      else if (e.key === "Escape" && back.classList.contains("open")) { closePal(); }
    });
  }
  function scrollSel() { var b = $$("#pal-list button")[sel]; if (b && b.scrollIntoView) b.scrollIntoView({ block: "nearest" }); }

  /* ask my profile (scripted, keyword match) */
  var qaLog = $("#qa-log");
  if (qaLog) {
    var QA = [
      { q: "How do you evaluate agents?", k: ["eval", "evaluate", "test", "quality", "measure", "metric"], a: "I put quality gates before anything is published, trace what the system did, and turn every production failure into a test case so it cannot come back unnoticed." },
      { q: "What is your stack?", k: ["stack", "tools", "technology", "tech", "framework", "langchain", "skills", "database", "vector"], a: "Agents: LLM tool calling, multi-agent orchestration, MCP, human-in-the-loop, browser-automation agents, LangChain, n8n. Retrieval: RAG, embeddings, Pinecone, Qdrant, MongoDB Vector Search. Also Gemini API, TensorFlow.js, Docker, AWS and CI/CD." },
      { q: "How do you do human approval?", k: ["approval", "human", "hitl", "approve", "loop", "review", "gate"], a: "When an agent is unsure it asks a structured question with options and a response ID. For bigger changes it builds previews first, a person approves, and only then does anything go live." },
      { q: "What have you shipped?", k: ["shipped", "built", "project", "work", "production", "experience", "done"], a: "At Helium: an LLM generation pipeline, an A/B testing agent and an MCP server added to a multi-agent platform, a human-in-the-loop clarification tool and a keyword research pipeline. Outside work: SafePay Command, a deployed AI payment-risk platform with a LightGBM risk model, rules and a tamper-evident audit ledger." },
      { q: "Do you work with MCP?", k: ["mcp", "protocol", "model context"], a: "Yes. I built an MCP server so AI clients can create, preview and activate A/B experiments through a fixed action catalog." },
      { q: "Are you open to Dubai?", k: ["dubai", "uae", "relocate", "available", "availability", "hire", "open", "remote", "join", "notice"], a: "Yes, I am open to Applied AI Engineer roles in Dubai/UAE and remote. Email gibrailzaidi@gmail.com or message me on LinkedIn." },
      { q: "Tell me about a failure", k: ["failure", "bug", "mistake", "wrong", "failed", "retry", "selector", "lesson"], a: "An agent built selectors from an element id. On pages where a child input was named id, it got an object instead of a string and kept retrying. The fix was to read the attribute, validate it, and fall back to a structural path. Lesson: agents amplify small bugs because they retry." },
      { q: "How can I contact you?", k: ["contact", "email", "reach", "linkedin", "resume", "cv", "github"], a: "Email gibrailzaidi@gmail.com, LinkedIn linkedin.com/in/gibrailzaidi, GitHub github.com/Gibrail404. My resume is on the Resume page." }
    ];
    var chips = $("#qa-chips"), form = $("#qa-form"), input = $("#qa-input");
    function addMsg(t, cls) { var d = document.createElement("div"); d.className = "msg " + cls; d.textContent = t; qaLog.appendChild(d); qaLog.scrollTop = qaLog.scrollHeight; }
    function answer(text) {
      var q = text.toLowerCase(), best = null, bs = 0;
      QA.forEach(function (e) { var s = 0; e.k.forEach(function (w) { if (q.indexOf(w) >= 0) s++; }); if (e.q.toLowerCase() === q) s += 5; if (s > bs) { bs = s; best = e; } });
      return best ? best.a : "I do not have a scripted answer for that. Please email me at gibrailzaidi@gmail.com and I will reply.";
    }
    function ask(text) { text = (text || "").trim(); if (!text) return; addMsg(text, "q"); setTimeout(function () { addMsg(answer(text), "a"); }, reduce ? 0 : 350); }
    QA.slice(0, 6).forEach(function (e) {
      var b = document.createElement("button"); b.type = "button"; b.className = "btn sm"; b.textContent = e.q;
      b.addEventListener("click", function () { ask(e.q); }); chips.appendChild(b);
    });
    form.addEventListener("submit", function (ev) { ev.preventDefault(); ask(input.value); input.value = ""; });
  }

  /* architecture explorer */
  var nodes = $$(".xnode"), panel = $("#xpanel");
  if (nodes.length && panel) {
    function show(n) {
      nodes.forEach(function (x) { x.setAttribute("aria-pressed", x === n ? "true" : "false"); });
      panel.querySelector("h4").textContent = n.getAttribute("data-t");
      panel.querySelector(".da").textContent = n.getAttribute("data-a");
      panel.querySelector(".db").textContent = n.getAttribute("data-b");
      panel.querySelector(".dc").textContent = n.getAttribute("data-c");
    }
    nodes.forEach(function (n) { n.addEventListener("click", function () { show(n); }); });
    show(nodes[0]);
  }
})();
