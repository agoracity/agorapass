"use client";

import dynamic from 'next/dynamic';
import { EmbeddedZupassProvider } from "../utils/hooks/useEmbeddedZupass";
import { Zupass } from "@/config/siteConfig";
import { PODCrypto } from './POD';

const zapp = {
  name: "test-client",
  permissions: ["read", "write"]
};

interface MainProps {
  wallet: string;
}

function Main({ wallet }: MainProps) {
  return (
    <>
      <PODCrypto wallet={wallet} />
    </>
  );
}

interface WrapperProps {
  wallet: string;
}

function Wrapper({ wallet }: WrapperProps) {
  return (
    <EmbeddedZupassProvider zapp={zapp} zupassUrl={Zupass.url}>
      <Main wallet={wallet} />
    </EmbeddedZupassProvider>
  );
}

export default dynamic(() => Promise.resolve(Wrapper), { ssr: false });