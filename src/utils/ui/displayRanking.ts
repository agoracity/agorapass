export default function displayRanking(ranking: string) {
    const numberToMultiply = 1000;
    const normalizedRanking = parseFloat(ranking) * numberToMultiply;
    const roundedNumber = Math.floor(normalizedRanking);
    return roundedNumber;
}