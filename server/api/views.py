from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def healthcheck(_request):
    return Response({"message": "Successfully reached backend!"})

