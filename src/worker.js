import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

const FROM_ADDRESS = "contact@thesonlab.com";
const TO_ADDRESS = "jenny@thesonlab.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const msg = createMimeMessage();
  msg.setSender({ name: "The Son Lab contact form", addr: FROM_ADDRESS });
  msg.setRecipient(TO_ADDRESS);
  msg.setSubject(`New message from ${name} via thesonlab.com`);
  msg.addMessage({
    contentType: "text/plain",
    data: `From: ${name} <${email}>\n\n${message}`,
  });
  msg.setHeader("Reply-To", email);

  const emailMessage = new EmailMessage(FROM_ADDRESS, TO_ADDRESS, msg.asRaw());

  try {
    await env.SEND_EMAIL.send(emailMessage);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
  }
}
