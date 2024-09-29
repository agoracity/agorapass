import { ReactNode, StrictMode } from "react";
import { getConnectionInfo } from "../../../hooks/zupass/utils";
import { useParcnetClient, ParcnetClientProvider } from "../../../hooks/zupass/useParcnetClient";
import { PODSection } from "./POD";

const zapp = {
  name: "stamp",
  permissions: ["read", "write"]
};

function Main({ wallet, token }: { wallet: string; token: string }): ReactNode {
  const { connected } = useParcnetClient();
  return (
    <>
        <PODSection wallet={wallet} token={token} />
    </>
  );
}

export default function Wrapper({ wallet, token }: { wallet: string; token: string }): ReactNode {
  return (
    <StrictMode>
      <ParcnetClientProvider zapp={zapp} connectionInfo={getConnectionInfo()}>
        <Main wallet={wallet} token={token} />
      </ParcnetClientProvider>
    </StrictMode>
  );
}
