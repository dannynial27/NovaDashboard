/**
 * Nova Dashboard - Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Chart.js Initialization ---
    initPortfolioChart();

    // --- UI Interactions ---
    setupMobileMenu();
    
});

function initPortfolioChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    
    // Define gradient for line chart
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(108, 92, 231, 0.4)'); // Primary color with opacity
    gradientFill.addColorStop(1, 'rgba(108, 92, 231, 0.0)');

    // Mock Data
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dataPoints = [42000, 43500, 41200, 48000, 46500, 52000, 55432];

    // Chart Configuration
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value ($)',
                data: dataPoints,
                borderColor: '#6c5ce7', // var(--primary)
                borderWidth: 3,
                backgroundColor: gradientFill,
                fill: true,
                tension: 0.4, // Smooth curvy lines
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
                legend: {
                    display: false // Hide legend to match clean design
                },
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
                            let value = context.parsed.y;
                            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#747d8c'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#747d8c',
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });

    // Handle Chart Filter Buttons Active State
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // In a real app, you would fetch new data and update chart here
        });
    });
}

function setupMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    
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
