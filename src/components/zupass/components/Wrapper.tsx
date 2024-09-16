"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from "./Navbar";
import { EmbeddedZupassProvider, useEmbeddedZupass } from "../utils/hooks/useEmbeddedZupass";
import { FrogCrypto } from "./FrogCrypto";

export const ZUPASS_URL = process.env.NEXT_PUBLIC_ZUPASS_URL || "https://zupass.org";

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

function Wrapper() {
  const [zupassUrl, setZupassUrl] = useState(ZUPASS_URL);

  useEffect(() => {
    const storedUrl = localStorage.getItem("zupassUrl");
    if (storedUrl) {
      setZupassUrl(storedUrl);
    }
  }, []);

  return (
    <EmbeddedZupassProvider zapp={zapp} zupassUrl={zupassUrl}>
      <Main />
    </EmbeddedZupassProvider>
  );
}

export default dynamic(() => Promise.resolve(Wrapper), { ssr: false });