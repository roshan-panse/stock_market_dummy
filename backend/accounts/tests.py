from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Account
from rest_framework.authtoken.models import Token


class AccountAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registration_creates_user_and_starting_cash_balance(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newtrader",
                "email": "newtrader@example.com",
                "password": "safe-password-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="newtrader")
        account = Account.objects.get(user=user)

        self.assertTrue(user.check_password("safe-password-123"))
        self.assertEqual(account.cash_balance, Decimal("100000.00"))

    def test_registration_rejects_short_password(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "shortpass",
                "email": "short@example.com",
                "password": "123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username="shortpass").exists())

    def test_registration_rejects_duplicate_username(self):
        User.objects.create_user(
            username="existing",
            password="safe-password-123",
        )

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "existing",
                "email": "another@example.com",
                "password": "safe-password-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.filter(username="existing").count(), 1)

    def test_login_returns_token_for_valid_credentials(self):
        user = User.objects.create_user(
            username="loginuser",
            password="safe-password-123",
        )

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "loginuser",
                "password": "safe-password-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "loginuser")
        self.assertTrue(response.data["token"])
        self.assertTrue(Token.objects.filter(user=user).exists())

    def test_login_rejects_invalid_password(self):
        User.objects.create_user(
            username="loginuser",
            password="safe-password-123",
        )

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "loginuser",
                "password": "wrong-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("token", response.data)
