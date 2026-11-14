const RICKOVNS_SHOP_CONFIG = {
  checkoutUrl: "" // Set payment/checkout URL here. The selected coin total is sent as ?coins=...
};

const storeToast = document.querySelector(".store-toast");
let storeToastTimer;
function notifyStore(message) {
  storeToast.textContent = message;
  storeToast.classList.add("is-visible");
  clearTimeout(storeToastTimer);
  storeToastTimer = setTimeout(() => storeToast.classList.remove("is-visible"), 3800);
}

const categoryNames = {
  cars: ["МАШИНЫ", "АВТОСАЛОН"],
  number: ["ЭКСКЛЮЗИВНЫЕ НОМЕРА", "УНИКАЛЬНЫЕ НОМЕРА"],
  stash: ["ТЮРЕМНАЯ НАКОПКА", "ТОВАРЫ РАЗДЕЛА"],
  coins: ["ИГРОВАЯ ВАЛЮТА", "ПАКЕТЫ COINS"],
  nickname: ["СМЕНА НИКНЕЙМА", "УСЛУГИ ДЛЯ ПЕРСОНАЖА"],
  admin: ["ДОСТУП АДМИНИСТРАТОРА", "УРОВЕНЬ И СРОК"]
};
const categoryButtons = document.querySelectorAll(".store-categories [data-category]");
const productGrid = document.querySelector(".product-grid");
const coinCards = Array.from(productGrid.children);
const emptyCategory = document.querySelector(".category-empty");
const categoryTitle = document.querySelector(".store-category-title");
const categorySubtitle = document.querySelector(".store-category-subtitle");
const categoryCount = document.querySelector(".store-sort");
const categoryProducts = {
  number:[{name:"Номер «Стандарт»",description:"Смена номера персонажа",price:290},{name:"Номер «Редкий»",description:"Редкий номерной знак",price:990}],
  stash:[{name:"Камера хранения • 7 дней",description:"Дополнительное место для вещей",price:390},{name:"Камера хранения • 30 дней",description:"Расширенное хранилище",price:1190},{name:"Большой склад • 30 дней",description:"Максимальный объём хранения",price:2490}],
  nickname:[{name:"Смена никнейма",description:"Измени имя персонажа один раз",price:490},{name:"Смена никнейма • пакет",description:"Две смены имени персонажа",price:790}]
};
const demoRates={UAH:1,USD:.024,EUR:.022,USDT:.024,RUB:2.2};
const demoSymbols={UAH:"₴",USD:"$",EUR:"€",USDT:"₮",RUB:"₽"};
function formatStorePrice(uah){const code=localStorage.getItem("rickovns-demo-currency")||"UAH";const amount=uah*demoRates[code];return `${new Intl.NumberFormat("ru-RU",{maximumFractionDigits:code==="UAH"||code==="RUB"?0:2}).format(amount)} ${demoSymbols[code]}`;}
const storeCurrency=document.querySelector("[data-store-currency]");
storeCurrency.value=localStorage.getItem("rickovns-demo-currency")||"UAH";
storeCurrency.addEventListener("change",()=>{localStorage.setItem("rickovns-demo-currency",storeCurrency.value);updateShopCurrency();renderCart();updateAdminPrice();});
function renderExtras(category) {
  productGrid.replaceChildren();
  for (const item of categoryProducts[category] || []) {
    const card=document.createElement("article"); card.className="product-card extra-product";
    const art=document.createElement("div"); art.className="product-art extra-art"; art.textContent=category==="number"?"№":category==="stash"?"▤":"✦";
    const info=document.createElement("div"); info.className="product-info";
    const title=document.createElement("h2"); title.textContent=item.name;
    const desc=document.createElement("p"); desc.textContent=item.description;
    const price=document.createElement("div"); price.className="product-amount"; price.textContent=formatStorePrice(item.price);
    const button=document.createElement("button"); button.className="purchase-button"; button.type="button"; button.textContent="В корзину ＋";
    button.addEventListener("click",()=>{cart.push({name:item.name,coins:0,quantity:1,price:item.price});renderCart();notifyStore(`${item.name} добавлен в корзину.`);});
    info.append(title,desc,price,button); card.append(art,info); productGrid.append(card);
  }
}

