/**
 * Helper functions for extracting and generating references for wallet attributes
 */

import type { FullyQualifiedReference, MustRef } from './reference'
import { refsWithValue, toFullyQualified } from './reference'
import type { RatedWallet } from './wallet'
import type { ResolvedFeatures } from './features'
import type { Url, LabeledUrl } from './url'
import { isLabeledUrl, labeledUrl, isUrl } from './url'
import { isNonEmptyArray, type NonEmptyArray } from '@/types/utils/non-empty'

/**
 * Safe way to extract URL from various URL formats
 */
function extractUrl(item: unknown): string | undefined {
	if (typeof item === 'string') {
		return item
	} else if (item && typeof item === 'object') {
		if ('url' in item && typeof item.url === 'string') {
			return item.url
		}
	}
	return undefined
}

/**
 * Create a LabeledUrl object with type safety
 */
function createLabeledUrl(url: string, label: string): LabeledUrl {
	return { url, label }
}

/**
 * Get the selected variant data from a wallet
 */
function getSelectedVariant(wallet: RatedWallet): any {
	const selectedVariant = Object.keys(wallet.variants)[0]
	const variantData = wallet.variants[selectedVariant as keyof typeof wallet.variants]

	if (!variantData) {
		throw new Error('No variant data found')
	}

	return variantData
}

/**
 * Get references for a wallet's attribute
 */
export function getAttributeReferences(
	wallet: RatedWallet,
	attributeCategory: string,
	attributeId: string,
): FullyQualifiedReference[] {
	const selectedVariant = getSelectedVariant(wallet)
	const features = selectedVariant.features

	switch (attributeCategory) {
		case 'privacy':
			return getPrivacyReferences(features, attributeId, wallet)
		case 'selfSovereignty':
			return getSelfSovereigntyReferences(features, attributeId, wallet)
		case 'transparency':
			return getTransparencyReferences(features, attributeId, wallet)
		case 'security':
			return getSecurityReferences(features, attributeId, wallet)
		case 'ecosystem':
			return getEcosystemReferences(features, attributeId, wallet)
		default:
			return []
	}
}

/**
 * Get privacy-related references
 */
