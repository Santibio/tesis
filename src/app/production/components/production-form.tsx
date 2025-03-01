"use client";

import { useForm, Controller } from "react-hook-form";
import { Product } from "@prisma/client";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
} from "@nextui-org/react";
import { capitalize } from "@/libs/helpers/text";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import {
  AddProductionInputs,
  CreateProductionFormSchema,
} from "@/libs/schemas/production";
import { createProduction } from "../actions";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import paths from "@/libs/paths";

interface ProductionFormProps {
  products: Product[];
}

export default function ProductionForm({ products }: ProductionFormProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddProductionInputs>({
    resolver: zodResolver(CreateProductionFormSchema),
    defaultValues: {
      product: "",
      quantity: undefined,
    },
  });

  const [isLoading, setIsloading] = useState<boolean>(false);

  const onSubmit = async (data: AddProductionInputs) => {
    try {
      setIsloading(true);
      const response = await createProduction(data);
      if (response?.errors) {
        const errorMessage =
          response.errors._form?.[0] || "An unexpected error occurred.";
        toast.error(errorMessage);
      } else {
        toast.success("Lote creado correctamente");
        router.push(paths.production());
      }
    } catch (error) {
      console.log("Error: ", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="h-[70dvh] flex flex-col gap-4">
        <Controller
          name="product"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              label="Producto"
              placeholder="Buscar producto"
              onSelectionChange={(key) => {
                field.onChange(key); // Actualiza el valor en el form
              }}
              defaultItems={products}
              isInvalid={!!errors.product}
              errorMessage={errors.product?.message}
              startContent={
                <Search
                  className="text-default-400"
                  strokeWidth={2.5}
                  size={20}
                />
              }
            >
              {(item) => (
                <AutocompleteItem key={item.id}>
                  {capitalize(item.name)}
                </AutocompleteItem>
              )}
            </Autocomplete>
          )}
        />
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              label="Cantidad"
              placeholder="Ingresar cantidad"
              value={field.value?.toString() ?? ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
              isInvalid={!!errors.quantity}
              errorMessage={errors.quantity?.message}
            />
          )}
        />
      </div>

      <Button
        type="submit"
        color="primary"
        variant="ghost"
        className="w-full mt-6"
        isLoading={isLoading}
        isDisabled={isLoading}
      >
        Confirmar
      </Button>
    </form>
  );
}
