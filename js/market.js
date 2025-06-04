import cryptoService from '@/services/coinmarketcapService.js';
import { formatCurrency, formatNumber } from '@/utils.js';
import { Chart } from 'chart.js';

class MarketPage {
    constructor() {
        this.marketList = document.getElementById('market-list');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.errorMessage = document.getElementById('error-message');
        this.graphModal = document.getElementById('graph-modal');
        this.closeModalBtn = document.getElementById('close-modal');
        this.modalContent = document.getElementById('modal-content');
        this.currentChart = null;
        this.currentSymbol = null;
        this.allCoins = []; // Store all fetched coins for filtering/sorting
        this.searchInput = document.getElementById('search-input');
        this.sortSelect = document.getElementById('sort-select');
        this.currencySelect = document.getElementById('currency-select');
        this.coins = [];
        this.currentSort = 'market_cap_desc';
        this.currentSearch = '';
        this.currentCurrency = 'usd';

        //currency
        this.currencySymbols = {
            usd: '$',
            eur: '€',
            gbp: '£',
            jpy: '¥',
            aud: 'A$',
            cad: 'C$',
            chf: 'CHF ',
            cny: '¥',
            inr: '₹'
        };
    }

    async init() {
        this.setupEventListeners();
        await this.loadMarketData();
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.sortSelect.addEventListener('change', () => this.handleSort());
        this.currencySelect.addEventListener('change', () => this.handleCurrencyChange());
        this.closeModalBtn.addEventListener('click', () => this.closeGraphModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.graphModal) {
                this.closeGraphModal();
            }
        });
    }

    async handleCurrencyChange() {
        this.currentCurrency = this.currencySelect.value;
        cryptoService.setCurrency(this.currentCurrency);
        await this.loadMarketData();
    }

    async loadMarketData() {
        this.showMainLoading();
        try {
            // Fetch latest listings from the service
            const result = await cryptoService.getLatestListings();
            console.log('Result from getLatestListings:', result);
            // Store all coins for filtering and sorting
            this.coins = result.data;
          
            this.renderMarketData(this.coins);
            this.hideMainLoading();
        } catch (error) {
            console.error('Error in loadMarketData:', error);
            // error message on failure
            this.showError('Failed to load market data. Please try again later.');
            this.hideMainLoading();
        }
    }

    renderMarketData(coins) {
        console.log('Rendering market data with coins:', coins);
        
        if (this.marketList) {
            this.marketList.innerHTML = '';
        }

        // If no coins or data is empty, show a message
        if (!coins || coins.length === 0) {
            this.showError('No cryptocurrency data available.');
            this.coins = []; 
            return;
        }

        // Sort coins by market cap
        if (this.currentSort.startsWith('market_cap')) {
            console.log('Sorting by market cap:', this.currentSort);
            coins.sort((a, b) => {
                const valueA = Number(a.market_cap) || 0;
                const valueB = Number(b.market_cap) || 0;
                return this.currentSort === 'market_cap_asc' ? valueA - valueB : valueB - valueA;
            });
        }

       
        coins.forEach((coin) => {
            const card = this.createCryptoCard(coin);
            if (this.marketList) {
                this.marketList.appendChild(card);
            }
        });

       
        console.log('Rendered coins:', coins.map(coin => ({
            name: coin.name,
            marketCap: coin.market_cap,
            sort: this.currentSort
        })));
    }

    createCryptoCard(coin) {
        const card = document.createElement('div');
        card.className = 'crypto-card';
        // Store coin ID on the card for detail fetching
        card.dataset.coinId = coin.id; 
        
        const priceChange = coin.price_change_percentage_24h;
        
        const priceChangeClass = priceChange !== undefined && priceChange >= 0 ? 'positive' : 'negative';

       
        const marketCap = Number(coin.market_cap) || 0;
        const formattedMarketCap = this.formatMarketCap(marketCap);

        
        card.innerHTML = `
            <div class="crypto-header">
                <img src="${coin.image}" alt="${coin.name} Icon" class="crypto-icon">
                <div class="crypto-info">
                    <h3>${coin.name}</h3>
                    <span class="crypto-symbol">${coin.symbol ? coin.symbol.toUpperCase() : 'N/A'}</span>
                </div>
            </div>
            <div class="crypto-price">${this.formatPrice(coin.current_price)}</div>
            <div class="crypto-stats">
                <div class="stat">
                    <span class="stat-label">24h Change</span>
                    <span class="stat-value ${priceChangeClass}">${priceChange !== undefined ? priceChange.toFixed(2) + '%' : 'N/A'}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Volume (24h)</span>
                    <span class="stat-value">${this.formatVolume(coin.total_volume)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Market Cap</span>
                    <span class="stat-value">${formattedMarketCap}</span>
                </div>
            </div>
            <button class="view-details-btn">View Details</button>
        `;

        // Add event listener to the View Details button
        const viewDetailsBtn = card.querySelector('.view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                // Use the coin ID stored on the card
                const coinId = card.dataset.coinId;
                if (coinId) {
                    this.showDetails(coinId);
                }
            });
        }

        return card;
    }

    formatPrice(price) {
        // Check if price is a valid number
        if (price === null || price === undefined || isNaN(price)) {
            const symbol = this.currencySymbols[this.currentCurrency.toLowerCase()] || this.currentCurrency.toUpperCase();
            return `${symbol} N/A`;
        }
        const symbol = this.currencySymbols[this.currentCurrency.toLowerCase()] || this.currentCurrency.toUpperCase();
        const formattedPrice = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
        if (this.currentCurrency === 'jpy') {
            // JPY is a special case often not using decimals and symbol placement varies
            return `¥${price.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
        }
        // For other currencies, place the symbol before the number
        return `${symbol}${formattedPrice}`;
    }

    formatMarketCap(marketCap) {
        // Check if marketCap is a valid number
        if (marketCap === null || marketCap === undefined || isNaN(marketCap)) {
            const symbol = this.currencySymbols[this.currentCurrency.toLowerCase()] || this.currentCurrency.toUpperCase();
            return `${symbol} N/A`;
        }
        const symbol = this.currencySymbols[this.currentCurrency.toLowerCase()] || this.currentCurrency.toUpperCase();
        let formattedMarketCap;
        if (marketCap >= 1e12) {
            formattedMarketCap = `${(marketCap / 1e12).toFixed(2)}T`;
        } else if (marketCap >= 1e9) {
            formattedMarketCap = `${(marketCap / 1e9).toFixed(2)}B`;
        } else if (marketCap >= 1e6) {
            formattedMarketCap = `${(marketCap / 1e6).toFixed(2)}M`;
        } else {
             formattedMarketCap = marketCap.toLocaleString();
        }
        // For most currencies, place the symbol before the number
        return `${symbol}${formattedMarketCap}`;
    }

    formatVolume(volume) {
        // Check if volume is a valid number
        if (volume === null || volume === undefined || isNaN(volume)) {
            const symbol = this.currencySymbols[this.currentCurrency.toLowerCase()] || this.currentCurrency.toUpperCase();
            return `${symbol} N/A`;
        }
        const symbol = this.currencySymbols[this.currentCurrency.toLowerCase()] || this.currentCurrency.toUpperCase();
        let formattedVolume;
        if (volume >= 1e12) {
            formattedVolume = `${(volume / 1e12).toFixed(2)}T`;
        } else if (volume >= 1e9) {
            formattedVolume = `${(volume / 1e9).toFixed(2)}B`;
        } else if (volume >= 1e6) {
            formattedVolume = `${(volume / 1e6).toFixed(2)}M`;
        } else {
            formattedVolume = volume.toLocaleString();
        }
         // For most currencies, place the symbol before the number
        return `${symbol}${formattedVolume}`;
    }

    handleSearch() {
        this.currentSearch = this.searchInput.value;
        this.filterAndSortCoins();
    }

    handleSort() {
        this.currentSort = this.sortSelect.value;
        this.filterAndSortCoins();
    }

    filterAndSortCoins() {
        let filteredCoins = this.coins;

        // Apply search filter
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filteredCoins = filteredCoins.filter(coin => 
                coin.name.toLowerCase().includes(searchLower) || 
                coin.symbol.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        const [field, order] = this.currentSort.split('_');
        console.log('Sorting by:', field, order);
        
        filteredCoins.sort((a, b) => {
            let valueA, valueB;

            // Handle different sorting fields
            switch (field) {
                case 'price':
                    valueA = a.current_price;
                    valueB = b.current_price;
                    break;
                case 'market_cap':
                    valueA = a.market_cap || 0;
                    valueB = b.market_cap || 0;
                    console.log('Market Cap values:', { 
                        coinA: a.name, 
                        valueA: valueA, 
                        coinB: b.name, 
                        valueB: valueB 
                    });
                    break;
                case 'volume':
                    valueA = a.total_volume;
                    valueB = b.total_volume;
                    break;
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                default:
                    valueA = a[field];
                    valueB = b[field];
            }

            // Handle string comparison for name sorting
            if (field === 'name') {
                return order === 'asc' 
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            // Handle numeric comparison for other fields
            // Convert to numbers to ensure proper comparison
            valueA = Number(valueA);
            valueB = Number(valueB);
            
            return order === 'asc' 
                ? valueA - valueB
                : valueB - valueA;
        });

        this.renderMarketData(filteredCoins);
    }

    async showGraph(coinId) {
        this.showModalLoading(); // Show loading spinner in modal
        if (this.graphModal) this.graphModal.style.display = 'block'; // Show the modal

        try {
            // Fetch historical data using coin ID
            const historicalData = await cryptoService.getHistoricalData(coinId, 30); // Default to 30 days

            if (!historicalData || !historicalData.data || !historicalData.data.prices || historicalData.data.prices.length === 0) {
                 this.showErrorInModal('Historical data not available for this cryptocurrency.');
                return;
            }

            const pricesData = historicalData.data.prices;

            // Prepare data for the chart
            const labels = pricesData.map(priceData => new Date(priceData[0]).toLocaleDateString());
            const prices = pricesData.map(priceData => priceData[1]);

            // Calculate price change for display
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];
            const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
            const priceChangeColor = priceChange >= 0 ? '#22c55e' : '#ef4444';

            // Determine chart y-axis limits with padding
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const padding = (maxPrice - minPrice) * 0.1;

            // Create chart container HTML
            const chartContainer = document.createElement('div');
             chartContainer.innerHTML = `
                <h2>${coinId.toUpperCase()} Price History</h2>
                <p style="color: ${priceChangeColor};">Change (30 Days): ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%</p>
                 <div class="time-filters">
                    <button data-days="7">7D</button>
                    <button data-days="30">30D</button>
                    <button data-days="90">90D</button>
                    <button data-days="365">1Y</button>
                </div>
                <canvas id="priceChart"></canvas>
            `;

            // Replace modal loading with chart container
            if (this.modalContent) {
                this.modalContent.innerHTML = '';
                this.modalContent.appendChild(chartContainer);
            }

            // Setup time filter buttons
             chartContainer.querySelectorAll('.time-filters button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const target = event.target;
                    const days = parseInt(target.dataset.days);
                     // Update chart with new time frame
                    if (this.currentSymbol) {
                        this.updateChart(this.currentSymbol, days);
                    }
                });
            });

            // Render the chart
            this.renderChart(labels, prices, coinId, minPrice - padding, maxPrice + padding);

        } catch (error) {
            console.error('Error showing graph:', error);
             this.showErrorInModal(`Failed to load historical data: ${error.message || error}`);
        }
    }

     async updateChart(coinId, days) {
        this.showModalLoading(); // Show loading spinner in modal while updating
         if (this.modalContent) this.modalContent.innerHTML = ''; // Clear current modal content

        try {
             // Fetch historical data for the new time frame
            const historicalData = await cryptoService.getHistoricalData(coinId, days);

             if (!historicalData || !historicalData.data || !historicalData.data.prices || historicalData.data.prices.length === 0) {
                 this.showErrorInModal('Historical data not available for this cryptocurrency or selected time frame.');
                return;
            }

            const pricesData = historicalData.data.prices;

             // Prepare data for the chart
            const labels = pricesData.map(priceData => new Date(priceData[0]).toLocaleDateString());
            const prices = pricesData.map(priceData => priceData[1]);

             // Calculate price change for display
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];
            const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
             const priceChangeColor = priceChange >= 0 ? '#22c55e' : '#ef4444';

             // Determine chart y-axis limits with padding
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
             const padding = (maxPrice - minPrice) * 0.1;

            // Create chart container HTML
            const chartContainer = document.createElement('div');
             chartContainer.innerHTML = `
                <h2>${coinId.toUpperCase()} Price History</h2>
                <p style="color: ${priceChangeColor};">Change (${days} Days): ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%</p>
                 <div class="time-filters">
                    <button data-days="7">7D</button>
                    <button data-days="30">30D</button>
                    <button data-days="90">90D</button>
                    <button data-days="365">1Y</button>
                </div>
                <canvas id="priceChart"></canvas>
            `;

             // Replace modal loading with chart container
            if (this.modalContent) {
                this.modalContent.innerHTML = '';
                this.modalContent.appendChild(chartContainer);
            }

             // Setup time filter buttons (re-add listeners after replacing innerHTML)
             chartContainer.querySelectorAll('.time-filters button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const target = event.target;
                    const days = parseInt(target.dataset.days);
                     // Update chart with new time frame
                    if (this.currentSymbol) {
                        this.updateChart(this.currentSymbol, days);
                    }
                });
            });

            // Render the updated chart
            this.renderChart(labels, prices, coinId, minPrice - padding, maxPrice + padding);

        } catch (error) {
            console.error('Error updating graph:', error);
            this.showErrorInModal(`Failed to update historical data: ${error.message || error}`);
        }
    }

    renderChart(labels, prices, coinId, yAxisMin, yAxisMax) {
        const canvas = document.getElementById('priceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart instance before creating a new one
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: coinId.toUpperCase() + ' Price',
                    data: prices,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        beginAtZero: false,
                        min: yAxisMin,
                        max: yAxisMax,
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return this.formatPrice(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.raw !== null) {
                                    label += this.formatPrice(context.raw);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        };

        // Create and store the new chart instance
        this.currentChart = new Chart(ctx, chartConfig);
    }

     // Shows the main market loading indicator and clears the market list
    showMainLoading() {
        if (this.loadingIndicator) this.loadingIndicator.style.display = 'block';
        if (this.errorMessage) this.errorMessage.style.display = 'none';
        if (this.marketList) this.marketList.innerHTML = ''; // Clear list while loading
    }

    // Hides the main market loading indicator
    hideMainLoading() {
        if (this.loadingIndicator) this.loadingIndicator.style.display = 'none';
    }

     // Shows a loading spinner within the modal content area
    showModalLoading() {
        if (this.modalContent) {
            this.modalContent.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Loading data...</p>
                </div>
            `;
        }
    }

    // Hides the modal loading indicator (content is usually replaced)
    hideModalLoading() {
        // The loading content is replaced by renderDetails or showErrorInModal,
        // so explicit hiding might not be strictly necessary unless you have
        // a persistent modal loading element outside of modalContent.
    }

    // Displays an error message in the main market area and clears the list
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
        }
         if (this.marketList) this.marketList.innerHTML = ''; // Clear list on error
    }

    // Displays an error message within the modal content area
    showErrorInModal(message) {
        if (this.modalContent) {
            this.modalContent.innerHTML = `
                <div class="error-container">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    async showDetails(coinId) {
        this.showModalLoading(); // Show loading spinner in modal
        if (this.graphModal) this.graphModal.style.display = 'block'; // Show the modal

        try {
            // Fetch coin details using coin ID
            const coinDetails = await cryptoService.getCryptoDetails(coinId);
            console.log('Coin details:', coinDetails);

             // Render the coin details in the modal
            this.renderDetails(coinDetails.data);

            // Note: We are not hiding the modal loading explicitly here
            // because renderDetails replaces the modal content.

        } catch (error) {
            console.error('Error showing details:', error);
             this.showErrorInModal(`Failed to load coin details: ${error.message || error}`);
             // Note: We are not hiding the modal loading explicitly here
             // because showErrorInModal replaces the modal content.
        }
    }

    renderDetails(coinDetails) {
        // Render the detailed coin information (excluding description as requested)
        if (this.modalContent) {
            this.modalContent.innerHTML = `
                <h2>${coinDetails.name} (${coinDetails.symbol ? coinDetails.symbol.toUpperCase() : 'N/A'})</h2>
                <p><strong>Rank:</strong> ${coinDetails.market_cap_rank}</p>
                <p><strong>Current Price:</strong> ${this.formatPrice(coinDetails.market_data.current_price[this.currentCurrency])}</p>
                <p><strong>Market Cap:</strong> ${this.formatMarketCap(coinDetails.market_data.market_cap[this.currentCurrency])}</p>
                <p><strong>Volume (24h):</strong> ${this.formatVolume(coinDetails.market_data.total_volume[this.currentCurrency])}</p>
                <button class="view-graph-btn">View Price Graph (30 Days)</button>
            `;

            // Add event listener to the View Graph button
            const viewGraphBtn = this.modalContent.querySelector('.view-graph-btn');
            if (viewGraphBtn) {
                viewGraphBtn.addEventListener('click', () => {
                     // Use the coin ID from the current coin details
                    const coinId = coinDetails.id;
                    if (coinId) {
                        this.showGraph(coinId);
                    }
                });
            }
        }
    }

    closeGraphModal() {
        this.graphModal.style.display = 'none';
        this.modalContent.innerHTML = '';
        // Destroy chart instance when modal is closed to prevent memory leaks
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }
    }
}

// Initialize the market page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const marketPage = new MarketPage();
    marketPage.init();
}); 
