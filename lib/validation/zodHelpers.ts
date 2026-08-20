import {z} from "zod";


/** Flattens a ZodError into a simple { field: message } map for form display. */
export function fieldErrorsFrom(error: z.ZodError<any>) {
  const flat = z.treeifyError(error) as Record<string, string[] | undefined>;
  const out: Record<string, string> = {};
  for (const key in flat) {
    const msgs = flat[key];
    if (msgs && msgs.length > 0) out[key] = msgs[0];
  }
  return out;
}