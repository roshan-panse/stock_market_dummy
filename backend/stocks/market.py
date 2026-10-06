from datetime import datetime, time
from zoneinfo import ZoneInfo


MARKET_TIMEZONE = ZoneInfo("Asia/Kolkata")

MARKET_OPEN = time(9, 15)
MARKET_CLOSE = time(15, 30)


def is_market_open():
    now = datetime.now(MARKET_TIMEZONE)

    # Monday = 0, Sunday = 6
    if now.weekday() >= 5:
        return False

    current_time = now.time()

    return MARKET_OPEN <= current_time <= MARKET_CLOSE