const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const makeMemberService = ({ memberRepository, userRepository }) => {
  const getSettings = async () => memberRepository.getSettings();

  const updateSettings = async (data) => memberRepository.updateSettings(data);

  const listMembers = async (filters) => memberRepository.findAllMembers(filters);

  const getMemberProgress = async (userId) => {
    const [user, settings] = await Promise.all([
      userRepository.findById(userId),
      memberRepository.getSettings(),
    ]);

    const { minMonthlyAmount, hasFreeShipping, renewalPeriodDays } = settings;
    const now = new Date();

    // ── Active member ──────────────────────────────────────────────
    if (user.isMember) {
      const periodStart = user.memberSince ?? user.createdAt;
      const currentSpend = await memberRepository.getUserPeriodSpend(userId, periodStart);

      const progressPercent = Math.min(100, Math.round((currentSpend / minMonthlyAmount) * 100));
      const remaining = Math.max(0, minMonthlyAmount - currentSpend);

      let daysUntilExpiry = null;
      if (user.memberExpiry) {
        daysUntilExpiry = Math.max(0, Math.ceil((new Date(user.memberExpiry) - now) / 86400000));
      }

      return {
        isMember: true,
        memberSince: user.memberSince,
        memberExpiry: user.memberExpiry,
        daysUntilExpiry,
        currentSpend,
        minMonthlyAmount,
        hasFreeShipping,
        activeFreeShipping: hasFreeShipping,
        renewalPeriodDays,
        progressPercent,
        remaining,
        daysLeftInWindow: daysUntilExpiry,
        windowEnd: user.memberExpiry,
      };
    }

    // ── Non-member: 180-day qualifying window ──────────────────────
    let periodStart = user.memberPeriodStart ?? user.createdAt;
    const windowEnd = addDays(periodStart, renewalPeriodDays);

    // Window expired — reset to now, spending starts fresh
    if (now > windowEnd) {
      periodStart = now;
      await userRepository.updateMembership(userId, { memberPeriodStart: now });
    }

    const currentSpend = await memberRepository.getUserPeriodSpend(userId, periodStart);

    // Threshold reached — grant membership
    if (currentSpend >= minMonthlyAmount) {
      const memberSince = now;
      const memberExpiry = addDays(now, renewalPeriodDays);
      await userRepository.updateMembership(userId, {
        isMember: true,
        memberSince,
        memberExpiry,
        memberPeriodStart: null,
      });
      return {
        isMember: true,
        memberSince,
        memberExpiry,
        daysUntilExpiry: renewalPeriodDays,
        currentSpend,
        minMonthlyAmount,
        hasFreeShipping,
        activeFreeShipping: hasFreeShipping,
        renewalPeriodDays,
        progressPercent: 100,
        remaining: 0,
        daysLeftInWindow: renewalPeriodDays,
        windowEnd: memberExpiry,
      };
    }

    const progressPercent = Math.min(100, Math.round((currentSpend / minMonthlyAmount) * 100));
    const remaining = Math.max(0, minMonthlyAmount - currentSpend);
    const daysLeftInWindow = Math.max(0, Math.ceil((windowEnd - now) / 86400000));

    return {
      isMember: false,
      memberSince: null,
      memberExpiry: null,
      daysUntilExpiry: null,
      currentSpend,
      minMonthlyAmount,
      hasFreeShipping,
      activeFreeShipping: false,
      renewalPeriodDays,
      progressPercent,
      remaining,
      daysLeftInWindow,
      windowEnd,
    };
  };

  return { getSettings, updateSettings, listMembers, getMemberProgress };
};
