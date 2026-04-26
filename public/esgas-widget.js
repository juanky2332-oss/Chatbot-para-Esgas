/* ESGAS Chatbot Widget — incluye en tu web con:
   <script src="https://chatbot-para-esgas.vercel.app/esgas-widget.js" defer></script>
*/
(function () {
    if (document.getElementById('esgas-chat-frame')) return;

    var EMBED_URL = 'https://chatbot-para-esgas.vercel.app/embed';

    // Sizes (px)
    var BTN_W  = 160;
    var BTN_H  = 185;
    var CHAT_W = 460;
    var CHAT_H = 628;

    var iframe = document.createElement('iframe');
    iframe.id  = 'esgas-chat-frame';
    iframe.src = EMBED_URL;
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.style.cssText = [
        'position:fixed',
        'bottom:0',
        'right:0',
        'width:'  + BTN_W  + 'px',
        'height:' + BTN_H  + 'px',
        'border:none',
        'z-index:2147483647',
        'overflow:hidden',
        'background:transparent',
        'transition:width 0.3s ease, height 0.3s ease',
    ].join(';');

    // Defer insertion until body exists
    function mount() { document.body.appendChild(iframe); }
    if (document.body) { mount(); }
    else { document.addEventListener('DOMContentLoaded', mount); }

    // Resize iframe when chat opens / closes
    window.addEventListener('message', function (e) {
        if (!e.data || e.data.type !== 'esgas-chat-open') return;
        if (e.data.open) {
            iframe.style.width  = CHAT_W + 'px';
            iframe.style.height = CHAT_H + 'px';
        } else {
            iframe.style.width  = BTN_W  + 'px';
            iframe.style.height = BTN_H  + 'px';
        }
    });
})();
