'use strict'

const url = require('url')
const isAbsoluteUrl = require('is-absolute-url')
const escapeHtml = require('escape-html')
const highlight = require('highlight.js')
const cheerio = require('cheerio')
const lodash = require('lodash')

function cheerioLoadWithouEscaping (htmlString) {
  return cheerio.load(htmlString, { decodeEntities: false })
}

function addIdsToHeadings (htmlString) {
  let $ = cheerioLoadWithouEscaping(htmlString)

  $('h2, h3').each((index, element) => {
    const el = $(element)

    const insideCodeBlock = el.parent('code').length > 0
    if (insideCodeBlock) return

    let id = el.text()
    id = lodash.replace(id, /[^A-Za-z0-9-_.&\s]/g, '') // remove special characters
    id = lodash.kebabCase(id)

    el.attr('id', id)
  })

  return $.html()
}

function trimCodeBlocks (htmlString) {
  let $ = cheerioLoadWithouEscaping(htmlString)

  $('code').each((index, element) => {
    let html = $(element).html()
    html = html.replace(/^\s+/, '')
    html = html.replace(/\s+$/, '')

    $(element).html(html)
  })

  return $.html()
}

function escapeAndHighlightCodeBlocks (htmlString) {
  let $ = cheerioLoadWithouEscaping(htmlString)

  $('code').each((index, element) => {
    const el = $(element)
    const html = el.html()

    const language = el.attr('data-language')
    if (language) {
      // syntax highlight (highlight.js does the escaping)
      const highlightObj = highlight.highlight(language, html)

      el.html(highlightObj.value)
    } else {
      // just escape the content
      const escapedHtml = escapeHtml(html)
      el.html(escapedHtml)
    }
  })

  return $.html()
}

function replaceRelativeImageUrls (htmlString, absolutePath) {
  if (!absolutePath) {
    throw new Error('missing absolutePath paramenter')
  }

  let $ = cheerioLoadWithouEscaping(htmlString)

  // replace relative img paths with absolute paths to images
  $('img').each((_, element) => {
    const el = $(element)
    const src = el.attr('src')

    if (isAbsoluteUrl(src)) return

    if (!absolutePath.endsWith('/')) {
      absolutePath = absolutePath + '/'
    }
    if (!absolutePath.startsWith('/')) {
      absolutePath = '/' + absolutePath
    }

    el.attr('src', url.resolve(absolutePath, src))
  })

  return $.html()
}


module.exports = {
  addIdsToHeadings,
  trimCodeBlocks,
  escapeAndHighlightCodeBlocks,
  replaceRelativeImageUrls
}
