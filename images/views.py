from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet, GenericViewSet
from rest_framework.views import APIView
from rest_framework import mixins, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
    NotFound,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema

from images.models import Image, Gallery
from images.serializers import ImagesSerializer, GallerySerializer


class ImageViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet
):
    queryset = Image.objects.all()
    # Здесь пришлось поменять с IsAuthenticated на AllowAny, 
    # потому что теперь мы этот вьюсет вызываем при регистрации, 
    # т.е. когда мы еще не авторизированы
    permission_classes = [AllowAny]
    serializer_class = ImagesSerializer
    parser_classes = [MultiPartParser, FormParser]
