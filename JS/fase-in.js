// IntersectionObserver
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        obs.unobserve(entry.target); // 監視解除 → 1度だけ
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".slide-in").forEach(el => observer.observe(el));

  