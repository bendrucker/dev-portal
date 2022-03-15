import React from 'react'
import IconTileLogo from 'components/icon-tile-logo'
import { IconArrowRight16 } from '@hashicorp/flight-icons/svg-react/arrow-right-16'
import slugify from 'slugify'
import Heading from 'components/heading'
import StandaloneLink from 'components/standalone-link'
import Text from 'components/text'
import { GetStartedProps } from './types'
import s from './style.module.css'
import IconTile from 'components/icon-tile'
import { IconHashicorp16 } from '@hashicorp/flight-icons/svg-react/hashicorp-16'

function GetStarted({
  product,
  heading,
  text,
  link,
}: GetStartedProps): React.ReactElement {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.iconSection}>
          {product == 'sentinel' || product == 'hcp' ? (
            <IconTile size="extra-large" brandColor="neutral-dark">
              <IconHashicorp16 />
            </IconTile>
          ) : (
            <IconTileLogo product={product} />
          )}
        </div>
        <div className={s.textSection}>
          <Heading
            className={s.heading}
            level={3}
            size={200}
            slug={slugify(heading)}
            weight="semibold"
          >
            {heading}
          </Heading>
          <Text className={s.text} size={200}>
            {text}
          </Text>
          <StandaloneLink
            href={link.url}
            icon={<IconArrowRight16 />}
            iconPosition="trailing"
            text={link.text}
            textSize={200}
          />
        </div>
      </div>
    </div>
  )
}

export type { GetStartedProps }
export default GetStarted