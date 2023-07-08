import datetime
import os
import urllib.parse
import pandas as pd
import numpy as np
from itertools import islice

import requests
from apscheduler.schedulers.background import BackgroundScheduler
from django.core.mail import send_mail
from django.conf import settings
from base.models import Nip, Contract, ErrorLog
from base.api.serializers import ContractSerializer
from backend.emails import ToFix

URL = ""
TEXT = "&text="
KEY = "&apikey=" + os.environ.get("WHATSAPP_API_KEY")
NUMBER = os.environ.get("PHONE_NUMBER")


SPREADSHEET_CONTRACTS = os.environ.get("SPREADSHEET_CONTRACTS")
url_google = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_CONTRACTS}/gviz/tq?tqx=out:csv&gid=0"
col_num = 23


def prepare_sheet_df():
    contracts = pd.read_csv(url_google)
    contracts = contracts.fillna(value="")
    contracts = contracts.replace({np.nan: ""})
    contracts = contracts.iloc[:, 1:col_num]
    contracts.head()
    contracts["info"] = (
        contracts.iloc[:, 20].astype(str) + "\n" + contracts.iloc[:, 21].astype(str)
    )
    contracts.drop(
        contracts.columns[[5, 11, 12, 15, 16, 18, 19, 20, 21]], inplace=True, axis=1
    )
    names = {
        f"{contracts.columns[0]}": "branch",
        f"{contracts.columns[1]}": "salesman",
        f"{contracts.columns[4]}": "address",
        f"{contracts.columns[5]}": "contract_number",
        f"{contracts.columns[6]}": "owner",
        f"{contracts.columns[7]}": "medium",
        f"{contracts.columns[8]}": "phone_number",
        f"{contracts.columns[9]}": "contact_person",
        f"{contracts.columns[11]}": "price",
        f"{contracts.columns[12]}": "annex",
    }
    contracts = contracts.rename(columns=names)
    contracts = contracts.drop_duplicates()
    contracts = contracts.drop_duplicates(subset=["contract_number"])
    contracts["contract_number"] = contracts.contract_number.replace(
        " ", "", regex=True
    )
    return contracts.to_dict("records")


def get_contracts():
    errors_msg = ""
    error = ErrorLog.objects.all().first()
    if not error:
        error = ErrorLog()
    ids = list(Contract.objects.values_list("contract_number", flat=True))
    contracts = prepare_sheet_df()

    idx = 0
    # cant bulk add because of potential invalid data
    for contract in contracts:
        query = Contract.objects.filter(contract_number=contract["contract_number"])
        if not query:
            continue
        query = query.first()
        serializer = ContractSerializer(instance=query, data=contract, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            errors_msg += f"{idx}. {serializer.errors} - {contract}"
            idx += 1

    error.message = errors_msg
    error.save()
    print("Errors: ", idx)


def send_whatsapp_message(msg):
    notification = requests.get(URL + NUMBER + TEXT + msg + KEY)
    if not notification.ok:
        print(f"Error: {notification.status_code}")


def messages(data, header="Do przejęcia\n"):
    message = header
    for nip in data:
        message += f"""NIP {nip.nip} zablokowany do
        {nip.blocade_end.strftime('%d.%m.%Y %H.%M')}
        ofertowany przez {nip.client_of}\n"""

    message = urllib.parse.quote(message)
    send_whatsapp_message(message)


def takeover_today():
    data = Nip.objects.filter(
        blocade_end__range=[
            datetime.date.today(),
            datetime.date.today() + datetime.timedelta(days=1),
        ],
        takeover=True,
    )
    print("DaTA:", data)
    if data:
        messages(data, "Do przejęcia\n")


def takeover_tomorrow():
    data = Nip.objects.filter(
        blocade_end__range=[
            datetime.date.today() + datetime.timedelta(days=1),
            datetime.date.today() + datetime.timedelta(days=2),
        ],
        takeover=True,
    )
    print("DaTA:", data)
    if data:
        messages(data, "Do przejęcia\n")


def taken_tomorrow():
    data = Nip.objects.filter(
        blocade_end__range=[
            datetime.date.today() + datetime.timedelta(days=1),
            datetime.date.today() + datetime.timedelta(days=2),
        ],
        takeover=False,
    )
    if data:
        messages(data, "Przejęte\n")


def start_scheduler():
    contract_fix = ToFix()
    scheduler = BackgroundScheduler(timezone="Europe/Warsaw")
    scheduler.add_job(
        func=takeover_tomorrow,
        trigger="cron",
        hour="16",
        minute="20",
        id="takeover tomorrow",
    )
    scheduler.add_job(
        func=taken_tomorrow, trigger="cron", hour="18", minute="2", id="taken tomorrow"
    )
    scheduler.add_job(
        func=takeover_today, trigger="cron", hour="6", id="takeover today"
    )

    scheduler.add_job(
        func=get_contracts,
        trigger="cron",
        hour="03",
        minute="03",
        id="download contracts",
    )

    scheduler.add_job(
        func=contract_fix.send_emails,
        trigger="cron",
        hour="6",
        minute="50",
        id="contracts to fix",
        day_of_week="mon,tue,wed,thu,fri",
    )
    scheduler.start()
