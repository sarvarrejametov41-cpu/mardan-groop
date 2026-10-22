// Mardan Group - Boshlang'ich Mahsulotlar Bazasi
let defaultProducts = [
    // Крошка (Tonna va Kg hisobida)
    { id: 1, category: "kroshka", name: "Крошка Россия", price: 290, stock: 50000, unit: "т" },
    { id: 2, category: "kroshka", name: "Крошка Казахстан", price: 250, stock: 50000, unit: "т" },
    
    // Клей (Kg hisobida)
    { id: 3, category: "kley", name: "Клей Риберг", price: 1900, stock: 5000, unit: "кг" },
    { id: 4, category: "kley", name: "Клей Флоксер", price: 2300, stock: 5000, unit: "кг" },
    
    // Пигмент (Shtuk/Dona hisobida)
    { id: 5, category: "pigment", name: "Зелёный пигмент", price: 27000, stock: 80, unit: "шт" },
    { id: 6, category: "pigment", name: "Красный пигмент", price: 22000, stock: 90, unit: "шт" },
    { id: 7, category: "pigment", name: "Жёлтый пигмент", price: 30000, stock: 50, unit: "шт" },
    { id: 8, category: "pigment", name: "Синий пигмент", price: 47000, stock: 30, unit: "шт" },
    { id: 9, category: "pigment", name: "Белый пигмент", price: 45000, stock: 40, unit: "шт" },
    { id: 10, category: "pigment", name: "Оранжевый пигмент", price: 29000, stock: 60, unit: "шт" }
];

if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(defaultProducts));
}
if (!localStorage.getItem("sales")) {
    localStorage.setItem("sales", JSON.stringify([]));
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", () => {
    renderClientCatalog();
    updateCartBadge();
});

// Katalogni ekranga chiqarish
function renderClientCatalog() {
    let products = JSON.parse(localStorage.getItem("products"));
    
    let gridKroshka = document.getElementById("grid-kroshka");
    let gridKley = document.getElementById("grid-kley");
    let gridPigment = document.getElementById("grid-pigment");

    if(!gridKroshka) return;

    gridKroshka.innerHTML = "";
    gridKley.innerHTML = "";
    gridPigment.innerHTML = "";

    products.forEach(p => {
        let priceUnitText = p.unit === "т" ? `${p.price} тг / кг (или ${p.price * 1000} тг / тонна)` : `${p.price.toLocaleString()} тг / ${p.unit}`;
        
        let cardHtml = `
            <div class="product-card">
                <h4>${p.name}</h4>
                <div class="price">${priceUnitText}</div>
                <div class="stock-info">В наличии: <strong>${p.stock} ${p.unit}</strong></div>
                <button class="buy-btn" onclick="addToCart(${p.id})">🛒 В корзину</button>
            </div>
        `;

        if (p.category === "kroshka") gridKroshka.innerHTML += cardHtml;
        else if (p.category === "kley") gridKley.innerHTML += cardHtml;
        else if (p.category === "pigment") gridPigment.innerHTML += cardHtml;
    });
}

// Savatga mahsulot qo'shish (Tonna bo'lsa kilogrammga aylantirib hisoblash)
function addToCart(productId) {
    let products = JSON.parse(localStorage.getItem("products"));
    let prod = products.find(p => p.id === productId);

    let existingItem = cart.find(item => item.id === productId);

    // Kroshka uchun tonnalarda so'rash
    let amountPrompt = 1;
    if (prod.unit === "т") {
        let inputTons = prompt(`Введите количество в ТОННАХ (например, 22 для 22 тонны / 22.000 кг):`, "1");
        if (!inputTons || isNaN(inputTons) || parseFloat(inputTons) <= 0) return;
        amountPrompt = parseFloat(inputTons);
    } else {
        let inputQty = prompt(`Введите количество (${prod.unit}):`, "1");
        if (!inputQty || isNaN(inputQty) || parseFloat(inputQty) <= 0) return;
        amountPrompt = parseFloat(inputQty);
    }

    if (existingItem) {
        existingItem.amount += amountPrompt;
    } else {
        cart.push({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            unit: prod.unit,
            amount: amountPrompt
        });
    }

    saveCart();
    alert(`Товар "${prod.name}" добавлена в корзину!`);
}

function updateCartBadge() {
    let totalItems = cart.length;
    let badge = document.getElementById("cartCountBadge");
    if(badge) badge.innerText = totalItems;
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
}

function openCartModal() {
    renderCartItems();
    document.getElementById("cartModal").style.display = "flex";
}

function closeCartModal() {
    document.getElementById("cartModal").style.display = "none";
}

// Savatdagi mahsulotlarni va umumiy summani hisoblash
function renderCartItems() {
    let container = document.getElementById("cartItemsList");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#94a3b8;'>Корзина пуста</p>";
        document.getElementById("cartTotalPrice").innerText = "0";
        return;
    }

    let grandTotal = 0;

    cart.forEach(item => {
        let itemTotal = 0;
        let qtyText = "";

        if (item.unit === "т") {
            // 22 tonna = 22 * 1000 * 290 тг = 6,380,000 тг
            let weightInKg = item.amount * 1000;
            itemTotal = weightInKg * item.price;
            qtyText = `${item.amount} тонна (${weightInKg.toLocaleString()} кг)`;
        } else {
            itemTotal = item.amount * item.price;
            qtyText = `${item.amount} ${item.unit}`;
        }

        grandTotal += itemTotal;

        container.innerHTML += `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <span>Цена: ${item.price} тг/кг</span>
                </div>
                <div class="cart-item-qty">
                    <span><strong>${qtyText}</strong></span>
                    <span style="color:#f59e0b; margin-left:10px;"><strong>${itemTotal.toLocaleString()} тг</strong></span>
                    <button class="btn-remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
            </div>
        `;
    });

    document.getElementById("cartTotalPrice").innerText = grandTotal.toLocaleString();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCartItems();
}

// Buyurtmani yuborish
function submitCartOrder(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Ваша корзина пуста!");
        return;
    }

    let customerName = document.getElementById("cartCustomerName").value;
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    let now = new Date();
    let dateTimeStr = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0];

    let detailsArray = [];
    let grandTotal = 0;

    cart.forEach(item => {
        if (item.unit === "т") {
            let kg = item.amount * 1000;
            let total = kg * item.price;
            grandTotal += total;
            detailsArray.push(`${item.name} (${item.amount} т / ${kg.toLocaleString()} кг)`);
        } else {
            let total = item.amount * item.price;
            grandTotal += total;
            detailsArray.push(`${item.name} (${item.amount} ${item.unit})`);
        }
    });

    sales.unshift({
        id: Date.now(),
        customer: customerName,
        product: detailsArray.join(", "),
        amount: "Общий заказ",
        unit: "-",
        total: grandTotal,
        dateTime: dateTimeStr,
        status: "Ожидает проверки"
    });

    localStorage.setItem("sales", JSON.stringify(sales));

    cart = [];
    saveCart();

    alert("Ваш общий заказ успешно отправлен! После проверки перевода администратором товары будут подтверждены.");
    closeCartModal();
}