function getPrivacyReferences(
	features: ResolvedFeatures,
	attributeId: string,
	wallet: RatedWallet,
): FullyQualifiedReference[] {
	if (!features.privacy) {
		return []
	}

	switch (attributeId) {
		case 'multiAddressCorrelation':
			if (features.privacy.dataCollection?.collectedByEntities) {
				const entities = features.privacy.dataCollection.collectedByEntities
				if (entities && Array.isArray(entities)) {
					// Find entities that have multiAddress property
					const relevantEntities = entities.filter(
						entity => entity.leaks && entity.leaks.multiAddress,
					)

					if (relevantEntities.length > 0) {
						const references: FullyQualifiedReference[] = []

						// Process refs from each entity
						for (const entity of relevantEntities) {
							// The ref is at the entity.leaks level, not inside multiAddress
							if (entity.leaks && 'ref' in entity.leaks && entity.leaks.ref) {
								const ref = entity.leaks.ref
								const entityName = entity.entity?.name || 'Service provider'

								// Handle object reference
								if (typeof ref === 'object' && !Array.isArray(ref)) {
									if ('url' in ref && ref.url) {
										const explanation =
											'explanation' in ref && typeof ref.explanation === 'string'
												? ref.explanation
												: `How ${entityName} handles multiple addresses`

										references.push({
											urls: [{ url: ref.url, label: entityName }] as NonEmptyArray<LabeledUrl>,
											explanation,
										})
									}
								}
								// Handle array of references
								else if (Array.isArray(ref)) {
									for (const item of ref) {
										if (typeof item === 'string') {
											references.push({
												urls: [{ url: item, label: entityName }] as NonEmptyArray<LabeledUrl>,
												explanation: `How ${entityName} handles multiple addresses`,
											})
										} else if (typeof item === 'object' && item !== null && 'url' in item) {
											const url = item.url
											const explanation =
												'explanation' in item && typeof item.explanation === 'string'
													? item.explanation
													: `How ${entityName} handles multiple addresses`

											references.push({
												urls: [{ url, label: entityName }] as NonEmptyArray<LabeledUrl>,
												explanation,
											})
										}
									}
								}
								// Handle string reference
								else if (typeof ref === 'string') {
									references.push({
										urls: [{ url: ref, label: entityName }] as NonEmptyArray<LabeledUrl>,
										explanation: `How ${entityName} handles multiple addresses`,
									})
								}
							}
						}

						if (references.length > 0) {
							return references
						}
					}
				}
			}
			break

		case 'addressCorrelation':
			// First check onchain references
			if (features.privacy.dataCollection?.onchain?.ref) {
				const ref = features.privacy.dataCollection.onchain.ref

				// Handle object reference
				if (typeof ref === 'object' && !Array.isArray(ref)) {
					if ('url' in ref && ref.url) {
						const explanation =
							'explanation' in ref && typeof ref.explanation === 'string'
								? ref.explanation
								: 'How wallet addresses are handled onchain'

						return [
							{
								urls: [
									{ url: ref.url, label: 'Onchain data collection' },
								] as NonEmptyArray<LabeledUrl>,
								explanation,
							},
						]
					}
				}
				// Handle array of references
				else if (Array.isArray(ref)) {
					const references: FullyQualifiedReference[] = []

					for (const item of ref) {
						if (typeof item === 'string') {
							references.push({
								urls: [
									{ url: item, label: 'Onchain data collection' },
								] as NonEmptyArray<LabeledUrl>,
								explanation: 'How wallet addresses are handled onchain',
							})
						} else if (typeof item === 'object' && item !== null && 'url' in item) {
							const url = item.url
							const explanation =
								'explanation' in item && typeof item.explanation === 'string'
									? item.explanation
									: 'How wallet addresses are handled onchain'

							references.push({
								urls: [{ url, label: 'Onchain data collection' }] as NonEmptyArray<LabeledUrl>,
								explanation,
							})
						}
					}

					if (references.length > 0) {
						return references
					}
				}
				// Handle string reference
				else if (typeof ref === 'string') {
					return [
						{
							urls: [{ url: ref, label: 'Onchain data collection' }] as NonEmptyArray<LabeledUrl>,
							explanation: 'How wallet addresses are handled onchain',
						},
					]
				}
			}

			// Check entities with walletAddress property that leaks information
			if (features.privacy.dataCollection?.collectedByEntities) {
				const entities = features.privacy.dataCollection.collectedByEntities
				if (entities && Array.isArray(entities)) {
					// Find entities that have walletAddress property with non-zero Leak value
					const relevantEntities = entities.filter(
						entity =>
							entity.leaks &&
							entity.leaks.walletAddress &&
							// @ts-ignore - We know that walletAddress can be a Leak enum
							entity.leaks.walletAddress > 0, // Any value greater than Leak.NEVER (which is 0)
					)

					if (relevantEntities.length > 0) {
						const references: FullyQualifiedReference[] = []

						// Process refs from each entity
						for (const entity of relevantEntities) {
							// The ref is at the entity.leaks level
							if (entity.leaks && 'ref' in entity.leaks && entity.leaks.ref) {
								const ref = entity.leaks.ref
								const entityName = entity.entity?.name || 'Service provider'

								// Handle object reference
								if (typeof ref === 'object' && !Array.isArray(ref)) {
									if ('url' in ref && ref.url) {
										const explanation =
											'explanation' in ref && typeof ref.explanation === 'string'
												? ref.explanation
												: `How ${entityName} handles wallet address privacy`

										references.push({
											urls: [{ url: ref.url, label: entityName }] as NonEmptyArray<LabeledUrl>,
											explanation,
										})
									}
								}
								// Handle array of references
								else if (Array.isArray(ref)) {
									for (const item of ref) {
										if (typeof item === 'string') {
											references.push({
												urls: [{ url: item, label: entityName }] as NonEmptyArray<LabeledUrl>,
												explanation: `How ${entityName} handles wallet address privacy`,
											})
										} else if (typeof item === 'object' && item !== null && 'url' in item) {
											const url = item.url
											const explanation =
												'explanation' in item && typeof item.explanation === 'string'
													? item.explanation
													: `How ${entityName} handles wallet address privacy`

											references.push({
												urls: [{ url, label: entityName }] as NonEmptyArray<LabeledUrl>,
												explanation,
											})
										}
									}
								}
								// Handle string reference
								else if (typeof ref === 'string') {
									references.push({
										urls: [{ url: ref, label: entityName }] as NonEmptyArray<LabeledUrl>,
										explanation: `How ${entityName} handles wallet address privacy`,
									})
								}
							}
						}

						if (references.length > 0) {
							return references
						}
					}
				}
			}
			break
	}

	return []
}

