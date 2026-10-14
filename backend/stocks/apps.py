
import os
import sys
import threading

from django.apps import AppConfig


class StocksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "stocks"

    def ready(self):
        # Run the background worker only with Django's runserver.
        if "runserver" not in sys.argv:
            return

        # Avoid starting it twice with Django's auto-reloader.
        if os.environ.get("RUN_MAIN") != "true":
            return

        def run_worker():
            from django.core.management import call_command
            call_command("simulate_prices")

        threading.Thread(
            target=run_worker,
            name="market-background-worker",
            daemon=True,
        ).start()
