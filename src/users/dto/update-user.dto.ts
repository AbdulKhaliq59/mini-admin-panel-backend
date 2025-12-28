export class UpdateUserDto {
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive';
}
