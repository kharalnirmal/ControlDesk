"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createCategoryAction,
  type CategoryActionState,
} from "@/features/categories/category.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CategoryActionState = {
  status: "idle",
  message: "",
  errors: {},
};

export function CategoryCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  const nameError = state.errors.name?.[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Category name</Label>

        <Input
          id="category-name"
          name="name"
          placeholder="e.g. Electronics"
          maxLength={80}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "category-name-error" : undefined}
        />

        {nameError && (
          <p id="category-name-error" className="text-destructive text-sm">
            {nameError}
          </p>
        )}
      </div>

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

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create category"}
      </Button>
    </form>
  );
}
