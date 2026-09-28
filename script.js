(() => {
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  const queryTheme = new URLSearchParams(location.search).get("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial =
    queryTheme === "light" || queryTheme === "dark"
      ? queryTheme
      : stored || (prefersLight ? "light" : "dark");
  root.dataset.theme = initial;

  const nav = document.querySelector(".nav");
  const themeBtn = document.querySelector(".theme");

  const setTheme = (next) => {
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
    draw();
  };

  themeBtn?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  const onScroll = () => {
    nav?.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const canvas = document.getElementById("field");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;
  let raf;

  const colour = () =>
    getComputedStyle(root).getPropertyValue("--accent").trim() || "#e8ff47";
  const ink = () =>
    getComputedStyle(root).getPropertyValue("--muted").trim() || "#9a978c";

  const draw = () => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = ink();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;

    for (let x = 20; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, h - 10);
      ctx.stroke();
    }
    for (let y = 20; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.strokeStyle = colour();
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120;
      const x = 24 + u * (w - 48);
      const y =
        h / 2 +
        Math.sin(u * Math.PI * 4 + t) * 38 +
        Math.sin(u * Math.PI * 9 + t * 1.7) * 12;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const px = 24 + ((t * 18) % (w - 48));
    const py =
      h / 2 +
      Math.sin(((px - 24) / (w - 48)) * Math.PI * 4 + t) * 38;
    ctx.fillStyle = colour();
    ctx.beginPath();
    ctx.arc(px, py, 3.2, 0, Math.PI * 2);
    ctx.fill();
  };

  const tick = () => {
    t += 0.025;
    draw();
    raf = requestAnimationFrame(tick);
  };

  draw();
  if (!reduced) tick();

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "light" : "dark");
    }
  });

  window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
})();
