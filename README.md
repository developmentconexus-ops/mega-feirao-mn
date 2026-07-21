# Mega Feirão Metal Nobre

Aplicativo interno para organizar a fila de vendedores durante o Mega Feirão Metal Nobre.

## Implantação recomendada: Python portátil

O servidor da empresa **não precisa ter Python instalado**. O pacote inclui o Python oficial embutível para Windows dentro da própria pasta do aplicativo. Também não é necessário instalar Node.js, npm, Go, Docker, banco de dados ou bibliotecas pelo `pip`.

Estrutura do pacote:

```text
Mega-Feirao-Portable\
├── python\
│   └── python.exe
├── projeto\
│   └── app.py
├── Iniciar Mega Feirao.bat
├── Iniciar Mega Feirao Oculto.ps1
└── Parar Mega Feirao.ps1
```

## Baixar o pacote pronto

1. Abra a aba **Actions** do repositório.
2. Abra a execução mais recente de **Build Portable Python**.
3. Em **Artifacts**, baixe `mega-feirao-python-portable`.
4. Extraia a pasta inteira para o servidor, por exemplo:

```text
C:\Mega-Feirao-Portable
```

Não copie apenas o `app.py`; as pastas `python` e `projeto` devem permanecer juntas.

## Iniciar com a janela visível

Dê dois cliques em:

```text
C:\Mega-Feirao-Portable\Iniciar Mega Feirao.bat
```

Esse modo mostra os logs e permite encerrar com `Ctrl+C`.

## Iniciar oculto

No PowerShell:

```powershell
& "C:\Mega-Feirao-Portable\Iniciar Mega Feirao Oculto.ps1"
```

O comando executado internamente é equivalente a:

```powershell
Start-Process -FilePath "C:\Mega-Feirao-Portable\python\python.exe" `
  -ArgumentList "app.py" `
  -WorkingDirectory "C:\Mega-Feirao-Portable\projeto" `
  -WindowStyle Hidden
```

Para encerrar a instância iniciada de forma oculta:

```powershell
& "C:\Mega-Feirao-Portable\Parar Mega Feirao.ps1"
```

## Acesso

```text
http://192.168.0.3:3000
```

No próprio servidor:

```text
http://localhost:3000
```

## Firewall do Windows

Abra o PowerShell como administrador e execute uma única vez:

```powershell
New-NetFirewallRule -DisplayName "Mega Feirao Metal Nobre" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

Todos os celulares precisam estar conectados à mesma rede local do servidor.

## Persistência

Na primeira execução, o programa cria automaticamente:

```text
C:\Mega-Feirao-Portable\projeto\data\state.json
```

Esse arquivo guarda a fila atual. Para zerar a fila, pare o programa, exclua `projeto\data\state.json` e inicie novamente.

## Usuários

Os usuários e senhas estão no início de `app.py`. Há três papéis:

- `seller`: vendedor que altera o próprio status.
- `reception`: acesso à tela da recepção.
- `viewer`: acesso somente para visualização.
