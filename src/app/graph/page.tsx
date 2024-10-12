"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
// Dynamically import ForceGraph3D with ssr option set to false
const ForceGraph3D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph3D), {
    ssr: false,
    loading: () => <p>Loading 3D Graph...</p>
});
import { useAttestationDetails } from '@/utils/hooks/useAttestationGraph';

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

interface Attestation {
    attester: string;
    recipient: string;
}

interface Node {
    id: string;
    score: number;
}

interface Link {
    source: string;
    target: string;
}

interface Coords {
    x: number;
    y: number;
    z: number;
}

const RankingsGraph: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const router = useRouter();

    // Fetch attestations data using the useAttestationDetails hook
    const { attestations, isLoading, error: isError } = useAttestationDetails(500, 1);

    const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] } | null>(null);

    const updateDimensions = () => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            setDimensions({
                width: clientWidth,
                height: clientHeight,
            });
        }
    };

    // Use useLayoutEffect to measure the container size before the browser paints
    useLayoutEffect(() => {
        updateDimensions();
    }, []);

    // Use useEffect for setting up the resize listener
    useEffect(() => {
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Update dimensions when graphData changes
    useEffect(() => {
        if (graphData) {
            updateDimensions();
        }
    }, [graphData]);

    useEffect(() => {
        if (isLoading || isError || !attestations) return;

        const nodes: Node[] = [];
        const links: Link[] = [];
        const nodeMap = new Map<string, Node>();

        attestations.forEach((attestation: Attestation) => {
            if (!nodeMap.has(attestation.attester)) {
                nodeMap.set(attestation.attester, { id: attestation.attester, score: 0 });
            }
            if (!nodeMap.has(attestation.recipient)) {
                nodeMap.set(attestation.recipient, { id: attestation.recipient, score: 0 });
            }
            nodeMap.get(attestation.attester)!.score += 1;
            nodeMap.get(attestation.recipient)!.score += 1;
            links.push({
                source: attestation.attester,
                target: attestation.recipient
            });
        });

        // Convert Map.values() to an array
        nodes.push(...Array.from(nodeMap.values()));

        setGraphData({ nodes, links });
    }, [attestations, isLoading, isError]);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading data...</p>;
    if (!graphData) return null;

    const nodeColorScale = d3.scaleOrdinal(d3.schemeRdYlGn[4]);

    // Calculate reduced dimensions to prevent overflow
    const graphWidth = Math.floor(dimensions.width * 0.95); // 95% of container width
    const graphHeight = Math.floor(dimensions.height * 0.95); // 95% of container height

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} className='flex items-center justify-center'>
            {graphData && dimensions.width > 0 && dimensions.height > 0 && (
                <ForceGraph3D
                    graphData={graphData}
                    nodeAutoColorBy="id"
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    onNodeClick={(node: any) => {
                        router.push(`/address/${node.id}`);
                    }}
                    width={graphWidth}
                    height={graphHeight}
                    d3AlphaDecay={0.01}
                    d3VelocityDecay={0.1}
                    backgroundColor="#003f5c"
                    linkColor={() => '#54F7C5'}
                    nodeColor={(node) => nodeColorScale(String(node.id))}
                    nodeVal={(node) => node.score}
                    nodeLabel={(node) => `
                        <div style="
                            background-color: rgba(0,0,0,0.8);
                            color: white;
                            border-radius: 20px;
                            font-weight: bold;
                            padding: 5px;
                        ">
                            ${node.id} 
                            </br>
                            (Score: ${node.score})
                        </div>
                    `}
                />
            )}
        </div>
    );
};

const RankingsPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center bg-gray-100 w-full h-full">
            <RankingsGraph />
        </div>
    );
};

export default RankingsPage;
