class CryptoService {
    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
        this.selectedCurrency = 'usd';
        this.requestDelayMs = 200; // milliseconds delay between requests
    }

    setCurrency(currency) {
        this.selectedCurrency = currency.toLowerCase();
    }

    async getLatestListings() {
        try {
            await this.delay(this.requestDelayMs); // Add delay
            const response = await fetch(`${this.baseUrl}/coins/markets?vs_currency=${this.selectedCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
            if (!response.ok) {
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
            await this.delay(this.requestDelayMs); // Add delay
            const response = await fetch(`${this.baseUrl}/coins/${symbol}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
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
            await this.delay(this.requestDelayMs); // Add delay
            const response = await fetch(
                `${this.baseUrl}/coins/${symbol}/market_chart?vs_currency=${this.selectedCurrency}&days=${days}`
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch historical data from CoinGecko: ${response.statusText}`);
            }
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching historical data:', error);
            throw error;
        }
    }

    // Helper function to introduce a delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new CryptoService();