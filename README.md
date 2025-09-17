# SB'Stilo - Loja com checkout via WhatsApp

Este é um site moderno e simples para vender roupas. O cliente adiciona itens ao carrinho e finaliza o pedido pelo WhatsApp com a lista de produtos e o total.

## Como usar

1. Abra o arquivo `index.html` no navegador (duplo clique).
2. Os produtos estão em `products.js` (array `PRODUCTS`).
3. O WhatsApp já está configurado para `xxxxxxxxxxxxx`.

## Alterar número do WhatsApp

Edite `products.js` e ajuste:

```js
window.WHATSAPP_NUMBER = "xxxxxxxxxxxxx";
```

Use DDI + DDD + número, apenas dígitos. Ex.: Brasil/CE → `5588...`.

## Editar produtos

No `products.js`, cada item possui:
- `id`
- `name`
- `subtitle`
- `price`
- `category`
- `image`

Você pode trocar as imagens por arquivos próprios (coloque na mesma pasta e aponte o caminho) ou usar URLs.

## Como funciona o checkout

- O botão "Finalizar no WhatsApp" abre uma nova aba com `https://wa.me/SEU_NUMERO?text=MENSAGEM`.
- A mensagem contém: lista de itens, total e campos para Nome/Endereço/Pagamento.

## Personalização visual

- Cores/tipografia/estilos em `styles.css`.
- Fonte Inter via Google Fonts.

## Dúvidas / ajustes

Precisa de páginas extras (sobre, políticas, contato), filtros por categoria, banners ou integração com Instagram? Me diga que eu adiciono aqui.
