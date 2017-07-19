const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const opts = {
  rendererOpts: {
    quality: 1
  }
};

function secretService() {
  return {
    create() {
      const secret = speakeasy.generateSecret();
      return secret.base32;
    },

    qrcode(key) {
      return new Promise((resolve, reject) => {
        QRCode.toDataURL('otpauth://totp/oss-auth-server?secret=' + key, opts, (err, dataURL) => {
          if (err) {
            reject(err);
          } else {
            resolve(dataURL);
          }
        });
      });
    }
  };
}

module.exports = secretService;
