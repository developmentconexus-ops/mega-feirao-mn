# Mega Feirão Metal Nobre

Aplicativo interno para organizar a fila de vendedores durante o Mega Feirão Metal Nobre.

## Implantação recomendada: Python

O servidor da empresa precisa apenas do Python que já está instalado. Não é necessário instalar Node.js, npm, Go, Docker, banco de dados ou bibliotecas pelo `pip`.

Toda a aplicação está no arquivo:

```text
app.py
```

Ele contém o servidor, a interface, os usuários e a lógica da fila.

## Instalar no servidor

1. Baixe o repositório como ZIP pelo GitHub.
2. Extraia para:

```text
C:\Mega-Feirao
```

3. Abra o Prompt de Comando nessa pasta.
4. Execute:

```powershell
python app.py
```

Caso o comando `python` não funcione, tente:

```powershell
py app.py
```

O aplicativo ficará disponível em:

```text
http://192.168.0.3:3000
```

No próprio servidor, também pode ser testado em:

```text
http://localhost:3000
```

## Firewall do Windows

Abra o PowerShell como administrador e execute:

```powershell
New-NetFirewallRule -DisplayName "Mega Feirao Metal Nobre" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

Todos os celulares precisam estar conectados à mesma rede local do servidor.

## Persistência

Na primeira execução, o programa cria automaticamente:

```text
C:\Mega-Feirao\data\state.json
```

Esse arquivo guarda a fila atual. Para zerar a fila:

1. Encerre o programa com `Ctrl+C`.
2. Exclua `data\state.json`.
3. Execute `python app.py` novamente.

## Usuários

Os usuários e senhas estão no início de `app.py`. Há três papéis:

- `seller`: vendedor que altera o próprio status.
- `reception`: acesso à tela da recepção.
- `viewer`: acesso somente para visualização.

## Versão em Go

Os arquivos da versão em Go permanecem no repositório apenas como alternativa. Para o servidor da empresa, utilize `app.py`, pois o Python já é autorizado no ambiente.