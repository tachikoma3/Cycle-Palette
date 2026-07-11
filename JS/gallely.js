
(function() {

  const $thumbnails = $(".gallery-thumbnails img");
  const $modal = $(".image-modal");
  const $modalImg = $(".image-modal-content img");
  const $overlay = $(".image-modal-overlay");

  // ============================
  // サムネ表示アニメ（スクロール）
  // ============================
  
  gsap.from(".gallery-thumbnails li", {
    scrollTrigger: {
      trigger: ".gallery-thumbnails",
      start: "top 85%",
      toggleActions: "play none none none"
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.out",
    once: true,
  });

  // ============================
  // クリックでモーダル表示
  // ============================
  $thumbnails.on("click", function() {

    const imgSrc = $(this).attr("src");
    $modalImg.attr("src", imgSrc);

    $modal.css("display", "flex");

    gsap.fromTo(".image-modal-content",
      { 
        scale: 0.8,
        opacity: 0,
        y: 50
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      }
    );

    gsap.fromTo(".image-modal-overlay",
      { opacity: 0 },
      { opacity: 0.8, duration: 0.4 }
    );

const $credit = $(".image-credit");

$thumbnails.on("click", function() {

  const imgSrc = $(this).attr("src");
  const creditText = $(this).data("credit");

  $modalImg.attr("src", imgSrc);
  $credit.text(creditText);

  gsap.fromTo(".image-credit-link",
  { opacity: 0 },
  { opacity: 1, duration: 0.5, delay: 0.4 }
);

});

  });

  // ============================
  // 閉じる処理
  // ============================
  $(".image-close, .image-modal-overlay").on("click", function() {

    gsap.to(".image-modal-content", {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.4,
      ease: "power2.in"
    });

    gsap.to(".image-modal-overlay", {
      opacity: 0,
      duration: 0.3,
      onComplete: function() {
        $modal.css("display", "none");
      }
    });

  });

});