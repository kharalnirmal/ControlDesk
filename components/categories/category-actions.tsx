"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteCategoryAction,
  renameCategoryAction,
  type CategoryActionState,
} from "@/features/categories/category.action";

const initialState: CategoryActionState = {
  status: "idle",
  message: "",
  errors: {},
};

export function CategoryActions({
  id,
  name,
  productCount,
}: {
  id: string;
  name: string;
  productCount: number;
}) {
  const [renameState, renameAction, renaming] = useActionState(
    renameCategoryAction.bind(null, id),
    initialState,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCategoryAction.bind(null, id),
    initialState,
  );
  const state = deleteState.status !== "idle" ? deleteState : renameState;

  return (
    <div className="min-w-64 space-y-2">
      <form action={renameAction} className="flex items-center justify-end gap-2">
        <label htmlFor={`category-${id}`} className="sr-only">
          Rename {name}
        </label>
        <Input
          id={`category-${id}`}
          name="name"
          defaultValue={name}
          minLength={2}
          maxLength={80}
          className="max-w-48"
          aria-invalid={Boolean(renameState.errors.name?.length)}
        />
        <Button type="submit" variant="outline" disabled={renaming}>
          {renaming ? "Saving..." : "Rename"}
        </Button>
      </form>
      <form
        action={deleteAction}
        className="flex items-center justify-end gap-2"
        onSubmit={(event) => {
          if (!window.confirm(`Delete the “${name}” category?`)) {
            event.preventDefault();
          }
        }}
      >
        <Button
          type="submit"
          variant="destructive"
          disabled={deleting || productCount > 0}
          title={
            productCount > 0
              ? "Categories containing products cannot be deleted"
              : undefined
          }
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </form>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-right text-xs text-destructive"
              : "text-right text-xs text-emerald-600"
          }
        >
          {state.errors.name?.[0] ?? state.message}
        </p>
      )}
    </div>
  );
}
