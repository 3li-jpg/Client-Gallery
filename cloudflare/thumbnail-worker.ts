interface Env {
  GALLERY_BUCKET: {
    get: (key: string) => Promise<{
      body?: ReadableStream | null;
      httpMetadata?: {
        contentType?: string;
      };
    } | null>;
  };
  JWT_SECRET: string;
}

interface ThumbnailPayload {
  kind: "thumbnail";
  galleryId: string;
  photoId: string;
  r2Key: string;
  width: number;
  quality: number;
  exp: number;
}

function base64UrlToUint8Array(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index]!;
  }

  return mismatch === 0;
}

async function verifyToken(token: string, secret: string) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Malformed token");
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expectedSignature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput)),
  );
  const providedSignature = base64UrlToUint8Array(encodedSignature);

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(
    new TextDecoder().decode(base64UrlToUint8Array(encodedPayload)),
  ) as ThumbnailPayload;

  if (payload.kind !== "thumbnail") {
    throw new Error("Unexpected token kind");
  }

  if (payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }

  return payload;
}

function jsonResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function getObject(env: Env, key: string) {
  return env.GALLERY_BUCKET.get(key);
}

async function getObjectWithFallback(env: Env, key: string) {
  const object = await getObject(env, key);

  if (object?.body) {
    return object;
  }

  if (key.endsWith(".thumb.jpg")) {
    return getObject(env, key.slice(0, -10));
  }

  if (key.endsWith(".viewer.jpg")) {
    return getObject(env, key.slice(0, -11));
  }

  return null;
}

const worker = {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return jsonResponse("Missing token", 401);
    }

    let payload: ThumbnailPayload;

    try {
      payload = await verifyToken(token, env.JWT_SECRET);
    } catch {
      return jsonResponse("Invalid token", 401);
    }

    if (!url.pathname.startsWith("/origin") && !url.pathname.startsWith("/thumb/")) {
      return jsonResponse("Not found", 404);
    }

    const object = await getObjectWithFallback(env, payload.r2Key);

    if (!object?.body) {
      return jsonResponse("Not found", 404);
    }

    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "Cache-Control":
          payload.r2Key.endsWith(".thumb.jpg")
            ? "private, max-age=3600"
            : payload.r2Key.endsWith(".viewer.jpg")
              ? "private, max-age=900"
              : "private, max-age=60",
      },
    });
  },
};

export default worker;
