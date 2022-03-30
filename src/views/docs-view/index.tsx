import dynamic from 'next/dynamic'
import { MDXRemote } from 'next-mdx-remote'
import { useCurrentProduct } from 'contexts'
import defaultMdxComponents from 'layouts/sidebar-sidecar/utils/_local_platform-docs-mdx'
import SidebarSidecarLayout from 'layouts/sidebar-sidecar'
import { DocsViewProps, ProductsToPrimitivesMap } from './types'
import Image from 'components/image'

// Author primitives
const Badge = dynamic(() => import('components/author-primitives/packer/badge'))
const BadgesHeader = dynamic(
  () => import('components/author-primitives/packer/badges-header')
)
const Button = dynamic(() => import('@hashicorp/react-button'))
const Checklist = dynamic(
  () => import('components/author-primitives/packer/checklist')
)
const Columns = dynamic(
  () => import('components/author-primitives/vault/columns')
)
const ConfigEntryReference = dynamic(
  () => import('components/author-primitives/consul/config-entry-reference')
)
const InlineTag = dynamic(
  () => import('components/author-primitives/vault/inline-tag')
)
const NestedNode = dynamic(
  () => import('components/author-primitives/waypoint/nested-node')
)
const Placement = dynamic(
  () => import('components/author-primitives/shared/placement-table')
)
const PluginBadge = dynamic(
  () => import('components/author-primitives/packer/plugin-badge')
)
const ProviderTable = dynamic(
  () => import('components/author-primitives/terraform/provider-table')
)
const SentinelEmbedded = dynamic(
  () => import('@hashicorp/react-sentinel-embedded')
)

const productsToPrimitives: ProductsToPrimitivesMap = {
  boundary: null,
  consul: { ConfigEntryReference },
  hcp: null,
  nomad: { Placement },
  packer: { Badge, BadgesHeader, Checklist, PluginBadge },
  sentinel: { SentinelEmbedded },
  terraform: { ProviderTable },
  vagrant: { Button },
  vault: { Columns, Tag: InlineTag },
  waypoint: { NestedNode, Placement },
}

const sharedMdxComponents = {
  // In /docs, we want to hide image borders by default for now,
  // to match existing behaviour. Later we may adjust this.
  img: ({ alt, src, title }: JSX.IntrinsicElements['img']) => (
    <Image alt={alt} src={src} title={title} noBorder={true} />
  ),
}

const DocsView = ({ mdxSource, lazy }: DocsViewProps) => {
  const currentProduct = useCurrentProduct()
  const { compiledSource, scope } = mdxSource
  const productMdxComponents = productsToPrimitives[currentProduct.slug] || {}
  const additionalComponents = {
    ...productMdxComponents,
    ...sharedMdxComponents,
  }
  const components = defaultMdxComponents({ additionalComponents })

  return (
    <MDXRemote
      compiledSource={compiledSource}
      components={components}
      lazy={lazy}
      scope={scope}
    />
  )
}

DocsView.layout = SidebarSidecarLayout

export type { DocsViewProps }
export default DocsView
