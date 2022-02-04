import { TextProps } from 'components/text'

export interface InlineLinkProps {
  className?: string
  href: string
  text: string
  textSize?: TextProps['size']
  textWeight?: TextProps['weight']
}
