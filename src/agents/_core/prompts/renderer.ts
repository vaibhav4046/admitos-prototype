/**
 * Prompt renderer — applies template variables to a loaded PromptVersion.
 *
 * Templates use `{{var_name}}` syntax. We deliberately do NOT support
 * JavaScript expressions in templates — no Handlebars helpers, no
 * conditionals, no loops. If a prompt needs logic, the logic belongs in
 * code that prepares the variables, not in the prompt file.
 *
 * Validation rules enforced at render time:
 *
 *   1. Every `{{var}}` in the template MUST be present in the variables
 *      map. Missing vars throw — we never silently render "{{name}}"
 *      into a user-facing output.
 *
 *   2. Variables in the map that are NOT referenced by the template are
 *      allowed but logged in dev. This catches the case where a caller
 *      passes stale variables after a prompt was pruned.
 *
 *   3. `null` / `undefined` values are treated as missing. Use empty
 *      string explicitly if you mean "no value".
 *
 *   4. All values are coerced to string via `String(value)`. Objects
 *      should be JSON-stringified BEFORE being passed in — we don't
 *      serialize for you, because the choice of pretty-print vs. compact
 *      affects token count.
 */

import type { PromptVersion } from "./types";

export interface RenderedPrompt {
  system: string;
  user: string;
  /** Echoed back so callers don't have to re-thread ids through the stack. */
  promptId: string;
  promptSlot: string;
  promptVersion: number;
  model: string;
}

const VAR_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

function extractVars(template: string): Set<string> {
  const out = new Set<string>();
  for (const m of template.matchAll(VAR_PATTERN)) {
    const name = m[1];
    if (name) out.add(name);
  }
  return out;
}

function fill(
  template: string,
  vars: Record<string, unknown>,
  context: string
): string {
  return template.replace(VAR_PATTERN, (_match, rawName: string) => {
    const name = rawName.trim();
    const value = vars[name];
    if (value === undefined || value === null) {
      throw new Error(
        `prompt_render_missing_var: variable "${name}" required by ${context} was not provided`
      );
    }
    return String(value);
  });
}

export function renderPrompt(
  prompt: PromptVersion,
  vars: Record<string, unknown> = {}
): RenderedPrompt {
  const systemVars = extractVars(prompt.system);
  const userVars = extractVars(prompt.user_template);

  // Dev-only: warn on unused vars. In prod we stay silent to avoid
  // noise in the logs for callers that share a variable bag across
  // several slots.
  if (process.env.NODE_ENV !== "production") {
    const used = new Set([...systemVars, ...userVars]);
    for (const k of Object.keys(vars)) {
      if (!used.has(k)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[prompt_renderer] unused variable "${k}" for slot="${prompt.slot}" v${prompt.version}`
        );
      }
    }
  }

  const system = fill(
    prompt.system,
    vars,
    `system template of ${prompt.slot} v${prompt.version}`
  );
  const user = fill(
    prompt.user_template,
    vars,
    `user template of ${prompt.slot} v${prompt.version}`
  );

  return {
    system,
    user,
    promptId: prompt.id,
    promptSlot: prompt.slot,
    promptVersion: prompt.version,
    model: prompt.model,
  };
}
