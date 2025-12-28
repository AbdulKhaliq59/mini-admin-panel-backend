export class CreateUserDto {
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
}
