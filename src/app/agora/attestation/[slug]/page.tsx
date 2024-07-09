"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAttestation } from "@/lib/fetchers/attestations";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Page({ params }: { params: { slug: string } }) {
    // Fetch attestation data
    const { data, error, isLoading } = useQuery({
        queryKey: ["attestation", params.slug],
        queryFn: () => fetchAttestation(params.slug),
        placeholderData: null,
        // Ensure to set staleTime to 0 to prevent displaying placeholder data before actual data arrives
        staleTime: 0,
    });

    // Check isLoading first to display "Loading..." message
    if (isLoading) return <div>Loading...</div>;

    // Handle errors
    if (error) return <div>Error: {error.message}</div>;

    // Handle case where data is not yet loaded
    if (!data) return <div>Loading...</div>; // Alternatively, you can customize this message

    // Once data is loaded, display the attestation details
    return (
        <div className="flex items-center justify-center bg-gray-100 w-full min-h-screen p-4">
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: [20, -5, 0],
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.4, 0.0, 0.2, 1],
                }}
                className="bg-white bg-opacity-90 shadow-lg p-6 rounded-lg max-w-md w-full"
            >
                <TooltipProvider>
                    <Card className="bg-white w-full">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-semibold">Attestation Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 space-y-4">
                                {/* ID Field with Tooltip */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">ID:</span>
                                    <div className="truncate w-1/2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="text-link truncate">{data.id}</p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{data.id}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                {/* Attester Field with Tooltip */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Attester:</span>
                                    <div className="truncate w-1/2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link href={'/agora/address/' + data.attester} className="text-link block truncate">{data.attester}</Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{data.attester}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                {/* Time Field */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Time:</span>
                                    <span className="text-gray-700">{new Date(data.time * 1000).toLocaleString()}</span>
                                </div>
                                {/* Time Created Field */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Time Created:</span>
                                    <span className="text-gray-700">{new Date(data.timeCreated * 1000).toLocaleString()}</span>
                                </div>
                                {/* Recipient Field with Tooltip */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Recipient:</span>
                                    <div className="truncate w-1/2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link href={'/agora/address/' + data.recipient} className="text-link block truncate">{data.recipient}</Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{data.recipient}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                {/* Expiration Time Field */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Expiration Time:</span>
                                    <span className="text-gray-700">{data.expirationTime ? new Date(data.expirationTime * 1000).toLocaleString() : "N/A"}</span>
                                </div>
                                {/* Revocation Time Field */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Revocation Time:</span>
                                    <span className="text-gray-700">{data.revocationTime ? new Date(data.revocationTime * 1000).toLocaleString() : "N/A"}</span>
                                </div>
                                {/* Ref UID Field */}
                                {/* <div className="flex items-center justify-between">
                                    <span className="font-semibold">Ref UID:</span>
                                    <span className="text-gray-700 truncate">{data.refUID}</span>
                                </div> */}
                                {/* Revocable Field */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Revocable:</span>
                                    <span className="text-gray-700">{data.revocable ? "Yes" : "No"}</span>
                                </div>
                                {/* Revoked Field */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Revoked:</span>
                                    <span className="text-gray-700">{data.revoked ? "Yes" : "No"}</span>
                                </div>
                                {/* Schema ID Field with Tooltip */}
                                {/* <div className="flex items-center justify-between">
                                    <span className="font-semibold">Schema ID:</span>
                                    <div className="truncate w-1/2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="text-link truncate">{data.schemaId}</p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{data.schemaId}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div> */}
                            </div>
                        </CardContent>
                    </Card>
                </TooltipProvider>
            </motion.div>
        </div>
    );
}
