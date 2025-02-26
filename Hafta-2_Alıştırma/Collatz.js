function collatzSequenceLength(n) {
    let length = 1;
    while (n !== 1) {
        if (n % 2 === 0) {
            n = n / 2;
        } else {
            n = 3 * n + 1;
        }
        length++;
    }
    return length;
}

function longestCollatzUnder(limit) {
    let maxLength = 0;
    let number = 0;

    for (let i = 1; i < limit; i++) {
        let length = collatzSequenceLength(i);
        if (length > maxLength) {
            maxLength = length;
            number = i;
        }
    }

    return number;
}

console.log(longestCollatzUnder(1000000));
