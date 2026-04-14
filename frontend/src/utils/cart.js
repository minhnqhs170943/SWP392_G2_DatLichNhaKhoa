const CART_KEY = "market_cart";

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    const next = cart.map((item) =>
      item.id === product.id ? { ...item, qty: item.qty + 1 } : item
    );
    saveCart(next);
    return next;
  }

  const next = [
    ...cart,
    {
      id: product.id,
      brand: product.brand,
      name: product.name,
      price: product.priceNumber,
      qty: 1,
    },
  ];
  saveCart(next);
  return next;
}

export function updateQtyInCart(id, delta) {
  const cart = getCart();
  const next = cart.map((item) =>
    item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
  );
  saveCart(next);
  return next;
}

export function removeFromCart(id) {
  const cart = getCart();
  const next = cart.filter((item) => item.id !== id);
  saveCart(next);
  return next;
}

export function clearCart() {
  saveCart([]);
  return [];
}
