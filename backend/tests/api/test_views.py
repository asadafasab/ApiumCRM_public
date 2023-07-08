import pytest
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
from django.urls import reverse

# from base.api.views import ContractsView
from django.contrib.auth.models import User


# factory = APIRequestFactory()


@pytest.fixture
def api_client():
    user = User.objects.create_superuser(username="user", password="password")
    user.save()
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


@pytest.fixture
def nip_data():
    return dict(
        takeover=True,
        nip=3213213214,
        client_of="Test Name",
        company_name="A Company Ltd",
        blocade_end=datetime.now(),
    )


def test_get_routes():
    client = APIClient()
    response = client.get("/api/")

    assert response.status_code < 300


# check authentication
def test_auth_all_routes():
    client = APIClient()
    api_list = [
        "/api/contract/1",
        "/api/contracts",
        "/api/contracts/filter",
        "/api/company",
        "/api/company/1",
        "/api/annex",
        "/api/nip/",
        "/api/nip/1",
    ]
    for link in api_list:
        response = client.get(link, follow=True)
        assert response.status_code == 401


# authenticate
@pytest.mark.django_db
def test_authenticate(api_client):
    url = "/api/contracts"
    response = api_client.get(url, follow=True)
    print(dir(response), response.json)
    assert response.status_code < 300


# test adding contracts from file
def test_contract_file():
    ...
    # check number of contracts


def test_annexes():
    ...


@pytest.mark.django_db
def test_add_nip(api_client, nip_data):
    url = "/api/nip/"
    response = api_client.post(url, nip_data, follow=True)
    assert response.status_code < 300

    received_data = api_client.get(url, follow=True).data
    received_data = dict(received_data[0])

    assert received_data["nip"] == nip_data["nip"]
    assert received_data["takeover"] == nip_data["takeover"]
    assert received_data["client_of"] == nip_data["client_of"]
    assert received_data["company_name"] == nip_data["company_name"]


@pytest.mark.django_db
def test_delete_nip(api_client, nip_data):
    url_link = "/api/nip/"
    response = api_client.post(url_link, nip_data, follow=True)
    pk = response.data["id"]

    url = reverse("nip_pk_url", kwargs=dict(pk=pk))
    response = api_client.delete(url, follow=True)
    received_data = api_client.get(url_link, follow=True).data
    assert received_data == []


@pytest.mark.django_db
def test_edit_nip(api_client, nip_data):
    url_link = "/api/nip/"
    response = api_client.post(url_link, nip_data, follow=True)
    pk = response.data["id"]

    url = reverse("nip_pk_url", kwargs=dict(pk=pk))
    data = dict(takeover=False, client_of="Not me")
    response = api_client.post(url, data)

    assert 1 == 2


@pytest.mark.django_db
def test_contacts(api_client):
    url_link = "/api/contacts"
    url = reverse("contacts_url")
    # post
    data = dict(contact="qwe@qwe.q", is_email=True)
    response = api_client.post(url, data)

    # getattr

    # delete
