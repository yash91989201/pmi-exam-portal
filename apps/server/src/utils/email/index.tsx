import { EmailVerificationEmail } from "@/lib/emails/email-verification";
import { PasswordResetEmail } from "@/lib/emails/password-reset";
import { SignInEmail } from "@/lib/emails/sign-in";
import { resend } from "@/lib/resend";

export const sendSignInOtp = async ({
	email,
	otp,
}: {
	email: string;
	otp: string;
}) => {
	await resend.emails.send({
		from: "PMI India <auth@mail.pmiindia.org>",
		to: [email],
		subject: "Your sign in code",
		react: <SignInEmail otp={otp} />,
	});
};

export const sendEmailVerificationOtp = async ({
	email,
	otp,
}: {
	email: string;
	otp: string;
}) => {
	await resend.emails.send({
		from: "PMI India <auth@mail.pmiindia.org>",
		to: [email],
		subject: "Verify your email",
		react: <EmailVerificationEmail otp={otp} />,
	});
};

export const sendPasswordResetOtp = async ({
	email,
	otp,
}: {
	email: string;
	otp: string;
}) => {
	await resend.emails.send({
		from: "PMI India <auth@mail.pmiindia.org>",
		to: [email],
		subject: "Reset your password",
		react: <PasswordResetEmail otp={otp} />,
	});
};
