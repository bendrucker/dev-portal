import { ReactNode } from 'react'

/**
 * TODO: We more than likely want to require an accessible label on Tabs in the
 * future, but we do not currently require it on our existing Tabs from
 * react-components. For migration purposes, labels are not currently marked as
 * required.
 *
 * The commented out code below this `TabsProps` interface is how we would
 * accomplish requiring either `aria-label` or `aria-labelledby`.
 */
export interface TabsProps {
  /**
   * A non-visible label describing the purpose of the Tabs
   */
  ariaLabel?: string

  /**
   * The `id` of an element containing a label describing the purpose of the
   * Tabs
   */
  ariaLabelledBy?: string

  /**
   * At least two `Tab` components, one for each button and panel to render
   */
  children: ReactNode

  /**
   * The index of the tab to show as active on initial render
   */
  initialActiveIndex?: number

  /**
   * Whether or not a full-width border should be shown below the tab buttons
   */
  showAnchorLine?: boolean
}

// interface BaseProps {
//   children: ReactNode
//   initialActiveIndex?: number
// }

// interface PropsForAriaLabel extends BaseProps {
//   ariaLabel: string
//   ariaLabelledBy?: never
// }

// interface PropsForAriaLabelledBy extends BaseProps {
//   ariaLabel?: never
//   ariaLabelledBy: string
// }

// export type TabsProps = PropsForAriaLabel | PropsForAriaLabelledBy
