"use client";
import { useZupass } from "@/components/zupass/zupass";
import { useZupassPopupMessages } from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { showTempSuccessAlert, showErrorAlert, showSuccessAlert, showTempErrorAlert } from "@/utils/alertUtils";
import ShinyButton from "@/components/ui/ShinyButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { handleVouch } from "@/utils/zupass/handleAttestation";

import { checkSemaphoreAttestation } from '@/utils/checkSemaphoreAttestation';

export default function ZupassButton() {
	const [loading, setLoading] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [ticketsToSign, setTicketsToSign] = useState<any[]>([]);
	const { login } = useZupass();
	const [multiPCDs] = useZupassPopupMessages();

	useEffect(() => {
		if (multiPCDs) {
			console.log("🚀 ~ multiPCDs:", multiPCDs);
		}
	}, [multiPCDs]);

	useEffect(() => {
		if (ticketsToSign.length > 0) {
			setDialogOpen(true);
		}
	}, [ticketsToSign]);

	const { getAccessToken, user } = usePrivy();
	const { wallets } = useWallets();

	const loginHandler = async () => {
		setLoading(true);
		try {
			const token = await getAccessToken();
			await login(user, wallets, token, setTicketsToSign);
		} catch (error) {
			console.error("Error during login:", error);
			showErrorAlert("Failed to connect Zupass. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleSign = async (index: number) => {
		const ticket = ticketsToSign[index];
		if (ticket.signed) return;
		try {
			if (!user || !user.wallet) {
				throw new Error('User or user wallet not found');
			}
			const wallet = wallets.find(w => w.walletClientType === user.wallet?.walletClientType);
			if (!wallet) {
				throw new Error('Desired wallet not found');
			}
			const address = wallet.address;

			const attestationCheck = await checkSemaphoreAttestation(
				ticket.external_id, 
				ticket.ticketType, 
				address,
				ticket.email 
			);
			
			if (attestationCheck.exists) {
				if (attestationCheck.isSameWallet) {
					await showTempSuccessAlert(`Ticket ${ticket.ticketType} is already connected to your account.`);
					setTicketsToSign(prev => prev.map((t, i) => i === index ? { ...t, signed: true } : t));
					return;
				} else {
					showTempErrorAlert(`Ticket ${ticket.ticketType} is already connected to another account.`);
					return;
				}
			}

			console.log('ticket', ticket);
			const results = await handleVouch(user, wallets, await getAccessToken(), {
				add_groups: [ticket], // Wrap the single ticket in an array
				external_id: ticket.external_id
			});

			if (results && results.length > 0) {
				const result = results[0]; // We're only processing one ticket at a time here

				if (result.alreadyConnected) {
					await showTempSuccessAlert(`Ticket ${ticket.ticketType} is already connected to an account.`);
				} else if (result.error) {
					showTempErrorAlert(`Failed to process ticket: ${ticket.ticketType}`);
				} else {
					await showTempSuccessAlert(`Ticket ${ticket.ticketType} signed successfully!`);
				}

				setTicketsToSign(prev => prev.map((t, i) => i === index ? { ...t, signed: true } : t));

				// Check if all tickets are signed
				const allSigned = ticketsToSign.every(t => t.signed);
				if (allSigned) {
					showSuccessAlert('All Zupass tickets processed successfully.', 'Go to profile', `/me`);
					setDialogOpen(false);
				}
			} else {
				showErrorAlert('No results returned from handleVouch');
			}
		} catch (error) {
			console.error('Error processing ticket:', error);
			showTempErrorAlert(`Failed to process ticket: ${ticket.ticketType}`); // Changed to temp error alert
		}
	};

	if (loading) {
		return <p>loading...</p>;
	}

	return (
		<>
			<ShinyButton onClick={loginHandler} className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma]">
				Connect Zupass
			</ShinyButton>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="bg-[#19473f] text-[#f0b90b]" onInteractOutside={(e) => {
					e.preventDefault();
				}}>
					<DialogHeader>
						<DialogTitle className="text-[#f0b90b] font-semibold">Sign Your Zupass Tickets</DialogTitle>
						<DialogDescription className="text-[#f0b90b] opacity-80">
							Choose which tickets you'd like to sign and connect to your account.
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4">
						{ticketsToSign.map((ticket, index) => (
							<div key={index} className="flex justify-between items-center">
								<span className="text-[#f0b90b]">{ticket.ticketType}</span>
								<ShinyButton
									onClick={() => handleSign(index)}
									disabled={ticket.signed}
									className={`font-semibold font-[Tahoma] ${ticket.signed ? "bg-green-500 hover:bg-green-600 text-[#19473f]" : "bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f]"}`}
								>
									{ticket.signed ? "Signed!" : "Sign"}
								</ShinyButton>
							</div>
						))}
					</div>
					<DialogFooter>
						<Button
							onClick={() => setDialogOpen(false)}
							className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma]"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
