"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  archiveProductAction,
  restoreProductAction,
  type ProductLifecycleState,
} from "@/features/products/product.action";

const initialState: ProductLifecycleState = { status: "idle", message: "" };

export function ProductStatusForm({
  productId,
  archived,
}: {
  productId: string;
  archived: boolean;
}) {
  const action = (archived ? restoreProductAction : archiveProductAction).bind(
    null,
    productId,
  );
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center gap-3"
      onSubmit={(event) => {
        if (
          !archived &&
          !window.confirm(
            "Archive this product? It will be removed from active listings and metrics.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Button
        type="submit"
        variant={archived ? "outline" : "destructive"}
        disabled={pending}
      >
        {pending ? "Updating..." : archived ? "Restore product" : "Archive product"}
      </Button>
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
    </form>
  );
}
