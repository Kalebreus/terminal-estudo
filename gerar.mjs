import { readFile, writeFile, mkdir } from 'node:fs/promises';

const characters = JSON.parse(await readFile('personagens.json', 'utf8'));
const hero = characters.find(character => character.id === 'guts');
const types = [
  { id: 'poster', name: 'Pôster', detail: 'Arte impressa · A3', price: 3990 },
  { id: 'camiseta', name: 'Camiseta', detail: 'Algodão · Modelagem unissex', price: 8990 },
  { id: 'caneca', name: 'Caneca', detail: 'Cerâmica · 325 ml', price: 5490 },
  { id: 'adesivos', name: 'Kit de adesivos', detail: 'Vinil · Kit com 4 unidades', price: 2490 },
  { id: 'ecobag', name: 'Ecobag', detail: 'Algodão cru · 35 × 40 cm', price: 6490 },
  { id: 'chaveiro', name: 'Chaveiro', detail: 'Acrílico · 5 cm', price: 2990 }
];
const money = cents => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = value => String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
const photo = (character, root = './') => root + encodeURIComponent(character.image);
const profile = (character, root = './') => root + 'personagens/' + character.id + '.html';
const theme = character => `style="--accent:${character.color};--tone:${character.tone}"`;
const image = (character, root, loading = 'lazy') => `<img src="${photo(character, root)}" alt="Arte de ${esc(character.name)}" loading="${loading}">`;
const brand = '<span class="brand-icon" aria-hidden="true">✦</span><span>ARQUIVO<span class="brand-accent">GEEK</span></span>';
const search = (id, label) => `<label class="search"><span aria-hidden="true">⌕</span><input id="${id}" type="search" placeholder="${label}" aria-label="${label}"></label>`;
const page = ({ title, description, main, current = '', root = './' }) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0c0d10">
<meta name="description" content="${esc(description)}">
<title>${esc(title)} | Arquivo Geek</title>
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${root}style.css">
<script src="${root}index.js" defer></script>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header"><div class="shell header-inner">
<a class="brand" href="${root}index.html" aria-label="Arquivo Geek, início">${brand}</a>
<nav aria-label="Menu principal">
<a href="${root}index.html"${current === 'home' ? ' aria-current="page"' : ''}>Início</a>
<a href="${root}index.html#colecao"${current === 'character' ? ' aria-current="location"' : ''}>Personagens</a>
<a href="${root}loja.html"${current === 'store' ? ' aria-current="page"' : ''}>Loja</a>
</nav>
<a class="cart-link" href="${root}loja.html#carrinho"><span class="cart-label">Carrinho</span><span aria-hidden="true">▤</span><b data-cart-count>0</b></a>
</div></header>
<main id="conteudo">${main}</main>
<footer class="site-footer"><div class="shell"><a class="brand" href="${root}index.html">${brand}</a><p>Projeto independente de cultura geek.</p><button type="button" class="button outline theme-toggle" aria-pressed="false">Tema claro</button><a href="https://github.com/Kalebreus/terminal-estudo">Ver no GitHub →</a></div></footer>
</body></html>
`;
const card = character => `<article class="character-card" ${theme(character)} data-character="${character.id}" data-search="${esc([character.name, character.series, character.category, character.role, character.description].join(' '))}">
<a href="${profile(character)}"><div class="card-image" data-id="${character.id}">${image(character, './')}</div>
<div class="card-copy"><span class="kicker">${esc(character.series)}</span><h3>${esc(character.name)}</h3><span class="card-arrow" aria-hidden="true">→</span></div></a>
<a class="card-video" href="${profile(character)}#video" aria-label="Assistir ao vídeo de ${esc(character.name)}">▶ Assistir ao vídeo</a>
<button type="button" class="favorite" data-favorite="${character.id}" aria-pressed="false" aria-label="Favoritar ${esc(character.name)}">♡</button>
</article>`;

await writeFile('index.html', page({
  title: 'Personagens de anime, mangá e games',
  description: 'Explore sete personagens da cultura geek em perfis com biografias, artes, vídeos e colecionáveis.',
  current: 'home',
  main: `
<section class="hero">
<div class="hero-art" aria-hidden="true">${image(hero, './', 'eager')}</div>
<div class="shell hero-inner">
<div class="hero-copy"><p class="kicker"><span class="signal"></span> ANIME · MANGÁ · GAMES</p>
<h1>PERSONAGENS<br><em>QUE FICAM.</em></h1>
<p class="lead">Biografias, arte em movimento e colecionáveis de personagens que marcaram a cultura geek.</p>
<div class="hero-actions"><a class="button primary" href="#colecao">Explorar personagens <span>↓</span></a><a class="button outline" href="loja.html">Ver a loja <span>→</span></a></div></div>
<a class="hero-credit" href="${profile(hero)}"><span class="kicker">EM DESTAQUE · BERSERK</span><strong>Guts <span>→</span></strong></a>
</div>
</section>
<section class="shell section" id="colecao">
<div class="section-heading"><div><p class="kicker"><span class="signal"></span> O ARQUIVO</p><h2>A coleção</h2></div><span id="character-count" class="count" aria-live="polite">${characters.length} personagens</span></div>
<div class="toolbar">${search('character-search', 'Buscar personagem ou universo')}<button class="button outline" id="favorites-only" type="button" aria-pressed="false">♡ Favoritos</button></div>
<div class="card-grid">${characters.map(card).join('')}</div>
<p class="empty" id="character-empty" hidden>Nenhum personagem encontrado.</p>
</section>
<section class="shell shop-banner"><div><p class="kicker">LOJA GEEK</p><h2>Da tela para sua coleção.</h2><p>Pôsteres, camisetas, canecas e outros itens inspirados nos personagens do arquivo.</p></div><a class="button primary" href="loja.html">Explorar catálogo <span>→</span></a></section>`
}));

await mkdir('personagens', { recursive: true });
for (const [index, character] of characters.entries()) {
  const next = characters[(index + 1) % characters.length];
  const youtubeId = encodeURIComponent(character.video);
  await writeFile(`personagens/${character.id}.html`, page({
    title: character.name,
    description: character.description,
    root: '../',
    current: 'character',
    main: `
