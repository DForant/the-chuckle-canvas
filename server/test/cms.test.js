/* eslint-env jest */
// Strictly Jest globals - DO NOT import from "node:test"
import { fetchProductBySlug, ProductNotFoundError } from "../src/services/cms.js";
import * as cmsService from "../src/services/cms.js";

describe("CMS Service - fetchProductBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("correctly maps WooCommerce product detail nodes (name, description, galleryImages, variations, categories)", async () => {
    const mockGraphQLResponse = {
      data: {
        product: {
          id: "prod-1",
          databaseId: 101,
          slug: "leather-wallet",
          name: "Leather Wallet",
          description: "<p>Bifold wallet</p>",
          shortDescription: "<p>Short desc</p>",
          price: "$50.00",
          regularPrice: "$50.00",
          salePrice: null,
          onSale: false,
          stockStatus: "IN_STOCK",
          stockQuantity: 10,
          image: { id: "img-main", sourceUrl: "https://cms.local/main.jpg", altText: "Main" },
          galleryImages: {
            nodes: [{ id: "img-1", sourceUrl: "https://cms.local/1.jpg", altText: "Front" }]
          },
          productCategories: {
            nodes: [{ id: "cat-1", databaseId: 2, name: "Accessories", slug: "accessories" }]
          },
          variations: {
            nodes: [
              {
                id: "var-1",
                databaseId: 102,
                name: "Brown",
                price: "$50.00",
                regularPrice: "$50.00",
                salePrice: null,
                stockStatus: "IN_STOCK",
                stockQuantity: 5,
                attributes: {
                  nodes: [{ name: "pa_color", value: "brown", label: "Color" }]
                },
                image: { id: "img-var", sourceUrl: "https://cms.local/var.jpg", altText: "Brown" }
              }
            ]
          }
        }
      }
    };

    jest.spyOn(cmsService, "executeGraphQLQuery").mockResolvedValueOnce(mockGraphQLResponse);

    const result = await fetchProductBySlug("leather-wallet");

    expect(result).toMatchObject({
      id: "prod-1",
      databaseId: 101,
      slug: "leather-wallet",
      name: "Leather Wallet",
      description: "<p>Bifold wallet</p>",
      price: "$50.00",
      regularPrice: "$50.00",
      onSale: false,
      stockStatus: "IN_STOCK",
      stockQuantity: 10,
    });

    expect(result.featuredImage).toEqual({
      id: "img-main",
      sourceUrl: "https://cms.local/main.jpg",
      altText: "Main"
    });

    expect(result.galleryImages).toEqual([
      { id: "img-1", sourceUrl: "https://cms.local/1.jpg", altText: "Front" }
    ]);

    expect(result.categories).toEqual([
      { id: "cat-1", databaseId: 2, name: "Accessories", slug: "accessories" }
    ]);

    expect(result.variations).toEqual([
      {
        id: "var-1",
        databaseId: 102,
        name: "Brown",
        price: "$50.00",
        regularPrice: "$50.00",
        salePrice: null,
        stockStatus: "IN_STOCK",
        stockQuantity: 5,
        attributes: [
          { name: "pa_color", value: "brown", label: "Color" }
        ],
        image: {
          id: "img-var",
          sourceUrl: "https://cms.local/var.jpg",
          altText: "Brown"
        }
      }
    ]);
  });

  it("explicitly catches WooGraphQL 'No product ID was found' error string and throws ProductNotFoundError (404)", async () => {
    const mockWooGraphQLError = {
      errors: [
        {
          message: "No product ID was found",
          locations: [{ line: 2, column: 3 }],
          path: ["product"]
        }
      ]
    };

    jest.spyOn(cmsService, "executeGraphQLQuery").mockResolvedValueOnce(mockWooGraphQLError);

    await expect(fetchProductBySlug("non-existent-slug")).rejects.toThrow(ProductNotFoundError);
    await expect(fetchProductBySlug("non-existent-slug")).rejects.toMatchObject({ status: 404 });
  });

  it("throws ProductNotFoundError (404) when data.product is null", async () => {
    const mockNullResponse = {
      data: {
        product: null
      }
    };

    jest.spyOn(cmsService, "executeGraphQLQuery").mockResolvedValueOnce(mockNullResponse);

    await expect(fetchProductBySlug("ghost-item")).rejects.toThrow(ProductNotFoundError);
  });
});
