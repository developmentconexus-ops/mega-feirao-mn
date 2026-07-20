# Mega Feirão Metal Nobre

Aplicativo interno para organizar a fila de vendedores durante o Mega Feirão Metal Nobre.

## Implantação recomendada: um único EXE

O projeto é um servidor Go com todo o frontend embutido. O servidor da empresa **não precisa de Node.js, npm, banco de dados, Docker ou Go instalado**.

### Baixar o executável

1. Abra o repositório no GitHub.
2. Entre em **Actions**.
3. Abra a execução mais recente de **Build Windows EXE**.
4. Em **Artifacts**, baixe `mega-feirao-windows`.
5. Extraia `mega-feirao.exe` para `C:\Mega-Feirao` no servidor.

### Executar

Dê dois cliques em:

```text
C:\Mega-Feirao\mega-feirao.exe
```

O aplicativo ficará disponível em:

```text
http://192.168.0.3:3000
```

Na primeira execução, o programa cria automaticamente:

```text
C:\Mega-Feirao\data\state.json
```

Esse arquivo guarda a fila atual. Para zerar todos os vendedores como “em atendimento”, feche o programa e exclua `data\state.json`.

### Firewall do Windows

Libere uma regra de entrada TCP para a porta `3000`. Todos os celulares precisam estar na mesma rede local do servidor.

## Desenvolvimento

Requer Go 1.23 ou superior somente na máquina de desenvolvimento:

```bash
go test ./...
go run .
```

Build manual para Windows:

```bash
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o dist/mega-feirao.exe .
```

## Usuários

Os usuários e senhas estão em `config.go`. Há três papéis:

- `seller`: altera o próprio status.
- `reception`: visualiza a fila da recepção.
- `viewer`: visualiza a mesma tela em modo somente leitura.
