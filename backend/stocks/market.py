
from datetime import datetime, time
from zoneinfo import ZoneInfo
import holidays


MARKET_TIMEZONE = ZoneInfo("Asia/Kolkata")

MARKET_OPEN = time(9, 15)
MARKET_CLOSE = time(15, 30)

# General Indian holidays (not an official NSE trading calendar)
INDIA_HOLIDAYS = holidays.country_holidays("IN")


def is_market_open():
    now = datetime.now(MARKET_TIMEZONE)

    # Monday = 0, Sunday = 6
    if now.weekday() >= 5:
        return False

    # Do not treat listed Indian holidays as market days
    if now.date() in INDIA_HOLIDAYS:
        return False

    current_time = now.time()

    return MARKET_OPEN <= current_time <= MARKET_CLOSE
