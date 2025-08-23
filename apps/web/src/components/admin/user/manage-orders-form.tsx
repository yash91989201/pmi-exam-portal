import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
	ManageUserOrdersInput,
	type ManageUserOrdersInputType,
} from "@server-schemas/index";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { GripVertical, Trash } from "lucide-react";
import {
	type SubmitHandler,
	type UseFormReturn,
	useFieldArray,
	useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { queryClient, queryUtils } from "@/utils/orpc";

interface SortableItemProps {
	id: string;
	index: number;
	form: UseFormReturn<
		ManageUserOrdersInputType,
		// biome-ignore lint/suspicious/noExplicitAny: <this is the form type>
		any,
		ManageUserOrdersInputType
	>;
	onRemove: (index: number) => void;
}

const SortableItem = ({ id, index, form, onRemove }: SortableItemProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 10 : "auto",
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="mb-4 flex items-center gap-4 rounded-lg border bg-background p-4 shadow-sm"
		>
			<div
				{...attributes}
				{...listeners}
				className="cursor-grab touch-none active:cursor-grabbing"
			>
				<GripVertical className="h-6 w-6 text-muted-foreground" />
			</div>
			<div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-2">
				<FormField
					control={form.control}
					name={`orders.${index}.orderText`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input {...field} placeholder="E.g., Complete project report" />
							</FormControl>
						</FormItem>
					)}
				/>
				<div className="flex items-end">
					<FormField
						control={form.control}
						name={`orders.${index}.isCompleted`}
						render={({ field }) => (
							<FormItem className="flex h-10 items-center gap-2 space-y-0 rounded-md border-input px-3">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										id={`completed-${id}`}
									/>
								</FormControl>
								<FormLabel
									htmlFor={`completed-${id}`}
									className="cursor-pointer"
								>
									Completed
								</FormLabel>
							</FormItem>
						)}
					/>
				</div>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="text-destructive hover:bg-destructive/10"
				onClick={() => onRemove(index)}
			>
				<Trash className="h-5 w-5" />
			</Button>
		</div>
	);
};

export const ManageOrdersForm = ({ userId }: { userId: string }) => {
	const { data: userOrdersData } = useSuspenseQuery(
		queryUtils.admin.getUserOrders.queryOptions({ input: { userId } }),
	);

	const form = useForm<ManageUserOrdersInputType>({
		resolver: standardSchemaResolver(ManageUserOrdersInput),
		defaultValues: {
			userId,
			orders: userOrdersData.userOrders.map((o) => ({
				id: o.id,
				orderText: o.orderText,
				orderPriority: o.orderPriority,
				isCompleted: o.isCompleted,
			})),
		},
	});

	const { fields, remove, move } = useFieldArray({
		control: form.control,
		name: "orders",
	});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const { mutateAsync: manageUserOrders, isPending } = useMutation(
		queryUtils.admin.manageUserOrders.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries(
					queryUtils.admin.getUserOrders.queryOptions({ input: { userId } }),
				);
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update orders");
			},
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = fields.findIndex((field) => field.id === active.id);
			const newIndex = fields.findIndex((field) => field.id === over.id);
			move(oldIndex, newIndex);
		}
	};

	const onSubmit: SubmitHandler<ManageUserOrdersInputType> = async (
		formData,
	) => {
		const ordersWithPriority = {
			...formData,
			orders: formData.orders.map((order, index) => ({
				...order,
				orderPriority: index + 1,
			})),
		};
		await manageUserOrders(ordersWithPriority);
	};

	const items = fields.map((field) => field.id);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Manage Orders</CardTitle>
				<CardDescription>
					Drag and drop to reorder, edit details, and mark orders as completed.
				</CardDescription>
			</CardHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={items}
								strategy={verticalListSortingStrategy}
							>
								{fields.map((field, index) => (
									<SortableItem
										key={field.id}
										id={field.id}
										index={index}
										form={form}
										onRemove={remove}
									/>
								))}
							</SortableContext>
						</DndContext>
					</CardContent>
					<CardFooter className="flex justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => form.reset()}
							disabled={isPending}
						>
							Reset
						</Button>
						<Button
							type="submit"
							disabled={isPending || !form.formState.isDirty}
						>
							{isPending ? "Saving..." : "Save Changes"}
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
};
