import pickle
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import undetected_chromedriver as uc
import random
from getpass import getpass
from typing import List
from selenium.webdriver.chrome.options import Options
import datetime
import json
import re
import requests
import pandas as pd
import sys


URL_FB = ""


class WAManager:
    URL = "https://web.whatsapp.com/"
    GROUP_NAME = ""
    GROUP_NAME_XPATH = ''

    def __init__(self, first_use=False):
        options = Options()
        # options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--start-maximized")
        options.add_argument("--disable-popup-blocking")
        options.add_argument("user-data-dir=./chrum")

        self.driver = uc.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 60)
        if first_use:
            self.driver.get(self.URL)
            input("LOGIN and click enter")
        self.wait_for_login()
        #     self._save_cookies()
        # self._load_cookies()
        # self.open_wa()
        # time.sleep(40)
        self.click_on_group()

    def get_nips(self):
        messages = self._scrap_messages()
        nips = re.findall("[0-9]{10}", messages)
        print(nips)

    def wait_for_login(self):
        self.driver.get(self.URL)
        time.sleep(10)

    def click_on_group(self):
        target = f'"{self.GROUP_NAME}"'
        image = "Multi Messages"
        x_arg = "//span[contains(@title," + target + ")]"
        group_title = self.wait.until(EC.presence_of_element_located((By.XPATH, x_arg)))
        group_title.click()
        inp_xpath = '//*[@id="main"]/footer/div[1]/div[2]/div/div[2]'

    def _scroll(self):
        SCROLL_PAUSE_TIME = 0.5

        # Get scroll height
        last_height = self.driver.execute_script("return document.body.scrollHeight")

        while True:
            # Scroll down to bottom
            self.driver.execute_script(
                "window.scrollTo(0, document.body.scrollHeight);"
            )

            # Wait to load page
            time.sleep(SCROLL_PAUSE_TIME)

            # Calculate new scroll height and compare with last scroll height
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    def _scrap_messages(self):
        el = self.driver.find_element(
            By.XPATH, '//*[@data-testid="conversation-panel-body"]'
        )
        self._scroll()
        all_msg = self.driver.find_element(By.XPATH, '//*[@id="main"]')
        print(all_msg.text)
        el = self.driver.find_element(
            By.XPATH, '//*[@data-testid="conversation-panel-body"]'
        )
        return el.text


if __name__ == "__main__":
    wa = WAManager()
    wa.get_nips()
    wa.driver.close()
