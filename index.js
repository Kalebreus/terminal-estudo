'use strict';

const money = cents => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();

function load(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the current selection available for the session.
  }
}

const theme = document.querySelector('.theme-toggle');
const themeKey = 'arquivo-geek:theme';
function applyTheme(light) {
  document.documentElement.classList.toggle('light', light);
  theme.setAttribute('aria-pressed', light);
  theme.textContent = light ? 'Tema escuro' : 'Tema claro';
}
try {
  const previousTheme = localStorage.getItem(themeKey);
  applyTheme(previousTheme === '"light"' || previousTheme === 'light');
} catch {
  applyTheme(false);
}
theme.addEventListener('click', () => {
  const light = !document.documentElement.classList.contains('light');
  applyTheme(light);
  save(themeKey, light ? 'light' : 'dark');
});

const favoritesKey = 'arquivo-geek:favorites';
const favorites = new Set(load(favoritesKey));
const cards = [...document.querySelectorAll('.character-card')];
const characterSearch = document.querySelector('#character-search');
const favoritesOnly = document.querySelector('#favorites-only');

function filterCharacters() {
  let count = 0;
  const query = normalize(characterSearch.value);
  for (const card of cards) {
    const matchesSearch = normalize(card.dataset.search).includes(query);
    const matchesFavorites = favoritesOnly.getAttribute('aria-pressed') === 'false' || favorites.has(card.dataset.character);
    card.hidden = !(matchesSearch && matchesFavorites);
    if (!card.hidden) count += 1;
  }
  document.querySelector('#character-count').textContent = count + (count === 1 ? ' personagem' : ' personagens');
  document.querySelector('#character-empty').hidden = count > 0;
}

for (const button of document.querySelectorAll('[data-favorite]')) {
  const id = button.dataset.favorite;
  const characterName = button.closest('article').querySelector('h3').textContent;
  const renderFavorite = () => {
    const active = favorites.has(id);
    button.textContent = active ? '♥' : '♡';
    button.setAttribute('aria-pressed', active);
    button.setAttribute('aria-label', (active ? 'Remover dos favoritos: ' : 'Favoritar ') + characterName);
  };
  renderFavorite();
  button.addEventListener('click', () => {
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    save(favoritesKey, [...favorites]);
    renderFavorite();
    filterCharacters();
    if (button.closest('article').hidden) favoritesOnly.focus();
  });
}
characterSearch?.addEventListener('input', filterCharacters);
if (characterSearch) {
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.altKey && !event.metaKey
        && !event.target.closest('input, textarea, select, [contenteditable]')) {
      event.preventDefault();
      characterSearch.focus();
    }
  });
}
favoritesOnly?.addEventListener('click', () => {
  favoritesOnly.setAttribute('aria-pressed', favoritesOnly.getAttribute('aria-pressed') === 'false');
  filterCharacters();
});

const stage = document.querySelector('[data-motion]');
if (stage) {
  const button = stage.querySelector('button');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function setPaused(paused) {
    stage.toggleAttribute('data-paused', paused);
    stage.toggleAttribute('data-playing', !paused);
    button.setAttribute('aria-pressed', paused);
    button.textContent = paused ? 'Reproduzir animação' : 'Pausar animação';
  }
  setPaused(preference.matches);
  preference.addEventListener('change', event => setPaused(event.matches));
  button.addEventListener('click', () => setPaused(!stage.hasAttribute('data-paused')));
}

const cartKey = 'arquivo-geek:cart';
const cart = new Map(load(cartKey)
  .filter(item => item && typeof item.id === 'string' && typeof item.name === 'string'
    && Number.isSafeInteger(item.price) && item.price > 0
    && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99)
  .map(item => [item.id, item]));

function renderCartCount() {
  const count = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  for (const badge of document.querySelectorAll('[data-cart-count]')) {
    badge.textContent = count;
    badge.closest('a').setAttribute('aria-label', 'Carrinho, ' + count + (count === 1 ? ' item' : ' itens'));
  }
}
renderCartCount();

