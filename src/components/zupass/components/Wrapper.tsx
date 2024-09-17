"use client";

import dynamic from 'next/dynamic';
import { EmbeddedZupassProvider } from "../utils/hooks/useEmbeddedZupass";
import { FrogCrypto } from "./FrogCrypto";
import { Zupass } from "@/config/siteConfig";

const zapp = {
  name: "test-client",
  permissions: ["read", "write"]
};

function Main() {
  return (
    <>
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

function Wrapper() {
  return (
    <EmbeddedZupassProvider zapp={zapp} zupassUrl={Zupass.url}>
      <Main />
    </EmbeddedZupassProvider>
  );
}

export default dynamic(() => Promise.resolve(Wrapper), { ssr: false });