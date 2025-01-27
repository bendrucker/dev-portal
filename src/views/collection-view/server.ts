import {
  Collection as ClientCollection,
  ProductOption,
} from 'lib/learn-client/types'
import {
  getAllCollections,
  getCollection,
} from 'lib/learn-client/api/collection'
import { splitProductFromFilename } from 'views/tutorial-view/utils'
import { TutorialPageProduct } from 'views/tutorial-view/server'
import { stripUndefinedProperties } from 'lib/strip-undefined-props'

export interface CollectionPageProps {
  collection: ClientCollection
  allProductCollections: ClientCollection[]
  product: CollectionPageProduct
}

export interface CollectionPagePath {
  params: {
    collectionSlug: string
  }
}

export type CollectionPageProduct = TutorialPageProduct

export async function getCollectionPageProps(
  product: CollectionPageProduct,
  slug: string
): Promise<{ props: CollectionPageProps }> {
  const collection = await getCollection(`${product.slug}/${slug}`)
  // For sidebar data
  const allProductCollections = await getAllCollections({
    product: product.slug,
  })

  return {
    props: stripUndefinedProperties({
      collection: collection,
      allProductCollections,
      product,
    }),
  }
}

export async function getCollectionPaths(
  product: ProductOption
): Promise<CollectionPagePath[]> {
  const collections = await getAllCollections({
    product,
  })
  // Only build collections where this product is the main 'theme'
  // @TODO once we implement the `theme` query option, remove the theme filtering
  // https://app.asana.com/0/1201903760348480/1201932088801131/f
  const filteredCollections = collections.filter((c) => c.theme === product)
  const paths = filteredCollections.map((collection) => ({
    params: {
      collectionSlug: splitProductFromFilename(collection.slug),
    },
  }))

  return paths
}
