# Contributing to Juli's Kochbuch

:construction: This file is still under construction.

## Testing workflows

Workflows can be tested with `act`. The official usage guide can be found [here](https://nektosact.com/usage/).

### Workflows that require a container registry

`compose.dev.yaml` includes a container registry component that can be used to test workflows that build and push container images.  
`tag-event.json` includes an event that can be used to test workflows that trigger on tags.

Use this to test `docker-publish.yml`:

```bash
act push --eventpath tag-event.json --var-file .env
```