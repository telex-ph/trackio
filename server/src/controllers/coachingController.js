import { getCoachingReadFlags } from "../utils/coachingReadFlags";

export const updateCoaching = async (req, res) => {
  const { status, ...rest } = req.body;

  const readFlags = getCoachingReadFlags(status);

  const updated = await Coaching.findByIdAndUpdate(
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