<div class="shell profile-page" ${theme(character)}>
<a class="back-link" href="../index.html#colecao">← Todos os personagens</a>
<section class="profile-hero">
<div class="profile-copy"><p class="kicker"><span class="signal"></span> ${esc(character.series)} / ${esc(character.category)}</p>
<h1>${esc(character.name)}</h1><p class="profile-role">${esc(character.role)}</p>
<h2>Biografia</h2><p class="bio">${esc(character.description)}</p>
<div class="profile-actions"><a class="button primary" href="#video">▶ Assistir ao vídeo</a><a class="button outline" href="../loja.html?personagem=${character.id}">Ver produtos <span>→</span></a></div></div>
<figure class="profile-image" data-id="${character.id}">${image(character, '../', 'eager')}<figcaption>Arte de ${esc(character.name)}</figcaption></figure>
</section>
<section class="section media-section" aria-label="Arte e vídeo de ${esc(character.name)}">
<div><h2>Arte em movimento</h2><div class="motion-stage" data-motion>
<img class="motion-image" src="../${character.id}.svg" alt="Ilustração de ${esc(character.name)}" loading="lazy">
<span class="motion-ring" aria-hidden="true"></span><span class="motion-ring ring-two" aria-hidden="true"></span>
<button class="button motion-button" type="button" aria-pressed="false">Pausar animação</button>
</div></div>
<div id="video"><h2>Vídeo do personagem</h2>
<iframe class="youtube-player" src="https://www.youtube-nocookie.com/embed/${youtubeId}" title="Vídeo de ${esc(character.name)} no YouTube" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
<a class="button outline youtube-link" href="https://youtu.be/${youtubeId}" target="_blank" rel="noopener noreferrer">Abrir no YouTube <span aria-hidden="true">→</span></a>
<details class="profile-teaser"><summary>Teaser do Arquivo Geek</summary><video controls playsinline preload="none" poster="${photo(character, '../')}" aria-label="Vídeo de apresentação de ${esc(character.name)}">
<source src="../midia/${character.id}.mp4" type="video/mp4">
<a href="../midia/${character.id}.mp4">Baixar vídeo</a></video>
<p class="media-caption">Teaser visual sem áudio.</p></details></div>
</section>
<a class="next-profile" href="${profile(next, '../')}"><span><small class="kicker">PRÓXIMO PERSONAGEM</small><strong>${esc(next.name)}</strong></span><span aria-hidden="true">→</span></a>
</div>`
  }));
}

const products = types.flatMap((_, row) => characters.map((character, column) => {
  const type = types[(row + column) % types.length];
  return `<article class="product" ${theme(character)} data-product data-type="${type.id}" data-character="${character.id}" data-search="${esc([type.name, character.name, character.series].join(' '))}">
<div class="product-art ${type.id}" aria-hidden="true"><div class="product-object"><img src="./${character.id}.svg" alt="" loading="lazy"></div></div>
<div class="product-copy"><span class="kicker">${esc(character.series)}</span><h3>${type.name} · ${esc(character.name)}</h3><p>${type.detail}</p>
<div class="product-buy"><strong>${money(type.price)}</strong><button class="button outline" type="button" data-add="${type.id}:${character.id}" data-name="${esc(type.name + ' · ' + character.name)}" data-price="${type.price}" aria-label="Adicionar ${esc(type.name + ' de ' + character.name)} ao carrinho">Adicionar <span>+</span></button></div></div>
</article>`;
}));
await writeFile('loja.html', page({
  title: 'Loja geek',
  description: 'Catálogo de pôsteres, camisetas, canecas, adesivos, ecobags e chaveiros inspirados nos personagens do Arquivo Geek.',
  current: 'store',
  main: `<section class="store-hero"><div class="shell"><p class="kicker"><span class="signal"></span> LOJA GEEK</p><h1>Da tela para<br><em>sua coleção.</em></h1><p class="lead">Encontre produtos inspirados nos seus personagens favoritos.</p><p class="store-note">Catálogo demonstrativo · imagens ilustrativas · compras indisponíveis</p></div></section>
<section class="shell section" id="catalogo"><div class="section-heading"><h2>Catálogo</h2><span class="count" id="product-count" aria-live="polite">${products.length} produtos</span></div>
<div class="toolbar store-toolbar">${search('product-search', 'Buscar produto ou universo')}
<label>Categoria<select id="category-filter"><option value="">Todas</option>${types.map(type => `<option value="${type.id}">${type.name}</option>`).join('')}</select></label>
<label>Personagem<select id="character-filter"><option value="">Todos</option>${characters.map(character => `<option value="${character.id}">${esc(character.name)}</option>`).join('')}</select></label></div>
<div class="card-grid">${products.join('')}</div><p class="empty" id="product-empty" hidden>Nenhum produto corresponde aos filtros.</p>
</section>
<section class="shell section cart-section" id="carrinho"><div class="section-heading"><h2>Carrinho</h2><a href="#catalogo">Voltar ao catálogo ↑</a></div><div id="cart-items"><p>Seu carrinho está vazio.</p></div><div class="cart-total">Subtotal <strong id="cart-total">${money(0)}</strong></div><p class="media-caption">Os preços são ilustrativos. O pagamento ainda não está disponível.</p></section>
<p class="toast" id="cart-status" role="status" hidden></p>`
}));
