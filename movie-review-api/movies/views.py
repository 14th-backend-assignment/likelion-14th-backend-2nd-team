from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count
from .models import Movie
from .serializers import MovieListSerializer, MovieDetailSerializer

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['genre', 'release_year']
    search_fields = ['title', 'director']
    ordering_fields = ['release_year', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return MovieListSerializer
        return MovieDetailSerializer

    def get_queryset(self):
        qs = Movie.objects.all()
        if self.action == 'list':
            qs = qs.annotate(
                average_rating=Avg('reviews__rating'),
                review_count=Count('reviews')
            )
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]