

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const tags = `
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#6D8196" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <meta name="google" content="notranslate" />
  <style>
    /* Fundo antes do JS carregar = tema padrão (escuro), sem clarão branco na abertura.
       O autofill dos campos é tratado no App.tsx (transição) + Input.tsx (cor do texto),
       que seguem o tema ativo. */
    html, body { background-color: #2B2B2B; }
  </style>
`;

html = html.replace('</head>', `${tags}</head>`);
// viewport-fit=cover: sem isso o iPhone (notch/Dynamic Island) informa 0 de área
// segura (env(safe-area-inset-*)) e o topo colorido não sobe até atrás do relógio —
// a faixa da status bar (App.tsx) e o padding do topo da Início dependem desse valor.
html = html.replace(
  /<meta name="viewport" content="([^"]*)"/,
  (tag, conteudo) => (conteudo.includes('viewport-fit') ? tag : `<meta name="viewport" content="${conteudo}, viewport-fit=cover"`),
);
html = html.replace('<html lang="en">', '<html lang="pt-BR" translate="no">');

fs.writeFileSync(indexPath, html);
console.log('Tags do PWA injetadas e idioma corrigido em dist/index.html');