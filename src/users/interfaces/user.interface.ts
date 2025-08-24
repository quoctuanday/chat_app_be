export interface IUser {
  id: string;
  email: string;
  username: string;
  password: string;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
