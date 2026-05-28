from rest_framework import viewsets, permissions, filters
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewListSerializer, ReviewDetailSerializer
from .permissions import IsOwnerOrReadOnly


class ReviewViewSet(viewsets.ModelViewSet):
    """
    영화 리뷰 CRUD API

    - list: 전체 리뷰 목록 조회
    - create: 리뷰 작성 (로그인 필요)
    - retrieve: 리뷰 상세 조회
    - update / partial_update: 리뷰 수정 (작성자만 가능)
    - destroy: 리뷰 삭제 (작성자만 가능)
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movie', 'user', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReviewListSerializer
        return ReviewDetailSerializer

    def get_queryset(self):
        return Review.objects.select_related('user', 'movie').annotate(
            like_count=Count('likes', distinct=True),
            comment_count=Count('comments', distinct=True)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)