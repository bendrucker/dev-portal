import BoundaryIoLayout from 'layouts/_proxied-dot-io/boundary'
import productData from 'data/boundary'
import ProductDownloadsPage from '@hashicorp/react-product-downloads-page'
import MerchDesktopClient from 'components/_proxied-dot-io/boundary/merch-desktop-client'
import styles from './style.module.css'

const VERSION = productData.version
const DESKTOP_VERSION = productData.desktopVersion
const DESKTOP_BINARY_SLUG = 'boundary-desktop'

function DownloadsPage({ binaryReleases, desktopReleases }) {
  return (
    <ProductDownloadsPage
      releases={binaryReleases}
      latestVersion={VERSION}
      getStartedLinks={[
        {
          label: 'Install Boundary',
          href:
            'https://learn.hashicorp.com/tutorials/boundary/getting-started-install',
        },
        {
          label: 'Introduction to Boundary',
          href:
            'https://learn.hashicorp.com/tutorials/boundary/getting-started-intro',
        },
        {
          label: 'Start a Development Environment',
          href:
            'https://learn.hashicorp.com/tutorials/boundary/getting-started-dev',
        },
      ]}
      logo={
        <img
          className={styles.logo}
          alt="Boundary"
          src={require('@hashicorp/mktg-logos/product/boundary/primary/color.svg')}
        />
      }
      product="boundary"
      tutorialLink={{
        label: 'View Tutorial on HashiCorp Learn',
        href:
          'https://learn.hashicorp.com/tutorials/boundary/getting-started-install',
      }}
      merchandisingSlot={
        <MerchDesktopClient
          version={DESKTOP_VERSION}
          releases={desktopReleases}
        />
      }
    />
  )
}

export async function getStaticProps() {
  return Promise.all([
    fetch(`https://releases.hashicorp.com/boundary/index.json`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    }).then((res) => res.json()),
    fetch(`https://releases.hashicorp.com/boundary-desktop/index.json`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    }).then((res) => res.json()),
  ])
    .then((result) => {
      const binaryReleases = result.find(
        (releases) => releases.name === productData.slug
      )
      const desktopReleases = result.find(
        (releases) => releases.name === DESKTOP_BINARY_SLUG
      )
      return {
        props: {
          binaryReleases,
          desktopReleases,
        },
      }
    })
    .catch(() => {
      throw new Error(
        `--------------------------------------------------------
        Unable to resolve version ${VERSION} on releases.hashicorp.com from link
        <https://releases.hashicorp.com/${productData.slug}/${VERSION}/index.json>. Usually this
        means that the specified version has not yet been released. The downloads page
        version can only be updated after the new version has been released, to ensure
        that it works for all users.
        ----------------------------------------------------------`
      )
    })
}

DownloadsPage.layout = BoundaryIoLayout
export default DownloadsPage