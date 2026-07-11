(function () {
  "use strict";

  // モーダルの検索範囲にするdivです。
  // このdivの外側にあるコメントやpタグは拾いません。
  // このクラスでモーダル内の画像とコメントを反映させます。
  var scopeSelector = "div[data-image-comment], div.modal-img";

  // Modal本体がない場合は、何もせず終了します。
  if (!window.Modal) return;

  // 余分な空白や改行を1つの半角スペースに整えて、前後の空白を削除します。
  function cleanText(value) {
    return String(value || "").replace(/[^\S\r\n]+/g, " ").trim();
  }

  // 画像とコメントを探す範囲を、指定したdiv内だけに限定します。
  function findContainer(element) {
    return element.closest(scopeSelector);
  }

  // クリックされた要素から、モーダルに表示する画像を見つけます。
  // data-image-selectorを使う場合も、指定divの中だけを検索します。
  function findImage(trigger, container) {
    var selector = trigger.getAttribute("data-image-selector");
    var selected = selector ? container.querySelector(selector) : null;

    return (
      selected ||
      (trigger.matches("img") ? trigger : null) ||
      trigger.querySelector("img") ||
      container.querySelector("img")
    );
  }

  // モーダル本文に表示するコメントを取得します。
  // 優先順位は /* ... */、data-comment、p/figcaption、フォールバック文です。
  function findCommentText(container, image) {
    var selector = image.getAttribute("data-comment-selector");
    var selected = selector ? container.querySelector(selector) : null;
    var blockComment = findBlockComment(container);
    var paragraph = selected || container.querySelector("pre, figcaption");

    return (
      cleanText(blockComment) ||
      cleanText(image.getAttribute("data-comment")) ||
      cleanText(paragraph && paragraph.textContent) ||
      "No comment text was found."
    );
  }

  // HTMLコメント内、または要素のHTML文字列内から /* ... */ の本文を探します。
  function findBlockComment(container) {
    var htmlComment = findBlockCommentFromHtmlComments(container);
    var markupComment = findBlockCommentFromText(container.innerHTML || "");

    return htmlComment || markupComment;
  }

  // HTMLのコメントノードだけを走査して、コメント内の /* ... */ を探します。
  function findBlockCommentFromHtmlComments(container) {
    var walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_COMMENT,
      null
    );
    var node = walker.nextNode();

    while (node) {
      var text = findBlockCommentFromText(node.nodeValue);
      if (text) return text;
      node = walker.nextNode();
    }

    return "";
  }

  // 文字列から最初に見つかった /* ... */ の中身だけを取り出します。
  function findBlockCommentFromText(text) {
    var match = String(text || "").match(/\/\*([\s\S]*?)\*\//);
    return match ? match[1] : "";
  }

  // モーダル内のコメントタイトルを取得します。
  // altを最優先にして、未設定ならdata属性や見出しを使います。
  function findCommentTitle(container, image) {
    var titleSelector = image.getAttribute("data-comment-title-selector");
    var selected = titleSelector ? container.querySelector(titleSelector) : null;
    var heading = selected || container.querySelector("h1, h2, h3, h4, h5, h6");

    return (
      cleanText(image.getAttribute("alt")) ||
      cleanText(image.getAttribute("data-comment-title")) ||
      cleanText(heading && heading.textContent) ||
      "Comment"
    );
  }

  // 対象要素、またはその内側をクリックしたときにモーダルを開きます。
  // documentで受けるため、後から追加された要素にもそのまま効きます。
  document.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) return;

    var container = findContainer(event.target);
    if (!container) return;

    var trigger = event.target.closest("[data-image-comment-trigger]") || container;
    if (!container.contains(trigger)) return;

    var target = trigger;
    var image = findImage(target, container);
    if (!image) return;

    Modal.openImageComment({
      title: cleanText(image.getAttribute("data-modal-title")) || "",
      imageSrc: image.currentSrc || image.src,
      imageAlt: cleanText(image.getAttribute("alt")),
      commentTitle: findCommentTitle(container, image),
      comment: findCommentText(container, image),
      link: image.getAttribute("data-link") || "",
      creditText: image.getAttribute("data-credit") || "",
      creditLink: image.getAttribute("data-credit-link") || "",
    });
  });
})();
