(() => {
  const ACCOUNTS = "rickovns-demo-accounts";
  const SESSION = "rickovns-demo-session";
  const panel = document.querySelector("[data-auth-panel]");
  const dashboard = document.querySelector("[data-dashboard]");
  const loggedOut = document.querySelector("[data-logged-out]");
  const form = document.querySelector("[data-auth-form]");
  const error = document.querySelector("[data-auth-error]");
  let mode = "login";
  let accounts = {};
  try { accounts = JSON.parse(localStorage.getItem(ACCOUNTS) || "{}"); } catch { accounts = {}; }
  const normalizeNick = value => value.trim();
  function render() {
    const nick = localStorage.getItem(SESSION);
    panel.hidden = Boolean(nick); dashboard.hidden = !nick; loggedOut.hidden = true;
    if (!nick) return;
    const user = accounts[nick];
    if (!user) { localStorage.removeItem(SESSION); render(); return; }
    document.querySelector("[data-profile-nick]").textContent = nick;
    document.querySelector("[data-profile-date]").textContent = new Date(user.registeredAt).toLocaleDateString("ru-RU");
    document.querySelector("[data-profile-rank]").textContent = user.rank || "Житель";
    document.querySelector("[data-profile-expiry]").textContent = user.rankUntil ? new Date(user.rankUntil).toLocaleDateString("ru-RU") : "Без срока";
    renderPurchases(nick);
  }
  function renderInventory(orders) {
    const garage = document.querySelector(".garage-items");
    const list = document.querySelector(".owned-items");
    garage.replaceChildren();
    list.replaceChildren();
    const cars = new Map();
    const holdings = new Map();
    for (const order of orders) {
      for (const item of order.items) {
        if (vehicles.some(car => car.id === item.vehicleId)) {
          cars.set(item.vehicleId, (cars.get(item.vehicleId) || 0) + item.quantity);
          continue;
        }
        const legacy = item.name.match(/уровень (\d+) · (\d+) дней/i);
        const level = item.adminLevel || legacy?.[1];
        let name = item.name;
        if (level) {
          const until = new Date(order.createdAt);
          until.setDate(until.getDate() + Number(item.days || legacy?.[2]));
          name = `Админка · уровень ${level} · ${until < new Date() ? "истекла" : "до"} ${until.toLocaleDateString("ru-RU")}`;
        }
        if (item.coins) name = "Coins";
        holdings.set(name, (holdings.get(name) || 0) + item.quantity * (item.coins || 1));
      }
    }
    for (const [id, count] of cars) {
      const car = vehicles.find(model => model.id === id);
      const tile = document.createElement("article");
      const caption = document.createElement("strong");
      caption.textContent = count > 1 ? `${car.name} × ${count}` : car.name;
      tile.append(vehiclePhoto(car), caption);
      garage.append(tile);
    }
    if (!cars.size) garage.textContent = "Машин пока нет.";
    for (const [name, count] of holdings) {
      const entry = document.createElement("li");
      entry.textContent = count === 1 ? name : `${name} × ${count.toLocaleString("ru-RU")}`;
      list.append(entry);
    }
    if (!holdings.size) {
      const empty = document.createElement("li");
      empty.textContent = "Доступов и предметов пока нет.";
      list.append(empty);
    }
  }

  function renderPurchases(nick) {
    const host=document.querySelector("[data-purchase-list]");host.replaceChildren();
    let orders=[]; try { orders=JSON.parse(localStorage.getItem("rickovns-demo-orders")||"[]").filter(order=>order.nickname===nick); } catch { orders=[]; }
    renderInventory(orders);
    if (!orders.length) { const row=document.createElement("div");row.className="purchase-empty";row.textContent="Пока нет заказов. Здесь появится история покупок.";host.append(row);return; }
    for(const order of orders){const row=document.createElement("div");row.className="purchase-row";const label=document.createElement("span");label.textContent=order.items.map(item=>item.name).join(", ");const meta=document.createElement("small");meta.textContent=`${order.id} · ${new Date(order.createdAt).toLocaleDateString("ru-RU")} · ${order.status}`;const total=document.createElement("strong");const sum=order.items.reduce((s,item)=>s+(item.price||0)*item.quantity,0);const code=order.currency||"UAH";const rate={UAH:1,USD:.024,EUR:.022,USDT:.024,RUB:2.2}[code];const symbol={UAH:"₴",USD:"$",EUR:"€",USDT:"₮",RUB:"₽"}[code];total.textContent=sum?`${new Intl.NumberFormat("ru-RU",{maximumFractionDigits:code==="UAH"||code==="RUB"?0:2}).format(sum*rate)} ${symbol}`:"Coins";row.append(label,meta,total);host.append(row);}
  }
  document.querySelectorAll("[data-auth-tab]").forEach(tab=>tab.addEventListener("click",()=>{mode=tab.dataset.authTab;document.querySelectorAll("[data-auth-tab]").forEach(t=>t.classList.toggle("is-active",t===tab));document.querySelector("[data-auth-submit]").textContent=mode==="register"?"Создать демо-профиль":"Войти";error.textContent="";}));
  form.addEventListener("submit",event=>{event.preventDefault();const nick=normalizeNick(form.elements.nickname.value);if(!/^[A-Za-z]+_[A-Za-z]+$/.test(nick)){error.textContent="Укажи ник латиницей в формате Имя_Фамилия.";return;}if(mode==="register"){if(accounts[nick]){error.textContent="Такой демо-профиль уже есть в этом браузере. Перейди во вкладку «Вход».";return;}accounts[nick]={registeredAt:new Date().toISOString(),rank:"Премиум I · демо",rankUntil:new Date(Date.now()+30*24*60*60*1000).toISOString()};localStorage.setItem(ACCOUNTS,JSON.stringify(accounts));}else if(!accounts[nick]){error.textContent="Профиль с таким ником не найден на этом устройстве. Сначала зарегистрируйся.";return;}localStorage.setItem(SESSION,nick);render();});
  document.querySelector("[data-logout]").addEventListener("click",()=>{localStorage.removeItem(SESSION);dashboard.hidden=true;panel.hidden=true;loggedOut.hidden=false;});
  document.querySelector("[data-back-login]").addEventListener("click",()=>{loggedOut.hidden=true;panel.hidden=false;});
  render();
})();
