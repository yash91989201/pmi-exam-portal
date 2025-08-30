import { createId } from "@paralleldrive/cuid2";
import { PlusCircle, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
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
		fields.forEach((_, index) => {
			setValue(`orders.${index}.orderPriority`, index + 1);
		});
	}, [fields, setValue]);

	const addOrder = () => {
		if (fields.length < 10) {
			append({
				id: createId(),
				orderText: "",
				orderPriority: fields.length + 1,
			});
		}
	};

	const deleteOrder = (index: number) => {
		if (fields.length > 1) {
			remove(index);
		}
	};

	return (
		<div className="space-y-4">
			{fields.map((order, index) => (
				<Card key={order.id} className="border-2 border-dashed shadow-none">
					<CardHeader className="flex flex-row items-center justify-between py-4">
						<CardTitle className="font-medium text-lg">
							Order #{index + 1}
						</CardTitle>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									disabled={fields.length === 1}
									type="button"
									className="text-muted-foreground hover:text-destructive"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete
										this order status.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={() => deleteOrder(index)}>
										Continue
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</CardHeader>
					<CardContent>
						<FormField
							name={`orders.${index}.orderText`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status Text</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder={`Enter status text for order ${index + 1}`}
											type="text"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>
			))}
			<Button
				type="button"
				variant="outline"
				onClick={addOrder}
				disabled={fields.length >= 10}
			>
				<PlusCircle className="mr-2 h-4 w-4" />
				Add New Order
			</Button>
		</div>
	);
}

