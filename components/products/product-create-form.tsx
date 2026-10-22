"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createProductAction,
  type ProductActionState,
  updateProductAction,
} from "@/features/products/product.action";

type CategoryOption = {
  id: string;
  name: string;
};

const initialState: ProductActionState = {
  status: "idle",
  message: "",
  errors: {},
};

export type ProductFormValues = {
  name: string;
  sku: string;
  price: string;
  stock: string;
  categoryId: string;
  description: string;
  imageUrl: string;
};

const emptyValues: ProductFormValues = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  categoryId: "",
  description: "",
  imageUrl: "",
};

const inputClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return <p className="text-destructive text-sm">{messages[0]}</p>;
}

export function ProductCreateForm({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductFormValues & { id: string };
}) {
  const initialValues = product ?? emptyValues;
  const [values, setValues] = useState<ProductFormValues>(initialValues);

  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;

  async function submitAction(
    previousState: ProductActionState,
    formData: FormData,
  ) {
    const result = await action(previousState, formData);
    if (result.status === "success" && !product) {
      setValues({ ...emptyValues });
    }
    return result;
  }

  const [state, formAction, pending] = useActionState(submitAction, initialState);

  // Update one field without losing the others.
  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="gap-5 grid md:grid-cols-2">
        {/* Product name */}
        <div className="space-y-2">
          <label htmlFor="product-name" className="font-medium text-sm">
            Product name
          </label>

          <input
            id="product-name"
            name="name"
            className={inputClass}
            placeholder="Wireless Mouse"
            required
            maxLength={120}
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            aria-invalid={Boolean(state.errors.name?.length)}
          />

          <FieldError messages={state.errors.name} />
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <label htmlFor="product-sku" className="font-medium text-sm">
            SKU
          </label>

          <input
            id="product-sku"
            name="sku"
            className={inputClass}
            placeholder="MOUSE-001"
            required
            maxLength={32}
            value={values.sku}
            onChange={(e) => updateField("sku", e.target.value)}
            aria-invalid={Boolean(state.errors.sku?.length)}
          />

          <FieldError messages={state.errors.sku} />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label htmlFor="product-price" className="font-medium text-sm">
            Price (NPR)
          </label>

          <input
            id="product-price"
            name="price"
            type="text"
            inputMode="decimal"
            className={inputClass}
            placeholder="1250.00"
            required
            value={values.price}
            onChange={(e) => updateField("price", e.target.value)}
            aria-invalid={Boolean(state.errors.price?.length)}
          />

          <FieldError messages={state.errors.price} />
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <label htmlFor="product-stock" className="font-medium text-sm">
            Stock quantity
          </label>

          <input
            id="product-stock"
            name="stock"
            type="number"
            min={0}
            max={1000000}
            step={1}
            className={inputClass}
            placeholder="20"
            required
            value={values.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            aria-invalid={Boolean(state.errors.stock?.length)}
          />

          <FieldError messages={state.errors.stock} />
        </div>

        {/* Category */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="product-category" className="font-medium text-sm">
            Category
          </label>

          <select
            id="product-category"
            name="categoryId"
            className={inputClass}
            required
            value={values.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            aria-invalid={Boolean(state.errors.categoryId?.length)}
          >
            <option value="" disabled>
              Select a category
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <FieldError messages={state.errors.categoryId} />
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="product-description" className="font-medium text-sm">
            Description (optional)
          </label>

          <textarea
            id="product-description"
            name="description"
            rows={4}
            maxLength={2000}
            className={inputClass}
            placeholder="Describe this product..."
            value={values.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <FieldError messages={state.errors.description} />
        </div>

        {/* Image URL */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="product-image" className="font-medium text-sm">
            Image URL (optional)
          </label>

          <input
            id="product-image"
            name="imageUrl"
            type="url"
            className={inputClass}
            placeholder="https://example.com/mouse.jpg"
            value={values.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            aria-invalid={Boolean(state.errors.imageUrl?.length)}
          />

          <FieldError messages={state.errors.imageUrl} />
        </div>
      </div>

      {/* Server feedback */}
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-emerald-600"
          }
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending
            ? product
              ? "Saving..."
              : "Creating..."
            : product
              ? "Save changes"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
