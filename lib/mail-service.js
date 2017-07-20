const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'localhost',
  port: process.env.MAIL_PORT || 465,
  secure: process.env.MAIL_SECURE || false, // secure:true for port 465, secure:false for port 587
  auth: {
    user: process.env.MAIL_USER ,
    pass: process.env.MAIL_PASS
  }
});

const SENDER = process.env.MAIL_SENDER || 'contact@oss-auth-server.org';

function mailService(baseUrl) {
  return {
    /**
     * Sends a mail that contains the URL to the Google Authenticator QRCode
     * @param  {string} to              e-mail recipient
     * @param  {string} route           the route leading to the QRCode (eg. "/qrcode?secret=ABC")
     * @param  {Date}   expirationDate  this date is the validity limit of the given URL
     * @return {Promise<object>}        a Promise containing the mail info
     */
    send(to, route, expirationDate) {
      if (route.substr(0, 1) !== '/') {
        route = '/' + route;
      }
      // setup email data with unicode symbols
      const mailOptions = {
        from: `"OSS Auth Server" <${SENDER}>`,
        to: to,
        subject: 'Authentication - OSS Auth Server',
        html: `
<p>
  Hello <strong>${to}</strong>,
  <br/><br/>
  Please, follow <a href="${baseUrl}${route}">this link<a> and scan the QR code using <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr">Google Authenticator</a> in order to <a href="${baseUrl}">log-in<a>.
</p>
<p>
  This link will be available until ${expirationDate}.
</p>
<p>OSS Auth Server</p>
`
      };

      return new Promise((resolve, reject) => {
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    }
  };
}

module.exports = mailService;
