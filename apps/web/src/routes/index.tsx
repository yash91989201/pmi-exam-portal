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
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/user/shared/footer";
import { Header } from "@/components/user/shared/header";
import { UserSignInForm } from "@/components/user/sign-in-form";

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
			<main className="flex-grow bg-background">
				{/* Hero Section */}
				<section className="bg-background py-12 sm:py-16 lg:py-20 xl:py-24">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
							<div className="space-y-6 sm:space-y-8">
								<div className="space-y-3 sm:space-y-4">
									<h1 className="font-bold text-3xl text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
										Master Your{" "}
										<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
											PMI Certification
										</span>{" "}
										Journey
									</h1>
									<p className="text-base text-muted-foreground sm:text-lg lg:text-xl">
										Join thousands of professionals who have advanced their
										careers through our comprehensive PMI exam preparation
										platform. Practice with real exam questions and get
										certified faster.
									</p>
								</div>
								<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
									<Button
										size="lg"
										className="bg-primary text-primary-foreground hover:bg-primary/90"
									>
										Start Free Practice
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
									<Button size="lg" variant="outline">
										View Certifications
									</Button>
								</div>
							</div>
							<div className="flex justify-center">
								<UserSignInForm />
							</div>
						</div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="border-border border-b bg-muted/30 py-8 sm:py-12">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
							{stats.map((stat, index) => (
								<div key={index.toString()} className="text-center">
									<div className="font-bold text-2xl text-foreground sm:text-3xl lg:text-4xl">
										{stat.value}
									</div>
									<div className="text-muted-foreground text-xs sm:text-sm lg:text-base">
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Certifications Section */}
				<section className="bg-background py-12 sm:py-16 lg:py-20">
					<div className="container mx-auto px-4">
						<div className="mb-8 text-center lg:mb-12">
							<h2 className="mb-3 font-bold text-2xl text-foreground sm:text-3xl lg:mb-4 lg:text-4xl">
								PMI Certifications Available
							</h2>
							<p className="text-base text-muted-foreground sm:text-lg">
								Choose from our comprehensive collection of PMI certification
								exam preparations
							</p>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
							{certificationData.map((cert, index) => (
								<Card
									key={index.toString()}
									className="group border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
								>
									<CardHeader className="space-y-3 text-center sm:space-y-4">
										<div className="mx-auto w-fit rounded-full bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20 sm:p-3">
											{cert.icon}
										</div>
										<CardTitle className="font-bold text-base text-card-foreground sm:text-lg">
											{cert.name}
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3 text-center sm:space-y-4">
										<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
											{cert.description}
										</p>
										<div className="flex items-center justify-center gap-4 text-muted-foreground text-xs sm:text-sm">
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{cert.duration}
											</div>
											<div className="flex items-center gap-1">
												<BookOpen className="h-3 w-3" />
												{cert.questions} questions
											</div>
										</div>
									</CardContent>
									<CardFooter>
										<Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
											Start Practice
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* Benefits Section */}
				<section className="bg-muted/30 py-12 sm:py-16 lg:py-20">
					<div className="container mx-auto px-4">
						<div className="mb-8 text-center lg:mb-12">
							<h2 className="mb-3 font-bold text-2xl text-foreground sm:text-3xl lg:mb-4 lg:text-4xl">
								Why Choose Our Platform?
							</h2>
							<p className="text-base text-muted-foreground sm:text-lg">
								Experience the most comprehensive and effective way to prepare
								for your PMI certification
							</p>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
							{benefits.map((benefit, index) => (
								<div
									key={index.toString()}
									className="group rounded-lg bg-card p-4 transition-all duration-300 hover:shadow-md sm:p-6"
								>
									<div className="mb-3 w-fit rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20 sm:mb-4 sm:p-3">
										{benefit.icon}
									</div>
									<h3 className="mb-2 font-bold text-base text-card-foreground sm:mb-3 sm:text-lg">
										{benefit.title}
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
										{benefit.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="bg-background py-12 sm:py-16 lg:py-20">
					<div className="container mx-auto px-4">
						<div className="mb-8 text-center lg:mb-12">
							<h2 className="mb-3 font-bold text-2xl text-foreground sm:text-3xl lg:mb-4 lg:text-4xl">
								Exam Portal Features
							</h2>
							<p className="text-base text-muted-foreground sm:text-lg">
								Experience a secure, reliable, and user-friendly examination
								platform
							</p>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
							{features.map((feature, index) => (
								<Card
									key={index.toString()}
									className="group border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
								>
									<CardHeader className="space-y-3 text-center sm:space-y-4">
										<div className="mx-auto w-fit rounded-full bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20 sm:p-3">
											{feature.icon}
										</div>
										<CardTitle className="font-bold text-base text-card-foreground sm:text-lg">
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="text-center">
										<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="bg-gradient-to-r from-primary to-secondary py-12 text-primary-foreground sm:py-16 lg:py-20">
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
									className="bg-background text-foreground hover:bg-background/90"
								>
									Get Started Today
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
								<Button
									size="lg"
									variant="ghost"
									className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
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
		icon: <TrendingUp className="h-5 w-5 text-primary" />,
		title: "Boost Career Growth",
		description:
			"Level up your skills with professional education and globally recognized certification.",
	},
	{
		icon: <Target className="h-5 w-5 text-primary" />,
		title: "Impact Project Success",
		description:
			"Access exclusive tools, resources, and expertise to drive successful project outcomes.",
	},
	{
		icon: <Users className="h-5 w-5 text-primary" />,
		title: "Join Global Community",
		description:
			"Connect with over 700,000 project professionals worldwide and expand your network.",
	},
	{
		icon: <Zap className="h-5 w-5 text-primary" />,
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
		icon: <ShieldCheck className="h-6 w-6 text-primary" />,
		title: "Secure & Reliable",
		description:
			"Enterprise-grade security ensures your exam data is protected with bank-level encryption and secure testing environment.",
	},
	{
		icon: <BookOpenCheck className="h-6 w-6 text-primary" />,
		title: "Comprehensive Exams",
		description:
			"Access all your assigned exams, view detailed results, and track your certification progress in one centralized portal.",
	},
	{
		icon: <LifeBuoy className="h-6 w-6 text-primary" />,
		title: "Expert Support",
		description:
			"Our dedicated support team is available 24/7 to assist you with technical issues, exam questions, and guidance.",
	},
	{
		icon: <Target className="h-6 w-6 text-primary" />,
		title: "Performance Analytics",
		description:
			"Get detailed insights into your exam performance with comprehensive analytics and personalized recommendations.",
	},
	{
		icon: <TrendingUp className="h-6 w-6 text-primary" />,
		title: "Progress Tracking",
		description:
			"Monitor your certification journey with visual progress indicators and milestone achievements.",
	},
	{
		icon: <Globe className="h-6 w-6 text-primary" />,
		title: "Global Recognition",
		description:
			"Earn certifications that are recognized and valued by employers worldwide across all industries.",
	},
];

const certificationData = [
	{
		icon: <Award className="h-6 w-6 text-primary" />,
		name: "PMP®",
		description:
			"Project Management Professional - The gold standard for project managers worldwide",
		duration: "35 hours",
		questions: 180,
	},
	{
		icon: <CheckCircle className="h-6 w-6 text-primary" />,
		name: "CAPM®",
		description:
			"Certified Associate in Project Management - Perfect entry point for new project managers",
		duration: "23 hours",
		questions: 150,
	},
	{
		icon: <Zap className="h-6 w-6 text-primary" />,
		name: "PMI-ACP®",
		description:
			"Agile Certified Practitioner - Validate your agile project management skills",
		duration: "21 hours",
		questions: 120,
	},
];
