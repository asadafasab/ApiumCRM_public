from django.urls import path
from .views import (
    GetRoutes,
    NipView,
    PPEView,
    ContractsView,
    ContactsView,
    AnnexView,
    ErrorView,
    StatsView,
    ContractToFixView,
    FetchTOFixFilter,
    FetchContractsFilter,
    MyTokenObtainPairView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.urlpatterns import format_suffix_patterns


urlpatterns = [
    path("", GetRoutes.as_view()),
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("nip/", NipView.as_view(), name="nip_url"),
    path("nip/<int:pk>/", NipView.as_view(), name="nip_pk_url"),
    path("ppe/", PPEView.as_view()),
    path("contracts/", ContractsView.as_view()),
    path("contracts/filter/", FetchContractsFilter.as_view()),
    path("annex/", AnnexView.as_view()),
    path("contacts/", ContactsView.as_view(), name="contacts_url"),
    path("error/", ErrorView().as_view(), name="error_url"),
    path("stats/", StatsView().as_view(), name="stats_url"),
    path("contracttofix/", ContractToFixView().as_view(), name="contract_fix_url"),
    path(
        "contracttofix/filter/",
        FetchTOFixFilter().as_view(),
        name="contract_filter_fix_url",
    ),
    path(
        "contracttofix/<int:pk>/",
        ContractToFixView().as_view(),
        name="contract_fix_url",
    ),
]
urlpatterns = format_suffix_patterns(urlpatterns)
