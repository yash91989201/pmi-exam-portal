import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createId } from "@paralleldrive/cuid2";
import { useMutation } from "@tanstack/react-query";
import { Loader2, RefreshCw, Save } from "lucide-react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { OrderFormSchema } from "@/lib/schema";
import type { OrderFormSchemaType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";
import OrdersField from "./orders-field";

export default function CreateOrderForm({
	initialOrders,
}: {
	initialOrders: OrderFormSchemaType["orders"];
}) {
	const { mutateAsync: updateOrders } = useMutation(
		queryUtils.admin.updateOrders.mutationOptions({}),
	);

	const { mutateAsync: syncOrders, isPending: isSyncing } = useMutation(
		queryUtils.admin.syncOrders.mutationOptions({}),
	);

	const handleSync = async () => {
		try {
			const res = await syncOrders(); // no input
			toast.success(res.message);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to sync orders.",
			);
		}
	};

	const createOrderForm = useForm<OrderFormSchemaType>({
		defaultValues: {
			orders:
				initialOrders.length > 0
					? initialOrders
					: [
							{
								id: createId(),
								orderText: "",
								orderPriority: 1,
							},
						],
		},
		resolver: standardSchemaResolver(OrderFormSchema),
	});
	const { handleSubmit, formState, reset } = createOrderForm;

	const onSubmit: SubmitHandler<OrderFormSchemaType> = async (data) => {
		try {
			const mutationRes = await updateOrders(data);
			toast.success(mutationRes.message);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update order statuses.",
			);
		}
	};

	return (
		<section>
			<Form {...createOrderForm}>
				<form
					onSubmit={handleSubmit(onSubmit)}
					onReset={() => reset()}
					className="space-y-3"
				>
					<OrdersField />
					<div className="flex items-center gap-4">
						<Button
							type="submit"
							disabled={formState.isSubmitting}
							className="flex items-center gap-2"
						>
							{formState.isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Save className="h-4 w-4" />
							)}
							<span>Update Orders</span>
						</Button>
						<Button
							type="button"
							onClick={handleSync}
							disabled={isSyncing}
							className="flex items-center gap-2"
							variant="secondary"
						>
							{isSyncing ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<RefreshCw className="h-4 w-4" />
							)}
							<span>Sync All User Orders</span>
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
}
