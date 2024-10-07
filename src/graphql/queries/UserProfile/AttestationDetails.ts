const ATTESTATION_DETAILS = `
  query AttestationDetails($where: AttestationWhereInput, $take: Int, $skip: Int) {
    attestations(where: $where, take: $take, skip: $skip) {
      id
      attester
      recipient
      decodedDataJson
      timeCreated
    }
  }
`;

export default ATTESTATION_DETAILS;