export const makeWhatsappController = ({ whatsappService }) => {
  const getSettings = async (req, res, next) => {
    try {
      const settings = await whatsappService.getSettings();
      return res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  };

  const updateSettings = async (req, res, next) => {
    try {
      const settings = await whatsappService.updateSettings(req.body);
      return res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  };

  return { getSettings, updateSettings };
};