/**
 * Get self-sovereignty-related references
 */
function getSelfSovereigntyReferences(
	features: ResolvedFeatures,
	attributeId: string,
	wallet: RatedWallet,
): FullyQualifiedReference[] {
	if (!features.selfSovereignty) {
		return []
	}

	switch (attributeId) {
		case 'transactionSubmission':
			// Handle direct attribute refs
			if (features.selfSovereignty.transactionSubmission?.ref) {
				const ref = features.selfSovereignty.transactionSubmission.ref
				if (typeof ref === 'object' && !Array.isArray(ref) && ref !== null && 'url' in ref) {
					const url = extractUrl(ref)
					if (url) {
						return [
							{
								urls: [labeledUrl(url, 'Transaction Submission')] as NonEmptyArray<LabeledUrl>,
								explanation:
									'explanation' in ref
										? String(ref.explanation)
										: 'Information about transaction submission options',
							},
						]
					}
				}
			}

			// Process more detailed transaction submission references
			if (features.selfSovereignty.transactionSubmission) {
				try {
					const txSubmission = features.selfSovereignty.transactionSubmission
					const refs: FullyQualifiedReference[] = []

					// L1 references
					if (txSubmission.l1?.selfBroadcastViaDirectGossip?.ref) {
						const ref = txSubmission.l1.selfBroadcastViaDirectGossip.ref
						const urlsArray: LabeledUrl[] = []

						if (Array.isArray(ref)) {
							ref.forEach(urlItem => {
								const url = extractUrl(urlItem)
								if (url) {
									urlsArray.push(labeledUrl(url, 'Direct L1 broadcasting'))
								}
							})
						} else {
							const url = extractUrl(ref)
							if (url) {
								urlsArray.push(labeledUrl(url, 'Direct L1 broadcasting'))
							}
						}

						if (urlsArray.length > 0) {
							refs.push({
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: 'Self-broadcasting transactions via direct gossip protocol',
							})
						}
					}

					// L2 references - Base
					if (txSubmission.l2?.opStack && txSubmission.l2.opStack?.ref) {
						const ref = txSubmission.l2.opStack.ref
						const urlsArray: LabeledUrl[] = []

						if (Array.isArray(ref)) {
							ref.forEach(urlItem => {
								const url = extractUrl(urlItem)
								if (url) {
									urlsArray.push(labeledUrl(url, 'Optimism stack support'))
								}
							})
						} else {
							const url = extractUrl(ref)
							if (url) {
								urlsArray.push(labeledUrl(url, 'Optimism stack support'))
							}
						}

						if (urlsArray.length > 0) {
							refs.push({
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: 'Support for self-broadcasting on OP Stack',
							})
						}
					}

					if (refs.length > 0) {
						return refs
					}
				} catch (err) {
					console.error('Error extracting transaction submission refs:', err)
				}
			}
			break

		case 'selfHostedNode':
			// Handle direct attribute refs
			if (features.selfSovereignty.selfHostedNode?.ref) {
				const ref = features.selfSovereignty.selfHostedNode.ref
				if (typeof ref === 'object' && !Array.isArray(ref) && ref !== null && 'url' in ref) {
					const url = extractUrl(ref)
					if (url) {
						return [
							{
								urls: [labeledUrl(url, 'Self-hosted Node')] as NonEmptyArray<LabeledUrl>,
								explanation:
									'explanation' in ref
										? String(ref.explanation)
										: 'Information about self-hosted node support',
							},
						]
					}
				}
			}

			// Backup method - check in transaction submission
			if (features.selfSovereignty.transactionSubmission?.l1?.selfBroadcastViaSelfHostedNode?.ref) {
				const ref =
					features.selfSovereignty.transactionSubmission.l1.selfBroadcastViaSelfHostedNode.ref
				const urlsArray: LabeledUrl[] = []

				if (Array.isArray(ref)) {
					ref.forEach(urlItem => {
						const url = extractUrl(urlItem)
						if (url) {
							urlsArray.push(labeledUrl(url, 'Self-hosted node support'))
						}
					})
				} else {
					const url = extractUrl(ref)
					if (url) {
						urlsArray.push(labeledUrl(url, 'Self-hosted node support'))
					}
				}

				if (urlsArray.length > 0) {
					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: 'Information about self-hosted node support',
						},
					]
				}
			}
			break

		case 'accountPortability':
			// Handle direct attribute refs
			if (features.selfSovereignty.accountPortability?.ref) {
				const ref = features.selfSovereignty.accountPortability.ref
				if (typeof ref === 'object' && !Array.isArray(ref) && ref !== null && 'url' in ref) {
					const url = extractUrl(ref)
					if (url) {
						return [
							{
								urls: [labeledUrl(url, 'Account Portability')] as NonEmptyArray<LabeledUrl>,
								explanation:
									'explanation' in ref
										? String(ref.explanation)
										: 'Information about account portability features',
							},
						]
					}
				}
			}

			// Fallback to account support
			if (
				features.accountSupport?.rawErc4337?.ref ||
				features.accountSupport?.eoa?.ref ||
				features.accountSupport?.mpc?.ref
			) {
				// Collect all relevant references
				const refs: Array<any> = []

				// Check ERC-4337 account references
				if (features.accountSupport.rawErc4337?.ref) {
					refs.push(features.accountSupport.rawErc4337.ref)
				}

				// Check EOA account references
				if (features.accountSupport.eoa?.ref) {
					refs.push(features.accountSupport.eoa.ref)
				}

				// Check MPC account references
				if (features.accountSupport.mpc?.ref) {
					refs.push(features.accountSupport.mpc.ref)
				}

				// Process all found references
				if (refs.length > 0) {
					const urlsArray: LabeledUrl[] = []

					refs.forEach(ref => {
						if (Array.isArray(ref)) {
							ref.forEach(urlItem => {
								const url = extractUrl(urlItem)
								if (url) {
									urlsArray.push(labeledUrl(url, 'Account portability'))
								}
							})
						} else {
							const url = extractUrl(ref)
							if (url) {
								urlsArray.push(labeledUrl(url, 'Account portability'))
							}
						}
					})

					if (urlsArray.length > 0) {
						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: 'Information about account portability features',
							},
						]
					}
				}
			}
			break

		case 'transactionInclusion':
			// Handle direct attribute refs
			if (features.selfSovereignty.transactionInclusion?.ref) {
				const ref = features.selfSovereignty.transactionInclusion.ref
				if (typeof ref === 'object' && !Array.isArray(ref) && ref !== null && 'url' in ref) {
					const url = extractUrl(ref)
					if (url) {
						return [
							{
								urls: [labeledUrl(url, 'Transaction Inclusion')] as NonEmptyArray<LabeledUrl>,
								explanation:
									'explanation' in ref
										? String(ref.explanation)
										: 'Information about transaction inclusion features',
							},
						]
					}
				}
			}

			// Fallback to L2 support
			if (features.selfSovereignty.transactionSubmission?.l2) {
				const l2Support = features.selfSovereignty.transactionSubmission.l2
				const refs: Array<any> = []

				// Check OpStack references
				if (l2Support.opStack?.ref) {
					refs.push(l2Support.opStack.ref)
				}

				// Check Arbitrum references
				if (l2Support.arbitrum?.ref) {
					refs.push(l2Support.arbitrum.ref)
				}

				// Process all found references
				if (refs.length > 0) {
					const urlsArray: LabeledUrl[] = []

					refs.forEach(ref => {
						if (Array.isArray(ref)) {
							ref.forEach(urlItem => {
								const url = extractUrl(urlItem)
								if (url) {
									urlsArray.push(labeledUrl(url, 'L2 transaction inclusion'))
								}
							})
						} else {
							const url = extractUrl(ref)
							if (url) {
								urlsArray.push(labeledUrl(url, 'L2 transaction inclusion'))
							}
						}
					})

					if (urlsArray.length > 0) {
						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: 'Information about L2 transaction inclusion features',
							},
						]
					}
				}
			}
			break
	}

	return []
}

