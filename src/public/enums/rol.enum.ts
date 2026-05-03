import { registerEnumType } from '@nestjs/graphql';
export enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
}

registerEnumType(Role, {
  name: 'Role',
});