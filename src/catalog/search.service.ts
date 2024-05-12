import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { pick } from "lodash";
import { CatalogItem, CatalogItemFormat } from "src/catalog/item.schema";
import { LIST_PAGE_SIZE } from "src/constants";

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexCatalogItem(item: CatalogItem) {
    const id = item._id.toString();
    console.info(`Indexing catalog item: ${item.format}, ${item.id}, ${id}`);

    try {
      await this.elasticsearchService.index({
        index: item.format.toLowerCase(),
        id: id,
        document: pick(item, "original_title", "title", "tagline", "overview"),
      });
      console.info(`Catalog item indexed: ${item.format}, ${item.id}, ${id}`);
    } catch (error) {
      console.info(
        `Failed to index catalog item: ${item.format}, ${item.id}, ${id}. Error: ${error}`,
      );
    }
  }

  async searchCatalogItem(
    format: CatalogItemFormat,
    query: string,
    skip?: string[],
  ) {
    const result = await this.elasticsearchService.search({
      index: format.toLowerCase(),
      _source: [],
      size: LIST_PAGE_SIZE,
      query: {
        bool: {
          must: { multi_match: { query } },
          must_not: { ids: { values: skip } },
        },
      },
    });

    return result.hits.hits.map((hit) => hit._id);
  }
}
