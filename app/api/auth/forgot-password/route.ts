import { NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { sendEmail } from "@/lib/email"
import handlebars from "handlebars";

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { email } = await req.json()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "If an account with that email exists, we've sent a password reset link" })
    }

    const resetToken = crypto.randomBytes(20).toString("hex")
    const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    user.resetPasswordToken = passwordResetToken
    user.resetPasswordExpire = Date.now() + 3600000

    await user.save()

    const htmlTemplate = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
    </head>
    
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"
            style="margin: auto; width: 100%; max-width: 600px;">
            <tr>
                <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                    <img src="https://i.ibb.co/5Khx5MC/email-with-encrypted-password-1.png"
                        style="max-width: 200%; margin-top: 140px; margin-bottom: 2em; width:200px;"
                        alt="email reset image">
                    <h2 style="margin: 0; margin-bottom: 10px;">Forget Your Password?</h2>
                    <p style="margin: 0; margin-bottom: 10px;">We have recieved request to reset password for your account
                        at address - <b>"{{email}}"</b>.</p>
                    <p style="margin: 0; margin-bottom: 10px;">To Reset the Password, Please click the below button.</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                        <tr>
                            <td bgcolor="#111212" style="border-radius: 5px; text-align: center;">
                                <a href="{{link}}"
                                    style="display: inline-block; padding: 10px 20px; text-decoration: none; color: #ffffff; font-size: 14px;">Reset
                                    Password
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    
    </html>`;

    const template = handlebars.compile(htmlTemplate);

    const replacements = {
      email: email,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`
    };

    const htmlToSend = template(replacements);

    try {
      const emailSent = await sendEmail(email, "Forgot Password", htmlToSend);
      console.log({ emailSent });
    } catch (error) {
      return NextResponse.json(
        {
          error_code: "error_sending_email",
          message: "Oops! Something went wrong while sending email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "If an account with that email exists, we've sent a password reset link" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "An error occurred while processing your request" }, { status: 500 })
  }
}