/**
 * Get transparency-related references
 */
function getTransparencyReferences(
	features: ResolvedFeatures,
	attributeId: string,
	wallet: RatedWallet,
): FullyQualifiedReference[] {
	if (!features.transparency) {
		return []
	}

	switch (attributeId) {
		case 'feeTransparency':
			if (features.transparency.feeTransparency?.ref) {
				try {
					const ref = features.transparency.feeTransparency.ref
					const urlsArray: LabeledUrl[] = []

					if (Array.isArray(ref)) {
						ref.forEach(urlItem => {
							const url = extractUrl(urlItem)
							if (url) {
								urlsArray.push(labeledUrl(url, 'Fee information'))
							}
						})
					} else {
						const url = extractUrl(ref)
						if (url) {
							urlsArray.push(labeledUrl(url, 'Fee information'))
						}
					}

					if (urlsArray.length > 0) {
						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: 'Information about fee transparency and disclosure',
							},
						]
					}
				} catch (err) {
					console.error('Error extracting fee transparency refs:', err)
				}
			}
			break

		case 'funding':
			if (features.monetization?.ref) {
				try {
					const urlsArray: LabeledUrl[] = []
					const ref = features.monetization.ref

					if (Array.isArray(ref)) {
						ref.forEach(refItem => {
							// Handle case where URL is a direct string or object with url property
							const directUrl = extractUrl(refItem)

							if (directUrl) {
								const label =
									typeof refItem === 'object' && 'explanation' in refItem
										? String(refItem.explanation) || 'Funding source'
										: 'Funding source'

								urlsArray.push(createLabeledUrl(directUrl, label))
							}
							// Handle case where url is an array of {label, url} objects (Rabby case)
							else if (
								typeof refItem === 'object' &&
								refItem !== null &&
								'url' in refItem &&
								Array.isArray(refItem.url)
							) {
								// Process each URL in the array
								refItem.url.forEach(urlObj => {
									if (typeof urlObj === 'object' && urlObj !== null && 'url' in urlObj) {
										const url = urlObj.url
										const label =
											'label' in urlObj && typeof urlObj.label === 'string'
												? urlObj.label
												: 'Funding source'

										urlsArray.push(createLabeledUrl(url, label))
									}
								})

								// Also add the explanation for each URL batch
								if (
									urlsArray.length > 0 &&
									'explanation' in refItem &&
									typeof refItem.explanation === 'string'
								) {
									urlsArray[urlsArray.length - 1].explanation = refItem.explanation
								}
							}
						})
					} else {
						const url = extractUrl(ref)
						if (url) {
							urlsArray.push(createLabeledUrl(url, 'Funding source'))
						}
					}

					if (urlsArray.length > 0) {
						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: `${wallet.metadata.displayName}'s funding information`,
							},
						]
					}
				} catch (err) {
					console.error('Error extracting funding refs:', err)
				}
			}
			break

		case 'openSource':
			if (wallet.metadata.repoUrl && features.license) {
				// Use refsWithValue to extract references from license if available
				const licenseRefs = refsWithValue(features.license)
				if (licenseRefs && licenseRefs.length > 0) {
					return licenseRefs
				}

				// Fallback - create a reference pointing directly to the LICENSE file
				// Determine most likely license file patterns based on repository URL
				const repoUrl =
					typeof wallet.metadata.repoUrl === 'string'
						? wallet.metadata.repoUrl
						: extractUrl(wallet.metadata.repoUrl)

				if (!repoUrl) {
					return []
				}

				// Common locations for license files in repositories
				const licenseUrlPatterns = [
					`${repoUrl}/blob/master/LICENSE`,
					`${repoUrl}/blob/main/LICENSE`,
					`${repoUrl}/blob/master/LICENSE.md`,
					`${repoUrl}/blob/main/LICENSE.md`,
				]

				// For specific wallets, we know the exact license file location
				if (wallet.metadata.id === 'daimo') {
					const urlsArray: LabeledUrl[] = [
						createLabeledUrl(
							'https://github.com/daimo-eth/daimo/blob/master/LICENSE',
							'Daimo License File',
						),
					]

					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: 'Daimo uses the GPL-3.0 license for its source code',
						},
					]
				} else if (wallet.metadata.id === 'rainbow') {
					const urlsArray: LabeledUrl[] = [
						createLabeledUrl(
							'https://github.com/rainbow-me/rainbow/blob/develop/LICENSE',
							'Rainbow License File',
						),
					]

					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: 'Rainbow uses the GPL-3.0 license for its source code',
						},
					]
				} else if (wallet.metadata.id === 'coinbase') {
					const urlsArray: LabeledUrl[] = [
						createLabeledUrl(
							'https://github.com/coinbase/wallet-mobile/blob/master/LICENSE.md',
							'Coinbase Wallet License File',
						),
					]

					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: 'Coinbase Wallet uses the BSD-3-Clause license for its source code',
						},
					]
				}

				// Default license reference pointing to a common license location
				const urlsArray: LabeledUrl[] = [
					createLabeledUrl(licenseUrlPatterns[0], `${wallet.metadata.displayName} License File`),
				]

				return [
					{
						urls: urlsArray as NonEmptyArray<LabeledUrl>,
						explanation: `${wallet.metadata.displayName}'s license file in the source code repository`,
					},
				]
			}
			break

		case 'sourceVisibility':
			if (wallet.metadata.repoUrl) {
				const repoUrl =
					typeof wallet.metadata.repoUrl === 'string'
						? wallet.metadata.repoUrl
						: extractUrl(wallet.metadata.repoUrl)

				if (repoUrl) {
					const urlsArray: LabeledUrl[] = [
						createLabeledUrl(repoUrl, `${wallet.metadata.displayName} Repository`),
					]

					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: `${wallet.metadata.displayName}'s source code is publicly available on GitHub`,
						},
					]
				}
			}
			break
	}

	return []
}

