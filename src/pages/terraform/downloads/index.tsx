import { ReactElement } from 'react'
import { GetStaticProps } from 'next'
import semverSatisfies from 'semver/functions/satisfies'
import semverMajor from 'semver/functions/major'
import semverMinor from 'semver/functions/minor'
import semverPatch from 'semver/functions/patch'
import terraformData from 'data/terraform.json'
import installData from 'data/terraform-install.json'
import { ProductData } from 'types/products'
import {
  GeneratedProps,
  generateStaticProps,
  ReleasesAPIResponse,
} from 'lib/fetch-release-data'
import CoreDevDotLayout from 'layouts/core-dev-dot-layout'
import ProductDownloadsView from 'views/product-downloads-view'
import PlaceholderDownloadsView from 'views/placeholder-product-downloads-view'

const VERSION_DOWNLOAD_CUTOFF = '>=1.0.11'

const TerraformDownloadsPage = (props: GeneratedProps): ReactElement => {
  if (__config.flags.enable_new_downloads_view) {
    const { latestVersion, releases } = props
    return (
      <ProductDownloadsView
        latestVersion={latestVersion}
        pageContent={installData}
        releases={releases}
      />
    )
  } else {
    return <PlaceholderDownloadsView />
  }
}

/**
 * Pulled from terraform-website/pages/downloads/index.jsx on 2022-03-09:
 * https://github.com/hashicorp/terraform-website/blob/master/pages/downloads/index.jsx#L55-L98
 *
 * Modified 2022-03-28 to replace semverGte with semverSatisfies,
 * as the former seemed to return pre-releases, which is not what we want.
 */
function filterVersions(
  versions: ReleasesAPIResponse['versions'],
  versionRange: string
): ReleasesAPIResponse['versions'] {
  // Filter by arbitrary & reasonable version cutoff
  const filteredVersions = Object.keys(versions).filter(
    (versionNumber: string) => {
      return semverSatisfies(versionNumber, versionRange)
    }
  )

  /**
   * Computes the latest patch versions for each major/minor
   * e.g. given [1.1.2, 1.1.1, 1.1.0, 1.0.9, 1.0.8]
   * return [1.1.2, 1.0.9]
   */
  const tree: { [x: number]: { [y: number]: number } } = {}
  filteredVersions.forEach((v: string) => {
    const x = semverMajor(v)
    const y = semverMinor(v)
    const z = semverPatch(v)

    if (!tree[x]) {
      tree[x] = { [y]: z }
    } else if (!tree[x][y]) {
      tree[x][y] = z
    } else {
      tree[x][y] = Math.max(tree[x][y], z)
    }
  })

  // Turn the reduced tree of latest patches only into an array
  const latestPatchesOnly = []
  Object.entries(tree).forEach(([x, xObj]) => {
    Object.entries(xObj).forEach(([y, z]) => {
      latestPatchesOnly.push(`${x}.${y}.${z}`)
    })
  })

  // Turn the array of latest patches only into an object with release data
  const filteredVersionsObj = {}
  latestPatchesOnly.forEach((versionNumber: string) => {
    filteredVersionsObj[versionNumber] = versions[versionNumber]
  })
  return filteredVersionsObj
}

export const getStaticProps: GetStaticProps = async () => {
  const product = terraformData as ProductData
  const generatedProps = await generateStaticProps(product)

  // Filter versions based on VERSION_DOWNLOAD_CUTOFF
  const rawVersions = generatedProps.props?.releases?.versions
  const filteredVersions = filterVersions(rawVersions, VERSION_DOWNLOAD_CUTOFF)
  generatedProps.props.releases.versions = filteredVersions

  return generatedProps
}

TerraformDownloadsPage.layout = CoreDevDotLayout

export default TerraformDownloadsPage
