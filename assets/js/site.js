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

  function init() {
    initTheme();
    initCopyButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
