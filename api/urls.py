from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_overview, name='api-overview'),
    path('players/', views.players_list, name='players-list'),
    path('players/<int:pk>/', views.player_detail, name='player-detail'),
    path('players/create/', views.player_create, name='player-create'),
]
