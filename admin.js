document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("isAdminLoggedIn") === "true") {
        showAdminDashboard();
    }
});

function checkAdminLogin() {
    let pass = document.getElementById("adminPasswordInput").value;
    if (pass === "admin123") {
        sessionStorage.setItem("isAdminLoggedIn", "true");
        showAdminDashboard();
    } else {
        alert("Неверный пароль!");
    }
}

function adminLogout() {
    sessionStorage.removeItem("isAdminLoggedIn");
    location.reload();
}

function showAdminDashboard() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("adminPanelContent").style.display = "block";
    loadAdminData();
}

function loadAdminData() {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    // Подтвержденная выручка
    let totalRev = sales.filter(s => s.status === "Перевод поступил").reduce((sum, s) => sum + s.total, 0);
    document.getElementById("totalRevenue").innerText = totalRev.toLocaleString() + " тг";

    // Склад остатки
    let stockBody = document.getElementById("stockTableBody");
    stockBody.innerHTML = "";
    products.forEach(p => {
        stockBody.innerHTML += `
            <tr>
                <td>${p.category.toUpperCase()}</td>
                <td><strong>${p.name}</strong></td>
                <td>
                    <input type="number" value="${p.price}" style="width:90px; padding:4px;" id="priceInput_${p.id}"> тг
                    <button onclick="editProductPrice(${p.id})" style="padding:3px 7px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer;">💾</button>
                </td>
                <td><strong>${p.stock} ${p.unit}</strong></td>
                <td><button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Удалить</button></td>
            </tr>
        `;
    });

    renderSalesTable(sales);
    calculateTopProducts(sales);
}

// Admin paneldan Kley yoki boshqa mahsulotlar NARXINI O'ZGARTIRISH
function editProductPrice(id) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let newPrice = parseInt(document.getElementById(`priceInput_${id}`).value);

    let prod = products.find(p => p.id === id);
    if (prod && !isNaN(newPrice)) {
        prod.price = newPrice;
        localStorage.setItem("products", JSON.stringify(products));
        alert(`Цена товара "${prod.name}" изменена на ${newPrice} тг!`);
        loadAdminData();
    }
}

// Admin paneldan Yangi Material qo'shish
function addNewProduct(e) {
    e.preventDefault();

    let category = document.getElementById("newCategory").value;
    let name = document.getElementById("newName").value;
    let price = parseInt(document.getElementById("newPrice").value);
    let stock = parseInt(document.getElementById("newStock").value);
    let unit = document.getElementById("newUnit").value;

    let products = JSON.parse(localStorage.getItem("products")) || [];

    let newProduct = {
        id: Date.now(),
        category: category,
        name: name,
        price: price,
        stock: stock,
        unit: unit
    };

    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));

    alert(`Товар "${name}" успешно добавлен в каталог!`);
    document.getElementById("addProductForm").reset();
    loadAdminData();
}

function deleteProduct(id) {
    if (confirm("Вы уверены, что хотите удалить этот товар из каталога?")) {
        let products = JSON.parse(localStorage.getItem("products")) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem("products", JSON.stringify(products));
        loadAdminData();
    }
}

function renderSalesTable(salesList) {
    let salesBody = document.getElementById("salesTableBody");
    salesBody.innerHTML = "";

    salesList.forEach(s => {
        let statusClass = "status-pending";
        if (s.status === "Перевод поступил") statusClass = "status-approved";
        if (s.status === "Отказ") statusClass = "status-rejected";

        let actionBtns = "";
        if (s.status === "Ожидает проверки") {
            actionBtns = `
                <button class="btn-approve" onclick="updateOrderStatus(${s.id}, 'approve')">Перевод поступил</button>
                <button class="btn-reject" onclick="updateOrderStatus(${s.id}, 'reject')">Отказ</button>
            `;
        } else {
            actionBtns = `<em>Завершено</em>`;
        }

        salesBody.innerHTML += `
            <tr>
                <td>${s.dateTime}</td>
                <td><strong>${s.customer}</strong></td>
                <td>${s.product}</td>
                <td>${s.amount}</td>
                <td><strong>${s.total.toLocaleString()} тг</strong></td>
                <td class="${statusClass}">${s.status}</td>
                <td>${actionBtns}</td>
            </tr>
        `;
    });
}

function updateOrderStatus(saleId, action) {
    let sales = JSON.parse(localStorage.getItem("sales")) || [];
    let sale = sales.find(s => s.id === saleId);

    if (action === 'approve') {
        sale.status = "Перевод поступил";
        alert("Перевод подтвержден!");
    } else {
        sale.status = "Отказ";
        alert("Заказ отклонен!");
    }

    localStorage.setItem("sales", JSON.stringify(sales));
    loadAdminData();
}

function filterSales() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    let filtered = sales.filter(s => 
        s.customer.toLowerCase().includes(query) || 
        s.dateTime.includes(query)
    );

    renderSalesTable(filtered);
}

function calculateTopProducts(sales) {
    let counts = {};
    sales.filter(s => s.status === "Перевод поступил").forEach(s => {
        counts[s.product] = (counts[s.product] || 0) + 1;
    });

    let sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    if(sorted.length > 0) {
        document.getElementById("topProduct").innerText = `${sorted[0][0]}`;
        document.getElementById("leastProduct").innerText = `${sorted[sorted.length-1][0]}`;
    }
}