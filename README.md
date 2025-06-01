# CryptoVault

A modern cryptocurrency tracking and portfolio management web application built with Vite, Node.js, and Express.

## Features

-  Real-time cryptocurrency market data
-  Interactive price charts with multiple timeframes
-  Search and filter cryptocurrencies
-  Multiple currency support (USD, EUR, GBP, JPY, etc.)
-  Responsive design for all devices
-  Secure contact form submissions
-  Detailed market statistics and trends

## Tech Stack

- **Frontend:**
  - Vite - Fast development server and build tool
  - JavaScript (ES6+) - Modern JavaScript features
  - Chart.js - Interactive data visualization
  - Modern CSS - Responsive and dynamic styling

- **Backend:**
  - Node.js - Server-side runtime environment
  - Express.js - Web application framework
  - CORS - Enables secure cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bonsaitrees/CryptoVault.git
   cd CryptoVault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `config.json` file in the root directory:
   ```json
   {
     "server": {
       "port": 3002,
       "cors": {
         "origin": "http://localhost:5173",
         "credentials": true,
         "methods": ["GET", "POST"],
         "allowedHeaders": ["Content-Type"]
       }
     }
   }
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3002

## Project Structure

```
CryptoVault/
├── js/                    # JavaScript source files
│   ├── market.js         # Market page functionality
│   ├── services/         # API services
│   └── utils.js          # Utility functions
├── page/                 # HTML pages
│   └── market.html       # Market page
├── public/              # Static assets
├── src/                 # Source files
│   └── server/          # Server-side code
├── config.json          # Configuration file
├── index.html           # Main entry point
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Pages

- **Home**: Landing page with key features and hero section
- **About**: Project information and team details
- **Security**: Security features and measures
- **Pricing**: Subscription plans and pricing
- **Market**: Real-time cryptocurrency market data
- **Contact**: Support and contact information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [CoinGecko API](https://www.coingecko.com/en/api) for cryptocurrency data
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Vite](https://vitejs.dev/) for the build tool 
