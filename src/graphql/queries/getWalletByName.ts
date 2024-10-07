export const FIND_FIRST_ENS_NAME = `
  query FindFirstEnsName($where: EnsNameWhereInput) {
    findFirstEnsName(where: $where) {
      id
      name
    }
  }
`;

export type FindFirstEnsNameVariables = {
  where: {
    name: {
      contains: string;
    };
  };
};