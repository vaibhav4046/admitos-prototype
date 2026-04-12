/**
 * components/admissions — surface-specific composites for the admissions
 * route group only. Anything in this folder is hard-banned from
 * `app/(wellbeing)/`. Primitives that are safe for both surfaces live in
 * `components/ui/`; wellbeing-specific chrome lives in `components/adie/`.
 */

export { AdmissionsHeader } from "./AdmissionsHeader";
export type {
  AdmissionsHeaderProps,
  AdmissionsHeaderUserInput,
} from "./AdmissionsHeader";
