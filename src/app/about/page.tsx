"use client";
import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";

const FeaturesSection = () => {
    const features = [
        {
            title: "Why vouching?",
            description:
                "Agora Pass enables community members to vouch for each other and increase their trust score within the Zuzalu community. By vouching for new members, you are inviting them to become part of the ecosystem. Once you get over a certain trust score you will be able to get an Agora Pass Zupass enabled. This pass will grant you access to the Agora.City forum and other perks.",
            skeleton: <SkeletonOne />,
            className: "col-span-1 lg:col-span-6 border-b",
        },
        {
            title: "Let's build a Web of Trust",
            description:
                "Engage with other members of the Zuzalu community and build meaningful connections",
            skeleton: <SkeletonFour />,
            className: "col-span-1 lg:col-span-6",
        },
    ];
    return (
        <div className="relative z-20 pb-10 max-w-7xl mx-auto">
            <div className="p-8">
                <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-bold text-black">
                    About Agora Pass
                </h4>

                <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal">
                    Join the solution to decentralize invitations into Agora.City
                </p>
            </div>

            <div className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 mt-12 xl:border rounded-md">
                    {features.map((feature) => (
                        <FeatureCard key={feature.title} className={feature.className}>
                            <FeatureTitle>{feature.title}</FeatureTitle>
                            <FeatureDescription>{feature.description}</FeatureDescription>
                            <div className="h-full w-full">{feature.skeleton}</div>
                        </FeatureCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

const FeatureCard = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
            {children}
        </div>
    );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
    return (
        <p className="max-w-5xl mx-auto text-left tracking-tight text-black text-xl md:text-2xl md:leading-snug font-semibold">
            {children}
        </p>
    );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
    return (
        <p
            className={cn(
                "text-sm md:text-base max-w-4xl text-left mx-auto",
                "text-neutral-500 font-normal",
                "text-left max-w-sm mx-0 md:text-sm my-2"
            )}
        >
            {children}
        </p>
    );
};

const SkeletonOne = () => {
    return (
        <div className="relative flex py-8 px-2 gap-10 h-full">
            <div className="w-full p-5 mx-auto bg-white shadow-2xl group h-full">
                <div className="flex flex-1 w-full h-full flex-col space-y-2">
                    <Image
                        src="/feature-1.webp"
                        alt="header"
                        width={800}
                        height={800}
                        className="h-full w-full aspect-square object-cover object-left-top rounded-sm"
                    />
                </div>
            </div>

            <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white via-white to-transparent w-full pointer-events-none" />
            <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white via-transparent to-transparent w-full pointer-events-none" />
        </div>
    );
};

const SkeletonFour = () => {
    return (
        <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent mt-10">
            <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
        </div>
    );
};

const Globe = ({ className }: { className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 1],
            glowColor: [1, 1, 1],
            markers: [
                // longitude latitude
                { location: [42.4247, 18.7712], size: 0.1 }, //Kotor, montenegro
                { location: [41.0082, 28.9784], size: 0.1 }, //Istanbul, Turkey
                { location: [16.3727, -86.4617], size: 0.1 }, //Pristine Bay, Bay Islands, Honduras
                { location: [32.1574, -82.9071], size: 0.1 }, //Georgia
                { location: [38.6104, -122.8691], size: 0.1 }, //Healdsburg, California
                { location: [18.7883, 98.9853], size: 0.1 }, //Chiang Mai, Thailand (glowing)
                { location: [-34.6037, -58.3816], size: 0.1 }, //Buenos Aires, Argentina
                { location: [52.5200, 13.4050], size: 0.1 }, //Berlin, Germany
                { location: [38.7223, -9.1393], size: 0.1 }, //Lisbon, Portugal
            ],
            onRender: (state: any) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.01;
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
            className={className}
        />
    );
};

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <main>
                <FeaturesSection />
            </main>
        </div>
    );
};

export default AboutPage;