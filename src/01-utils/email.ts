import nodeMailer from 'nodemailer';
import { IContactUsModel } from '../03-models/contact-us-model';



const transponder = nodeMailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASS_MAIL
    }
})

export const mailSend = (contactUs: IContactUsModel): Promise<any> => {
    return new Promise<any>((resolve, reject) => {

        const mailOptions = {
            from: contactUs.email,
            to: process.env.USER_MAIL,
            subject: `${contactUs.email}:  ${contactUs.subject}`,
            html: `
            <div style="direction: ltr">
            <h1>Contact From NW-tst</h1>
            <p><b>Name:</b> ${contactUs.name}</p>
            <p><b>Subject:</b> ${contactUs.subject}<br /></p>
            <p><b>Message:</b><i> ${contactUs.message}</i></p>
            </div>`
        }

        transponder.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err)

            resolve(info.response)
        })

    })

}


export const sendResetEmail = async (email: string, resetToken: Promise<string>) => {
    return new Promise<any>((resolve, reject) => {
        const mailOptions = {
            from: process.env.USER_MAIL,
            to: email,
            subject: 'Password Reset',
            html: `
              <html>
                <head>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      background-color: #f7f7f7;
                      margin: 0;
                      padding: 0;
                      line-height: 1.6;
                    }
                    .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #fff;
                      border-radius: 5px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                      font-size: 24px;
                      color: #333;
                      margin-top: 0;
                    }
                    p {
                      font-size: 16px;
                      color: #666;
                    }
                    a {
                      color: #007bff;
                      text-decoration: none;
                    }
                    a:hover {
                      text-decoration: underline;
                    }
                    .button {
                      display: inline-block;
                      background-color: #007bff;
                      color: #fff;
                      padding: 10px 20px;
                      border-radius: 5px;
                      text-decoration: none;
                      margin-top: 20px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Password Reset</h1>
                    <p>To reset your password, please click on the following link:</p>
                    <a class="button" href="http://localhost:3000/reset-password?token=${resetToken}">Reset Password</a>
                    <p>If you didn't request a password reset, you can ignore this email.</p>
                  </div>
                </body>
              </html>
            `,
        };

        transponder.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err)

            resolve(info.response)
        })
    })
};