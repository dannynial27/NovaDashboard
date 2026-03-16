/**
 * Nova Dashboard - Application Logic
 */

// --- Application State ---
const AppState = {
    balance: 124562.00,
    profit: 32104.50,
    expenses: 8430.25,
    transactions: [
        { id: '#TRX-9482', date: 'Oct 24, 2023 14:30', recipient: 'Sarah Connor', avatar: 'https://i.pravatar.cc/150?img=47', type: 'Transfer', amount: -500.00, status: 'Completed', isIcon: false },
        { id: '#TRX-9481', date: 'Oct 23, 2023 09:15', recipient: 'Netflix', icon: 'fa-play', bgClass: 'netflix', type: 'Subscription', amount: -15.99, status: 'Completed', isIcon: true },
        { id: '#TRX-9480', date: 'Oct 21, 2023 11:20', recipient: 'TechCorp Inc.', avatar: 'https://i.pravatar.cc/150?img=60', type: 'Salary', amount: 8500.00, status: 'Completed', isIcon: false },
        { id: '#TRX-9479', date: 'Oct 20, 2023 16:45', recipient: 'Binance Deposit', icon: 'fa-btc', bgClass: 'binance', isBrand: true, type: 'Investment', amount: -2000.00, status: 'Pending', isIcon: true }
    ],
    chartData: {
        '1H': { labels: ['10:00', '10:10', '10:20', '10:30', '10:40', '10:50', '11:00'], data: [124500, 124550, 124540, 124580, 124590, 124562, 124600] },
        '1D': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], data: [122000, 122500, 121000, 123000, 124000, 124562, 124800] },
        '1W': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [42000, 43500, 41200, 48000, 46500, 52000, 124562] },
        '1M': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [105000, 110000, 108000, 124562] },
        '1Y': { labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'], data: [80000, 95000, 90000, 105000, 115000, 124562] }
    },
    activeChartFilter: '1W'
};

let portfolioChartInstance = null;
let currentRecipientContext = { name: 'Sarah Connor', avatar: 'https://i.pravatar.cc/150?img=32' };

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialization ---
    initPortfolioChart();
    renderTransactions();
    updateBalanceDisplay();
    
    // --- UI Interactions ---
    setupMobileMenu();
    setupChartFilters();
    setupQuickTransfer();
    setupSearch();
    
    // --- Complete System Features ---
    setupNavigation();
    setupDropdowns();
    setupExportCSV();
    setupAddRecipientModal();
    
    // --- New Chart Initializations ---
    initAllocationChart();
    initCashflowChart();
    renderFullTransactionsTable();
});

// --- Navigation Logic (SPA) ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-view]');
    const viewSections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Handle Logout special case
            if (link.id === 'sidebar-logout-btn' || link.id === 'dropdown-logout-btn') {
                showToast('Logged Out', 'You have been successfully logged out.', 'info');
                return;
            }

            const targetViewId = link.getAttribute('data-view');
            if(!targetViewId) return;

            // Update UI State
            viewSections.forEach(section => section.classList.remove('active'));
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));

            // Show active view
            const targetView = document.getElementById(`${targetViewId}-view`);
            if(targetView) targetView.classList.add('active');

            // Find closest li if in sidebar and make it active
            const parentLi = link.closest('.nav-item');
            if (parentLi && link.closest('.sidebar')) {
                parentLi.classList.add('active');
            }
            
            // Close sidebar on mobile after clicking
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 992 && sidebar.classList.contains('mobile-active')) {
                sidebar.classList.remove('mobile-active');
                document.querySelector('.mobile-only-toggle i').className = 'fa-solid fa-bars';
            }
        });
    });
}

// --- Header Dropdowns ---
function setupDropdowns() {
    const notifBtn = document.getElementById('notif-btn');
    const notifMenu = document.getElementById('notif-menu');
    const profileBtn = document.getElementById('profile-btn');
    const profileMenu = document.getElementById('profile-menu');

    // Toggle logic
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.remove('show');
        notifMenu.classList.toggle('show');
        notifBtn.classList.remove('active-ping'); // Remove ping indicator after viewing
    });

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifMenu.classList.remove('show');
        profileMenu.classList.toggle('show');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!notifMenu.contains(e.target) && e.target !== notifBtn) {
            notifMenu.classList.remove('show');
        }
        if (!profileMenu.contains(e.target) && e.target !== profileBtn) {
            profileMenu.classList.remove('show');
        }
    });

    // Mark as read mock feature
    document.querySelector('.mark-read')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
        showToast('Success', 'All notifications marked as read.', 'success');
    });
}

