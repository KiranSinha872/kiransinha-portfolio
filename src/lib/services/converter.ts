import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter,
  WithFieldValue,
} from 'firebase/firestore';

export function createConverter<T extends { id?: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: WithFieldValue<T>): DocumentData {
      // Strip client-side ID before saving to Firestore document body
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = modelObject as any;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions
    ): T {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ...data,
      } as unknown as T;
    },
  };
}
