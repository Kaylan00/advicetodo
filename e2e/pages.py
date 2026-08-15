"""Acoes de tela reaproveitadas pelos testes, para o teste falar de fluxo e nao de seletor."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def seletor(valor):
    return (By.CSS_SELECTOR, f'[data-testid="{valor}"]')


def criar_conta(browser, wait, base_url, usuario):
    browser.get(f"{base_url}/criar-conta")
    formulario = wait.until(EC.visibility_of_element_located(seletor("form-cadastro")))
    formulario.find_element(By.NAME, "first_name").send_keys(usuario["nome"])
    formulario.find_element(By.NAME, "email").send_keys(usuario["email"])
    formulario.find_element(By.NAME, "password").send_keys(usuario["senha"])
    formulario.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    wait.until(EC.visibility_of_element_located(seletor("nova-tarefa")))


def entrar(browser, wait, base_url, usuario):
    browser.get(f"{base_url}/entrar")
    formulario = wait.until(EC.visibility_of_element_located(seletor("form-login")))
    formulario.find_element(By.NAME, "email").send_keys(usuario["email"])
    formulario.find_element(By.NAME, "password").send_keys(usuario["senha"])
    formulario.find_element(By.CSS_SELECTOR, "button[type=submit]").click()


def criar_tarefa(browser, wait, titulo):
    wait.until(EC.element_to_be_clickable(seletor("nova-tarefa"))).click()
    wait.until(EC.visibility_of_element_located(seletor("dialogo-tarefa")))
    browser.find_element(*seletor("campo-titulo")).send_keys(titulo)
    browser.find_element(*seletor("salvar-tarefa")).click()
    wait.until(EC.invisibility_of_element_located(seletor("dialogo-tarefa")))
    wait.until(lambda driver: titulo in titulos_visiveis(driver))


def titulos_visiveis(browser):
    return [item.text for item in browser.find_elements(*seletor("titulo-tarefa"))]


def escolher_no_select(browser, wait, campo, valor):
    """O select e proprio, entao a escolha e abrir a lista e clicar na opcao."""
    wait.until(EC.element_to_be_clickable(seletor(campo))).click()
    wait.until(EC.element_to_be_clickable(seletor(f"opcao-{valor or 'vazio'}"))).click()
