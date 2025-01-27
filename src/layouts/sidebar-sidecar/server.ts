import { Pluggable } from 'unified'
import { getStaticGenerationFunctions as _getStaticGenerationFunctions } from '@hashicorp/react-docs-page/server'
import RemoteContentLoader from '@hashicorp/react-docs-page/server/loaders/remote-content'
import { anchorLinks } from '@hashicorp/remark-plugins'
import { ProductData } from 'types/products'
import prepareNavDataForClient from 'layouts/sidebar-sidecar/utils/prepare-nav-data-for-client'
import getDocsBreadcrumbs from 'components/breadcrumb-bar/utils/get-docs-breadcrumbs'

/**
 * Returns static generation functions which can be exported from a page to fetch docs data
 *
 * Example usage:
 *
 * ```ts
 * const { getStaticPaths, getStaticProps } = getStaticGenerationFunctions({
 *   product,
 *   basePath,
 * })
 *
 * export { getStaticPaths, getStaticProps }
 * ```
 */
export function getStaticGenerationFunctions<
  MdxScope = Record<string, unknown>
>({
  product,
  basePath,
  productSlugForLoader = product.slug,
  basePathForLoader = basePath,
  baseName,
  additionalRemarkPlugins = [],
  getScope = async () => ({} as MdxScope),
  mainBranch,
}: {
  product: ProductData
  basePath: string
  productSlugForLoader?: string
  basePathForLoader?: string
  baseName: string
  additionalRemarkPlugins?: Pluggable[]
  getScope?: () => Promise<MdxScope>
  mainBranch?: string
}): ReturnType<typeof _getStaticGenerationFunctions> {
  /**
   * These products, defined in our config files, will source content from a long-lived branch named 'dev-portal'
   */
  const isProductWithContentPreviewBranch =
    __config.dev_dot.products_with_content_preview_branch.includes(product.slug)

  const loaderOptions: RemoteContentLoader['opts'] = {
    product: productSlugForLoader,
    basePath: basePathForLoader,
    latestVersionRef: isProductWithContentPreviewBranch
      ? __config.dev_dot.content_preview_branch
      : undefined,
  }

  // Defining a getter here so that we can pass in remarkPlugins on a per-request basis to collect headings
  const getLoader = (
    extraOptions?: Partial<ConstructorParameters<typeof RemoteContentLoader>[0]>
  ) => new RemoteContentLoader({ ...loaderOptions, ...extraOptions })

  return {
    getStaticPaths: async () => {
      const paths = await getLoader().loadStaticPaths()

      return {
        fallback: 'blocking',
        paths: paths.slice(0, __config.dev_dot.max_static_paths ?? 0),
      }
    },
    getStaticProps: async (ctx) => {
      const headings = [] // populated by loader.loadStaticProps()

      const loader = getLoader({
        mainBranch,
        remarkPlugins: [
          [anchorLinks, { headings }],
          ...additionalRemarkPlugins,
        ],
        scope: await getScope(),
      })

      const { navData, mdxSource, githubFileUrl } =
        await loader.loadStaticProps(ctx)

      /**
       * NOTE: we've encountered empty headings on at least one page:
       * "/terraform/enterprise/install/automated/active-active"
       * Passing empty headings to the client creates broken behaviour,
       * so we filter them out.
       * TODO: This change should perhaps be moved into our anchor-links plugin.
       * Either way, we will likely need to keep this fix in place indefinitely,
       * UNLESS we either fix all past versions of docs, OR implement a version
       * cutoff that excludes all past versions of docs with this issue.
       */
      const nonEmptyHeadings = headings.slice().filter(({ title }) => {
        const isValid = typeof title == 'string' && title !== ''
        if (isValid) {
          return true
        } else {
          const paramsAsPath =
            typeof ctx.params.page == 'string'
              ? ctx.params.page
              : ctx.params.page.join('/')
          console.warn(
            `Found an empty title on page "/${product.slug}/${basePath}/${paramsAsPath}". Empty titles are omitted from our sidebar. Ideally, they should be removed in the source MDX.`
          )
        }
      })

      const fullNavData = [
        ...navData,
        { divider: true },
        ...product.sidebar.resourcesNavData,
      ]

      // Add fullPaths and ids to navData
      const navDataWithFullPaths = prepareNavDataForClient(fullNavData, [
        product.slug,
        basePath,
      ])

      const breadcrumbLinks = getDocsBreadcrumbs({
        productPath: product.slug,
        productName: product.name,
        basePath,
        baseName,
        pathParts: (ctx.params.page || []) as string[],
        navData: navDataWithFullPaths,
      })

      const finalProps = {
        layoutProps: {
          breadcrumbLinks,
          githubFileUrl,
          headings: nonEmptyHeadings,
          sidebarProps: {
            backToLinkProps: {
              text: `Back to ${product.name}`,
              url: `/${product.slug}`,
            },
            menuItems: navDataWithFullPaths,
            title: product.name,
          },
        },
        mdxSource,
        product,
      }

      return {
        revalidate: __config.dev_dot.revalidate,
        props: finalProps,
      }
    },
  }
}
