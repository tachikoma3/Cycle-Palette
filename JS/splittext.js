gsap.registerPlugin(SplitText, ScrollTrigger);

// =========================================
// スムーススクロール（Lenis）のセットアップ
// =========================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

// LenisのスクロールをScrollTriggerに同期
lenis.on('scroll', ScrollTrigger.update);

// LenisのrafをGSAPのtickerに乗せて、アニメーションと歩調を合わせる
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ローディング中はLenisのスクロールも止めておく
// （body.is-loadingのoverflow:hiddenだけだと、Lenisが自前でスクロールを
// 　制御しているため二重にロックしておくのが安全）
lenis.stop();

const percentEl = document.querySelector('.loader-percent');
const counter = { val: 0 };

// 日本語フォントの読み込みを待ってから開始（文字幅ズレ・SplitTextの誤分割を防ぐ）
document.fonts.ready.then(() => {

  const loadTl = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove('is-loading');
      lenis.start(); // スムーススクロールを解禁
      playHero();    // ローダーが完全に消えてからヒーロー演出を開始
    }
  });

  loadTl
    // バーが伸びる
    .to('.loader-bar-fill', {
      scaleX: 1,
      duration: 1.3,
      ease: 'power2.inOut'
    })
    // 同時に0→100%のカウントアップ
    .to(counter, {
      val: 100,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate: () => {
        percentEl.textContent = Math.floor(counter.val) + '%';
      }
    }, '<')
    // ローダーが上へスライドして退場
    .to('.loader', {
      yPercent: -100,
      duration: 0.9,
      ease: 'power3.inOut'
    });
});

function playHero() {
  // 見出しをCharacter単位に分割（#heroセクション内に限定）
  const headingSplit = SplitText.create('#hero .hero-heading', {
    type: 'chars',
    charsClass: 'char'
  });

  // 本文をCharacter単位に分割（読みやすさ優先でstagger/durationは短め）
  const leadSplit = SplitText.create('#hero .hero-lead', {
    type: 'chars',
    charsClass: 'char'
  });

  gsap.timeline()
    // 見出しは右側から勢いよく飛んでくる演出。
    // stagger起点を "start"（左の文字から）にすることで、読む順番と同じ流れで
    // 文字が着地していく。収束してくる勢いよりも、テンポよく行進していく印象になる
    .from(headingSplit.chars, {
      x: () => gsap.utils.random(120, 220),
      y: () => gsap.utils.random(-24, 24),
      rotate: () => gsap.utils.random(-20, 20),
      autoAlpha: 0,
      duration: 0.85,
      stagger: { each: 0.04, from: 'start' },
      ease: 'power4.out' // 勢いよく減速して着地。バウンドさせず一発でピタッと止める
    })
    // H1が完全に着地してから本文が動き出す（位置指定なし＝前のtweenの終わりから開始）
    .from(leadSplit.chars, {
      autoAlpha: 0,
      duration: 0.4,
      stagger: 0.012,
      ease: 'power1.out'
    })
    // 本文が表示しきってから画像がスライドイン
    .from('#hero .hero-image-wrap', {
      xPercent: -100,
      duration: 1.5,
      ease: 'power3.out'
    });
}