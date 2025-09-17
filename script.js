(function() {
  const currency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const state = {
    items: {}, // id -> { product, qty }
  };

  const els = {
    grid: document.getElementById('product-grid'),
    cartCount: document.getElementById('cart-count'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    openCart: document.getElementById('open-cart'),
    closeCart: document.getElementById('close-cart'),
    checkout: document.getElementById('checkout'),
    backdrop: document.getElementById('backdrop'),
  };

  function setYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function renderProducts() {
    if (!window.PRODUCTS || !Array.isArray(window.PRODUCTS)) return;
    els.grid.innerHTML = window.PRODUCTS.map(p => cardTemplate(p)).join('');
    attachCardEvents();
  }

  function cardTemplate(product) {
    return `
      <article class="card" data-id="${product.id}">
        <div class="media">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="content">
          <div class="title">${product.name}</div>
          <div class="subtitle">${product.subtitle ?? ''}</div>
          <div class="price">${currency(product.price)}</div>
          <div class="actions">
            <div class="qty" data-qty>
              <button data-dec>-</button>
              <input data-input type="number" min="1" value="1" aria-label="Quantidade">
              <button data-inc>+</button>
            </div>
            <button class="btn btn-primary" data-add>Adicionar</button>
          </div>
        </div>
      </article>
    `;
  }

  function attachCardEvents() {
    els.grid.querySelectorAll('.card').forEach(card => {
      const id = card.getAttribute('data-id');
      const product = window.PRODUCTS.find(p => p.id === id);
      const wrap = card.querySelector('[data-qty]');
      const dec = card.querySelector('[data-dec]');
      const inc = card.querySelector('[data-inc]');
      const input = card.querySelector('[data-input]');
      const add = card.querySelector('[data-add]');

      dec.addEventListener('click', () => {
        const v = Math.max(1, parseInt(input.value || '1', 10) - 1);
        input.value = v;
      });
      inc.addEventListener('click', () => {
        const v = Math.max(1, parseInt(input.value || '1', 10) + 1);
        input.value = v;
      });
      add.addEventListener('click', () => {
        const qty = Math.max(1, parseInt(input.value || '1', 10));
        addToCart(product, qty);
        openCart();
      });
    });
  }

  function addToCart(product, qty) {
    if (!state.items[product.id]) {
      state.items[product.id] = { product, qty: 0 };
    }
    state.items[product.id].qty += qty;
    if (state.items[product.id].qty <= 0) delete state.items[product.id];
    sync();
  }

  function removeFromCart(id) {
    delete state.items[id];
    sync();
  }

  function changeQty(id, delta) {
    const item = state.items[id];
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    sync();
  }

  function calcTotal() {
    return Object.values(state.items).reduce((sum, it) => sum + it.product.price * it.qty, 0);
  }

  function sync() {
    // badge
    const totalQty = Object.values(state.items).reduce((n, it) => n + it.qty, 0);
    els.cartCount.textContent = String(totalQty);
    // list
    renderCartItems();
    // total
    els.cartTotal.textContent = currency(calcTotal());
  }

  function renderCartItems() {
    const entries = Object.values(state.items);
    if (entries.length === 0) {
      els.cartItems.innerHTML = `<p class="muted">Seu carrinho está vazio.</p>`;
      return;
    }
    els.cartItems.innerHTML = entries.map(({ product, qty }) => `
      <div class="cart-item" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <div class="meta">
          <div class="name">${product.name}</div>
          <div class="note">${qty} x ${currency(product.price)}</div>
        </div>
        <div>
          <div class="qty" style="margin-bottom:8px">
            <button data-delta="-1">-</button>
            <span style="min-width:32px; text-align:center; font-weight:700">${qty}</span>
            <button data-delta="1">+</button>
          </div>
          <button class="remove" data-remove>remover</button>
        </div>
      </div>
    `).join('');

    // bind qty and remove
    els.cartItems.querySelectorAll('.cart-item').forEach(row => {
      const id = row.getAttribute('data-id');
      row.querySelectorAll('[data-delta]').forEach(btn => {
        btn.addEventListener('click', () => changeQty(id, parseInt(btn.getAttribute('data-delta'), 10)));
      });
      row.querySelector('[data-remove]').addEventListener('click', () => removeFromCart(id));
    });
  }

  function openCart() {
    els.cartDrawer.classList.add('open');
    els.cartDrawer.setAttribute('aria-hidden', 'false');
    els.backdrop.hidden = false;
  }
  function closeCart() {
    els.cartDrawer.classList.remove('open');
    els.cartDrawer.setAttribute('aria-hidden', 'true');
    els.backdrop.hidden = true;
  }

  function buildWhatsAppMessage() {
    const entries = Object.values(state.items);
    if (entries.length === 0) return '';
    const lines = [];
    lines.push('*Novo pedido - SB\'Stilo*');
    lines.push('');
    entries.forEach(({ product, qty }) => {
      lines.push(`• ${product.name} (${qty}x) - ${currency(product.price * qty)}`);
    });
    lines.push('');
    lines.push(`Total: ${currency(calcTotal())}`);
    lines.push('');
    lines.push('Nome:');
    lines.push('Endereço:');
    lines.push('Forma de pagamento:');
    return encodeURIComponent(lines.join('\n'));
  }

  function checkout() {
    const phone = (window.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    if (!phone) {
      alert('Configure o número do WhatsApp em products.js (WHATSAPP_NUMBER).');
      return;
    }
    const msg = buildWhatsAppMessage();
    if (!msg) {
      alert('Seu carrinho está vazio.');
      return;
    }
    const url = `https://wa.me/${phone}?text=${msg}`;
    window.open(url, '_blank');
  }

  // events
  els.openCart.addEventListener('click', openCart);
  els.closeCart.addEventListener('click', closeCart);
  els.backdrop.addEventListener('click', closeCart);
  els.checkout.addEventListener('click', checkout);

  // init
  setYear();
  renderProducts();
  sync();
})();


