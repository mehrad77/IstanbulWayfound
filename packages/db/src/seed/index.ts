import { cafeLale } from "./cafe-lale.ts";
import { defneDental } from "./defne-dental.ts";
import { selviShowroom } from "./selvi-showroom.ts";

export { bundleFromSeed } from "./bundle.ts";
export { agencyUser, templateSeeds } from "./templates.ts";
export type * from "./types.ts";

export const businessSeeds = [cafeLale, selviShowroom, defneDental];

export const DEMO_ACCOUNTS = [
  { account: "cafe-owner", label: "Café Lale (owner)", role: "owner" },
  { account: "showroom-owner", label: "Selvi Textile Showroom (owner)", role: "owner" },
  { account: "clinic-owner", label: "Defne Dental Clinic (owner)", role: "owner" },
  { account: "agency", label: "Wayfound agency team", role: "agency" },
] as const;
