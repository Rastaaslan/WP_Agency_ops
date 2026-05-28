import { z } from "zod";
import { optionalText } from "@/server/validators/helpers";

export const manualScanSchema = z.object({
  wpVersion: optionalText(40),
  phpVersion: optionalText(40),
  pluginsText: optionalText(8000),
  themesText: optionalText(4000),
  notes: optionalText(4000),
});
