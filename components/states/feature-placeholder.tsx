import { Card, CardDescription, CardHeader } from "../ui/card";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-lg">{title}</h2>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
