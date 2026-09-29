export const makeMemberController = ({ memberService }) => {
  const getSettings = async (req, res, next) => {
    try {
      const settings = await memberService.getSettings();
      return res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  };

  const updateSettings = async (req, res, next) => {
    try {
      const settings = await memberService.updateSettings(req.body);
      return res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  };

  const listMembers = async (req, res, next) => {
    try {
      const result = await memberService.listMembers(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const getMemberProgress = async (req, res, next) => {
    try {
      const progress = await memberService.getMemberProgress(req.user.id);
      return res.status(200).json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  };

  return { getSettings, updateSettings, listMembers, getMemberProgress };
};
