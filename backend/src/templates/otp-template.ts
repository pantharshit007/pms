const otpTemplate = (otp: string, email: string, url: string) => {
  return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification Email</title>
    </head>
    <body>
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 100%; overflow: auto; line-height: 2">
            <div style="margin: 50px; width: 80%; padding: 20px 0">
                <div style="border-bottom: 1px solid #eee">
                    <a href="https://pm-sys.vercel.app/" style="color: #00466a; text-decoration: none; font-weight: 600">
                        <img style="max-width: 200px;" src="https://plus.unsplash.com/premium_photo-1706259481452-f857c96ceaca?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="PMS Logo"/>
                    </a>
                </div>
                <p style="font-size: 1.1em">Hi,</p>
                <p>Thank you for choosing Us. Use the following OTP to complete your Sign Up procedures. OTP is valid for 10 minutes</p>
                <p>This OTP is for <b>${email}</b></p>
                <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">
                    ${otp}
                </h2>
              
              <p>Or you can click to verify: <a href="${url}/auth/register?otp=${otp}&email=${email}">Verify</a></p>
                <p style="font-size: 0.9em;">Regards,<br />PMS</p>
                <hr style="border: none; border-top: 1px solid #eee" />
                <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                    <p>PMS Inc</p>
                    <p>India</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
};

export { otpTemplate };
