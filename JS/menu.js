const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  if (currentScroll > 100) {
    navbar.classList.add("show"); // スクロールで出現
  } else {
    navbar.classList.remove("show"); // トップでは非表示
  }
});