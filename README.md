# Arquivo Geek

Site estático em português com sete perfis de personagens, artes animadas, teasers visuais sem áudio e uma loja demonstrativa com 42 produtos.

## Rodar localmente

```sh
python3 -m http.server 8000
```

Abra http://localhost:8000/. O HTML gerado está versionado e pode ser servido diretamente pelo GitHub Pages.

## Atualizar conteúdo

Edite `personagens.json` para alterar os perfis e `gerar.mjs` para ajustar o catálogo. Execute `node gerar.mjs` para atualizar a página inicial, a loja e os perfis. Os vídeos locais estão em `midia/` e usam as artes do projeto. Os favoritos, o tema e o carrinho ficam no navegador.

## Venda de produtos

O catálogo usa produtos, imagens e preços ilustrativos. Para abrir vendas reais, substitua os exemplos pelos itens licenciados disponíveis, cadastre preços e estoque em uma plataforma de e-commerce e integre seu checkout com frete e pagamento. Valide preços e disponibilidade no serviço de compras. O subtotal exibido pelo site é calculado no navegador para fins de demonstração.
