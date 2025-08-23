import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	ArrowRight,
	Award,
	BookOpenCheck,
	CheckCircle,
	Clock,
	Globe,
	LifeBuoy,
	ShieldCheck,
	Target,
	TrendingUp,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserLoginForm } from "@/components/user/login-form";
import { Footer } from "@/components/user/shared/footer";
import { Header } from "@/components/user/shared/header";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;

		if (!session) {
			return;
		}

		throw redirect({
			to: session.user.role === "admin" ? "/dashboard" : "/exams",
		});
	},
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">
				{/* Hero Section with Gradient Background */}
				<section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-24">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
					<div className="container relative mx-auto px-4">
						<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
							<div className="flex flex-col justify-center space-y-8">
								<div className="space-y-4">
									<div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm">
										<Award className="mr-2 h-4 w-4" />
										Official PMI India Portal
									</div>
									<h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-6xl">
										Become a{" "}
										<span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
											certified success
										</span>
									</h1>
									<p className="text-gray-600 text-xl leading-relaxed">
										No matter what your professional goals are, we have a
										certification to help you reach them. Join thousands of
										professionals advancing their careers through PMI
										certifications.
									</p>
								</div>

								<div className="flex flex-col gap-4 sm:flex-row">
									<Button
										size="lg"
										className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
									>
										Explore Certifications
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
									<Button size="lg" variant="outline">
										Learn More
									</Button>
								</div>

								<div className="flex items-center space-x-8 text-gray-600 text-sm">
									<div className="flex items-center">
										<Users className="mr-2 h-4 w-4" />
										700K+ Members
									</div>
									<div className="flex items-center">
										<Globe className="mr-2 h-4 w-4" />
										Global Recognition
									</div>
									<div className="flex items-center">
										<Clock className="mr-2 h-4 w-4" />
										24/7 Support
									</div>
								</div>
							</div>

							<div className="flex items-center justify-center">
								<Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
									<CardHeader className="space-y-1">
										<CardTitle className="text-center font-bold text-2xl">
											Access Exam Portal
										</CardTitle>
										<p className="text-center text-gray-600">
											Sign in to continue your certification journey
										</p>
									</CardHeader>
									<CardContent>
										<UserLoginForm />
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</section>

				{/* Certifications Showcase */}
				<section className="bg-white py-20">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<h2 className="mb-4 font-bold text-3xl text-gray-900">
								Popular PMI Certifications
							</h2>
							<p className="mx-auto max-w-2xl text-gray-600 text-lg">
								Advance your career with industry-recognized certifications that
								demonstrate your expertise and commitment to excellence.
							</p>
						</div>

						<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
							{certifications.map((cert, index) => (
								<Card
									key={index.toString()}
									className="group border-0 bg-gradient-to-br from-gray-50 to-white transition-all duration-300 hover:shadow-lg"
								>
									<CardHeader className="space-y-4">
										<div className="flex items-center justify-between">
											<div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-xs">
												Certification
											</div>
											<div className="rounded-full bg-blue-100 p-2">
												<Award className="h-5 w-5 text-blue-600" />
											</div>
										</div>
										<CardTitle className="font-bold text-lg transition-colors group-hover:text-blue-600">
											{cert.name}
										</CardTitle>
										<p className="text-gray-600 text-sm">{cert.experience}</p>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-gray-700 text-sm leading-relaxed">
											{cert.description}
										</p>
										<Button
											variant="outline"
											size="sm"
											className="w-full group-hover:bg-blue-50"
										>
											Learn More
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* Benefits Section */}
				<section className="bg-gradient-to-r from-gray-50 to-blue-50 py-20">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
							<div className="space-y-8">
								<div className="space-y-4">
									<h2 className="font-bold text-3xl text-gray-900">
										Why Choose PMI Certifications?
									</h2>
									<p className="text-gray-600 text-lg">
										Join a global community of professionals who are
										transforming organizations through project success.
									</p>
								</div>

								<div className="space-y-6">
									{benefits.map((benefit, index) => (
										<div
											key={index.toString()}
											className="flex items-start space-x-4"
										>
											<div className="flex-shrink-0 rounded-full bg-green-100 p-2">
												<CheckCircle className="h-5 w-5 text-green-600" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900">
													{benefit.title}
												</h3>
												<p className="text-gray-600">{benefit.description}</p>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-6">
								{stats.map((stat, index) => (
									<Card
										key={index.toString()}
										className="border-0 bg-white p-6 text-center shadow-lg"
									>
										<CardContent className="space-y-2">
											<div className="font-bold text-3xl text-blue-600">
												{stat.value}
											</div>
											<div className="font-medium text-gray-900 text-sm">
												{stat.label}
											</div>
											<div className="text-gray-600 text-xs">
												{stat.description}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="bg-white py-20">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<h2 className="mb-4 font-bold text-3xl text-gray-900">
								Exam Portal Features
							</h2>
							<p className="text-gray-600 text-lg">
								Experience a secure, reliable, and user-friendly examination
								platform
							</p>
						</div>

						<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
							{features.map((feature, index) => (
								<Card
									key={index.toString()}
									className="group border-0 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-lg"
								>
									<CardHeader className="space-y-4 text-center">
										<div className="mx-auto w-fit rounded-full bg-blue-100 p-3 transition-colors group-hover:bg-blue-200">
											{feature.icon}
										</div>
										<CardTitle className="font-bold text-lg">
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="text-center">
										<p className="text-gray-600 leading-relaxed">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-20 text-white">
					<div className="container mx-auto px-4 text-center">
						<div className="mx-auto max-w-3xl space-y-8">
							<h2 className="font-bold text-3xl">
								Ready to Advance Your Career?
							</h2>
							<p className="text-xl opacity-90">
								Join thousands of professionals who have transformed their
								careers through PMI certifications. Start your journey today.
							</p>
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Button
									size="lg"
									variant="secondary"
									className="bg-white text-blue-600 hover:bg-gray-100"
								>
									Get Started Today
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
								<Button
									size="lg"
									variant="ghost"
									className="border-white text-white hover:bg-white hover:text-blue-600"
								>
									Contact Support
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

// Data for the enhanced components
const certifications = [
	{
		name: "PMP® - Project Management Professional",
		experience: "3+ years of experience",
		description:
			"The gold standard of project management certification, demonstrating your ability to lead and direct projects.",
	},
	{
		name: "CAPM® - Certified Associate in Project Management",
		experience: "No experience required",
		description:
			"Perfect for those new to project management or seeking to enhance their project management skills.",
	},
	{
		name: "PMI-ACP® - PMI Agile Certified Practitioner",
		experience: "2+ years of experience",
		description:
			"Validate your ability to use agile practices in your projects while demonstrating increased professional versatility.",
	},
];

const benefits = [
	{
		title: "Boost Career Growth",
		description:
			"Level up your skills with professional education and globally recognized certification.",
	},
	{
		title: "Impact Project Success",
		description:
			"Access exclusive tools, resources, and expertise to drive successful project outcomes.",
	},
	{
		title: "Join Global Community",
		description:
			"Connect with over 700,000 project professionals worldwide and expand your network.",
	},
	{
		title: "Increase Earning Power",
		description:
			"PMI-certified professionals earn higher salaries and have better career advancement opportunities.",
	},
];

const stats = [
	{
		value: "700K+",
		label: "Members Worldwide",
		description: "Global community",
	},
	{
		value: "180+",
		label: "Countries",
		description: "PMI presence",
	},
	{
		value: "25%",
		label: "Salary Increase",
		description: "Average boost",
	},
	{
		value: "99.9%",
		label: "Uptime",
		description: "Platform reliability",
	},
];

const features = [
	{
		icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
		title: "Secure & Reliable",
		description:
			"Enterprise-grade security ensures your exam data is protected with bank-level encryption and secure testing environment.",
	},
	{
		icon: <BookOpenCheck className="h-6 w-6 text-blue-600" />,
		title: "Comprehensive Exams",
		description:
			"Access all your assigned exams, view detailed results, and track your certification progress in one centralized portal.",
	},
	{
		icon: <LifeBuoy className="h-6 w-6 text-blue-600" />,
		title: "Expert Support",
		description:
			"Our dedicated support team is available 24/7 to assist you with technical issues, exam questions, and guidance.",
	},
	{
		icon: <Target className="h-6 w-6 text-blue-600" />,
		title: "Performance Analytics",
		description:
			"Get detailed insights into your exam performance with comprehensive analytics and personalized recommendations.",
	},
	{
		icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
		title: "Progress Tracking",
		description:
			"Monitor your certification journey with visual progress indicators and milestone achievements.",
	},
	{
		icon: <Globe className="h-6 w-6 text-blue-600" />,
		title: "Global Recognition",
		description:
			"Earn certifications that are recognized and valued by employers worldwide across all industries.",
	},
];