/**
 * Get security-related references
 */
function getSecurityReferences(
	features: ResolvedFeatures,
	attributeId: string,
	wallet: RatedWallet,
): FullyQualifiedReference[] {
	if (!features.security) {
		return []
	}

	switch (attributeId) {
		case 'securityAudits':
			// Extract references from security audits
			if (features.security.publicSecurityAudits) {
				try {
					const audits = features.security.publicSecurityAudits
					// If no audits, return empty array
					if (!audits || !Array.isArray(audits) || audits.length === 0) {
						return []
					}

					// Sort audits by date (newest first)
					const sortedAudits = [...audits].sort((a, b) => {
						if (!a.auditDate || !b.auditDate) {
							return 0
						}
						return new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime()
					})

					// Get the most recent audit
					const mostRecentAudit = sortedAudits[0]
					if (!mostRecentAudit || !mostRecentAudit.ref) {
						return []
					}

					// Create a properly formatted reference from the audit
					const urlsArray: LabeledUrl[] = []
					const ref = mostRecentAudit.ref
					const auditLabel = `${mostRecentAudit.auditor.name} Audit Report`

					if (Array.isArray(ref)) {
						ref.forEach(urlItem => {
							const url = extractUrl(urlItem)
							if (url) {
								urlsArray.push(createLabeledUrl(url, auditLabel))
							}
						})
					} else {
						const url = extractUrl(ref)
						if (url) {
							urlsArray.push(createLabeledUrl(url, auditLabel))
						}
					}

					if (urlsArray.length > 0) {
						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: `${wallet.metadata.displayName} was last audited on ${mostRecentAudit.auditDate} by ${mostRecentAudit.auditor.name}${mostRecentAudit.unpatchedFlaws === 'ALL_FIXED' ? ' with all faults addressed' : ''}.`,
							},
						]
					}
				} catch (err) {
					console.error('Error extracting security audit refs:', err)
				}
			}

			// Fallback for specific wallets
			if (wallet.metadata.id === 'coinbase') {
				const urlsArray: LabeledUrl[] = [
					createLabeledUrl('https://coinbase.com/security', 'Coinbase Security'),
				]

				return [
					{
						urls: urlsArray as NonEmptyArray<LabeledUrl>,
						explanation:
							'Coinbase Wallet has undergone a recent security audit with all faults addressed.',
					},
				]
			}
			break

		case 'scamPrevention':
			if (features.security.scamAlerts) {
				try {
					// Extract references using refsWithValue
					const scamRefs = refsWithValue(features.security.scamAlerts)
					if (scamRefs && scamRefs.length > 0) {
						return scamRefs
					}

					// Fallback for known wallets
					if (wallet.metadata.id === 'daimo') {
						const urlsArray: LabeledUrl[] = [
							createLabeledUrl(
								'https://github.com/daimo-eth/daimo/blob/a960ddbbc0cb486f21b8460d22cebefc6376aac9/apps/daimo-mobile/src/view/screen/send/SendTransferScreen.tsx#L234-L238',
								'Daimo code on GitHub',
							),
						]

						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation:
									'Daimo shows a warning when sending funds to a user that you have not sent funds to in the past.',
							},
						]
					} else if (wallet.metadata.id === 'rabby') {
						const urlsArray: LabeledUrl[] = [
							createLabeledUrl(
								'https://github.com/RabbyHub/rabby-security-engine',
								'Rabby Security engine',
							),
						]

						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: 'Rabby security engine provides scam protection features.',
							},
						]
					}
				} catch (err) {
					console.error('Error extracting scam prevention refs:', err)
				}
			}
			break

		case 'bugBountyProgram':
			if (features.security.bugBountyProgram?.ref) {
				return refsWithValue(features.security.bugBountyProgram)
			}
			break

		case 'chainVerification':
			if (features.security.lightClient?.ethereumL1?.ref) {
				const ref = features.security.lightClient.ethereumL1.ref
				const urlsArray: LabeledUrl[] = []

				if (Array.isArray(ref)) {
					ref.forEach(urlItem => {
						const url = extractUrl(urlItem)
						if (url) {
							urlsArray.push(labeledUrl(url, 'Ethereum L1 Light Client'))
						}
					})
				} else {
					const url = extractUrl(ref)
					if (url) {
						urlsArray.push(labeledUrl(url, 'Ethereum L1 Light Client'))
					}
				}

				if (urlsArray.length > 0) {
					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: 'Information about chain verification capabilities',
						},
					]
				}
			}
			break
	}

	return []
}

