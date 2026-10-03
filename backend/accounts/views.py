from django.contrib.auth import authenticate
from rest_framework import generics, serializers
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs['username'],
            password=attrs['password'],
        )

        if user is None:
            raise serializers.ValidationError(
                'Invalid username or password.'
            )

        token, created = Token.objects.get_or_create(user=user)

        return {
            'token': token.key,
            'username': user.username,
        }


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data)