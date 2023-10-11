module.exports = async function main({ core, context, fetch }) {
  const { INPUT_API_ENDPOINT, INPUT_API_TOKEN, INPUT_ASSET, INPUT_QUERY } =
    process.env;
  const queries = { asset_metadata };

  if (queries.hasOwnProperty(INPUT_QUERY)) {
    queries[INPUT_QUERY]();
  } else {
    return core.setFailed(
      `Invalid query: ${INPUT_QUERY}. Must be one of ${Object.keys(
        queries
      ).join(", ")}`
    );
  }

  async function asset_metadata() {
    const response = await gql("/asset-inventory/graphql", ASSETS_QUERY);
    var { owner, repo } = context.repo;

    if (INPUT_ASSET && INPUT_ASSET.includes("/")) {
      var [owner, repo] = INPUT_ASSET.split("/");
    }

    core.info(`Fetching asset ${owner}/${repo}`);

    for (let asset of response.data.assets) {
      if (
        asset.__typename !== "AssetProject" ||
        asset.organizationName !== owner ||
        asset.projectName !== repo
      ) {
        continue;
      }

      const {
        applicationComposition,
        personalInformationCategories,
        access,
        origin,
      } = asset.attributes;

      const variables = {
        BOOST_ASSET_IS_EXTERNAL: access.includes("EXTERNAL"),
        BOOST_ASSET_HAS_PII: personalInformationCategories.length > 0,
        BOOST_ASSET_HAS_API: applicationComposition.includes("API"),
      };

      for (let key in variables) {
        core.info(`Setting ${key}=${variables[key]}`);
        core.exportVariable(key, variables[key]);
      }

      core.setOutput("attributes", JSON.stringify(variables));

      break;
    }
  }

  async function gql(path, query, variables = {}) {
    const body = JSON.stringify({ query, variables });
    const headers = {
      Authorization: `ApiKey ${INPUT_API_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${INPUT_API_ENDPOINT}${path}`, {
      method: "POST",
      headers,
      body,
    });

    return response.json();
  }
};

const ASSETS_QUERY = `
query {
  assets {
    __typename
    ... on AssetOrganization {
      provider
      organizationName
      baseUrl
    }
    ... on AssetProject {
      provider
      organizationName
      projectName
      baseUrl
      attributes {
          defaultBranch
          languages
          labels
          visibility
          origin
          flags
          personalInformationCategories
          applicationComposition
          access
      }
    }
  }
}
`;
