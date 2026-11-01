(function () {
  var root = document.documentElement;

  // theme
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  root.setAttribute("data-theme", saved || (prefersLight ? "light" : "dark"));
  var toggle = document.getElementById("theme-toggle");
  function paint() { if (toggle) toggle.textContent = root.getAttribute("data-theme") === "light" ? "☾" : "☀"; }
  paint();
  if (toggle) toggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    paint();
  });

  // mobile menu
  var menu = document.getElementById("menu-btn");
  var links = document.getElementById("nav-links");
  if (menu && links) {
    menu.addEventListener("click", function () { links.classList.toggle("open"); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
  }

  // reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add("in"); }); }

  // agent simulation (clearly labelled as a simulation in the page)
  var list = document.getElementById("demo-steps");
  var runBtn = document.getElementById("demo-run");
  var failBtn = document.getElementById("demo-fail");
  var approveBtn = document.getElementById("demo-approve");
  if (!list || !runBtn) return;

  var steps = [].slice.call(list.querySelectorAll(".step"));
  var timer = null;
  function reset() {
    clearTimeout(timer);
    steps.forEach(function (s) { s.className = "step"; s.querySelector(".badge").textContent = s.getAttribute("data-n"); });
    approveBtn.hidden = true; runBtn.disabled = false; failBtn.disabled = false;
  }
  function mark(i, cls, sym) { steps[i].className = "step " + cls; if (sym) steps[i].querySelector(".badge").textContent = sym; }
  function run(simulateFail) {
    reset(); runBtn.disabled = true; failBtn.disabled = true;
    var i = 0;
    (function next() {
      if (i >= 4) return;
      mark(i, "active");
      timer = setTimeout(function () {
        if (i === 2 && simulateFail) { mark(2, "fail", "✕"); steps[2].querySelector(".txt").textContent = "Check failed: output is empty. Stopped and reported honestly."; runBtn.disabled = false; failBtn.disabled = false; return; }
        if (i === 3) { mark(3, "wait", "!"); approveBtn.hidden = false; return; }
        mark(i, "done", "✓"); i++; next();
      }, 800);
    })();
  }
  runBtn.addEventListener("click", function () { run(false); });
  failBtn.addEventListener("click", function () { run(true); });
  approveBtn.addEventListener("click", function () {
    approveBtn.hidden = true;
    mark(3, "done", "✓");
    mark(4, "done", "✓");
    steps[4].querySelector(".txt").textContent = "Live (after human approval)";
    runBtn.disabled = false; failBtn.disabled = false;
  });
})();
