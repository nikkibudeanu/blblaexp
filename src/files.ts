import { NetworkHelper, FileHelper, NamingHelper, StringCase } from "@supernovaio/export-helpers"
import { AnyOutputFile, OutputTextFile, RenderedAsset, Supernova } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
import { exportPDFDefinitionDestination, exportAssetDestination, exportJSONDefinitionDestination } from "./paths"
import { applicableComponentTemplate, contentJsontemplate } from "./templates"



export async function convertRenderedAssetToComponent(
  asset: RenderedAsset,
  sdk: Supernova,
  exportConfiguration: ExporterConfiguration
): Promise<AnyOutputFile> {
  const destination = exportPDFDefinitionDestination(asset, exportConfiguration.componentFolder)
  let svg = await NetworkHelper.fetchAsText(sdk, asset.sourceUrl)
  const component = FileHelper.createTextFile({
    content: applicableComponentTemplate(svg, destination.className),
    relativePath: destination.path,
    fileName: destination.name,
  })
  return component
}

export async function convertRenderedAssetToJsonFile(
  asset: RenderedAsset,
  sdk: Supernova,
  exportConfiguration: ExporterConfiguration
): Promise<AnyOutputFile> {
  const destination = exportJSONDefinitionDestination(asset, exportConfiguration.componentFolder)
  let svg = await NetworkHelper.fetchAsText(sdk, asset.sourceUrl)
  const component = FileHelper.createTextFile({
    content: contentJsontemplate(svg, destination.className),
    relativePath: destination.path,
    fileName: destination.name,
  })
  return component
}

export async function convertRenderedAssetsToComponentsInBatches(
  renderedAssets: Array<RenderedAsset>,
  sdk: Supernova,
  exportConfiguration: ExporterConfiguration
): Promise<Array<AnyOutputFile>> {
  const resultingFiles: Array<AnyOutputFile> = []
  const chunks = chunkArray(renderedAssets, 20)

  for (const chunk of chunks) {
    const batchPromises = chunk.map((asset) => convertRenderedAssetToComponent(asset, sdk, exportConfiguration))
    const batchResults = await Promise.all(batchPromises)
    resultingFiles.push(...batchResults)
  }

  for (const chunk of chunks) {
    const batchPromises = chunk.map((asset) => convertRenderedAssetToJsonFile(asset, sdk, exportConfiguration))
    const batchResults = await Promise.all(batchPromises)
    resultingFiles.push(...batchResults)
  }

  return resultingFiles
}

export async function convertRenderedAssetsToOriginalSVG(
  renderedAssets: Array<RenderedAsset>,
  exportConfiguration: ExporterConfiguration
): Promise<Array<AnyOutputFile>> {
  const renderedSVGs = renderedAssets.map((a) => {
    const destination = exportAssetDestination(a, exportConfiguration.originalSvgFolder)
    return FileHelper.createCopyRemoteFile({
      url: a.sourceUrl,
      relativePath: destination.path,
      fileName: destination.name,
    })
  })

  return renderedSVGs
}

export async function convertRenderedAssetsToIndexFile(
  renderedAssets: Array<RenderedAsset>,
  exportConfiguration: ExporterConfiguration
): Promise<OutputTextFile> {
  const indexFile = FileHelper.createTextFile({
    content: renderedAssets
      .map((a, index) => {
        const destination = exportPDFDefinitionDestination(a, exportConfiguration.componentFolder)
        if(index === 0) {
          return `public enum IconEnum: String, CaseIterable {
  case \`${ NamingHelper.codeSafeVariableName(destination.className, StringCase.camelCase).replaceAll(" ", "")}\` = "${destination.className}"`
        }
        else if(index === renderedAssets.length - 1) {
          return `  case \`${ NamingHelper.codeSafeVariableName(destination.className, StringCase.camelCase).replaceAll(" ", "")}\` = "${destination.className}"
}`
        }
        else {
          return `  case \`${ NamingHelper.codeSafeVariableName(destination.className, StringCase.camelCase).replaceAll(" ", "")}\` = "${destination.className}"`
        }
      })
      .join("\n"),
    relativePath: "./Library/Common/",
    fileName: "IconEnum.swift",
  })

  return indexFile
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error("Chunk size should be greater than 0.")
  }

  const result: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}
