import { CircuitBoard, Box, Workflow, Wrench, type LucideProps } from "lucide-react";
const icons = { CircuitBoard, Box, Workflow, Wrench };
export function ServiceIcon({ name, ...props }: LucideProps & { name: string }) {
  const Icon = icons[name as keyof typeof icons] || CircuitBoard;
  return <Icon aria-hidden="true" {...props} />;
}
