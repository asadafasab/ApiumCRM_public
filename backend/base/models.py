import datetime

from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models


class Contract(models.Model):
    name = models.TextField()
    nip = models.BigIntegerField(
        validators=[MaxValueValidator(9_999_999_999), MinValueValidator(1_111_111_111)]
    )
    contract_number = models.TextField(max_length=256, unique=True)
    owner = models.TextField(blank=True)
    contact_person = models.TextField(blank=True)
    address = models.TextField(blank=True)
    phone_number = models.TextField(blank=True)
    email = models.TextField(max_length=512, blank=True, null=True)
    salesman = models.TextField(max_length=512, blank=True)
    volume = models.TextField(max_length=512, blank=True)
    date_signed = models.DateField(blank=True, null=True)
    date_begin = models.DateField(blank=True, null=True)
    date_end = models.DateField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    ppe_number = models.TextField(blank=True, null=True)
    price = models.TextField(blank=True)
    to_annex = models.TextField(max_length=32, blank=True)
    info = models.TextField(blank=True)
    medium = models.TextField(max_length=32, blank=True)
    branch = models.TextField(max_length=512, blank=True)
    longitude = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.name}, {self.date_end}, {self.nip}"


class Nip(models.Model):
    nip = models.BigIntegerField(
        validators=[MaxValueValidator(9_999_999_999), MinValueValidator(1_111_111_111)]
    )
    takeover = models.BooleanField(default=True)
    blocade_end = models.DateTimeField(default=datetime.datetime(3000, 1, 1, 0, 0))
    client_of = models.TextField(max_length=512)
    blocked_by = models.TextField(max_length=512, blank=True)
    company_name = models.TextField(max_length=512)

    def __str__(self) -> str:
        return f"NIP: {self.nip}"


class NotificationContact(models.Model):
    contact = models.TextField()
    is_email = models.BooleanField(default=True)


class ErrorLog(models.Model):
    message = models.TextField()


class ContractToFix(models.Model):
    BRANCH = [
        ("EX", "Example"),
    ]
    STATUSES = [
        ("1", "Aneks - Obowiązujący"),
        ("2", "Aneks - Przed okresem obowiązywania"),
        ("3", "Aneks - Wysłany do klienta"),
        ("4", "Anulowana"),
        ("5", "Cesja - Do podpisania przez klienta"),
        ("6", "Cesja - Pozytywna weryfikacja"),
        ("7", "Cesja - Wysłano zgłoszenie do OSD"),
        ("8", "Do podpisania przez klienta"),
        ("9", "Do poprawy"),
        ("10", "Oczekuje na zatwierdzenie"),
        ("11", "Rozpoczęto proces ZS"),
        ("12", "Rozwiązana"),
        ("13", "Wersja - W przygotowaniu"),
        ("14", "Weryfikacja negatywna - BZS"),
        ("15", "Weryfikacja pozytywna - BZS"),
        ("16", "Zakończona"),
        ("17", "Zakończono proces ZS"),
        ("18", "Brak"),
    ]
    is_done = models.BooleanField(default=False)
    salesman = models.TextField()
    branch = models.CharField(
        max_length=2,
        choices=BRANCH,
    )
    # company name
    name = models.TextField(blank=True, null=True)
    date_signed = models.DateField(blank=True, null=True)
    nip = models.BigIntegerField(
        validators=[MaxValueValidator(9_999_999_999), MinValueValidator(1_111_111_111)]
    )
    secretary = models.TextField(blank=True, null=True)
    info = models.TextField(blank=True)
