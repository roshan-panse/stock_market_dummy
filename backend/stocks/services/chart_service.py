import math
from decimal import Decimal, InvalidOperation
import yfinance as yf
from datetime import date, timedelta
from decimal import Decimal


def fetch_historical_prices(symbol, range_value):
    periods = {
        "1W": ("1mo", 5),
        "1M": ("1mo", 22),
        "6M": ("6mo", 130),
    }

    if range_value not in periods:
        raise ValueError("Unsupported historical chart range.")

    period, _ = periods[range_value]

    # NSE symbols on Yahoo Finance commonly use the .NS suffix.
    ticker = yf.Ticker(f"{symbol}.NS")

    history = ticker.history(
        period=period,
        interval="1d",
        auto_adjust=False,
    )

    if history.empty:
        raise ValueError(
            f"No historical data returned for {symbol}.NS. "
            "Check the symbol or try again later."
        )

  
    prices = []

    for timestamp, row in history.iterrows():
        close = row["Close"]

        # Skip missing or invalid closing prices.
        if close is None:
            continue

        try:
            close_float = float(close)

            if not math.isfinite(close_float) or close_float <= 0:
                continue

            close_decimal = Decimal(str(close_float)).quantize(
                Decimal("0.01")
            )

        except (ValueError, TypeError, InvalidOperation):
            continue

        prices.append({
            "date": timestamp.date(),
            "price": close_decimal,
        })

    if not prices:
        raise ValueError(
            f"No valid closing prices returned for {symbol}."
        )

    return prices