function selectCategory(category) {
  const isCoins = category === "coins";
  const isAdmin = category === "admin";
  categoryButtons.forEach((button) => {
    const selected = button.dataset.category === category;
    button.classList.toggle("category-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  categoryTitle.textContent = categoryNames[category][0];
  categorySubtitle.textContent = categoryNames[category][1];
  const hasProducts = isCoins || isAdmin || category === "cars" || Boolean(categoryProducts[category]);
  if (isCoins) productGrid.replaceChildren(...coinCards);
  if (category === "cars") renderVehicles();
  if (!isCoins && !isAdmin && categoryProducts[category]) renderExtras(category);
  productGrid.hidden = !hasProducts || isAdmin;
  emptyCategory.hidden = hasProducts;
  document.querySelector(".admin-config").hidden = !isAdmin;
  categoryCount.textContent = isCoins ? "ПАКЕТОВ: 05" : isAdmin ? "ВЫБЕРИ ДОСТУП" : category === "cars" ? "4 МОДЕЛИ" : "";
  productGrid.classList.toggle("vehicle-grid", category === "cars");
  productGrid.setAttribute("aria-label", categoryNames[category][0]);
  updateShopCurrency();
  if (!hasProducts) {
    emptyCategory.querySelector(".empty-title").textContent = categoryNames[category][0];
    emptyCategory.querySelector(".empty-copy").textContent = "Каталог этого раздела готовится. Coins уже доступны в магазине.";
  }
}

function renderVehicles() {
  productGrid.replaceChildren();
  for (const car of vehicles) {
    const card = document.createElement("article");
    card.className = "product-card";
    const info = document.createElement("div");
    info.className = "product-info";
    info.innerHTML = `<h2>${car.name}</h2>
      <p>${car.speed} км/ч · ${car.drive} привод<br>Бак ${car.tank} л · АИ-98 · ID ${car.id}</p>
      <strong class="shop-price" data-uah="${car.price}"></strong>
      <button type="button" class="purchase-button">В корзину ＋</button>`;
    info.querySelector("button").addEventListener("click", () => {
      const existing = cart.find(item => item.vehicleId === car.id);
      if (existing) existing.quantity++;
      else cart.push({vehicleId:car.id, name:car.name, price:car.price, quantity:1, coins:0});
      renderCart();
      openCart();
    });
    card.append(vehiclePhoto(car), info);
    productGrid.append(card);
  }
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectCategory(button.dataset.category);
    document.querySelector(".store-toolbar").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
document.querySelector(".empty-back").addEventListener("click", () => {
  selectCategory("coins");
  document.querySelector(".store-toolbar").scrollIntoView({ behavior: "smooth", block: "start" });
});

function readProfile() {
  try {
    const nick = localStorage.getItem("rickovns-demo-session");
    const accounts = JSON.parse(localStorage.getItem("rickovns-demo-accounts") || "{}");
    return nick && accounts[nick] ? {nickname:nick} : null;
  } catch { return null; }
}

const adminRanks = [
  ["Поддержка", "Ответы на вопросы новичков.", "Приём и распределение обращений.", 1490, 2990],
  ["Модерация", "Предупреждения за нарушения в чате.", "Временное ограничение чата.", 4990, 8990],
  ["Патруль", "Наблюдение за игровыми ситуациями.", "Разбор жалоб и просмотр истории предупреждений.", 14990, 17990],
  ["События", "Создание городских мероприятий.", "Управление участниками и итогами событий.", 20990, 23990],
  ["Кураторство", "Проверка решений модераторов.", "Распределение дежурств и разбор апелляций.", 26990, 29990]
];
const adminCards = [];
function updateAdminPrice() {
  for (const refresh of adminCards) refresh();
}
adminRanks.forEach(([name, first, second, base, senior], index) => {
  const level = index * 2 + 1;
  const card = document.createElement("article");
  card.className = "rank-card";
  card.innerHTML = `
    <small>УРОВНИ ${level}–${level + 1}</small>
    <h3>${name}</h3>
    <p><b>${level}</b> ${first}</p>
    <p><b>${level + 1}</b> ${second}</p>
    <div class="rank-options">
      <label>Уровень<select><option>${level}</option><option>${level + 1}</option></select></label>
      <label>Срок<select><option value="30">30 дней</option><option value="90">90 дней</option><option value="365">365 дней</option></select></label>
    </div>
    <output></output><button class="purchase-button" type="button">В корзину ＋</button>`;
  const [rankSelect, termSelect] = card.querySelectorAll("select");
  const price = () => Math.round((Number(rankSelect.value) === level ? base : senior)
    * ({30:1, 90:2.7, 365:8.5}[termSelect.value]));
  const refresh = () => card.querySelector("output").textContent = formatStorePrice(price());
  adminCards.push(refresh);
  card.addEventListener("change", refresh);
  card.addEventListener("pointermove", event => {
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--px", (event.clientX - bounds.left) + "px");
    card.style.setProperty("--py", (event.clientY - bounds.top) + "px");
  });
  card.querySelector("button").addEventListener("click", () => {
    cart.push({name: `${name} · уровень ${rankSelect.value} · ${termSelect.value} дней`, adminLevel:Number(rankSelect.value), days:Number(termSelect.value), coins:0, quantity:1, price:price()});
    renderCart();
    openCart();
  });
  document.querySelector(".admin-config").append(card);
  refresh();
});
const cart = [];
const cartPanel = document.querySelector(".store-cart");
const cartTrigger = document.querySelector(".store-cart-trigger");
const cartClose = document.querySelector(".cart-close");
const cartScrim = document.querySelector(".cart-scrim");
const cartItems = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".cart-checkout");

function openCart() {
  document.body.classList.add("cart-open");
  cartPanel.setAttribute("aria-hidden", "false");
  cartTrigger.setAttribute("aria-expanded", "true");
  const activeNick=localStorage.getItem("rickovns-demo-session");
  document.querySelector(".cart-nickname").value=activeNick||document.querySelector(".cart-nickname").value;
  cartClose.focus();
}
function closeCart() {
  document.body.classList.remove("cart-open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartTrigger.setAttribute("aria-expanded", "false");
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCoins = cart.reduce((sum, item) => sum + item.coins * item.quantity, 0);
  const totalRubles = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = [totalCoins ? `${totalCoins.toLocaleString("ru-RU")} Coins` : "",totalRubles ? formatStorePrice(totalRubles) : ""].filter(Boolean).join(" + ") || "0";
  checkoutButton.disabled = cart.length === 0;
  cartItems.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Корзина пока пуста. Добавь пакет Coins из каталога.";
    cartItems.append(empty);
    return;
  }

  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-row";
    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.name;
    const amount = document.createElement("span");
    amount.textContent = `${item.coins ? `${item.coins.toLocaleString("ru-RU")} Coins · ` : ""}${item.price ? formatStorePrice(item.price)+" · " : ""}${item.quantity} шт.`;
    info.append(title, amount);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.textContent = "−";
    remove.setAttribute("aria-label", `Убрать ${item.name} из корзины`);
    remove.addEventListener("click", () => {
      item.quantity -= 1;
      if (item.quantity === 0) cart.splice(index, 1);
      renderCart();
    });
    row.append(info, remove);
    cartItems.append(row);
  });
}

document.querySelectorAll("[data-coins]").forEach((button) => {
  button.addEventListener("click", () => {
    const coins = Number(button.dataset.coins);
    const name = button.closest(".product-card").querySelector("h2").textContent;
    const existing = cart.find((item) => item.coins === coins);
    if (existing) existing.quantity += 1;
    else cart.push({ name, coins, quantity: 1, price: coinPackagePrices[coins] });
    renderCart();
    notifyStore(`${name} добавлен в корзину.`);
  });
});
const coinPackagePrices={100000:99,250000:199,550000:399,1390000:899,7500000:2999};
document.querySelectorAll("[data-coins]").forEach(button=>{
  const amount=button.closest(".product-card").querySelector(".product-amount");
  const price=document.createElement("small");price.className="shop-price";price.dataset.uah=String(coinPackagePrices[button.dataset.coins]);amount.append(" ");amount.append(price);
});
function updateShopCurrency(){document.querySelectorAll(".shop-price").forEach(price=>price.textContent=formatStorePrice(Number(price.dataset.uah)));document.querySelectorAll("[data-admin-price-placeholder]").forEach(node=>node.textContent=formatStorePrice(Number(node.dataset.adminPrice)));}
updateShopCurrency();

cartTrigger.addEventListener("click", () => {
  if (document.body.classList.contains("cart-open")) closeCart();
  else openCart();
});
document.querySelector("[data-open-checkout]").addEventListener("click", () => {
  if (!cart.length) {
    document.querySelector("#coin-packages").scrollIntoView({behavior:"smooth",block:"start"});
    notifyStore("Сначала выбери Coins или другую покупку.");
    return;
  }
  openCart();
  setTimeout(() => checkoutButton.focus(), 350);
});
cartClose.addEventListener("click", closeCart);
cartScrim.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("cart-open")) {
    closeCart();
    cartTrigger.focus();
  }
});
checkoutButton.addEventListener("click", () => {
  const nicknameInput=document.querySelector(".cart-nickname");
  if(!nicknameInput.reportValidity()) return;
  const nickname=nicknameInput.value.trim();
  if(!/^[A-Za-z]+_[A-Za-z]+$/.test(nickname)){nicknameInput.setCustomValidity("Введи ник в формате Имя_Фамилия латиницей.");nicknameInput.reportValidity();nicknameInput.setCustomValidity("");return;}
  const currency=storeCurrency.value;
  const order = { id: `R-${Date.now()}`, nickname, currency, items: cart.map(item => ({...item})), createdAt: new Date().toISOString(), status: "Ожидает подключения оплаты" };
  const orders = JSON.parse(localStorage.getItem("rickovns-demo-orders") || "[]");
  orders.push(order);
  localStorage.setItem("rickovns-demo-orders", JSON.stringify(orders));
  cart.splice(0, cart.length); renderCart(); closeCart();
  notifyStore(`Заказ ${order.id} оформлен для ${nickname}. Валюта: ${currency}. Это демо — оплата и выдача не выполнены.`);
});

renderCart();
