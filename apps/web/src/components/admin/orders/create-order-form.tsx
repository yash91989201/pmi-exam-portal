import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createId } from "@paralleldrive/cuid2";
import { useMutation } from "@tanstack/react-query";
// ICONS
import { Loader2 } from "lucide-react";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// import type { OrderFormSchemaType, OrderSchemaType } from "@/lib/schema";
// CUSTOM COMPONENTS
import { Form } from "@/components/ui/form";
// ACTIONS
// import { updateOrder } from "@/server/actions/order";
// SCHEMAS
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
							{
								id: createId(),
								orderText: "",
								orderPriority: 2,
							},
						],
		},
		resolver: standardSchemaResolver(OrderFormSchema),
	});
	const { handleSubmit, formState, reset } = createOrderForm;

	const onSubmit: SubmitHandler<OrderFormSchemaType> = async (data) => {
		const mutationRes = await updateOrders(data);

		toast.success(mutationRes.message);
	};

	return (
		<Form {...createOrderForm}>
			<form
				className="flex flex-col gap-6"
				onSubmit={handleSubmit(onSubmit)}
				onReset={() => reset()}
			>
				<OrdersField />

				<Button
					type="submit"
					disabled={formState.isSubmitting}
					className="flex w-fit items-center justify-center gap-3 disabled:cursor-not-allowed"
				>
					<h6 className="md:text-lg">Update Order Status</h6>
					{formState.isSubmitting && <Loader2 className="animate-spin" />}
				</Button>
			</form>
		</Form>
	);
}