const products = [...document.querySelectorAll('[data-product]')];
if (products.length) {
  const search = document.querySelector('#product-search');
  const category = document.querySelector('#category-filter');
  const character = document.querySelector('#character-filter');
  const count = document.querySelector('#product-count');
  const empty = document.querySelector('#product-empty');
  const cartItems = document.querySelector('#cart-items');
  const total = document.querySelector('#cart-total');
  const status = document.querySelector('#cart-status');
  const catalog = new Map(products.map(product => {
    const button = product.querySelector('[data-add]');
    return [button.dataset.add, { id: button.dataset.add, name: button.dataset.name, price: Number(button.dataset.price) }];
  }));
  const initialCharacter = new URLSearchParams(location.search).get('personagem');
  if ([...character.options].some(option => option.value === initialCharacter)) character.value = initialCharacter;
  for (const [id, item] of cart) {
    if (catalog.has(id)) cart.set(id, { ...catalog.get(id), quantity: item.quantity });
    else cart.delete(id);
  }

  function filterProducts() {
    let shown = 0;
    const query = normalize(search.value);
    for (const product of products) {
      product.hidden = !normalize(product.dataset.search).includes(query)
        || Boolean(category.value && product.dataset.type !== category.value)
        || Boolean(character.value && product.dataset.character !== character.value);
      if (!product.hidden) shown += 1;
    }
    count.textContent = shown + (shown === 1 ? ' produto' : ' produtos');
    empty.hidden = shown > 0;
  }
  search.addEventListener('input', filterProducts);
  category.addEventListener('change', filterProducts);
  character.addEventListener('change', filterProducts);
  filterProducts();

  function renderCart() {
    renderCartCount();
    cartItems.replaceChildren();
    let subtotal = 0;
    for (const item of cart.values()) {
      subtotal += item.price * item.quantity;
      const row = document.createElement('div');
      row.className = 'cart-row';
      const name = document.createElement('span');
      name.textContent = item.name + ' · ' + money(item.price);
      const controls = document.createElement('div');
      controls.className = 'cart-controls';
      const quantity = document.createElement('span');
      quantity.textContent = item.quantity;
      quantity.setAttribute('aria-label', 'Quantidade: ' + item.quantity);
      for (const [delta, label, symbol] of [[-1, 'Reduzir quantidade de ', '−'], [1, 'Aumentar quantidade de ', '+']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button outline';
        button.textContent = symbol;
        button.disabled = delta === 1 && item.quantity >= 99;
        button.setAttribute('aria-label', label + item.name);
        button.dataset.item = item.id;
        button.dataset.delta = delta;
        button.addEventListener('click', () => {
          updateCart(item.id, delta);
          const replacement = [...cartItems.querySelectorAll('button')].find(control =>
            control.dataset.item === item.id && Number(control.dataset.delta) === delta && !control.disabled);
          (replacement ?? cartItems.querySelector('button') ?? document.querySelector('#carrinho a')).focus();
        });
        controls.append(button);
        if (delta === -1) controls.append(quantity);
      }
      row.append(name, controls);
      cartItems.append(row);
    }
    if (!cart.size) {
      const message = document.createElement('p');
      message.textContent = 'Seu carrinho está vazio.';
      cartItems.append(message);
    }
    total.textContent = money(subtotal);
  }

  let timer;
  function notify(message) {
    clearTimeout(timer);
    status.hidden = false;
    status.textContent = message;
    timer = setTimeout(() => { status.hidden = true; }, 3000);
  }

  function updateCart(id, delta) {
    const product = catalog.get(id);
    const quantity = (cart.get(id)?.quantity ?? 0) + delta;
    if (quantity > 99) {
      notify('Limite de 99 unidades por produto.');
      return;
    }
    if (quantity <= 0) cart.delete(id);
    else cart.set(id, { ...product, quantity });
    save(cartKey, [...cart.values()]);
    renderCart();
    if (delta > 0) notify(product.name + ' adicionado ao carrinho.');
    else if (quantity <= 0) notify(product.name + ' removido do carrinho.');
  }

  for (const button of document.querySelectorAll('[data-add]')) {
    button.addEventListener('click', () => updateCart(button.dataset.add, 1));
  }
  renderCart();
}
