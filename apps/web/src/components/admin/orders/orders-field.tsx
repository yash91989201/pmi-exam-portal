import { createId } from "@paralleldrive/cuid2";
// ICONS
import { Trash2 } from "lucide-react";
import { Fragment, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
// TYPES
// CUSTOM COMPONENTS
import {
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { OrderFormSchemaType } from "@/lib/types";

export default function OrdersField() {
	const { control, setValue } = useFormContext<OrderFormSchemaType>();

	const { fields, append, remove } = useFieldArray({
		name: "orders",
		control: control,
	});

	useEffect(() => {
		fields.forEach((field, index) => {
			setValue(`orders.${index}.orderPriority`, index + 1);
		});
	}, [fields, setValue]);

	const addOrder = () => {
		append({
			id: createId(),
			orderText: "",
			orderPriority: fields.length + 1,
		});
	};

	const deleteOrder = (index: number) => {
		remove(index);
	};

	return (
		<div className="flex flex-col gap-3">
			{fields.map((order, index) => (
				<Fragment key={order.id}>
					<div>
						<span className="font-bold text-primary text-xl">{index + 1}</span>
						<span>/{fields.length}</span>
					</div>
					<div className="flex items-center gap-3">
						<FormField
							name={`orders.${index}.orderText`}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											placeholder={`Order Status ${index + 1}`}
											className="w-60"
											type="text"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								onClick={() => deleteOrder(index)}
								disabled={fields.length === 1}
								type="button"
							>
								<Trash2 size={16} />
							</Button>
						</div>
					</div>
				</Fragment>
			))}
			<Button
				variant="outline"
				type="button"
				className="w-fit"
				onClick={() => addOrder()}
				disabled={fields.length >= 10}
			>
				Add New Order Status
			</Button>
		</div>
	);
}
