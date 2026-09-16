# Certificados TLS

O Nginx de producao exige estes dois arquivos neste diretorio:

- `fullchain.pem`: certificado do servidor seguido da cadeia intermediaria;
- `privkey.pem`: chave privada correspondente.

Nao versione os certificados nem a chave privada. Para o endereco atual
`10.200.2.25`, use um certificado emitido pela autoridade certificadora interna
com esse IP no campo Subject Alternative Name (SAN). A opcao recomendada e criar
um nome DNS interno, por exemplo `vendas.caoa.intra`, e solicitar um certificado
para esse nome; depois use esse nome em `NEXTAUTH_URL`.

Certificados publicos como Let's Encrypt nao sao emitidos para IPs privados.
Um certificado autoassinado cifra o trafego, mas continuara exibindo alerta no
navegador e nao deve ser usado como solucao de producao.
