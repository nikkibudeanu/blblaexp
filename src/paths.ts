import { NamingHelper, StringCase } from "@supernovaio/export-helpers"
import { RenderedAsset } from "@supernovaio/sdk-exporters"

export function exportAssetDestination(
  asset: RenderedAsset,
  folder: string | undefined
): {
  name: string
  path: string
} {
  const extension = asset.format.toString()
  const duplicates = asset.previouslyDuplicatedNames > 0 ? "-" + asset.previouslyDuplicatedNames : ""
  const name = asset.originalName.toLowerCase().replaceAll(" ", "-")

  // Create full path
  let path = [...asset.group.path]
  path.push(asset.group.name)
  if (folder) {
    path = [folder, ...path]
  }
  const resultingPath = path.join("/").replaceAll(" ", "-").toLowerCase()

  if (path.length > 0) {
    return {
      name: `${name}${duplicates}.${extension}`,
      path: resultingPath,
    }
  } else {
    return {
      name: `${name}${duplicates}.${extension}`,
      path: "./",
    }
  }
}

export function exportPDFDefinitionDestination(
  asset: RenderedAsset,
  folder: string | undefined
): {
  className: string
  name: string
  path: string
} {
  const duplicates = asset.previouslyDuplicatedNames > 0 ? asset.previouslyDuplicatedNames : ""
  const name = NamingHelper.codeSafeVariableName(`${asset.originalName}`, StringCase.snakeCase).replaceAll(" ", "")
  const extension = "pdf"

  // Create full path
  let path = [...asset.group.path]
  path.push(asset.group.name)
  if (folder) {
    path = [folder, `${name.replaceAll(" ", "-").toLowerCase()}.imageset`]
  }
  const resultingPath = path.join("/")

  if (path.length > 0) {
    return {
      className: `${name}${duplicates}`,
      name: `${name}${duplicates}.${extension}`,
      path: resultingPath,
    }
  } else {
    return {
      className: `${name}${duplicates}`,
      name: `${name}${duplicates}.${extension}`,
      path: "./",
    }
  }
}

export function exportJSONDefinitionDestination(
  asset: RenderedAsset,
  folder: string | undefined
): {
  className: string
  name: string
  path: string
} {
  const duplicates = asset.previouslyDuplicatedNames > 0 ? asset.previouslyDuplicatedNames : ""
  const name = NamingHelper.codeSafeVariableName(`${asset.originalName}`, StringCase.snakeCase).replaceAll(" ", "")
  const fileName = 'Contents'
  const extension = "json"

  // Create full path
  let path = [...asset.group.path]
  path.push(asset.group.name)
  if (folder) {
    path = [folder, `${name.replaceAll(" ", "-").toLowerCase()}.imageset`]
  }
  const resultingPath = path.join("/")

  if (path.length > 0) {
    return {
      className: `${name}${duplicates}`,
      name: `${fileName}.${extension}`,
      path: resultingPath,
    }
  } else {
    return {
      className: `${name}${duplicates}`,
      name: `${fileName}.${extension}`,
      path: "./",
    }
  }
}

export function isPathFilteredOut(filters: Array<string>, pathFragments: Array<string>): boolean {
  // Eventually improve, would be suboptimal for very large filter lists (but that is unrealistic)
  for (let f of filters) {
    for (let p of pathFragments) {
      if (f.includes(p)) {
        return true
      }
    }
  }

  return false
}
