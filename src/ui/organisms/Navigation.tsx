import { type NonEmptyArray, nonEmptyMap } from '@/types/utils/non-empty'
import type { ListItemButton } from '@mui/material'
import type { Box } from '@mui/system'
import React, { memo, useState, useRef, useEffect } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { ImageRobot } from './imageRobot'

// Add global CSS classes for hiding scrollbars
const globalStyles = `
.scrollbar-hide::-webkit-scrollbar {
	display: none;
}
.scrollbar-hide {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
`

/**
 * Size of the navigation menu, in pixels.
 */
const drawerWidth = 220

/**
 * A navigation item in the navigation menu.
 */
interface NavigationItemBase {
	/**
	 * Unique string identifying the item.
	 */
	id: string

	/**
	 * Item icon shown next to the item name in the navigation menu.
	 */
	icon?: React.ReactNode

	/**
	 * Item name in the navigation menu.
	 */
	title: string

	/**
	 * Set of children navigation items.
	 * Only one level of nesting is supported.
	 */
	children?: NavigationItem[]
}

/**
 * A navigation item in the navigation menu that also corresponds to a
 * content section in the main body of the page.
 */
export interface NavigationContentItem extends NavigationItemBase {
	/**
	 * The DOM `id` of the content block that the navigation item represents.
	 * Also used as URL anchor for that content section.
	 */
	contentId: string
}

export interface NavigationLinkItem extends NavigationItemBase {
	/**
	 * URL to navigate to when clicked.
	 */
	href: string
}

export type NavigationItem = NavigationContentItem | NavigationLinkItem

/**
 * Type predicate for `NavigationContentItem`.
 */
export function isNavigationContentItem(item: NavigationItem): item is NavigationContentItem {
	return Object.hasOwn(item, 'contentId')
}

/**
 * Type predicate for `NavigationLinkItem`.
 */
export function isNavigationLinkItem(item: NavigationItem): item is NavigationLinkItem {
	return Object.hasOwn(item, 'href')
}

/**
 * Set of logically-grouped navigation items.
 */
export interface NavigationGroup {
	/**
	 * Unique name for the group of items.
	 */
	id: string

	/**
	 * Set of navigation items in the group.
	 * This contains top-level navigation items only.
	 * Each item within may contain sub-items (with only one
	 * level of nesting).
	 */
	items: NonEmptyArray<NavigationItem>
	/**
	 * If true, allow this navigation group to scroll on the Y axis if it
	 * overflows, and expand this group to take as much height as possible.
	 * This should be true on at most one group in a set of navigation groups.
	 */
	overflow: boolean
}

/**
 * Icon shown next to navigation list items.
 */
function SingleListItemIcon({ children }: { children: React.ReactNode }): React.JSX.Element {
	return (
		<span
			key="listItemIcon"
			// sx={{
			// 	minWidth: `${navigationListIconSize}px`,
			// 	width: `${navigationListIconSize}px`,
			// 	height: `${navigationListIconSize}px`,
			// 	display: 'inline-block',
			// textAlign: 'center',
			// marginRight: '4px',
			// }}
		>
			{children}
		</span>
	)
}

interface NavigationItemProps {
	item: NavigationItem
	active: boolean
	depth: 'primary' | 'secondary'
	// sx?: React.ComponentProps<typeof ListItem>['sx']
	onContentItemClick?: (item: NavigationContentItem) => void
}

/**
 * A single navigation list item.
 */
