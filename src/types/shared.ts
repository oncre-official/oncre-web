/** Mirrors oncre-backend `State` model (src/app/shared/model/state.model.ts). */
export interface StateRecord {
  _id: string;
  name: string;
  alias: string;
}

/** Mirrors oncre-backend `Lga` model (src/app/shared/model/local-govt.model.ts) — `state` is populated (name + alias only). */
export interface LgaRecord {
  _id: string;
  name: string;
  stateId: string;
  state?: { name: string; alias: string };
}
