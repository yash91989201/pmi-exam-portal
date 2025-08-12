import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormSubmitButton() {
	return (
		<div className="flex justify-end pt-4">
			<Button
				type="submit"
				size="lg"
				className="px-12 py-3 font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
			>
				<Trophy className="mr-2 h-5 w-5" />
				Create Exam
			</Button>
		</div>
	);
}
