"use client";
import { Navbar } from "./Navbar";
import {
  EmbeddedZupassProvider,
  useEmbeddedZupass
} from "../utils/hooks/useEmbeddedZupass";
import { FrogCrypto } from "./FrogCrypto";
export const ZUPASS_URL = process.env.ZUPASS_URL || "https://zupass.org";

const zapp = {
  name: "test-client",
  permissions: ["read", "write"]
};

function Main() {
  const { connected } = useEmbeddedZupass();
  return (
    <>
      <Navbar connecting={!connected} />
      <div className="container mx-auto my-4 p-4">
        <div className="flex flex-col gap-4 my-4">
          <FrogCrypto />
          {/* <FileSystem />
          <GPC /> */}
        </div>
      </div>
    </>
  );
}

export default function Wrapper() {
  const zupassUrl = localStorage.getItem("zupassUrl") || ZUPASS_URL;

  return (
    <EmbeddedZupassProvider zapp={zapp} zupassUrl={zupassUrl}>
      <Main />
    </EmbeddedZupassProvider>
  );
}