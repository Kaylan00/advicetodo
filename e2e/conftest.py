import os
import uuid

import pytest
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

# O navegador roda em container, entao alcanca a aplicacao pelo nome do servico.
BASE_URL = os.getenv("E2E_BASE_URL", "http://web")
SELENIUM_URL = os.getenv("E2E_SELENIUM_URL", "http://localhost:4444")


@pytest.fixture(scope="session")
def browser():
    options = Options()
    options.add_argument("--window-size=1440,900")
    driver = webdriver.Remote(command_executor=SELENIUM_URL, options=options)
    yield driver
    driver.quit()


@pytest.fixture(autouse=True)
def sessao_limpa(browser):
    """Cada teste comeca deslogado, sem herdar o token do anterior."""
    browser.get(BASE_URL)
    browser.execute_script("window.localStorage.clear()")
    yield


@pytest.fixture
def wait(browser):
    # A lista se redesenha a cada filtro, entao referencia velha nao pode derrubar a espera.
    return WebDriverWait(
        browser,
        20,
        ignored_exceptions=(NoSuchElementException, StaleElementReferenceException),
    )


@pytest.fixture
def usuario():
    return {
        "nome": "Pessoa E2E",
        "email": f"e2e-{uuid.uuid4().hex[:10]}@advice.dev",
        "senha": "senha-do-teste-2026",
    }


@pytest.fixture
def base_url():
    return BASE_URL
