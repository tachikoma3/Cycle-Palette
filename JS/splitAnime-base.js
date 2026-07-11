// DOMが完全に読み込まれてから処理を開始
document.addEventListener("DOMContentLoaded", () => {

  // ScrollTriggerプラグインを有効化
  gsap.registerPlugin(ScrollTrigger);

  // =========================================
  // 文字分割関数（安全設計込み）
  // =========================================
  function simpleSplit(selector) {

    // 指定セレクタの要素を取得
    const el = document.querySelector(selector);

    // 要素が存在しない場合は処理を終了（エラー防止）
    if (!el) return null;

    // テキストを1文字ずつ分割
    const chars = el.textContent.split("");

    // 各文字をラップして再構築
    // ※スペースはそのまま保持
    el.innerHTML = chars
      .map(c => c === " "
        ? " "
        : `<h1 class="hero-top">${c}</h1>`)
      .join("");

    // 分割後の要素をNodeListで返す
    return el.querySelectorAll(".hero-top");
  }

  // =========================================
  // タイトル文字の分割実行
  // =========================================
  const chars = simpleSplit(".title");

  // =========================================
  // タイトルのスクロール連動アニメーション
  // =========================================
  gsap.from(chars, {
    y: 40,                // 下から浮き上がる動き
    opacity: 0,           // 透明状態から表示
    stagger: 0.03,        // 文字ごとに時間差をつける
    duration: 0.8,
    ease: "power3.out",

    scrollTrigger: {
      trigger: ".title",        // .titleがトリガー
      start: "top 60%",         // 要素上部が画面の60%位置に来たら発火
      toggleActions: "play none none none", // 一度再生のみ
      once: true,               // 1回のみ実行
    }
  });

  // =========================================
  // コメントエリアのスライドイン
  // =========================================
  gsap.from(".hero-comment",  {
    x: -500,               // 左からスライド
    opacity: 0,            // フェードインを追加するとより自然
    duration: 1,
    ease: "power2.out",

    scrollTrigger: {
      trigger: ".hero-comment",
      start: "top 60%",
      once: true,
    }
  });

  // =========================================
  // ヒーロー画像のスライドイン
  // =========================================
  gsap.from(".hero-img",  {
    x: 500,                // 右からスライド
    opacity: 0,
    duration: 1,
    ease: "power2.out",
    delay: 0.3,            // 少し遅らせて視線誘導

    scrollTrigger: {
      trigger: ".hero-img",
      start: "top 60%",
      once: true,
    }
  });

});