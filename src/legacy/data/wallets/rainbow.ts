import type { Info } from '@/legacy/types/Info'

export const rainbow: Info = {
	url: 'https://rainbow.me/',
	submittedByName: '@moritz',
	submittedByUrl: 'https://warpcast.com/moritz/',
	updatedAt: '11/12/2023',
	updatedByName: '@kien-ngo',
	updatedByUrl: 'https://github.com/kien-ngo',
	repoUrl: 'https://github.com/rainbow-me/',
	mobile: {
		accountType: 'EOA',
		chainCompatibility: {
			configurable: false,
			autoswitch: true,
			ethereum: true,
			optimism: true,
			arbitrum: true,
			base: true,
			polygon: true,
			gnosis: false,
			bnbSmartChain: true,
			avalanche: false,
		},
		ensCompatibility: {
			mainnet: true,
			subDomains: true,
			offchain: true,
			L2s: true,
			customDomains: false,
			freeUsernames: false,
		},
		backupOptions: {
			cloud: true,
			local: true,
			socialRecovery: false,
		},
		securityFeatures: {
			multisig: false,
			MPC: false,
			keyRotation: false,
			transactionScanning: true,
			limitsAndTimelocks: false,
			hardwareWalletSupport: true,
		},
		availableTestnets: {
			availableTestnets: false,
		},
		license: 'OPEN_SOURCE',
		connectionMethods: {
			walletConnect: true,
			injected: false,
			embedded: false,
			inappBrowser: false,
		},
		modularity: {
			modularity: false,
		},
	},
	browser: {
		accountType: 'EOA',
		chainCompatibility: {
			configurable: false,
			autoswitch: true,
			ethereum: true,
			optimism: true,
			arbitrum: true,
			base: true,
			polygon: true,
			gnosis: false,
			bnbSmartChain: true,
			avalanche: false,
		},
		ensCompatibility: {
			mainnet: true,
			subDomains: true,
			offchain: true,
			L2s: true,
			customDomains: false,
			freeUsernames: false,
		},
		backupOptions: {
			cloud: false,
			local: true,
			socialRecovery: false,
		},
		securityFeatures: {
			multisig: false,
			MPC: false,
			keyRotation: false,
			transactionScanning: true,
			limitsAndTimelocks: false,
			hardwareWalletSupport: true,
		},
		availableTestnets: {
			availableTestnets: true,
		},
		license: 'OPEN_SOURCE',
		connectionMethods: {
			walletConnect: false,
			injected: true,
			embedded: false,
			inappBrowser: false,
		},
		modularity: {
			modularity: false,
		},
	},
}
