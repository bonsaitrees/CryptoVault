class CryptoService {
    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
        this.selectedCurrency = 'usd';
        this.requestDelayMs = 200;
        this.supportedCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad', 'chf', 'cny', 'inr'];
    }

    setCurrency(currency) {
        const normalizedCurrency = currency.toLowerCase();
        if (this.supportedCurrencies.includes(normalizedCurrency)) {
            this.selectedCurrency = normalizedCurrency;
        } else {
            console.warn(`Currency ${currency} is not supported. Falling back to USD.`);
            this.selectedCurrency = 'usd';
        }
    }

    async getLatestListings() {
        try {
            await this.delay(this.requestDelayMs);
            const response = await fetch(`${this.baseUrl}/coins/markets?vs_currency=${this.selectedCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
            
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a minute.');
            }
            
            if (!response.ok) {
                if (this.selectedCurrency !== 'usd') {
                    console.warn(`Currency ${this.selectedCurrency} not supported. Falling back to USD.`);
                    this.selectedCurrency = 'usd';
                    return this.getLatestListings();
                }
                throw new Error(`Failed to fetch data from CoinGecko: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching latest listings:', error);
            throw error;
        }
    }

    async getCryptoDetails(symbol) {
        try {
            await this.delay(this.requestDelayMs);
            const response = await fetch(`${this.baseUrl}/coins/${symbol}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
            
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a minute.');
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch coin details from CoinGecko: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching crypto details:', error);
            throw error;
        }
    }

    async getHistoricalData(symbol, days) {
        try {
            await this.delay(this.requestDelayMs);
            const response = await fetch(
                `${this.baseUrl}/coins/${symbol}/market_chart?vs_currency=${this.selectedCurrency}&days=${days}`
            );
            
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a minute.');
            }
            
            if (!response.ok) {
                if (this.selectedCurrency !== 'usd') {
                    console.warn(`Currency ${this.selectedCurrency} not supported. Falling back to USD.`);
                    this.selectedCurrency = 'usd';
                    return this.getHistoricalData(symbol, days);
                }
                throw new Error(`Failed to fetch historical data from CoinGecko: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching historical data:', error);
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new CryptoService();
