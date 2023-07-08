"""All views"""

from base.models import Contract, Nip, NotificationContact, ErrorLog, ContractToFix
from rest_framework import status

from django.db.models import Max, QuerySet

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

import threading
from typing import List
from django.db.models import Q

from rest_framework.generics import ListAPIView
from django.db.models import Model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.serializers import ValidationError
from typing import Type
import datetime
import pandas as pd
from collections.abc import Iterable
from geopy import distance

from .serializers import (
    ContractSerializer,
    NipSerializer,
    ErrorLogSerializer,
    NotificationContactSerializer,
    ContractToFixSerializer,
)

MSG = "msg"


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Token serializer"""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    """Token view"""

    serializer_class = MyTokenObtainPairSerializer


class GetRoutes(APIView):
    """Return all API routes"""

    def get(self, request):
        routes = [
            "/api/token/",
            "/api/token/refresh/",
            "/api/contract/<path:pk>/",
            "/api/contracts/",
            "/api/contracts/filter/",
            "/api/contacts/<int:pk>/" "/api/ppe/",
            "/api/stats/",
            "/api/error/",
            "/api/annex/",
            "/api/contracttofix/<int:pk>/",
            "/api/contracttofix/",
            "/api/contracttofix/filter/",
            "/api/nip/",
            "/api/nip/<int:pk>/",
        ]
        return Response(routes)


class ContractsView(APIView):
    """Returns or edits a contract"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        contracts = Contract.objects.all().order_by("-date_signed")[:100]
        serializer = ContractSerializer(contracts, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not isinstance(request.data, list):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        t = threading.Thread(
            target=self._add_contracts, args=[request.data], daemon=True
        )
        t.start()
        return Response()

    @staticmethod
    def _add_contracts(data):
        for x in data:
            try:
                query = Contract.objects.filter(contract_number=x["contract_number"])
                if query:
                    serializer = ContractSerializer(
                        instance=query.first(), data=x, partial=True
                    )
                    if serializer.is_valid():
                        serializer.save()
                else:
                    serializer = ContractSerializer(data=x, partial=True)
                    if serializer.is_valid():
                        serializer.save()
            except:
                print(x)
        return True


class PPEView(APIView):
    """
    Handles adding PPE number in Contract model
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not isinstance(request.data, list):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        t = threading.Thread(
            target=self._add_contracts, args=[request.data], daemon=True
        )
        t.start()
        return Response()

    @staticmethod
    def _add_contracts(data):
        for x in data:
            try:
                query = Contract.objects.filter(contract_number=x["contract_number"])
                if query:
                    serializer = ContractSerializer(
                        instance=query.first(), data=x, partial=True
                    )
                    if serializer.is_valid():
                        serializer.save()

            except:
                print("ERROR ", x)
        return True


class AnnexView(APIView):
    """
    GET
        Returns all contracts that can be continued
    POST
        Filters contracts by nip and changes to_anex to DONE
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = Contracts.objects.filter(to_annex="DONE")
        serializer = ContractSerializer(query, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not isinstance(request.data, str) and request.data.isdigit():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        nip = int(request.data)
        query = Contract.objects.filter(nip=nip)
        if query:
            query.update(to_annex="DONE")
            return Response({MSG: "OK"})
        return Response(status=status.HTTP_404_NOT_FOUND)


class NipView(APIView):
    """
    Returns all NIP numbers.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if not pk:
            nips = Nip.objects.all()
            serializer = NipSerializer(nips, many=True)
            return Response(serializer.data)

        nip = Nip.objects.filter(id=pk)
        if not nip:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = NipSerializer(nip.first())
        return Response(serializer.data)

    def post(self, request, pk=None):
        if not pk:
            serializer = NipSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        nip = Nip.objects.filter(id=pk)
        if not nip:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = NipSerializer(data=request.data, instance=nip.first())
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        nip = Nip.objects.filter(id=pk)
        if not nip:
            return Response(status=status.HTTP_404_NOT_FOUND)

        nip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FetchContractsFilter(ListAPIView):
    """
    Filters contracts
    """

    serializer_class = ContractSerializer
    filter_backends = [DjangoFilterBackend]
    permission_classes = [IsAuthenticated]
    queryset = Contract.objects.all()

    def filter_queryset(self, queryset):
        filter_backends = [DjangoFilterBackend]
        print(self.request.query_params)
        annex = self.request.query_params.get("annex", None)
        distance = self.request.query_params.get("distance", None)
        latx = self.request.query_params.get("longitude", None)
        lngx = self.request.query_params.get("latitude", None)

        for backend in list(filter_backends):
            queryset = backend().filter_queryset(self.request, queryset, view=self)

        queryset = queryset.order_by("nip")
        if annex == "true":
            queryset = queryset.exclude(to_annex__contains="DONE")
            ppes = (
                queryset.values("ppe_number")
                .exclude(ppe_number=None)
                .annotate(Max("date_end"))
            )
            q_objects = Q(ppe_number__in=[])
            [
                q_objects.add(
                    Q(ppe_number=ppe["ppe_number"], date_end=ppe["date_end__max"]), Q.OR
                )
                for ppe in ppes
            ]
            data = queryset.filter(q_objects)
            statuses = [
                "Anulowana",
                "Rozwiązana",
                "Wersja - W przygotowaniu",
                "Weryfikacja negatywna - BZS",
                "Brak",
            ]
            ppe_empty = Q(ppe_number__exact="")
            ppe_null = Q(ppe_number__isnull=True)
            status_correct = ~Q(status__in=statuses)
            ppe_empty = queryset.filter((ppe_empty | ppe_null) & (status_correct))
            queryset = ppe_empty.union(data)
            queryset = queryset
        if distance and latx and lngx:
            distance = int(distance)
            latx = float(latx)
            lngx = float(lngx)
            queryset_distance = []
            for query in queryset:
                if self.is_in_distance(
                    (latx, lngx), (query.latitude, query.longitude), distance
                ):
                    queryset_distance.append(query)
            queryset = queryset_distance
        return queryset

    @staticmethod
    def is_in_distance(center_point, check_point, radius):
        dist = distance.distance(center_point, check_point).km
        if dist <= radius:
            return True
        return False

    filterset_fields = {
        "name": ["icontains"],
        "contract_number": ["icontains"],
        "nip": ["exact"],
        "address": ["icontains"],
        "salesman": ["icontains"],
        "date_end": ["lte", "gte"],
        "date_begin": ["lte", "gte"],
    }


class ContactsView(APIView):
    """
    Manages notification's contacts
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        contacts = NotificationContact.objects.all()
        serializer = NotificationContactSerializer(contacts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NotificationContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        contact = NottificationContact.object.filter(id=pk)
        if not contact:
            return Response(status=status.HTTP_404_NOT_FOUND)
        contact.delete()
        return Response(statusus=status.HTTP_204_NO_CONTENT)


class FetchTOFixFilter(ListAPIView):
    """
    Filters contracts to fix
    """

    serializer_class = ContractToFixSerializer
    filter_backends = [DjangoFilterBackend]
    permission_classes = [IsAuthenticated]
    queryset = ContractToFix.objects.all()

    filterset_fields = {
        "salesman": ["icontains"],
        "branch": ["exact"],
        "nip": ["exact"],
    }


class ContractToFixView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return self._get_all_fix()

    def post(self, request, pk=None):
        if pk:
            query = ContractToFix.objects.filter(id=pk)
            if not query:
                return Response(status=status.HTTP_404_NOT_FOUND)

            serializer = ContractToFixSerializer(
                data=request.data, instance=query.first()
            )
            if serializer.is_valid():
                serializer.save()
                return self._get_all_fix()

        serializer = ContractToFixSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return self._get_all_fix()
        print(serializer.errors)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        query = ContractToFix.objects.filter(id=pk)
        if not query:
            return Response(status=status.HTTP_404_NOT_FOUND)
        query.delete()
        return self._get_all_fix()

    def _get_all_fix(self):
        query = ContractToFix.objects.all().order_by("salesman")
        serializer = ContractToFixSerializer(query, many=True)
        return Response(serializer.data)


class ErrorView(APIView):
    """
    Shows one error (yep only one)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        error = ErrorLog.objects.all().first()
        serializer = ErrorLogSerializer(error)
        return Response(serializer.data)


class StatsView(APIView):
    """
    Returns statsistics about
    empty values in Contract model
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_count = Contract.objects.all().count()
        ppe_number_empty = Q(ppe_number__exact="")
        ppe_number_null = Q(ppe_number__isnull=True)
        ppe_empty_count = Contract.objects.filter(
            ppe_number_empty | ppe_number_null
        ).count()
        date_end_empty_count = Contract.objects.filter(date_end__isnull=True).count()
        salesman_empty = Q(salesman__exact="")
        salesman_null = Q(salesman__isnull=True)
        salesman_empty_count = Contract.objects.filter(
            salesman_empty | salesman_null
        ).count()
        volume_empty = Q(volume__exact="")
        volume_null = Q(volume__isnull=True)
        volume_empty_count = Contract.objects.filter(volume_empty | volume_null).count()
        phone_empty = Q(phone_number__exact="")
        phone_null = Q(phone_number__isnull=True)
        phone_number_empty_count = Contract.objects.filter(
            phone_empty | phone_null
        ).count()
        address_empty = Q(address__exact="")
        address_null = Q(address__isnull=True)
        address_empty_count = Contract.objects.filter(
            address_empty | address_null
        ).count()

        annexes = Contract.objects.all().values("nip", "to_annex").distinct()
        annexes_done_count = annexes.filter(to_annex="DONE").count()

        return Response(
            {
                "ppe": f"{ppe_empty_count}/{all_count}",
                "salesman": f"{salesman_empty_count}/{all_count}",
                "date_end": f"{date_end_empty_count}/{all_count}",
                "volume": f"{volume_empty_count}/{all_count}",
                "phone_number": f"{phone_number_empty_count}/{all_count}",
                "address": f"{address_empty_count}/{all_count}",
                "annexes": f"{annexes_done_count}/{annexes.count()}",
            }
        )
