import { Address } from "../entities/Address";

export function checkOwnership(address: Address, userId: number): boolean {
  return address.user?.id === userId;
}
