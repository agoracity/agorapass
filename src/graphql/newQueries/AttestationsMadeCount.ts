
const COUNT_ATTESTATIONS_MADE = `
  query CountAttestationsMade($where: AttestationWhereInput) {
    aggregateAttestation(where: $where) {
      _count {
        attester
      }
    }
  }
`;

export default COUNT_ATTESTATIONS_MADE