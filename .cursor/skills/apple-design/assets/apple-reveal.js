/* ============================================================
   Apple-style scroll reveal + gentle parallax
   Usage:
     <script src="apple-reveal.js" defer></script>
     add class "reveal" to elements to fade-up on scroll
     add class "reveal-group" to a parent to stagger its .reveal children
     add data-parallax="0.15" to elements for subtle parallax
   Honors prefers-reduced-motion (shows final state, no motion).
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealAll() {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
    document.querySelectorAll(".reveal-group").forEach(function (el) { el.classList.add("is-visible"); });
  }

  document.addEventListener("DOMContentLoaded", function () {

    // Reduced motion or no IntersectionObserver: just show everything.
    if (reduce || !("IntersectionObserver" in window)) { revealAll(); return; }

    // Auto-index children of reveal-groups so CSS can stagger via --i.
    document.querySelectorAll(".reveal-group").forEach(function (group) {
      group.querySelectorAll(":scope > .reveal").forEach(function (child, i) {
        if (!child.style.getPropertyValue("--i")) child.style.setProperty("--i", i);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target); // reveal once, then stop watching
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(".reveal, .reveal-group").forEach(function (el) { io.observe(el); });

    // Gentle parallax on data-parallax elements, rAF-throttled.
    var parallax = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (parallax.length) {
      var ticking = false;
      var update = function () {
        var vh = window.innerHeight;
        parallax.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          var factor = parseFloat(el.getAttribute("data-parallax")) || 0.15;
          var offset = (rect.top + rect.height / 2 - vh / 2) * -factor;
          el.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0)";
        });
        ticking = false;
      };
      var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      update();
    }
  });
})();
