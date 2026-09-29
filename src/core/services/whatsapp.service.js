export const makeWhatsappService = ({ memberRepository }) => {
  const getSettings = async () => {
    return memberRepository.getWhatsappSettings();
  };

  const updateSettings = async (data) => {
    return memberRepository.updateWhatsappSettings(data);
  };

  return { getSettings, updateSettings };
};
