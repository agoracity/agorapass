"use client";
import { useZupass } from "@/components/zupass/zupass";
import { useZupassPopupMessages } from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { showTempSuccessAlert, showErrorAlert, showSuccessAlert } from "@/utils/alertUtils";
import ShinyButton from "@/components/ui/ShinyButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { handleVouch } from "@/utils/zupass/handleAttestation";

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

	const { getAccessToken, user } = usePrivy();
	const { wallets } = useWallets();

	const loginHandler = async () => {
		setLoading(false);
		const token = await getAccessToken();
		await login(user, wallets, token, setTicketsToSign);
		setLoading(false);
		setDialogOpen(true);
	};

	const handleSign = async (index: number) => {
		const ticket = ticketsToSign[index];
		if (ticket.signed) return;

		try {
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
					showErrorAlert(`Failed to process ticket: ${ticket.ticketType}`);
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
			showErrorAlert(`Failed to process ticket: ${ticket.ticketType}`);
		}
	};

	if (loading) {
		return <p>loading...</p>;
	}

	return (
		<>
			<ShinyButton onClick={loginHandler} className="bg-accentdark hover:bg-accentdarker text-[#19473f] font-semibold font-[Tahoma]">
				Connect Zupass
			</ShinyButton>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Sign Your Zupass Tickets</DialogTitle>
						<DialogDescription>
							Choose which tickets you'd like to sign and connect to your account.
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4">
						{ticketsToSign.map((ticket, index) => (
							<div key={index} className="flex justify-between items-center">
								<span>{ticket.ticketType}</span>
								<Button 
									onClick={() => handleSign(index)} 
									disabled={ticket.signed}
									className={ticket.signed ? "bg-green-500 hover:bg-green-600" : ""}
								>
									{ticket.signed ? "Signed!" : "Sign"}
								</Button>
							</div>
						))}
					</div>
					<DialogFooter>
						<Button onClick={() => setDialogOpen(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
