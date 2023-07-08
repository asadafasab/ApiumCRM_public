import os.path
import time
from datetime import date, timedelta

from django.conf import settings

import pandas as pd

import gspread


class GoogleSheets:
    def __init__(self):
        self.ga = gspread.service_account(filename="./service_account.json")

    def interview_data(self):
        cities = settings.EMAILS.keys()
        interview_stats = self.ga.open_by_key(settings.SPREADSHEET_INTERVIEW)
        stats = dict()
        for inter in interview_stats.worksheets():
            sheets = [(x, inter.title) for x in settings.EMAILS if x in inter.title]

            for city, sheet in sheets:
                if sheet not in stats.keys():
                    stats[sheet] = []
                stats[sheet].append(inter.get_all_values())
        return stats

    def not_added_data(self):
        not_added = self.ga.open_by_key(settings.SPREADSHEET_NOT_ADDED)
        return not_added.sheet1.get_all_values()

    def to_fix_data(self):
        to_fix = self.ga.open_by_key(settings.SPREADSHEET_TOFIX)
        to_fix_dict = dict()
        for sheet in to_fix.worksheets():
            for contract in sheet.get_all_values():
                if len(contract) < 5:
                    continue
                city = contract[4].lower()
                if city not in to_fix_dict.keys():
                    to_fix_dict[city] = []
                to_fix_dict[city].append(contract)
        return to_fix_dict

    @staticmethod
    def _flatten(l):
        return [item for sublist in l for item in sublist]


class AllToFix:
    EXPORTED_CRM = "https://docs.google.com/spreadsheets/d/..."
    SHEET_NOTADDED = "https://docs.google.com/spreadsheets/d/..."
    SHEET_CLOUD_CONTRACTS = "..."

    GIDS = [
        ("NAME", 123),
    ]

    def __init__(self):
        self.salesman = dict()
        self.salesman["office1"] = [""]
        self.salesman["offic2"] = [""]
        

    def contracts(self):
        df_secret_all = dict()
        print(len(self.GIDS), end=" ")
        for name, gid in self.GIDS:
            _url = f"https://docs.google.com/spreadsheets/d/{settings.SPREADSHEET_TOFIX}/export?format=csv&gid={gid}"
            _df = pd.read_csv(_url)
            df_secret_all[name] = _df
            time.sleep(30)
            print(gid, end=" ")

        df_export = pd.read_csv(self.EXPORTED_CRM)
        df_description = pd.read_csv(self.SHEET_NOTADDED)

        columns = [
            "NIP",
        ]
        df = pd.DataFrame(columns=columns)
        # to remove from SHEET_NOTADDED
        df_to_add = df_export[
            ~df_export["Numer umowy"].isin(set(df_description["Numer umowy"]))
        ]
        # to add to SHEET_NOTADDED
        df_to_remove = df_description[
            ~df_description["Numer umowy"].isin(set(df_export["Numer umowy"]))
        ]

        for x in df_export.iloc:
            description = df_description[
                df_description["Numer umowy"] == x["Numer umowy"]
            ]
            bledy = ""
            ustalenia = ""
            poprawa = ""

            if not description.empty:
                bledy = description.iloc[0]["BŁĘDY"]
                ustalenia = description.iloc[0]["USTALENIA"]
                poprawa = description.iloc[0]["POPRAWIA"]

            # print(description)
            handlowcy = x["Handlowiec"]
            secretary = ""
            for secret in df_secret_all.keys():
                if not df_secret_all[secret][
                    df_secret_all[secret]["NIP"] == x["NIP"]
                ].empty:
                    data_secret = df_secret_all[secret][
                        df_secret_all[secret]["NIP"] == x["NIP"]
                    ]
                    secretary += f"{secret} "
                    bledy += f" {data_secret.iloc[0]['BŁĘDY W UMOWIE']}"

            oddzial = ""
            for city in self.salesman.keys():
                if x["Handlowiec"] in self.salesman[city]:
                    oddzial = city
                    break
            df = df.append(
                {
                    "NIP": x["NIP"],
                    "NR UMOWY": x["Numer umowy"],
                    "NAZWA FIRMY": x["Nazwa klienta"],
                    "DATA PODPISANIA": x["Data umowy"],
                    "DATA ZMIANY STATUSU": x["Data zmiany statusu"],
                    "STATUS": x["Status"],
                    "HANDLOWIEC": handlowcy,
                    "KTO WPROWADZAŁ": " ".join(secretary),
                    "ODDZIAL": oddzial,
                    "BŁĘDY": bledy,
                    "USTALENIA": ustalenia,
                    "KTO BEDZIE POPRAWIAŁ": poprawa,
                },
                ignore_index=True,
            )
        df.fillna("", inplace=True)
        df = df.sort_values(by=["ODDZIAL"])
        return df
