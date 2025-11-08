function findMinCoins(coins, amount) {
    if (amount === 0) return 0;
    const resultsMinCoins = new Array(amount+1)

    resultsMinCoins.fill(amount+1) //Prenchimento do array com um valor impossivel

    resultsMinCoins[0] = 0; //Caso inicial de amount = 0

    /**
        * Analise dinamica para chegar no resultado de amount esperado. O minimo de moedas vai ser sempre 1, que é a moeda que respeita a checagem i >= coin,
        somado com o valor de amount do valor restante que eu preciso considerando a moeda que passou na checagem
    */
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (i >= coin) {
                resultsMinCoins[i] = Math.min(resultsMinCoins[i], 1 + resultsMinCoins[i - coin]);
            }
        }
    }

    const minCoins = resultsMinCoins[amount];

    if (minCoins === amount+1) {
        return -1;
    }

    return minCoins;
}

function main() {
    let data = "";

    process.stdin.on("data", (chunk) => {
        data += chunk;
    });

    process.stdin.on("end", () => {
    try {
        const input = JSON.parse(data);
        const { coins, amount } = input;
        
        const minCoins = findMinCoins(coins, amount);
        
        process.stdout.write(JSON.stringify({ minCoins: minCoins }));
        
    } catch (e) {
        console.error("Erro ao processar entrada:", e.message);
        process.exit(1);
    }
    });
}

main();