const NavigationItem = memo(
	function NavigationItem({ item, active, depth }: NavigationItemProps): React.JSX.Element {
		const [isOpen, setIsOpen] = useState(false)
		const linkStyles =
			'flex flex-row items-left gap-1 py-0.15 hover:bg-backgroundSecondary rounded-md px-0.5 pl-0'
		const hasChildren = (item.children?.length ?? 0) > 0

		const toggleDropdown = (e: React.MouseEvent) => {
			if (hasChildren) {
				e.preventDefault()
				setIsOpen(!isOpen)
			}
		}

		const ButtonComponent = ({
			children,
		}: {
			children: React.ComponentProps<typeof ListItemButton>['children']
		}): React.JSX.Element => {
			if (isNavigationContentItem(item)) {
				return (
					<a
						href={hasChildren ? '#' : `#${item.contentId}`}
						className={linkStyles}
						onClick={toggleDropdown}
					>
						{children}
						{hasChildren && (
							<span className="ml-auto">
								<svg
									stroke="currentColor"
									fill="none"
									strokeWidth="2"
									viewBox="0 0 24 24"
									strokeLinecap="round"
									strokeLinejoin="round"
									height="1em"
									width="1em"
									xmlns="http://www.w3.org/2000/svg"
									className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
								>
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</span>
						)}
					</a>
				)
			}
			if (isNavigationLinkItem(item)) {
				return (
					<a
						href={hasChildren ? '#' : item.href}
						target={!hasChildren && item.href.startsWith('https://') ? '_blank' : undefined}
						rel="noreferrer"
						className={linkStyles}
						onClick={toggleDropdown}
					>
						{children}
						{hasChildren && (
							<span className="ml-auto">
								<svg
									stroke="currentColor"
									fill="none"
									strokeWidth="2"
									viewBox="0 0 24 24"
									strokeLinecap="round"
									strokeLinejoin="round"
									height="1em"
									width="1em"
									xmlns="http://www.w3.org/2000/svg"
									className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
								>
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</span>
						)}
					</a>
				)
			}
			throw new Error('Invalid navigation item')
		}
		return (
			<li key={`listItem-${item.id}`} id={`listItem-${item.id}`}>
				<ButtonComponent key="buttonComponent">
					{item.icon && <SingleListItemIcon key="icon">{item.icon}</SingleListItemIcon>}
					<span>{item.title}</span>
				</ButtonComponent>

				{hasChildren && (
					<ul
						key={`subitems-${item.id}`}
						className={`pl-1 border-l ml-2 flex flex-col gap-0 overflow-hidden transition-all ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
					>
						{item.children?.map(subitem => (
							<NavigationItem
								key={`subitem-${subitem.id}`}
								item={subitem}
								depth="secondary"
								active={active}
								onContentItemClick={undefined}
							/>
						))}
					</ul>
				)}
			</li>
		)
	},
	(prevProps: Readonly<NavigationItemProps>, nextProps: Readonly<NavigationItemProps>): boolean =>
		prevProps.item.id === nextProps.item.id &&
		prevProps.depth === nextProps.depth &&
		prevProps.active === nextProps.active,
)

const navigationBoxStyle = {
	width: drawerWidth,
	minWidth: drawerWidth,
	position: 'sticky',
	top: '0px',
	height: '100vh',
	bottom: '0px',
}

interface NavigationGroupProps {
	group: NavigationGroup
	groupIndex: number
	activeItemId?: string
	onContentItemClick?: (item: NavigationContentItem) => void
}

export const NavigationGroup = memo(
	function NavigationGroup({
		group,
		groupIndex,
		activeItemId,
		onContentItemClick,
	}: NavigationGroupProps): React.JSX.Element {
		return (
			<>
				<ul className="flex flex-col gap-0">
					{nonEmptyMap(group.items, item => (
						<React.Fragment key={`fragment-${item.id}`}>
							<NavigationItem
								key={`item-${item.id}`}
								item={item}
								active={activeItemId === item.id}
								depth="primary"
								onContentItemClick={onContentItemClick}
							/>
						</React.Fragment>
					))}
				</ul>
			</>
		)
	},
	(
		prevProps: Readonly<NavigationGroupProps>,
		nextProps: Readonly<NavigationGroupProps>,
	): boolean => {
		if (prevProps.group !== nextProps.group) {
			return false
		}
		if (prevProps.groupIndex !== nextProps.groupIndex) {
			return false
		}
		if (prevProps.onContentItemClick !== nextProps.onContentItemClick) {
			return false
		}
		if (prevProps.activeItemId === nextProps.activeItemId) {
			return true
		}
		// Check if active item ID is one of the sub-items of this group.
		for (const props of [prevProps, nextProps]) {
			for (const item of props.group.items) {
				if (item.id === props.activeItemId) {
					return false
				}
				for (const subItem of item.children ?? []) {
					if (subItem.id === props.activeItemId) {
						return false
					}
				}
			}
		}
		return true
	},
)

/**
 * The navigation bar on a page.
 */
export function Navigation({
	groups,
	activeItemId,
	flex,
	onContentItemClick = undefined,
	prefix,
}: {
	groups: NonEmptyArray<NavigationGroup>
	activeItemId?: string
	flex?: React.ComponentProps<typeof Box>['flex']
	onContentItemClick?: (item: NavigationContentItem) => void
	prefix?: React.ReactNode
}): React.JSX.Element {
	const [isAnyDropdownOpen, setIsAnyDropdownOpen] = useState(false)
	const [robotVisible, setRobotVisible] = useState(true)
	const [iconOpacity, setIconOpacity] = useState(0)
	const navigationRef = useRef<HTMLDivElement>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const iconTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const animationRef = useRef<number | null>(null)
	const wasDropdownOpenRef = useRef(false)

	// Function to animate opacity change smoothly
	const animateOpacity = (start: number, end: number, duration: number) => {
		let startTime: number | null = null

		// Cancel any ongoing animation
		if (animationRef.current !== null) {
			cancelAnimationFrame(animationRef.current)
		}

		// Animation function
		const animate = (timestamp: number) => {
			if (!startTime) {
				startTime = timestamp
			}
			const elapsedTime = timestamp - startTime
			const progress = Math.min(elapsedTime / duration, 1)
			const currentOpacity = start + (end - start) * progress

			setIconOpacity(currentOpacity)

			if (progress < 1) {
				animationRef.current = requestAnimationFrame(animate)
			}
		}

		// Start animation
		animationRef.current = requestAnimationFrame(animate)
	}

	// Function to check if any dropdown is open by looking for elements with max-h-96
	const checkDropdowns = () => {
		if (navigationRef.current) {
			const openDropdowns = navigationRef.current.querySelectorAll('ul[class*="max-h-96"]')
			const isOpen = openDropdowns.length > 0

			// Only trigger state changes if we're transitioning between states
			const isTransitioning = wasDropdownOpenRef.current !== isOpen

			// Set container size immediately
			setIsAnyDropdownOpen(isOpen)

			// Only trigger animations if we're transitioning between states
			if (isTransitioning) {
				// Clear any existing timeouts to prevent multiple animations
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
				}
				if (iconTimeoutRef.current) {
					clearTimeout(iconTimeoutRef.current)
				}

				// Create smooth transition for robot and icon
				if (isOpen) {
					// Show icon with smooth animation after a delay
					iconTimeoutRef.current = setTimeout(() => {
						animateOpacity(0, 1, 1500) // Fade in over 1.5 seconds
					}, 500)

					// Make robot disappear instantly
					setRobotVisible(false)
				} else {
					// Hide icon with smooth animation
					animateOpacity(iconOpacity, 0, 800) // Fade out over 0.8 seconds

					// Delay showing the robot to prevent flickering
					timeoutRef.current = setTimeout(() => {
						setRobotVisible(true)
					}, 300)
				}
			}

			// Update our ref to the current state for next time
			wasDropdownOpenRef.current = isOpen
		}
	}

	// Add the scrollbar hiding styles
	useEffect(() => {
		// Add the styles to the document head
		const styleElement = document.createElement('style')
		styleElement.innerHTML = globalStyles
		document.head.appendChild(styleElement)

		// Clean up function to remove the styles when the component unmounts
		return () => {
			document.head.removeChild(styleElement)
		}
	}, [])

	// Clean up timeouts and animations on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			if (iconTimeoutRef.current) {
				clearTimeout(iconTimeoutRef.current)
			}
			if (animationRef.current !== null) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [])

	// Set up mutation observer to watch for changes in the navigation
	useEffect(() => {
		const observer = new MutationObserver(checkDropdowns)
		if (navigationRef.current) {
			observer.observe(navigationRef.current, {
				attributes: true,
				subtree: true,
				attributeFilter: ['class'],
			})
		}
		return () => observer.disconnect()
	}, [])

	return (
		<div
			key="navigationBox"
			ref={navigationRef}
			className="flex flex-col w-full md:max-w-[300px] flex-0 py-6 sticky top-0 h-screen relative"
		>
			<div className="flex justify-between items-center w-full gap-1 px-6 mb-3">
				<a
					href="/"
					className="text-xl text-accent font-bold italic whitespace-nowrap flex items-center gap-1 relative"
				>
					<span
						className={`transition-opacity duration-800 ease-in-out ${isAnyDropdownOpen ? 'opacity-0' : 'opacity-100'} absolute left-5`}
					>
						~
					</span>
					<span className="relative w-16 h-13 inline-block">
						<img
							src="/images/icon.png"
							alt="WalletBeat Icon"
							className="h-14 w-12 absolute left+10 -top-[35px]"
							style={{ opacity: iconOpacity }}
						/>
					</span>
					<span className="ml-[-10px]">WalletBeat</span>
				</a>
				<ThemeSwitcher />
			</div>

			{/* Desktop Search Component - ensures the search is always visible on desktop */}
			{prefix && <div className="px-6 mb-4 w-full">{prefix}</div>}

			{/* Scrollable navigation area with flex-grow and auto-height when dropdowns are open */}
			<div className="flex-grow overflow-y-auto scrollbar-hide">
				<div className="flex flex-col gap-0 px-0 -ml-1">
					{nonEmptyMap(groups, (group, groupIndex) => (
						<NavigationGroup
							key={`navigationGroup-${group.id}`}
							group={group}
							groupIndex={groupIndex}
							onContentItemClick={onContentItemClick}
							activeItemId={activeItemId}
						/>
					))}
				</div>
			</div>

			{/* Robot container with consistent positioning - shrinks when dropdowns are open */}
			<div
				className={`relative ${isAnyDropdownOpen ? 'h-[100px]' : 'h-[288px]'} overflow-hidden -mt-1 transition-all duration-300`}
			>
				<div
					className={`absolute w-full ${
						robotVisible ? 'transition-opacity duration-1000 ease-in-out opacity-100' : 'opacity-0'
					}`}
				>
					<ImageRobot />
				</div>
			</div>
		</div>
	)
}
