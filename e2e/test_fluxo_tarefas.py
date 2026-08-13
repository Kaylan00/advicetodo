from pages import criar_conta, criar_tarefa, entrar, seletor, titulos_visiveis
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select


def test_visitante_e_mandado_para_o_login(browser, wait, base_url):
    browser.get(f"{base_url}/tarefas")

    wait.until(EC.visibility_of_element_located(seletor("form-login")))
    assert browser.current_url.endswith("/entrar")


def test_cadastro_leva_direto_para_a_lista_vazia(browser, wait, base_url, usuario):
    criar_conta(browser, wait, base_url, usuario)

    assert browser.find_element(*seletor("lista-vazia")).is_displayed()
    assert usuario["nome"] in browser.find_element(*seletor("usuario-logado")).text


def test_login_com_senha_errada_mostra_erro(browser, wait, base_url, usuario):
    criar_conta(browser, wait, base_url, usuario)
    browser.execute_script("window.localStorage.clear()")

    entrar(browser, wait, base_url, {**usuario, "senha": "senha-que-nao-e-essa"})

    erro = wait.until(EC.visibility_of_element_located(seletor("erro-login")))
    assert "inválidos" in erro.text


def test_criar_e_concluir_tarefa(browser, wait, base_url, usuario):
    criar_conta(browser, wait, base_url, usuario)

    criar_tarefa(browser, wait, "Enviar relatorio de glosas")
    browser.find_element(*seletor("alternar-tarefa")).click()

    wait.until(
        EC.text_to_be_present_in_element_attribute(seletor("alternar-tarefa"), "aria-pressed", "true")
    )
    assert "task--feita" in browser.find_element(*seletor("tarefa")).get_attribute("class")


def test_filtrar_por_situacao(browser, wait, base_url, usuario):
    criar_conta(browser, wait, base_url, usuario)
    criar_tarefa(browser, wait, "Tarefa que fica aberta")
    criar_tarefa(browser, wait, "Tarefa que sera concluida")

    browser.find_element(*seletor("alternar-tarefa")).click()
    wait.until(
        EC.text_to_be_present_in_element_attribute(seletor("alternar-tarefa"), "aria-pressed", "true")
    )

    Select(browser.find_element(*seletor("filtro-status"))).select_by_value("false")
    wait.until(lambda driver: titulos_visiveis(driver) == ["Tarefa que fica aberta"])

    Select(browser.find_element(*seletor("filtro-status"))).select_by_value("true")
    wait.until(lambda driver: titulos_visiveis(driver) == ["Tarefa que sera concluida"])


def test_compartilhar_tarefa_com_quem_nao_existe_avisa(browser, wait, base_url, usuario):
    criar_conta(browser, wait, base_url, usuario)
    criar_tarefa(browser, wait, "Tarefa para dividir")

    browser.find_element(*seletor("compartilhar-tarefa")).click()
    wait.until(EC.visibility_of_element_located(seletor("dialogo-compartilhar")))
    browser.find_element(*seletor("campo-email-compartilhar")).send_keys("ninguem@advice.dev")
    browser.find_element(*seletor("confirmar-compartilhar")).click()

    erro = wait.until(EC.visibility_of_element_located(seletor("erro-compartilhar")))
    assert "Nenhum usuário" in erro.text


def test_paginacao_aparece_quando_passa_de_dez_tarefas(browser, wait, base_url, usuario):
    criar_conta(browser, wait, base_url, usuario)
    for numero in range(1, 12):
        criar_tarefa(browser, wait, f"Tarefa numerada {numero:02d}")

    resumo = wait.until(EC.visibility_of_element_located(seletor("pagina-atual")))
    assert "Página 1 de 2" in resumo.text
    assert len(browser.find_elements(By.CSS_SELECTOR, '[data-testid="tarefa"]')) == 10

    browser.find_element(*seletor("proxima-pagina")).click()
    wait.until(lambda driver: "Página 2 de 2" in driver.find_element(*seletor("pagina-atual")).text)
    assert len(browser.find_elements(By.CSS_SELECTOR, '[data-testid="tarefa"]')) == 1
