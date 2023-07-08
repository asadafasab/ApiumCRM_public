from base.models import Contract, Nip, NotificationContact, ErrorLog,ContractToFix
from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField


class ContractSerializer(ModelSerializer):
    class Meta:
        model = Contract
        fields = "__all__"


class NipSerializer(ModelSerializer):
    class Meta:
        model = Nip
        fields = "__all__"


class NotificationContactSerializer(ModelSerializer):
    class Meta:
        model = NotificationContact
        fields = "__all__"


class ErrorLogSerializer(ModelSerializer):
    class Meta:
        model = ErrorLog
        fields = "__all__"

class ContractToFixSerializer(ModelSerializer):
    class Meta:
        model = ContractToFix
        fields = "__all__"