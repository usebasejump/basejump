export default function validateUrl(url: string, allowedURLs: string[]) {
    if (!url) {
        return false;
    }
    const urlObject = new URL(url);
    const allowedOriginObjects = allowedURLs.map(url => new URL(url));
    return allowedOriginObjects.some(allowedURLObject => {
        return urlObject.origin === allowedURLObject.origin;
    });
}