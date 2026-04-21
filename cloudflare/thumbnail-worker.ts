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

type CfRequestInit = RequestInit & {
  cf?: {
    image?: {
      width: number;
      quality: number;
      format: "auto";
      fit: "scale-down";
    };
  };
};

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

    if (url.pathname.startsWith("/origin")) {
      const object = await env.GALLERY_BUCKET.get(payload.r2Key);

      if (!object?.body) {
        return jsonResponse("Not found", 404);
      }

      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    if (!url.pathname.startsWith("/thumb/")) {
      return jsonResponse("Not found", 404);
    }

    const originUrl = new URL("/origin", url.origin);
    originUrl.searchParams.set("token", token);

    const init: CfRequestInit = {
      cf: {
        image: {
          width: payload.width,
          quality: payload.quality,
          format: "auto",
          fit: "scale-down",
        },
      },
    };

    return fetch(originUrl.toString(), init as RequestInit);
  },
};

export default worker;
