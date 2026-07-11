// .feature 要素をすべて配列として取得し、1つずつ処理
gsap.utils.toArray(".feature").forEach(section => {

  // 各セクション内の画像とテキスト要素を取得
  const img = section.querySelector(".feature__img");
  const text = section.querySelector(".feature__text");

  // セクションごとにタイムラインを生成
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,      // このセクションがトリガー
      start: "top 80%"       // セクション上部が画面の80%位置に来たら発火
      // once: true をここに書くとScrollTrigger全体を1回だけにできる
    }
  });

  // ① 画像のアニメーション
  tl.from(img, {
    x: -80,              // 左からスライドイン
    opacity: 0,          // 透明状態から表示
    duration: 0.8,       // アニメーション時間
    ease: "power3.out",  // やや強めのイージング
    once: true,          // ※本来はScrollTrigger側に設定するのが推奨
  })

  // ② テキストのアニメーション
  .from(text, {
    x: 80,               // 右からスライドイン
    opacity: 0,          // 透明状態から表示
    duration: 0.8,       
    delay: 0.2,          // 少し遅らせて開始
    ease: "power3.out",
    once: true,          // ※ScrollTrigger側に設定するのが正しい
  }, "-=0.6");            // 画像アニメーション終了0.6秒前から同時進行
});