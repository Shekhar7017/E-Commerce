import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { updateAddress, deleteAddress } from "@/lib/services/user.service";
import { addressSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const user = await requireUser();
    const { addressId } = await params;
    const body = await request.json();
    const input = addressSchema.partial().parse(body);
    const addresses = await updateAddress(user.id, addressId, input);
    return apiSuccess(addresses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const user = await requireUser();
    const { addressId } = await params;
    const addresses = await deleteAddress(user.id, addressId);
    return apiSuccess(addresses);
  } catch (error) {
    return handleApiError(error);
  }
}
