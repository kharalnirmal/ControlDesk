import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  <div role="status" aria-label="Loading Dashboard">
    <Skeleton className="mb-6 w-48 h-8" />
    <Skeleton className="w-full h-40" />
    <span className="sr-only">Loading dashboard content...</span>
  </div>;
}
