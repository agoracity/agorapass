import { gql } from "@apollo/client";

const FIND_FIRST_ENS_NAME = gql`
  query findFirstEnsName($where: EnsNameWhereInput!) {
    findFirstEnsName(where: $where) {
      name
    }
  }
`;

export default FIND_FIRST_ENS_NAME;