/**
 * Get ecosystem-related references
 */
function getEcosystemReferences(
	features: ResolvedFeatures,
	attributeId: string,
	wallet: RatedWallet,
): FullyQualifiedReference[] {
	switch (attributeId) {
		case 'addressResolution':
			// Add references for address resolution
			if (features.addressResolution?.ref) {
				const ref = features.addressResolution.ref
				const urlsArray: LabeledUrl[] = []
				let explanation: string | undefined

				// Try to extract explanation from the reference
				if (typeof ref === 'object' && 'explanation' in ref && ref.explanation) {
					explanation = ref.explanation
				} else {
					explanation = `${wallet.metadata.displayName} supports various address resolution systems that make sending to human-readable names possible.`
				}

				if (Array.isArray(ref)) {
					ref.forEach(urlItem => {
						const url = extractUrl(urlItem)
						// If this item has its own explanation, use it
						let label = 'Address resolution'
						if (typeof urlItem === 'object' && 'explanation' in urlItem && urlItem.explanation) {
							explanation = urlItem.explanation
							label =
								urlItem.explanation.slice(0, 30) + (urlItem.explanation.length > 30 ? '...' : '')
						}
						if (url) {
							urlsArray.push(labeledUrl(url, label))
						}
					})
				} else {
					const url = extractUrl(ref)
					if (url) {
						urlsArray.push(labeledUrl(url, 'Address resolution'))
					}
				}

				if (urlsArray.length > 0) {
					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: explanation,
						},
					]
				}
			}

			// Check for references in specific resolution types
			if (features.addressResolution?.nonChainSpecificEnsResolution?.ref) {
				const ref = features.addressResolution.nonChainSpecificEnsResolution.ref
				const urlsArray: LabeledUrl[] = []
				let explanation: string | undefined

				// Try to extract explanation from the reference
				if (typeof ref === 'object' && 'explanation' in ref && ref.explanation) {
					explanation = ref.explanation
				} else {
					explanation = `${wallet.metadata.displayName} supports ENS resolution for human-readable addresses.`
				}

				if (Array.isArray(ref)) {
					ref.forEach(urlItem => {
						const url = extractUrl(urlItem)
						// If this item has its own explanation, use it
						let label = 'ENS resolution'
						if (typeof urlItem === 'object' && 'explanation' in urlItem && urlItem.explanation) {
							explanation = urlItem.explanation
							label =
								urlItem.explanation.slice(0, 30) + (urlItem.explanation.length > 30 ? '...' : '')
						}
						if (url) {
							urlsArray.push(labeledUrl(url, label))
						}
					})
				} else {
					const url = extractUrl(ref)
					if (url) {
						urlsArray.push(labeledUrl(url, 'ENS resolution'))
					}
				}

				if (urlsArray.length > 0) {
					return [
						{
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: explanation,
						},
					]
				}
			}
			break

		case 'accountAbstraction':
			// Add references for account abstraction
			if (features.accountSupport?.rawErc4337?.ref || features.accountSupport?.eip7702?.ref) {
				// Process references with all original explanations preserved
				const references: FullyQualifiedReference[] = []

				// Process ERC-4337 references
				if (features.accountSupport.rawErc4337?.ref) {
					const ref = features.accountSupport.rawErc4337.ref
					const urlsArray: LabeledUrl[] = []
					let explanation: string | undefined

					// Try to extract explanation from the reference
					if (typeof ref === 'object' && 'explanation' in ref && ref.explanation) {
						explanation = ref.explanation
					} else {
						explanation = `${wallet.metadata.displayName} supports account abstraction through the ERC-4337 standard.`
					}

					if (Array.isArray(ref)) {
						ref.forEach(urlItem => {
							const url = extractUrl(urlItem)
							let label = 'ERC-4337 support'
							if (typeof urlItem === 'object' && 'explanation' in urlItem && urlItem.explanation) {
								// Create a separate reference for each item with its own explanation
								if (url) {
									const refUrlArray: LabeledUrl[] = [labeledUrl(url, label)]
									references.push({
										urls: refUrlArray as NonEmptyArray<LabeledUrl>,
										explanation: urlItem.explanation,
									})
								}
							} else if (url) {
								urlsArray.push(labeledUrl(url, label))
							}
						})
					} else {
						const url = extractUrl(ref)
						if (url) {
							urlsArray.push(labeledUrl(url, 'ERC-4337 support'))
						}
					}

					// Add the general reference if we have URLs that aren't already in individual references
					if (urlsArray.length > 0) {
						references.push({
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: explanation,
						})
					}
				}

				// Process EIP-7702 references with similar logic
				if (features.accountSupport.eip7702?.ref) {
					const ref = features.accountSupport.eip7702.ref
					const urlsArray: LabeledUrl[] = []
					let explanation: string | undefined

					// Try to extract explanation from the reference
					if (typeof ref === 'object' && 'explanation' in ref && ref.explanation) {
						explanation = ref.explanation
					} else {
						explanation = `${wallet.metadata.displayName} supports account abstraction through the EIP-7702 standard.`
					}

					if (Array.isArray(ref)) {
						ref.forEach(urlItem => {
							const url = extractUrl(urlItem)
							let label = 'EIP-7702 support'
							if (typeof urlItem === 'object' && 'explanation' in urlItem && urlItem.explanation) {
								// Create a separate reference for each item with its own explanation
								if (url) {
									const refUrlArray: LabeledUrl[] = [labeledUrl(url, label)]
									references.push({
										urls: refUrlArray as NonEmptyArray<LabeledUrl>,
										explanation: urlItem.explanation,
									})
								}
							} else if (url) {
								urlsArray.push(labeledUrl(url, label))
							}
						})
					} else {
						const url = extractUrl(ref)
						if (url) {
							urlsArray.push(labeledUrl(url, 'EIP-7702 support'))
						}
					}

					// Add the general reference if we have URLs that aren't already in individual references
					if (urlsArray.length > 0) {
						references.push({
							urls: urlsArray as NonEmptyArray<LabeledUrl>,
							explanation: explanation,
						})
					}
				}

				// Return all collected references
				if (references.length > 0) {
					return references
				}

				// Fallback to previous implementation if no references were created
				const refs: Array<any> = []

				// Check ERC-4337 account references
				if (features.accountSupport.rawErc4337?.ref) {
					refs.push(features.accountSupport.rawErc4337.ref)
				}

				// Check EIP-7702 account references
				if (features.accountSupport.eip7702?.ref) {
					refs.push(features.accountSupport.eip7702.ref)
				}

				// Process all found references
				if (refs.length > 0) {
					const urlsArray: LabeledUrl[] = []

					refs.forEach(ref => {
						if (Array.isArray(ref)) {
							ref.forEach(urlItem => {
								const url = extractUrl(urlItem)
								if (url) {
									urlsArray.push(labeledUrl(url, 'Account abstraction support'))
								}
							})
						} else {
							const url = extractUrl(ref)
							if (url) {
								urlsArray.push(labeledUrl(url, 'Account abstraction support'))
							}
						}
					})

					if (urlsArray.length > 0) {
						const hasErc4337 = features.accountSupport.rawErc4337
						const hasEip7702 = features.accountSupport.eip7702
						let explanation = `${wallet.metadata.displayName} supports account abstraction`

						if (hasErc4337 && hasEip7702) {
							explanation += ' through both ERC-4337 and EIP-7702 standards'
						} else if (hasErc4337) {
							explanation += ' through the ERC-4337 standard'
						} else if (hasEip7702) {
							explanation += ' through the EIP-7702 standard'
						}

						explanation += '.'

						return [
							{
								urls: urlsArray as NonEmptyArray<LabeledUrl>,
								explanation: explanation,
							},
						]
					}
				}
			}
			break
	}

	return []
}
