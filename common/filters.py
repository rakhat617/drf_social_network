from typing import Any

from rest_framework.request import Request
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import BaseFilterBackend
from django.db.models import Q, QuerySet


class SearchFilter(BaseFilterBackend):
    def filter_queryset(
        self, 
        request: Request, 
        queryset: QuerySet, 
        view: ModelViewSet | Any
    ):
        search_fields: list = getattr(view, "search_fields", [])
        search_value = request.query_params.get("search")
        queryset = queryset.filter(
            Q(username__icontains=search_value)
        )
        return queryset
        