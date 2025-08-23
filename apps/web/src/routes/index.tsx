import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	ArrowRight,
	Award,
	BookOpen,
	BookOpenCheck,
	CheckCircle,
	Clock,
	Globe,
	LifeBuoy,
	ShieldCheck,
	Target,
	TrendingUp,
	Users,
	Zap,
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
				<section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 sm:py-16 lg:py-24">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
					<div className="container relative mx-auto px-4">
						<div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
							<div className="flex flex-col justify-center space-y-6 lg:space-y-8">
								<div className="space-y-3 lg:space-y-4">
									<div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm">
										<Award className="mr-2 h-4 w-4" />
										Official PMI India Portal
									</div>
									<h1 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
										Become a{" "}
										<span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
											certified success
										</span>
									</h1>
									<p className="text-base text-gray-600 leading-relaxed sm:text-lg lg:text-xl">
										No matter what your professional goals are, we have a
										certification to help you reach them. Join thousands of
										professionals advancing their careers through PMI
										certifications.
									</p>
								</div>

								<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
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

								<div className="flex flex-col gap-3 text-gray-600 text-sm sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
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
										<CardTitle className="text-center font-bold text-xl lg:text-2xl">
											Access Exam Portal
										</CardTitle>
										<p className="text-center text-gray-600 text-sm">
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

				{/* PMI Certifications Showcase */}
				<section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
					<div className="container mx-auto px-4">
						<div className="mb-8 text-center lg:mb-12">
							<h2 className="mb-3 font-bold text-2xl text-gray-900 sm:text-3xl lg:mb-4 lg:text-4xl">
								PMI Certifications
							</h2>
							<p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
								Choose from industry-leading certifications that validate your
								project management expertise
							</p>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
							<Card className="group hover:-translate-y-1 cursor-pointer border-0 bg-white shadow-md transition-all hover:shadow-lg">
								<CardContent className="p-4 sm:p-6">
									<div className="mb-3 text-center sm:mb-4">
										<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:mb-4 sm:h-16 sm:w-16">
											<Award className="h-6 w-6 sm:h-8 sm:w-8" />
										</div>
										<h3 className="font-bold text-lg sm:text-xl">
											PMP<sup>®</sup>
										</h3>
									</div>
									<p className="mb-3 text-center text-gray-600 text-sm sm:mb-4 sm:text-base">
										Project Management Professional - The gold standard for
										project managers worldwide
									</p>
									<ul className="space-y-1.5 text-gray-700 text-sm sm:space-y-2 sm:text-base">
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											35 hours training required
										</li>
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											4,500 hours experience
										</li>
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											180 questions, 230 minutes
										</li>
									</ul>
								</CardContent>
							</Card>

							<Card className="group hover:-translate-y-1 cursor-pointer border-0 bg-white shadow-md transition-all hover:shadow-lg">
								<CardContent className="p-4 sm:p-6">
									<div className="mb-3 text-center sm:mb-4">
										<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 sm:mb-4 sm:h-16 sm:w-16">
											<BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
										</div>
										<h3 className="font-bold text-lg sm:text-xl">
											CAPM<sup>®</sup>
										</h3>
									</div>
									<p className="mb-3 text-center text-gray-600 text-sm sm:mb-4 sm:text-base">
										Certified Associate in Project Management - Perfect entry
										point for new project managers
									</p>
									<ul className="space-y-1.5 text-gray-700 text-sm sm:space-y-2 sm:text-base">
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											23 hours training required
										</li>
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											No experience required
										</li>
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											150 questions, 180 minutes
										</li>
									</ul>
								</CardContent>
							</Card>

							<Card className="group hover:-translate-y-1 cursor-pointer border-0 bg-white shadow-md transition-all hover:shadow-lg sm:col-span-2 lg:col-span-1">
								<CardContent className="p-4 sm:p-6">
									<div className="mb-3 text-center sm:mb-4">
										<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 sm:mb-4 sm:h-16 sm:w-16">
											<Zap className="h-6 w-6 sm:h-8 sm:w-8" />
										</div>
										<h3 className="font-bold text-lg sm:text-xl">
											PMI-ACP<sup>®</sup>
										</h3>
									</div>
									<p className="mb-3 text-center text-gray-600 text-sm sm:mb-4 sm:text-base">
										Agile Certified Practitioner - Validate your agile project
										management skills
									</p>
									<ul className="space-y-1.5 text-gray-700 text-sm sm:space-y-2 sm:text-base">
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											21 hours agile training
										</li>
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											2,000 hours agile experience
										</li>
										<li className="flex items-start">
											<CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
											120 questions, 180 minutes
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Benefits Section */}
				<section className="bg-gradient-to-r from-gray-50 to-blue-50 py-12 sm:py-16 lg:py-20">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
							<div className="space-y-6 lg:space-y-8">
								<div className="space-y-3 lg:space-y-4">
									<h2 className="font-bold text-2xl text-gray-900 sm:text-3xl lg:text-4xl">
										Why Choose PMI Certifications?
									</h2>
									<p className="text-base text-gray-600 sm:text-lg lg:text-xl">
										Join a global community of professionals who are
										transforming organizations through project success.
									</p>
								</div>

								<div className="space-y-4 sm:space-y-6">
									{benefits.map((benefit, index) => (
										<div
											key={index.toString()}
											className="flex items-start space-x-3 sm:space-x-4"
										>
											<div className="flex-shrink-0 rounded-full bg-green-100 p-1.5 sm:p-2">
												<CheckCircle className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900 text-sm sm:text-base">
													{benefit.title}
												</h3>
												<p className="text-gray-600 text-sm sm:text-base">
													{benefit.description}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
								{stats.map((stat, index) => (
									<Card
										key={index.toString()}
										className="border-0 bg-white p-3 text-center shadow-lg sm:p-4 lg:p-6"
									>
										<CardContent className="space-y-1 sm:space-y-2">
											<div className="font-bold text-blue-600 text-xl sm:text-2xl lg:text-3xl">
												{stat.value}
											</div>
											<div className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">
												{stat.label}
											</div>
											<div className="text-gray-600 text-xs lg:text-sm">
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
				<section className="bg-white py-12 sm:py-16 lg:py-20">
					<div className="container mx-auto px-4">
						<div className="mb-8 text-center lg:mb-12">
							<h2 className="mb-3 font-bold text-2xl text-gray-900 sm:text-3xl lg:mb-4 lg:text-4xl">
								Exam Portal Features
							</h2>
							<p className="text-base text-gray-600 sm:text-lg">
								Experience a secure, reliable, and user-friendly examination
								platform
							</p>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
							{features.map((feature, index) => (
								<Card
									key={index.toString()}
									className="group border-0 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-lg"
								>
									<CardHeader className="space-y-3 text-center sm:space-y-4">
										<div className="mx-auto w-fit rounded-full bg-blue-100 p-2.5 transition-colors group-hover:bg-blue-200 sm:p-3">
											{feature.icon}
										</div>
										<CardTitle className="font-bold text-base sm:text-lg">
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="text-center">
										<p className="text-gray-600 text-sm leading-relaxed sm:text-base">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-12 text-white sm:py-16 lg:py-20">
					<div className="container mx-auto px-4 text-center">
						<div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
							<h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl">
								Ready to Advance Your Career?
							</h2>
							<p className="text-base opacity-90 sm:text-lg lg:text-xl">
								Join thousands of professionals who have transformed their
								careers through PMI certifications. Start your journey today.
							</p>
							<div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
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
