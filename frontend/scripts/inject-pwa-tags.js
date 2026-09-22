

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
    /* O Chrome pinta um fundo amarelado próprio em campos com autofill, ignorando o
       fundo do nosso Input. Esse truque do box-shadow "pinta por cima" (o navegador
       não deixa sobrescrever background-color direto). Cores do tema CLARO (padrão):
       fundo branco + texto escuro, pra combinar com o form de login. */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
      box-shadow: 0 0 0 1000px #FFFFFF inset !important;
      -webkit-text-fill-color: #0A0F1A !important;
      caret-color: #0A0F1A !important;
      transition: background-color 9999s ease-in-out 0s;
    }
  </style>
`;

html = html.replace('</head>', `${tags}</head>`);
html = html.replace('<html lang="en">', '<html lang="pt-BR" translate="no">');

fs.writeFileSync(indexPath, html);
console.log('Tags do PWA injetadas e idioma corrigido em dist/index.html');