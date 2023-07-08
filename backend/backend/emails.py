from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import get_template
from .sheets import GoogleSheets, AllToFix
import time

import urllib.parse


class ToFix:
    def __init__(self):
        self.emails = settings.EMAILS
        self.gs = GoogleSheets()
        # self.data_tofix = self.gs.to_fix_data()

        # multiple sheets - how to handle this
        # self.data_interview = self.gs.interview_data()

    def fetch_contracts(self):
        self.all_contracts_to_fix = AllToFix().contracts()

    def send_emails(self):
        for branch in self.emails.keys():
            message = self._prepare_message(branch)
            if not message:
                continue
            self._send_email(self.emails[branch], message, branch)

    def _prepare_message(self, branch):
        data_incomplete = self.gs.not_added_data()

        branch = branch.lower()
        message = "Umowy do poprawy:\n\n"
        data_tofix = self.all_contracts_to_fix[
            self.all_contracts_to_fix["ODDZIAL"] == branch
        ].values.tolist()

        # if branch in self.data_tofix.keys():
        #     for tofix in self.data_tofix[branch]:
        #         status = tofix[2].lower()
        #         if (
        #             status.find("do poprawy") != -1
        #             or status.find("do podpisania") != -1
        #         ):
        #             data_tofix.append(tofix)

        data_incomplete = [x for x in data_incomplete if x[-1].lower() == branch]
        data_interview = []

        message = get_template("email_template.html").render(
            {
                "tofix": data_tofix,
                "incomplete": data_incomplete,
                "interview": data_interview,
            }
        )
        if not data_tofix and not data_incomplete and not data_interview:
            return False
        return message

    @staticmethod
    def _send_email(emails, message, branch):
        send_mail(
            subject=f"Umowy do poprawy - {branch}",
            message=".",
            html_message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=emails,
            fail_silently=False,
        )
