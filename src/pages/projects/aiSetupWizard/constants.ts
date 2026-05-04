import type { PicoCForm, ScopeForm } from "./types";

export const DEFAULT_TOPIC =
  "";

export const EMPTY_SCOPE: ScopeForm = {
  objectives: "",
  domain: "",
};

export const EMPTY_PICOC: PicoCForm = {
  population: "",
  intervention: "",
  comparator: "",
  outcome: "",
  context: "",
};
