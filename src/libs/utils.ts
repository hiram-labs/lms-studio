import type { ReadableStream as ReadableStreamType } from "@yume-chan/stream-extra/esm/types";

export function getRandomSample<T>(arr: T[], numItems: number) {
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, numItems);
}

export function generateDashboardBreadcrumbs(url: URL) {
  const segments = url.pathname.split("/").filter(Boolean);
  const query = url.search;
  return segments.map((segment, i) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1),
    url: `/${segments.slice(0, i + 1).join("/")}${query && i === segments.length - 1 ? query : ""}`,
  }));
}

export function getQueryParam(url: URL, key: string) {
  return new URL(url).searchParams.get(key);
}

export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift();
}

export function wrapPromiseWithTimeout<T>(
  promise: Promise<T>,
  delay: number,
  onWait: () => void = () => {}
): Promise<T> {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      onWait();
      setTimeout(() => {
        const error = new Error(
          `The promise could not resolve before the time out of ${delay}ms`
        );
        error.name = "PromiseTimeout";
        reject(error);
      }, delay);
    }),
  ]);
}

export async function fetchApkFileWithProgress(
  url: string,
  onProgress: (percentage: number) => void
) {
  const error = new Error();
  error.name = "APKFetchError";

  const response = await fetch(url);

  if (!response.ok) {
    error.message = "Failed to fetch APK file!";
    throw error;
  }

  const contentLength = response.headers.get("Content-Length");
  if (!contentLength) {
    error.message = "Failed to calculate APK file size!";
    throw error;
  }

  if (!response.body) {
    error.message = "Failed to get response body!";
    throw error;
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];

  await new Promise<void>((resolve, reject) => {
    function read() {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            resolve();
            return;
          }

          if (value) {
            chunks.push(value);
            loaded += value.length;
            onProgress(Math.round((loaded / total) * 100));
          }

          read();
        })
        .catch(reject);
    }
    read();
  });

  // Combine chunks into a single streamable file
  const completeFile = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    completeFile.set(chunk, offset);
    offset += chunk.length;
  }

  // Create a new ReadableStream from the complete file
  const fileStream = new ReadableStream({
    start(controller) {
      controller.enqueue(completeFile);
      controller.close();
    },
  }) as unknown as ReadableStreamType<Uint8Array>;

  return { fileSize: total, file: fileStream };
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
