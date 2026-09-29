export const makeMemberService = ({ memberRepository, userRepository }) => {
  const getSettings = async () => {
    return memberRepository.getSettings();
  };

  const updateSettings = async (data) => {
    return memberRepository.updateSettings(data);
  };

  const listMembers = async (filters) => {
    return memberRepository.findAllMembers(filters);
  };

  const getMemberProgress = async (userId) => {
    const [user, settings, currentSpend] = await Promise.all([
      userRepository.findById(userId),
      memberRepository.getSettings(),
      memberRepository.getUserMonthlySpend(userId),
    ]);

    const { minMonthlyAmount, discountPercent, hasFreeShipping, freeShippingMinAmount, renewalPeriodDays } = settings;

    // Auto-grant membership if threshold crossed and not yet a member
    if (!user.isMember && currentSpend >= minMonthlyAmount) {
      const memberSince = new Date();
      const memberExpiry = new Date(memberSince);
      memberExpiry.setDate(memberExpiry.getDate() + renewalPeriodDays);
      await userRepository.updateMembership(userId, { isMember: true, memberSince, memberExpiry });
      user.isMember = true;
      user.memberSince = memberSince;
      user.memberExpiry = memberExpiry;
    }

    const progressPercent = Math.min(100, Math.round((currentSpend / minMonthlyAmount) * 100));
    const remaining = Math.max(0, minMonthlyAmount - currentSpend);

    let daysUntilExpiry = null;
    if (user.isMember && user.memberExpiry) {
      const diff = new Date(user.memberExpiry) - new Date();
      daysUntilExpiry = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      isMember: user.isMember,
      memberSince: user.memberSince,
      memberExpiry: user.memberExpiry,
      daysUntilExpiry,
      currentSpend,
      minMonthlyAmount,
      progressPercent,
      remaining,
      discountPercent,
      hasFreeShipping,
      freeShippingMinAmount,
      renewalPeriodDays,
    };
  };

  return { getSettings, updateSettings, listMembers, getMemberProgress };
};
