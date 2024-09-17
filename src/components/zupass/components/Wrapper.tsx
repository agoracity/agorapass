"use client";

import dynamic from 'next/dynamic';
import { EmbeddedZupassProvider } from "../utils/hooks/useEmbeddedZupass";
import { Zupass } from "@/config/siteConfig";
import { PODCrypto } from './POD';

const zapp = {
  name: "test-client",
  permissions: ["read", "write"]
};

function Main() {
  return (
    <>
      <div className="container mx-auto my-4 p-4">
        <div className="flex flex-col gap-4 my-4">
          <PODCrypto />
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