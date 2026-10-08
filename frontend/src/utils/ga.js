export function getGaClientId() {
    const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)/);
    return match ? match[1] : null;
}