/**
 * components/ui — flat barrel for the base primitive set.
 *
 * Use:
 *
 *   import { Button, Card, CardBody } from "@/components/ui";
 *
 * The primitives here are deliberately small. Anything composed
 * (NavBar, CefStepShell, AdieMessage) lives one level up under
 * `components/<surface>/`.
 */

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Card, CardHeader, CardTitle, CardBody, CardFooter } from "./Card";

export { TextField } from "./TextField";
export type { TextFieldProps } from "./TextField";

export { TextArea } from "./TextArea";
export type { TextAreaProps } from "./TextArea";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export { Skeleton, SkeletonLines } from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";

export { PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";

export { Badge } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";

export { RouteProgress } from "./RouteProgress";

export { AppHeader, UserMenu } from "./AppHeader";
export type {
  AppHeaderProps,
  AppHeaderUser,
  AppHeaderNavItem,
} from "./AppHeader";
