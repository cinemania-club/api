export function addMongoId<T, U>(data: U, id: T) {
  return {
    ...data,
    _id: id,
  };
}
