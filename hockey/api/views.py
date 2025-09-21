from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse

@api_view(['GET'])
def api_overview(request):
    """
    API Overview endpoint
    """
    api_urls = {
        'List': '/api/players/',
        'Detail View': '/api/players/<id>/',
        'Create': '/api/players/create/',
        'Update': '/api/players/<id>/update/',
        'Delete': '/api/players/<id>/delete/',
    }
    return Response(api_urls)

@api_view(['GET'])
def players_list(request):
    """
    List all players
    """
    # For now, return mock data
    players = [
        {
            'id': 1,
            'name': 'Connor McDavid',
            'position': 'Center',
            'team': 'Edmonton Oilers',
            'goals': 32,
            'assists': 67
        },
        {
            'id': 2,
            'name': 'Leon Draisaitl',
            'position': 'Center',
            'team': 'Edmonton Oilers',
            'goals': 28,
            'assists': 55
        },
        {
            'id': 3,
            'name': 'Nathan MacKinnon',
            'position': 'Center',
            'team': 'Colorado Avalanche',
            'goals': 30,
            'assists': 60
        }
    ]
    return Response(players)

@api_view(['GET'])
def player_detail(request, pk):
    """
    Get a specific player
    """
    # For now, return mock data
    player = {
        'id': pk,
        'name': 'Connor McDavid',
        'position': 'Center',
        'team': 'Edmonton Oilers',
        'goals': 32,
        'assists': 67,
        'points': 99
    }
    return Response(player)

@api_view(['POST'])
def player_create(request):
    """
    Create a new player
    """
    data = request.data
    # In a real app, you'd save this to the database
    player = {
        'id': 4,
        'name': data.get('name', ''),
        'position': data.get('position', ''),
        'team': data.get('team', ''),
        'goals': data.get('goals', 0),
        'assists': data.get('assists', 0)
    }
    return Response(player, status=status.HTTP_201_CREATED)