import type {
	ChainDataProvider,
	CorporateEntity,
	Exchange,
	SecurityAuditor,
	TransactionBroadcastProvider,
} from '@/schema/entity'

export const exampleNodeCompany: CorporateEntity &
	ChainDataProvider &
	TransactionBroadcastProvider = {
	id: 'exampleNodeCompany',
	name: 'Example RPC Company',
	legalName: { name: 'Example RPC Corp', soundsDifferent: false },
	type: {
		chainDataProvider: true,
		corporate: true,
		dataBroker: false,
		exchange: false,
		offchainDataProvider: false,
		securityAuditor: false,
		transactionBroadcastProvider: true,
		walletDeveloper: false,
	},
	icon: 'NO_ICON',
	jurisdiction: 'Atlantis',
	url: 'https://example.com/',
	repoUrl: 'https://github.com/example-node-company',
	privacyPolicy: 'https://example.com/privacy',
	crunchbase: { type: 'NO_CRUNCHBASE_URL' },
	linkedin: { type: 'NO_LINKEDIN_URL' },
	twitter: { type: 'NO_TWITTER_URL' },
	farcaster: { type: 'NO_FARCASTER_PROFILE' },
}

export const exampleSecurityAuditor: CorporateEntity & SecurityAuditor = {
	id: 'exampleSecurityAuditor',
	name: 'Example Security Auditor',
	legalName: { name: 'Example Security Auditing', soundsDifferent: false },
	type: {
		chainDataProvider: false,
		corporate: true,
		dataBroker: false,
		exchange: false,
		offchainDataProvider: false,
		securityAuditor: true,
		transactionBroadcastProvider: false,
		walletDeveloper: false,
	},
	icon: 'NO_ICON',
	jurisdiction: 'Atlantis',
	url: 'https://example.com/',
	repoUrl: 'https://github.com/example-security-auditor',
	privacyPolicy: 'https://example.com/privacy',
	crunchbase: { type: 'NO_CRUNCHBASE_URL' },
	linkedin: { type: 'NO_LINKEDIN_URL' },
	twitter: { type: 'NO_TWITTER_URL' },
	farcaster: { type: 'NO_FARCASTER_PROFILE' },
}

export const exampleCex: CorporateEntity & Exchange = {
	id: 'exampleCex',
	name: 'Example Centralized Exchange',
	legalName: { name: 'Example Centralized Exchange Corp', soundsDifferent: false },
	type: {
		chainDataProvider: false,
		corporate: true,
		dataBroker: false,
		exchange: true,
		offchainDataProvider: false,
		securityAuditor: false,
		transactionBroadcastProvider: false,
		walletDeveloper: false,
	},
	icon: 'NO_ICON',
	jurisdiction: 'Atlantis',
	url: 'https://example.com/',
	repoUrl: 'https://github.com/example-centralized-exchange',
	privacyPolicy: 'https://example.com/privacy',
	crunchbase: { type: 'NO_CRUNCHBASE_URL' },
	linkedin: { type: 'NO_LINKEDIN_URL' },
	twitter: { type: 'NO_TWITTER_URL' },
	farcaster: { type: 'NO_FARCASTER_PROFILE' },
}
