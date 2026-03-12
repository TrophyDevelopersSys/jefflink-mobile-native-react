import { walletApi } from "../../api/wallet.api";
import type { WalletOverview, WalletTransaction } from "./types";

export const walletService = {
	async getOverview(): Promise<WalletOverview> {
		return walletApi.getOverview();
	},
	async listTransactions(): Promise<WalletTransaction[]> {
		return walletApi.listTransactions();
	}
};