// --- Export CSV Logic ---
function setupExportCSV() {
    const exportBtn = document.getElementById('export-csv-btn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
        if (AppState.transactions.length === 0) {
            showToast('Export Failed', 'No transactions to export.', 'warning');
            return;
        }

        // Generate CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Transaction ID,Date,Recipient,Type,Amount,Status\n";

        // Add Data Rows
        AppState.transactions.forEach(tx => {
            const row = [
                tx.id,
                `"${tx.date}"`, // wrap in quotes to handle commas in date
                `"${tx.recipient}"`,
                tx.type,
                tx.amount.toFixed(2),
                tx.status
            ];
            csvContent += row.join(",") + "\n";
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "nova_transactions_export.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);

        showToast('Export Successful', 'Your transaction history has been downloaded.', 'success');
    });
}

// --- Add Recipient Modal ---
function setupAddRecipientModal() {
    const modal = document.getElementById('add-recipient-modal');
    const addBtn = document.getElementById('add-recipient-btn');
    const closeBtns = modal.querySelectorAll('.modal-close, .modal-cancel');
    const saveBtn = document.getElementById('save-recipient-btn');
    const input = document.getElementById('new-recipient-name');
    const usersList = document.getElementById('quick-transfer-users');

    // Show modal
    addBtn.addEventListener('click', () => {
        modal.classList.add('show');
        input.value = ''; // Reset input
        input.focus();
    });

    // Hide modal
    const hideModal = () => modal.classList.remove('show');
    closeBtns.forEach(btn => btn.addEventListener('click', hideModal));

    // Save logic
    saveBtn.addEventListener('click', () => {
        const name = input.value.trim();
        if (!name) {
            showToast('Error', 'Please enter a valid name.', 'error');
            return;
        }

        // Generate a random avatar ID for the new recipient
        const randomImgId = Math.floor(Math.random() * 70) + 1;
        const newAvatarSrc = `https://i.pravatar.cc/150?img=${randomImgId}`;

        // Create new image element
        const newImg = document.createElement('img');
        newImg.src = newAvatarSrc;
        newImg.alt = name;
        newImg.className = 'transfer-avatar';

        // Add event listener to new recipient
        newImg.addEventListener('click', (e) => {
            document.querySelectorAll('.transfer-avatar').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            currentRecipientContext = {
                name: name,
                avatar: newAvatarSrc
            };
        });

        // Insert before the generic add button
        usersList.insertBefore(newImg, addBtn);
        
        // Auto-select the newly added recipient
        newImg.click();

        hideModal();
        showToast('Success', `${name} added to quick transfer list.`, 'success');
    });
}

// --- UI Updaters ---
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function updateBalanceDisplay() {
    document.querySelector('.stat-card:nth-child(1) .card-value').textContent = formatCurrency(AppState.balance);
    document.querySelector('.stat-card:nth-child(2) .card-value').textContent = formatCurrency(AppState.profit);
    document.querySelector('.stat-card:nth-child(3) .card-value').textContent = formatCurrency(AppState.expenses);
}

function renderTransactions(filterText = '') {
    const tbody = document.querySelector('.transactions-table tbody');
    if(!tbody) return;
    
    // Only render top 4 for the dashboard view
    const dashboardTbody = document.querySelector('#dashboard-view .transactions-table tbody');
    if(dashboardTbody) dashboardTbody.innerHTML = '';
    
    const filteredTransactions = AppState.transactions.filter(tx => {
        const textToSearch = `${tx.id} ${tx.recipient} ${tx.type}`.toLowerCase();
        return textToSearch.includes(filterText.toLowerCase());
    });

    if (filteredTransactions.length === 0 && dashboardTbody) {
        dashboardTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No transactions found.</td></tr>`;
        return;
    }

    // Render Dashboard Table (Max 4)
    if(dashboardTbody) {
        filteredTransactions.slice(0, 4).forEach(tx => {
            const tr = createTransactionRow(tx);
            dashboardTbody.appendChild(tr);
        });
    }
}

function renderFullTransactionsTable(filterText = '') {
    const fullTbody = document.getElementById('full-transactions-tbody');
    if(!fullTbody) return;
    
    fullTbody.innerHTML = '';
    
    // Mock generating a lot of transactions for the full view
    let allTx = [...AppState.transactions];
    for(let i=0; i<6; i++) {
        allTx = allTx.concat(AppState.transactions.map(tx => ({...tx, id: tx.id + '-' + i}))); // Duplicate mock data
    }

    const filteredTransactions = allTx.filter(tx => {
        const textToSearch = `${tx.id} ${tx.recipient} ${tx.type}`.toLowerCase();
        return textToSearch.includes(filterText.toLowerCase());
    });
    
    if (filteredTransactions.length === 0) {
        fullTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No transactions found.</td></tr>`;
        return;
    }

    // Render Full Table (slice to mock pagination)
    filteredTransactions.slice(0, 10).forEach(tx => {
        const tr = createTransactionRow(tx, true);
        fullTbody.appendChild(tr);
    });
}

function createTransactionRow(tx, showAction = false) {
    let recipientHTML = '';
    if (tx.isIcon) {
        const isBrand = tx.isBrand !== undefined ? tx.isBrand : false;
        const iconClass = isBrand ? `fa-brands ${tx.icon}` : `fa-solid ${tx.icon}`;
        recipientHTML = `<div class="tbl-user"><div class="icon-circle ${tx.bgClass}"><i class="${iconClass}"></i></div> ${tx.recipient}</div>`;
    } else {
        recipientHTML = `<div class="tbl-user"><img src="${tx.avatar}" alt="${tx.recipient}"> ${tx.recipient}</div>`;
    }

    const amountClass = tx.amount > 0 ? 'positive' : 'negative';
    const amountSign = tx.amount > 0 ? '+' : '';
    const statusClass = tx.status.toLowerCase();

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${tx.id}</td>
        <td>${tx.date}</td>
        <td>${recipientHTML}</td>
        <td>${tx.type}</td>
        <td class="${amountClass}">${amountSign}${formatCurrency(tx.amount)}</td>
        <td><span class="badge ${statusClass}">${tx.status}</span></td>
        ${showAction ? `<td><button class="secondary-btn" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fa-solid fa-ellipsis"></i></button></td>` : ''}
    `;
    return tr;
}

// --- Chart Logic ---
function initPortfolioChart() {
    const chartEl = document.getElementById('portfolioChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');
    
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(108, 92, 231, 0.4)');
    gradientFill.addColorStop(1, 'rgba(108, 92, 231, 0.0)');

    const config = {
        type: 'line',
        data: {
            labels: AppState.chartData[AppState.activeChartFilter].labels,
            datasets: [{
                label: 'Portfolio Value',
                data: AppState.chartData[AppState.activeChartFilter].data,
                borderColor: '#6c5ce7',
                borderWidth: 3,
                backgroundColor: gradientFill,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0f111a',
                pointBorderColor: '#6c5ce7',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(25, 28, 41, 0.9)',
                    titleColor: '#a4b0be',
                    bodyColor: '#f5f6fa',
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false, drawBorder: false }, ticks: { color: '#747d8c' } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, ticks: { color: '#747d8c', callback: value => '$' + (value / 1000) + 'k' } }
            },
            interaction: { intersect: false, mode: 'index' },
        }
    };

    portfolioChartInstance = new Chart(ctx, config);
}

function updateChartData(filter) {
    if(!portfolioChartInstance || !AppState.chartData[filter]) return;
    
    AppState.activeChartFilter = filter;
    portfolioChartInstance.data.labels = AppState.chartData[filter].labels;
    portfolioChartInstance.data.datasets[0].data = AppState.chartData[filter].data;
    portfolioChartInstance.update();
}

function setupChartFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateChartData(e.target.textContent);
        });
    });
}

function initAllocationChart() {
    const chartEl = document.getElementById('allocationChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Crypto', 'Stocks', 'Cash/Fiat'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    '#f3ba2f', // Bitcoin yellow
                    '#6c5ce7', // Primary purple
                    '#00cec9'  // Secondary teal
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(25, 28, 41, 0.9)',
                    titleColor: '#a4b0be',
                    bodyColor: '#f5f6fa',
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return ' ' + context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function initCashflowChart() {
    const chartEl = document.getElementById('cashflowChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
            datasets: [
                {
                    label: 'Income',
                    data: [8500, 9200, 8500, 11000, 8500, 9200],
                    backgroundColor: '#00cec9',
                    borderRadius: 4,
                },
                {
                    label: 'Expenses',
                    data: [4200, 5100, 6800, 3900, 4100, 4800],
                    backgroundColor: '#ff7675',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: { color: '#a4b0be', usePointStyle: true, boxWidth: 8 }
                },
                tooltip: {
                    backgroundColor: 'rgba(25, 28, 41, 0.9)',
                    titleColor: '#a4b0be',
                    bodyColor: '#f5f6fa',
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false, drawBorder: false }, ticks: { color: '#747d8c' } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, ticks: { color: '#747d8c', callback: value => '$' + (value / 1000) + 'k' } }
            },
            interaction: { intersect: false, mode: 'index' },
        }
    });
}

// --- Quick Transfer Logic ---
function setupQuickTransfer() {
    const transferAvatars = document.querySelectorAll('.transfer-avatar');
    const transferBtn = document.getElementById('transfer-submit-btn');
    const amountInput = document.getElementById('transfer-amount');
    if (!transferBtn || !amountInput) return;

    // Set initial context via the predefined HTML mock IDs
    transferAvatars.forEach(img => {
        img.addEventListener('click', (e) => {
            document.querySelectorAll('.transfer-avatar').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            
            currentRecipientContext = {
                name: e.target.alt || 'Unknown User',
                avatar: e.target.src
            };
        });
    });

    transferBtn.addEventListener('click', () => {
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            showToast('Invalid Amount', 'Please enter a valid amount to transfer.', 'warning');
            return;
        }

        if (amount > AppState.balance) {
            showToast('Transfer Failed', 'Insufficient funds for this transaction.', 'error');
            return;
        }

        // Process Transfer
        AppState.balance -= amount;
        
        // Generate mock transaction ID
        const txId = '#TRX-' + Math.floor(1000 + Math.random() * 9000);
        
        // Formulate date
        const dateOpt = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        const dateStr = new Date().toLocaleString('en-US', dateOpt).replace(',', '');

        // Add transaction (to beginning of array)
        AppState.transactions.unshift({
            id: txId,
            date: dateStr,
            recipient: currentRecipientContext.name,
            avatar: currentRecipientContext.avatar,
            type: 'Transfer',
            amount: -amount,
            status: 'Completed',
            isIcon: false
        });

        // Update UI
        updateBalanceDisplay();
        renderTransactions();
        
        // Reset input & Notify
        amountInput.value = '';
        showToast('Transfer Successful', `Sent ${formatCurrency(amount)} to ${currentRecipientContext.name}.`, 'success');
    });
}

// --- Search Logic ---
function setupSearch() {
    // Dashboard Search
    const dashboardSearchInput = document.querySelector('.search-bar input');
    if(dashboardSearchInput) {
        dashboardSearchInput.addEventListener('input', (e) => {
            renderTransactions(e.target.value);
        });
    }

    // Full Transactions View Search
    const fullSearchInput = document.querySelector('#transactions-view .search-bar input');
    if(fullSearchInput) {
        fullSearchInput.addEventListener('input', (e) => {
            renderFullTransactionsTable(e.target.value);
        });
    }
}

// --- Mobile Navigation ---
function setupMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if(!sidebar) return;
    
    // Create mobile toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'menu-toggle mobile-only-toggle';
    mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.body.appendChild(mobileToggle);

    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-active');
        const icon = mobileToggle.querySelector('i');
        if (sidebar.classList.contains('mobile-active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });
}

// --- Toast Notification System ---
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">
            <span class="toast-title">${title}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    const hideTimeout = setTimeout(() => {
        removeToast(toast);
    }, 5000);

    // Close button event
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(hideTimeout);
        removeToast(toast);
    });
}

function removeToast(toast) {
    if (toast.classList.contains('hiding')) return;
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => {
        toast.remove();
    });
}
