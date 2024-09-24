
const COUNT_ATTESTATIONS_RECEIVED = `
  query CountAttestationsReceived($where: AttestationWhereInput) {
    aggregateAttestation(where: $where) {
      _count {
        recipient
      }
    }
  }
`;

export default COUNT_ATTESTATIONS_RECEIVED