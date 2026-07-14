import BaseApiService from "./BaseApiService";

const _getContractUsesHistory = (userId) => {
  return BaseApiService.get(
    "/api/v1/contract-uses-history",
    {
      user_id: userId,
    },
    null,
  );
};

export const ContractUsesApiService = {
  getContractUsesHistory: _getContractUsesHistory,
};