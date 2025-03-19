import { paragraph } from '@/types/content'
import type { Wallet } from '@/schema/wallet'
import { WalletProfile } from '@/schema/features/profile'
import { ClearSigningLevel } from '@/schema/features/security/hardware-wallet-clear-signing'
import { PasskeyVerificationLibrary } from '@/schema/features/security/passkey-verification'
import { notSupported, supported } from '@/schema/features/support'
import { nconsigny } from '../contributors/nconsigny'
import { WalletTypeCategory, SmartWalletStandard } from '@/schema/features/wallet-type'
import { AccountType, TransactionGenerationCapability } from '@/schema/features/account-support'

export const safe: Wallet = {
	metadata: {
		id: 'safe',
		displayName: 'Safe',
		tableName: 'Safe',
		iconExtension: 'svg',
		blurb: paragraph(`
			Safe (formerly Gnosis Safe) is a smart contract wallet focused on secure asset management
			with multi-signature functionality for individuals and organizations.
		`),
		url: 'https://safe.global',
		repoUrl: 'https://github.com/safe-global',
		contributors: [nconsigny],
		lastUpdated: '2025-03-12',
		multiWalletType: {
			categories: [WalletTypeCategory.SMART_WALLET],
			smartWalletStandards: [SmartWalletStandard.ERC_4337],
		},
	},
	features: {
		profile: WalletProfile.GENERIC,
		chainConfigurability: null,
		accountSupport: {
			defaultAccountType: AccountType.rawErc4337,
			eoa: notSupported,
			mpc: notSupported,
			eip7702: notSupported,
			rawErc4337: supported({
				controllingSharesInSelfCustodyByDefault: 'YES',
				keyRotationTransactionGeneration:
					TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP,
				tokenTransferTransactionGeneration:
					TransactionGenerationCapability.USING_OPEN_SOURCE_STANDALONE_APP,
				ref: {
					url: 'https://github.com/safe-global/safe-modules/tree/master/4337',
					explanation: 'Safe supports ERC-4337 via their 4337 module implementation',
				},
			}),
		},
		multiAddress: null,
		addressResolution: {
			nonChainSpecificEnsResolution: null,
			chainSpecificAddressing: {
				erc7828: null,
				erc7831: null,
			},
			ref: null,
		},
		integration: {
			browser: {
				'1193': null,
				'2700': null,
				'6963': null,
				ref: null,
			},
		},
		security: {
			passkeyVerification: {
				libraries: [
					PasskeyVerificationLibrary.DAIMO_P256_VERIFIER,
					PasskeyVerificationLibrary.FRESH_CRYPTO_LIB,
				],
				libraryUrl: 'https://github.com/safe-global/safe-modules/tree/main/modules/passkey',
				details:
					'Safe uses a flexible signature verification system supporting WebAuthn standard and ERC-1271 to enable passkey-based authentication with secp256r1 (P-256) curve. Their implementation has been thoroughly audited by both Hats Finance and Certora, and is compatible with both Daimo P-256 verifier and FreshCryptoLib, allowing for precompiles in supported networks or any EIP-7212 interface verifier as fallback.',
				ref: [
					{
						url: 'https://github.com/safe-global/safe-modules/tree/main/modules/passkey',
						explanation:
							'Safe leverages its account standard-agnostic design to support custom signature verification logic, including Passkeys-based execution flow that uses WebAuthn standard and secp256r1 curve.',
					},
					{
						url: 'https://github.com/safe-global/safe-modules/blob/main/modules/passkey/docs/v0.2.1/audit.md',
						explanation:
							"Safe's passkey module has been thoroughly audited by both Hats Finance and Certora, ensuring its security and reliability.",
					},
					{
						url: 'https://github.com/daimo-eth/p256-verifier',
						explanation:
							'Safe supports the Daimo P-256 verifier as one of its verification options for passkeys.',
					},
					{
						url: 'https://github.com/safe-global/safe-modules/tree/main/modules/passkey/contracts/vendor/FCL',
						explanation:
							'Safe also implements P256 verification using FreshCryptoLib as an alternative option.',
					},
				],
			},
			scamAlerts: null,
			publicSecurityAudits: null,
			lightClient: {
				ethereumL1: null,
			},
			hardwareWalletSupport: {
				supportedWallets: {},
				ref: null,
			},
			hardwareWalletClearSigning: {
				clearSigningSupport: {
					level: ClearSigningLevel.NONE,
					details: 'No hardware wallet clear signing information available.',
				},
				ref: null,
			},
		},
		privacy: {
			dataCollection: null,
			privacyPolicy: 'https://safe.global/privacy',
		},
		selfSovereignty: {
			transactionSubmission: {
				l1: {
					selfBroadcastViaDirectGossip: null,
					selfBroadcastViaSelfHostedNode: null,
				},
				l2: {
					arbitrum: null,
					opStack: null,
				},
			},
		},
		license: null,
		monetization: {
			revenueBreakdownIsPublic: false,
			strategies: {
				selfFunded: null,
				donations: null,
				ecosystemGrants: null,
				publicOffering: null,
				ventureCapital: null,
				transparentConvenienceFees: null,
				hiddenConvenienceFees: null,
				governanceTokenLowFloat: null,
				governanceTokenMostlyDistributed: null,
			},
			ref: null,
		},
		transparency: {
			feeTransparency: null,
		},
	},
	variants: {
		mobile: true,
		browser: true,
		desktop: false,
		embedded: false,
		hardware: false,
	},
}
