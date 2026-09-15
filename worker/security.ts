export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const hex = (b: ArrayBuffer) =>
  Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join(
    "",
  );
export const random = () =>
  hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export async function digest(text: string) {
  return hex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
  );
}
export async function passwordHash(password: string, salt = random()) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const result = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return `${salt}:${hex(result)}`;
}
export function constantEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
export function arxivId(input: string) {
  const raw = input.trim();
  let id = raw;
  if (/^https?:/i.test(raw)) {
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      throw new HttpError(400, "Enter a valid paper URL.");
    }
    if (
      !["arxiv.org", "www.arxiv.org", "export.arxiv.org"].includes(u.hostname)
    )
      throw new HttpError(
        400,
        "Use an arXiv link, or upload the PDF for other publishers.",
      );
    id = u.pathname.replace(/^\/(abs|pdf|html)\//, "").replace(/\.pdf$/, "");
  }
  if (!/^(\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(v\d+)?$/.test(id))
    throw new HttpError(400, "Enter an arXiv identifier such as 1706.03762.");
  return id;
}
export function safeLink(value: string) {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
