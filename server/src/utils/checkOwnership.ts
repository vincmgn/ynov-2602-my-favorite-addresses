import { Response } from "express";
import { Address } from "../entities/Address";

export function checkOwnership(address: Address, userId: number): boolean {
  return address.user?.id === userId;
}

/**
 * Finds an address by id (loading the user relation) and checks ownership.
 * Returns the address if everything is fine, or sends the appropriate error response.
 */
export async function findAddressAndCheckOwnership(id: number, userId: number, res: Response): Promise<Address | null> {
  const address = await Address.findOne({ where: { id }, relations: ["user"] });

  if (!address) {
    res.status(404).json({ message: "address not found" });
    return null;
  }

  if (!checkOwnership(address, userId)) {
    res.status(403).json({ message: "forbidden" });
    return null;
  }

  return address;
}
