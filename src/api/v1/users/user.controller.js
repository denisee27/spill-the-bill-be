export const makeUserController = ({ userService }) => {
  const listUsers = async (req, res, next) => {
    try {
      const result = await userService.listUsers(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const getUserDetail = async (req, res, next) => {
    try {
      const user = await userService.getUserDetail(req.params.id);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  const updateRole = async (req, res, next) => {
    try {
      const user = await userService.updateRole(req.params.id, req.body.role);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  return { listUsers, getUserDetail, updateRole };
};
