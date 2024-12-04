export interface IUser {
  id: number;
  email: string;
  role: number;
  permissions: [
    {
      id: number;
      name: string;
      method: string;
      path: string;
    },
  ];
}
