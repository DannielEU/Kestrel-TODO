import { registerEnumType } from '@nestjs/graphql';
export enum Action {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    COMPLETE = 'COMPLETE',
    INCOMPLETE = 'INCOMPLETE',
}

registerEnumType(Action, {
  name: 'Action',
});
