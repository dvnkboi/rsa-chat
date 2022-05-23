self.window = self;
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/2.3.1/jsencrypt.min.js');
let crypt = null;
let privateKey = null;
let encryptionEnabled = true;



onmessage = function (e) {
  const [messageType, messageId, text, key] = e.data;
  let result;
  switch (messageType) {
    case 'generate-keys':
      result = generateKeypair();
      break;
    case 'encrypt':
      result = encrypt(text, key);
      break;
    case 'decrypt':
      result = decrypt(text);
      break;
    case 'enable-encryption':
      encryptionEnabled = true;
      result = true;
      break;
    case 'disable-encryption':
      encryptionEnabled = false;
      result = true;
      break;
  }
  postMessage([messageId, result]);
};
function generateKeypair() {
  crypt = new JSEncrypt({ default_key_size: 2048 });
  privateKey = crypt.getPrivateKey();
  return crypt.getPublicKey();
}
function encrypt(content, publicKey) {
  if (!encryptionEnabled) return content;
  crypt.setKey(publicKey);
  return crypt.encrypt(content);
}
function decrypt(content) {
  if (!encryptionEnabled) return content;
  crypt.setKey(privateKey);
  return crypt.decrypt(content);
}
