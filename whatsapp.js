import qrcode from "qrcode-terminal";
import { Client } from "whatsapp-web.js";

const whatsappClient = new Client();

whatsappClient.on("qr", (qr) => {
  console.log("📲 Escaneie o QR Code abaixo com seu WhatsApp:");
  qrcode.generate(qr, { small: true });
});

whatsappClient.on("ready", () => {
  console.log("✅ Bot WhatsApp conectado!");
});

whatsappClient.initialize();

export default whatsappClient;
