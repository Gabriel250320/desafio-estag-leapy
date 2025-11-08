# Desafio 02 — Coin Change

Implementação da solução para o problema de Coin Change utilizando programação dinâmica.

## Solução 

- Comecei tentando resolver o desafio a partir de um algoritmo guloso. A lógica era: ordenar o vetor de coins recebido, armazenar o resultado inteiro da divisão do amount pelo maior número desse vetor dentro do minCoins, e armazenar o resto em uma variável "resto". Com esse resto, o algoritmo iria percorrendo o vetor de coins, sempre somando o valor inteiro da divisão na variável minCoins, e dando continuidade até o resto chegar a 0.

- Porém, percebi que essa lógica falhava para alguns casos. Com isso, decidi seguir para uma implementação com programação dinâmica quando identifiquei um padrão de "subproblemas ótimos".

- O padrão identificado é que o valor mínimo de moedas sempre depende diretamente das soluções ótimas de valores menores. Utilizando o exemplo fornecido (coins = [1, 2, 5] e amount = 11), a solução ótima (minCoins(11)) será, obrigatoriamente, o menor valor entre estas três possibilidades:

1 + minCoins(11 - 1) (Usar uma moeda de 1 + a solução que já encontramos para o valor 10)

1 + minCoins(11 - 2) (Usar uma moeda de 2 + a solução que já encontramos para o valor 9)

1 + minCoins(11 - 5) (Usar uma moeda de 5 + a solução que já encontramos para o valor 6)

- Dessa forma, é possível obter a solução mais otimizada, partindo do ponto inicial que minCoins(0) é 0.

