# boost-graphql-github-action

Usage:

```yaml
- uses: boostsecurityio/boost-graphql-github-action@main
  id: asset_metadata
  with:
    api_token: ${{ secrets.BOOST_API_TOKEN }}
    # asset: repo/org
    # query: asset_metadata

- run: |
    echo $BOOST_ASSET_HAS_PII
    echo $BOOST_ASSET_HAS_API
    echo $BOOST_ASSET_IS_EXTERNAL

- env:
    ASSET_ATTRIBUTES: ${{ steps.asset_metadata.outputs.attributes }}
  run: |
    echo "$ASSET_ATTRIBUTES" | jq .
```
