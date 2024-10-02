export function getRandomSample<T>(arr: T[], numItems: number) {
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, numItems);
}

export function generateDashboardBreadcrumbs(url: URL) {
    const segments = url.pathname.split('/').filter(Boolean);
    const query = url.search;
    return segments.map((segment, i) => ({
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        url: `/${segments.slice(0, i + 1).join('/')}${query && i === segments.length - 1 ? query : ''}`,
    }))
}

export function getQueryParam(url: URL ,key: string) {
    return new URL(url).searchParams.get(key);
}