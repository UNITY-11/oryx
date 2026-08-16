import { getWhatsAppConfig, type WhatsAppConfig } from "./config";
import { normalizeWhatsAppRecipient } from "./phone";
import type { WhatsAppSendResult } from "./types";

type GraphError = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};

async function parseGraphResponse(res: Response): Promise<
  GraphError & {
    messages?: { id: string }[];
    id?: string;
  }
> {
  const body = (await res.json().catch(() => ({}))) as GraphError & {
    messages?: { id: string }[];
    id?: string;
  };
  if (!res.ok) {
    const message = body.error?.message ?? `WhatsApp API error (${res.status})`;
    throw new Error(message);
  }
  return body;
}

function apiBase(config: WhatsAppConfig): string {
  return `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}`;
}

export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  bodyText: string
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig();
  const recipient = normalizeWhatsAppRecipient(to);

  if (!config) {
    console.info("[whatsapp] Skipped (not configured):", { to, templateName });
    return { ok: false, skipped: true, error: "WhatsApp not configured" };
  }

  if (!recipient) {
    return { ok: false, error: "Invalid recipient phone number" };
  }

  try {
    const res = await fetch(`${apiBase(config)}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: config.templateLanguage },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: bodyText.slice(0, 1024) }],
            },
          ],
        },
      }),
    });

    const body = await parseGraphResponse(res);
    return {
      ok: true,
      messageId: body.messages?.[0]?.id,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send WhatsApp message";
    console.error("[whatsapp] Template send failed:", message);
    return { ok: false, error: message };
  }
}

export async function uploadWhatsAppMedia(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const config = getWhatsAppConfig();
  if (!config) {
    throw new Error("WhatsApp not configured");
  }

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", mimeType);
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: mimeType }),
    filename
  );

  const res = await fetch(`${apiBase(config)}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    body: form,
  });

  const body = await parseGraphResponse(res);
  if (!body.id) {
    throw new Error("WhatsApp media upload did not return an id");
  }
  return body.id;
}

export async function sendWhatsAppDocument(
  to: string,
  buffer: Buffer,
  filename: string,
  caption?: string
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig();
  const recipient = normalizeWhatsAppRecipient(to);

  if (!config) {
    return { ok: false, skipped: true, error: "WhatsApp not configured" };
  }

  if (!recipient) {
    return { ok: false, error: "Invalid recipient phone number" };
  }

  try {
    const mediaId = await uploadWhatsAppMedia(
      buffer,
      "application/pdf",
      filename
    );

    const res = await fetch(`${apiBase(config)}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "document",
        document: {
          id: mediaId,
          caption: caption?.slice(0, 1024),
          filename,
        },
      }),
    });

    const body = await parseGraphResponse(res);
    return {
      ok: true,
      messageId: body.messages?.[0]?.id,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send WhatsApp document";
    console.error("[whatsapp] Document send failed:", message);
    return { ok: false, error: message };
  }
}
