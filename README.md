\# Paperfolio — Stock Market Simulator



Paperfolio is a virtual stock-market simulator built for learning and practising stock trading without using real money.



\## Features



\- User registration and token-based login

\- Stock listings and simulated price updates

\- Virtual buying and selling of shares

\- Portfolio tracking, including cash, holdings, and profit/loss

\- Transaction history

\- Watchlist

\- Stock price history and charts

\- Market-hours handling for the Indian market



\## Technology Stack



\*\*Frontend\*\*

\- React

\- Vite

\- JavaScript



\*\*Backend\*\*

\- Python

\- Django and Django REST Framework

\- MySQL



\## Prerequisites



Install the following before running the project:



\- Python

\- Node.js and npm

\- MySQL



\## Run the Backend



Open a terminal:



```bat

cd backend

```



Activate your Python virtual environment if you have one, then install dependencies:



```bat

pip install -r requirements.txt

```



Configure the database and environment variables as required by your local setup. Then run:



```bat

python manage.py migrate

python manage.py runserver

```



The backend runs at `http://127.0.0.1:8000/` by default.



\## Run the Frontend



Open a second terminal:



```bat

cd frontend

npm install

npm run dev

```



Configure `VITE\_API\_URL` in the frontend environment file to point to the backend API, normally:



```text

VITE\_API\_URL=http://localhost:8000/api

```



Open the local URL printed by Vite, usually `http://localhost:5173/`.



\## API Areas



\- `/api/auth/` — registration and login

\- `/api/stocks/` — stock data and price history

\- `/api/portfolio/` — portfolio summary and performance

\- `/api/trading/` — buying, selling, and transaction history

\- `/api/watchlist/` — watchlist management



\## Important Note



This is a learning simulator. Trades use virtual money and do not execute real stock-market orders. Stock prices are simulated and should not be treated as live investment data.



