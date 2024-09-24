export const FIND_FIRST_ENS_NAME_BY_WALLET = `
  query FindFirstEnsNameByWallet($where: EnsNameWhereInput) {
    findFirstEnsName(where: $where) {
      id
      name
    }
  }
`;

export type FindFirstEnsNameVariables = {
  where: {
    id: {
      contains: string;
    };
  };
};