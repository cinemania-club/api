import { isEmpty } from "lodash";
import { Types } from "mongoose";

export type Oid = Types.ObjectId;

export function $oid(id: string) {
  return new Types.ObjectId(id);
}

export function $eq(doc1: Oid | string, doc2: Oid | string) {
  return doc1.toString() === doc2.toString();
}

export function $criteria<T>(criteria: T, apply: boolean) {
  return apply ? criteria : {};
}

export function $and<T>(criterias?: T[]) {
  const nonEmptyCriterias = nonEmpty(criterias);
  return nonEmptyCriterias ? { $and: nonEmptyCriterias } : {};
}

export function $or<T>(criterias?: T[]) {
  const nonEmptyCriterias = nonEmpty(criterias);
  return nonEmptyCriterias ? { $or: nonEmptyCriterias } : {};
}

function nonEmpty<T>(criterias?: T[]) {
  const nonEmptyCriterias = criterias?.filter((criteria) => !isEmpty(criteria));
  if (!nonEmptyCriterias?.length) return;

  return nonEmptyCriterias;
}
