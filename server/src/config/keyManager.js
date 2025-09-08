import { generateKeyPairSync } from "crypto";
import fs from "fs";

const privatePath = "./src/keys/private.pem";
const publicPath = "./src/keys/public.pem";

if (!fs.existsSync(privatePath) || !fs.existsSync(publicPath)) {
  fs.mkdirSync("./src/keys", { recursive: true });

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  fs.writeFileSync(publicPath, publicKey);
  fs.writeFileSync(privatePath, privateKey);
}
