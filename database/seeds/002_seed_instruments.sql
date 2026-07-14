-- ============================================================
-- TradeScope AI — Seed: Common Instruments
-- ============================================================

INSERT INTO instruments (symbol, name, asset_class, exchange, quote_currency, base_currency, contract_size, tick_size, tick_value, min_lot_size, max_lot_size) VALUES
-- Forex Majors
('EURUSD', 'Euro / US Dollar', 'forex', 'FX', 'USD', 'EUR', 100000, 0.00001, 10, 0.01, 100),
('GBPUSD', 'British Pound / US Dollar', 'forex', 'FX', 'USD', 'GBP', 100000, 0.00001, 10, 0.01, 100),
('USDJPY', 'US Dollar / Japanese Yen', 'forex', 'FX', 'JPY', 'USD', 100000, 0.001, 1000, 0.01, 100),
('USDCHF', 'US Dollar / Swiss Franc', 'forex', 'FX', 'CHF', 'USD', 100000, 0.00001, 10, 0.01, 100),
('AUDUSD', 'Australian Dollar / US Dollar', 'forex', 'FX', 'USD', 'AUD', 100000, 0.00001, 10, 0.01, 100),
('USDCAD', 'US Dollar / Canadian Dollar', 'forex', 'FX', 'CAD', 'USD', 100000, 0.00001, 10, 0.01, 100),
('NZDUSD', 'New Zealand Dollar / US Dollar', 'forex', 'FX', 'USD', 'NZD', 100000, 0.00001, 10, 0.01, 100),

-- Forex Crosses
('EURGBP', 'Euro / British Pound', 'forex', 'FX', 'GBP', 'EUR', 100000, 0.00001, 10, 0.01, 100),
('EURJPY', 'Euro / Japanese Yen', 'forex', 'FX', 'JPY', 'EUR', 100000, 0.001, 1000, 0.01, 100),
('GBPJPY', 'British Pound / Japanese Yen', 'forex', 'FX', 'JPY', 'GBP', 100000, 0.001, 1000, 0.01, 100),

-- Indices
('US30', 'Dow Jones Industrial Average', 'indices', 'CFD', 'USD', 'USD', 1, 1, 5, 0.01, 50),
('SPX500', 'S&P 500 Index', 'indices', 'CFD', 'USD', 'USD', 1, 0.1, 50, 0.01, 50),
('NAS100', 'NASDAQ 100 Index', 'indices', 'CFD', 'USD', 'USD', 1, 0.1, 20, 0.01, 50),
('UK100', 'FTSE 100 Index', 'indices', 'CFD', 'GBP', 'GBP', 1, 0.1, 10, 0.01, 50),
('GER40', 'DAX 40 Index', 'indices', 'CFD', 'EUR', 'EUR', 1, 0.5, 25, 0.01, 50),
('JPN225', 'Nikkei 225 Index', 'indices', 'CFD', 'JPY', 'JPY', 1, 5, 500, 0.01, 50),

-- Commodities
('XAUUSD', 'Gold / US Dollar', 'commodities', 'CFD', 'USD', 'XAU', 100, 0.01, 1, 0.01, 50),
('XAGUSD', 'Silver / US Dollar', 'commodities', 'CFD', 'USD', 'XAG', 5000, 0.001, 5, 0.01, 50),
('USOIL', 'WTI Crude Oil', 'commodities', 'CFD', 'USD', 'USD', 1000, 0.01, 10, 0.01, 50),
('UKOIL', 'Brent Crude Oil', 'commodities', 'CFD', 'USD', 'USD', 1000, 0.01, 10, 0.01, 50),

-- Crypto
('BTCUSD', 'Bitcoin / US Dollar', 'crypto', 'CFD', 'USD', 'BTC', 1, 0.1, 0.1, 0.01, 10),
('ETHUSD', 'Ethereum / US Dollar', 'crypto', 'CFD', 'USD', 'ETH', 1, 0.01, 0.01, 0.01, 20),
('XRPUSD', 'Ripple / US Dollar', 'crypto', 'CFD', 'USD', 'XRP', 100, 0.0001, 0.01, 0.01, 50),

-- Stocks (Major)
('AAPL', 'Apple Inc.', 'stocks', 'NASDAQ', 'USD', 'USD', 1, 0.01, 0.01, 1, 1000),
('MSFT', 'Microsoft Corporation', 'stocks', 'NASDAQ', 'USD', 'USD', 1, 0.01, 0.01, 1, 1000),
('GOOGL', 'Alphabet Inc.', 'stocks', 'NASDAQ', 'USD', 'USD', 1, 0.01, 0.01, 1, 1000),
('AMZN', 'Amazon.com Inc.', 'stocks', 'NASDAQ', 'USD', 'USD', 1, 0.01, 0.01, 1, 1000),
('TSLA', 'Tesla Inc.', 'stocks', 'NASDAQ', 'USD', 'USD', 1, 0.01, 0.01, 1, 1000),
('NVDA', 'NVIDIA Corporation', 'stocks', 'NASDAQ', 'USD', 'USD', 1, 0.01, 0.01, 1, 1000);
