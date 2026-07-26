/* Detection & Response — shared behaviour.
   Two jobs: the theme toggle, and copy buttons on code blocks.
   No dependencies; safe to load with `defer`.

   Note: the initial theme is applied by a tiny inline script in each page's
   <head> so there's no flash of the wrong palette before this file runs. */

(function () {
  "use strict";

  var STORAGE_KEY = "dr-theme";

  /* ---------- Theme toggle ---------- */

  function currentTheme() {
    var forced = document.documentElement.getAttribute("data-theme");
    if (forced === "dark" || forced === "light") return forced;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* private mode / storage disabled — the toggle still works for this page */
    }
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    });
  }

  function initTheme() {
    var buttons = document.querySelectorAll(".theme-toggle");
    if (!buttons.length) return;
    applyTheme(currentTheme());
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
      });
    });
  }

  /* ---------- Copy buttons on code blocks ---------- */

  function initCopyButtons() {
    document.querySelectorAll(".article pre").forEach(function (pre) {
      if (pre.parentElement && pre.parentElement.classList.contains("code-block")) return;

      var wrap = document.createElement("div");
      wrap.className = "code-block";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      wrap.appendChild(btn);

      btn.addEventListener("click", function () {
        var text = pre.innerText;
        var done = function () {
          btn.textContent = "copied";
          btn.classList.add("copied");
          setTimeout(function () {
            btn.textContent = "copy";
            btn.classList.remove("copied");
          }, 1600);
        };
        var fail = function () {
          btn.textContent = "failed";
          setTimeout(function () { btn.textContent = "copy"; }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fail);
        } else {
          // Fallback for non-secure contexts (e.g. opening the file over file://)
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy") ? done() : fail(); } catch (e) { fail(); }
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------- Post search + tag filter (index only) ---------- */

  function initPostFilter() {
    var search = document.getElementById("postSearch");
    var tagsBox = document.getElementById("filterTags");
    var noResults = document.getElementById("noResults");
    if (!search || !tagsBox) return;

    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".post-card[data-tags]")
    );
    // The "coming soon" card isn't a real post — hide it whenever a filter is on.
    var placeholders = Array.prototype.slice.call(
      document.querySelectorAll(".post-card[data-placeholder]")
    );
    if (!cards.length) return;

    // Index each card's searchable text once, up front.
    cards.forEach(function (card) {
      card._tags = (card.dataset.tags || "").split("|").filter(Boolean);
      card._text = card.textContent.toLowerCase() + " " + card._tags.join(" ");
    });

    // Tag chips are derived from the cards, so a new post's tags appear here
    // automatically — nothing to keep in sync by hand.
    var seen = {};
    var tags = [];
    cards.forEach(function (card) {
      card._tags.forEach(function (t) {
        if (!seen[t]) { seen[t] = true; tags.push(t); }
      });
    });
    tags.sort();

    var activeTag = "all";
    var query = "";
    var buttons = [];

    function label(t) {
      return t.replace(/\b\w/g, function (c) { return c.toUpperCase(); })
              .replace(/\b(Mcp|Yara|Dfir)\b/g, function (m) { return m.toUpperCase(); });
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var tagOk = activeTag === "all" || card._tags.indexOf(activeTag) !== -1;
        var textOk = query === "" || card._text.indexOf(query) !== -1;
        var ok = tagOk && textOk;
        card.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      var filtering = activeTag !== "all" || query !== "";
      placeholders.forEach(function (p) { p.style.display = filtering ? "none" : ""; });
      if (noResults) noResults.hidden = shown > 0;
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.tag === activeTag));
      });
    }

    function addButton(value, text) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-tag";
      b.dataset.tag = value;
      b.textContent = text;
      b.setAttribute("aria-pressed", String(value === activeTag));
      b.addEventListener("click", function () {
        activeTag = activeTag === value ? "all" : value;
        apply();
      });
      tagsBox.appendChild(b);
      buttons.push(b);
    }

    addButton("all", "All");
    tags.forEach(function (t) { addButton(t, label(t)); });

    search.addEventListener("input", function () {
      query = search.value.trim().toLowerCase();
      apply();
    });

    apply();
  }

  /* ---------- GoatCounter outbound-link events ---------- */
  /* Mirrors the handler in the portfolio and Malware Analysis Series, so all
     three sites report comparable events into the same GoatCounter account.
     count.js (loaded in the page head) already counts page views; this only
     adds click events for links that leave the site. Internal links are left
     alone — navigating to them produces a page view for the destination, and
     counting the click as well would double-count. */

  var GOATCOUNTER_URL = "https://shaddy43.goatcounter.com/count";
  var SITE = "DetectionAndResponse";

  function slugify(text) {
    return text.toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function trackEvent(name, title) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: name, title: title, event: true });
    } else {
      // count.js not loaded yet (still downloading, or blocked): hit the
      // pixel endpoint directly so the click is not lost.
      (new Image()).src = GOATCOUNTER_URL +
        "?p=" + encodeURIComponent(name) +
        "&t=" + encodeURIComponent(title) +
        "&e=true";
    }
  }

  function initOutboundTracking() {
    function handleClick(e) {
      // auxclick covers middle-click (open in new tab); ignore right-click
      if (e.type === "auxclick" && e.button !== 1) return;

      var target = e.target;
      if (!target || typeof target.closest !== "function") return;
      var link = target.closest("a[href]");
      if (!link) return;

      // Prefer an explicit, stable event name where the markup provides one
      // (certification badges and detection-file links use data-event, because
      // their link text would otherwise slugify into something unreadable or
      // ambiguous — several links read just "raw").
      if (link.dataset.event) {
        trackEvent(link.dataset.event, link.href);
        return;
      }

      // Otherwise track links to a different host: nav links out to the
      // portfolio and Malware Analysis Series, whoami socials, references.
      if (link.host && link.host !== location.host) {
        var label = (link.textContent || "").trim() || link.href;
        trackEvent(SITE + "-outbound-" + slugify(label), link.href);
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("auxclick", handleClick);
  }

  function init() {
    initTheme();
    initCopyButtons();
    initPostFilter();
    initOutboundTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
