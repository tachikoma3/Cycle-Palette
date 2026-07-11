(function () {
  "use strict";

  // モーダル全体の親要素です。初回表示時に1回だけ作成して再利用します。
  var root = null;

  // モーダルを閉じたあと、開く前にフォーカスしていた要素へ戻すために保持します。
  var previousFocus = null;

  // aria-labelledbyや本文差し替えで使うIDです。
  var titleId = "app-modal-title";
  var bodyId = "app-modal-body";

  // CSSアニメーションで閉じる場合のタイマーを管理します。
  var closeTimer = null;

  // モーダルのHTMLを作成し、クリック/キーボード操作のイベントを登録します。
  function createRoot() {
    if (root) return root;

    root = document.createElement("div");
    root.className = "app-modal-root";
    root.innerHTML =
      '<div class="app-modal-backdrop" data-modal-close></div>' +
      '<section class="app-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="' +
      titleId +
      '" tabindex="-1">' +
      '<header class="app-modal-header">' +
      '<h2 class="app-modal-title" id="' +
      titleId +
      '"></h2>' +
      '<button class="app-modal-close" type="button" aria-label="Close modal" data-modal-close>&times;</button>' +
      "</header>" +
      '<div class="app-modal-body" id="' +
      bodyId +
      '"></div>' +
      "</section>";

    document.body.appendChild(root);
    root.addEventListener("click", onRootClick);
    document.addEventListener("keydown", onKeyDown);

    return root;
  }

  // 背景レイヤー、または閉じるボタンをクリックしたらモーダルを閉じます。
  function onRootClick(event) {
    if (event.target.closest("[data-modal-close]")) {
      close();
    }
  }

  // Escキーで閉じ、Tabキーではフォーカスがモーダル外へ出ないようにします。
  function onKeyDown(event) {
    if (!root || !root.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key === "Tab") {
      keepFocusInside(event);
    }
  }

  // モーダル内でTab移動したとき、先頭と末尾でフォーカスを循環させます。
  function keepFocusInside(event) {
    var focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // HTML文字列へ埋め込む値をエスケープして、タグとして解釈されないようにします。
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // モーダルを開くアニメーションです。GSAPがあればGSAP、なければCSS遷移を使います。
  function animateOpen(modal) {
    var dialog = modal.querySelector(".app-modal-dialog");
    var backdrop = modal.querySelector(".app-modal-backdrop");

    // 閉じる途中に再度開いた場合、前回の閉じるタイマーを止めます。
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    if (window.gsap) {
      window.gsap.killTweensOf([dialog, backdrop]);
      window.gsap.set(backdrop, { opacity: 0 });
      window.gsap.set(dialog, { opacity: 0, y: 60, scale: 0.95 });
      window.gsap.to(backdrop, {
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      });
      window.gsap.to(dialog, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      });
      return;
    }

    window.requestAnimationFrame(function () {
      modal.classList.add("is-visible");
    });
  }

  // モーダルを閉じるアニメーションです。完了後にdoneを呼んで状態を片付けます。
  function animateClose(modal, done) {
    var dialog = modal.querySelector(".app-modal-dialog");
    var backdrop = modal.querySelector(".app-modal-backdrop");

    if (window.gsap) {
      window.gsap.killTweensOf([dialog, backdrop]);
      window.gsap.to(backdrop, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
      window.gsap.to(dialog, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
        onComplete: done,
      });
      return;
    }

    modal.classList.remove("is-visible");
    closeTimer = window.setTimeout(done, 260);
  }

  // モーダル本文を差し替えます。文字列HTMLとDOMノードの両方に対応しています。
  function setContent(content) {
    var body = root.querySelector("#" + bodyId);

    if (typeof content === "string") {
      body.innerHTML = content;
      return;
    }

    if (content instanceof Node) {
      body.replaceChildren(content);
      return;
    }

    body.replaceChildren();
  }

  // 汎用モーダルを開きます。titleとcontentを受け取り、中央に表示します。
  function open(options) {
    var modal = createRoot();
    var title = options && options.title ? options.title : "";
    var content = options && options.content ? options.content : "";

    previousFocus = document.activeElement;
    modal.querySelector("#" + titleId).textContent = title;
    setContent(content);

    modal.classList.add("is-open");
    document.body.classList.add("app-modal-locked");
    animateOpen(modal);
    modal.querySelector(".app-modal-dialog").focus();
  }

  // 画像とコメントを左右に並べる専用レイアウトでモーダルを開きます。
  function openImageComment(options) {
    var title = options && options.title ? options.title : "";
    var imageSrc = options && options.imageSrc ? options.imageSrc : "";
    var imageAlt = options && options.imageAlt ? options.imageAlt : "";
    var commentTitle = options && options.commentTitle ? options.commentTitle : "Comment";
    var comment = options && options.comment ? options.comment : "";
    var link = options && options.link ? options.link : "";
    var creditText = options && options.creditText ? options.creditText : "";
    var creditLink = options && options.creditLink ? options.creditLink : "";

    // 画像部分のHTML（リンクがある場合は <a> タグで囲む）
    var mediaHtml = '<img src="' + escapeHtml(imageSrc) + '" alt="' + escapeHtml(imageAlt) + '">';
    if (link) {
      mediaHtml = '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer">' + mediaHtml + '</a>';
    }

    // クレジット部分のHTML
    var creditHtml = '';
    if (creditText) {
      if (creditLink) {
        creditHtml = '<div class="image-credit"><a href="' + escapeHtml(creditLink) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(creditText) + '</a></div>';
      } else {
        creditHtml = '<div class="image-credit">' + escapeHtml(creditText) + '</div>';
      }
    }

    // ボタン部分のHTML
    var buttonHtml = '';
    if (link) {
      buttonHtml = 
        '<div class="image-comment-action">' +
        '  <a href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer" class="app-modal-btn">' +
        '    公式サイトで詳細を見る' +
        '  </a>' +
        '</div>';
    }

    // コメント本文のエスケープ＆改行処理（HTMLに直接 <br> を書いた場合にも対応できるようにデコードを追加）
    var commentHtml = escapeHtml(comment).replace(/&lt;br&gt;/g, "<br>").replace(/&lt;br\s*\/&gt;/g, "<br>");

    open({
      title: title,
      content:
        '<div class="image-comment">' +
        '<figure class="image-comment-media">' +
        mediaHtml +
        creditHtml +
        "</figure>" +
        '<div class="image-comment-text">' +
        "<h3>" +
        escapeHtml(commentTitle) +
        "</h3>" +
        "<pre>" +
        commentHtml +
        "</pre>" +
        buttonHtml +
        "</div>" +
        "</div>",
    });
  }

  // モーダルを閉じます。閉じ終わったらスクロール固定を解除し、元のフォーカスへ戻します。
  function close() {
    if (!root || !root.classList.contains("is-open")) return;

    animateClose(root, function () {
      root.classList.remove("is-open", "is-visible");
      document.body.classList.remove("app-modal-locked");

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    });
  }

  // 外部のJSから Modal.open(...) のように呼べるように公開します。
  window.Modal = {
    open: open,
    openImageComment: openImageComment,
    close: close,
  };
})();