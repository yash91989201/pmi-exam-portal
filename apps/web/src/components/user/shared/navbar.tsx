import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import {
	StopImpersonationBtn,
	StopImpersonationBtnSkeleton,
} from "@/components/admin/user/stop-impersonation-btn";

export const UserNavbar = () => {
	return (
		<nav>
			<ul className="flex space-x-4">
				<li>
					<Link to="/exams">Exams</Link>
				</li>
				<li>
					<Link to="/orders">Orders</Link>
				</li>
				<li>
					<Link to="/certificates">Certificates</Link>
				</li>
			</ul>

			<Suspense fallback={<StopImpersonationBtnSkeleton />}>
				<StopImpersonationBtn />
			</Suspense>
		</nav>
	);
};
