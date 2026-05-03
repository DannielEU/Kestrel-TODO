import { registerEnumType } from '@nestjs/graphql';

export enum WorkState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

registerEnumType(WorkState, {
  name: 'WorkState',
});