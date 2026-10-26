
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const balanceDisplay = document.getElementById("balance");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");

let transactions = [];

try {
    const savedTransactions = localStorage.getItem("transactions");
    transactions = savedTransactions
        ? JSON.parse(savedTransactions)
        : [];

    if (!Array.isArray(transactions)) {
        transactions = [];
    }
} catch (error) {
    transactions = [];
}

function formatMoney(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateSummary() {
    const income = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);

    balanceDisplay.textContent = formatMoney(income - expenses);
    incomeDisplay.textContent = formatMoney(income);
    expenseDisplay.textContent = formatMoney(expenses);
}

function displayTransactions() {
    transactionList.replaceChildren();

    if (transactions.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No transactions yet. Add one above!";
        transactionList.appendChild(emptyMessage);
        return;
    }

    transactions.slice().reverse().forEach(transaction => {
        const item = document.createElement("li");

        const details = document.createElement("span");
        details.textContent =
            `${transaction.description} (${transaction.category})`;

        const amount = document.createElement("strong");
        const sign = transaction.type === "income" ? "+" : "-";
        amount.textContent = sign + formatMoney(transaction.amount);
        amount.style.color =
            transaction.type === "income" ? "#2e7d32" : "#c62828";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${transaction.description}`
        );

        deleteButton.addEventListener("click", () => {
            transactions = transactions.filter(
                item => item.id !== transaction.id
            );

            saveTransactions();
            updateSummary();
            displayTransactions();
        });

        item.append(details, amount, deleteButton);
        transactionList.appendChild(item);
    });
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;

    if (
        !description ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        (type !== "income" && type !== "expense")
    ) {
        alert("Please enter a valid description and amount.");
        return;
    }

    const transaction = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        description,
        amount,
        type,
        category
    };

    transactions.push(transaction);
    saveTransactions();
    updateSummary();
    displayTransactions();

    form.reset();
    descriptionInput.focus();
});

updateSummary();
displayTransactions();
