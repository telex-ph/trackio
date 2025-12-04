import { getIRReadFlags } from "../utils/irReadFlags";

export const updateIR = async (req, res) => {
  const { status, ...rest } = req.body;

  // Assign correct isRead flags based on status
  const readFlags = getIRReadFlags(status);

  const updated = await IR.findByIdAndUpdate(
    req.params.id,
    {
      status,
      ...rest,
      ...readFlags,
    },
    { new: true }
  );

  res.json(updated);
};
