'use babel'

import {Range} from 'atom'

const FS = require('fs')
const MESSAGE_EXTRACTION_REGEXP = /[\S ]+: ([\S ]+)\(/

export const CSS_KEYS = ['alignContent','alignItems','alignSelf','alignmentBaseline','all','animation','animationDelay','animationDirection','animationDuration','animationFillMode','animationIterationCount','animationName','animationPlayState','animationTimingFunction','backfaceVisibility','background','backgroundAttachment','backgroundBlendMode','backgroundClip','backgroundColor','backgroundImage','backgroundOrigin','backgroundPosition','backgroundPositionX','backgroundPositionY','backgroundRepeat','backgroundRepeatX','backgroundRepeatY','backgroundSize','baselineShift','border','borderBottom','borderBottomColor','borderBottomLeftRadius','borderBottomRightRadius','borderBottomStyle','borderBottomWidth','borderCollapse','borderColor','borderImage','borderImageOutset','borderImageRepeat','borderImageSlice','borderImageSource','borderImageWidth','borderLeft','borderLeftColor','borderLeftStyle','borderLeftWidth','borderRadius','borderRight','borderRightColor','borderRightStyle','borderRightWidth','borderSpacing','borderStyle','borderTop','borderTopColor','borderTopLeftRadius','borderTopRightRadius','borderTopStyle','borderTopWidth','borderWidth','bottom','boxShadow','boxSizing','bufferedRendering','captionSide','clear','clip','clipPath','clipRule','color','colorInterpolation','colorInterpolationFilters','colorRendering','content','counterIncrement','counterReset','cursor','cx','cy','direction','display','dominantBaseline','emptyCells','enableBackground','fill','fillOpacity','fillRule','filter','flex','flexBasis','flexDirection','flexFlow','flexGrow','flexShrink','flexWrap','float','floodColor','floodOpacity','font','fontFamily','fontKerning','fontSize','fontStretch','fontStyle','fontVariant','fontVariantLigatures','fontWeight','glyphOrientationHorizontal','glyphOrientationVertical','height','imageRendering','isolation','justifyContent','left','letterSpacing','lightingColor','lineHeight','listStyle','listStyleImage','listStylePosition','listStyleType','margin','marginBottom','marginLeft','marginRight','marginTop','marker','markerEnd','markerMid','markerStart','mask','maskType','maxHeight','maxWidth','maxZoom','minHeight','minWidth','minZoom','mixBlendMode','objectFit','objectPosition','opacity','order','orientation','orphans','outline','outlineColor','outlineOffset','outlineStyle','outlineWidth','overflow','overflowWrap','overflowX','overflowY','padding','paddingBottom','paddingLeft','paddingRight','paddingTop','page','pageBreakAfter','pageBreakBefore','pageBreakInside','paintOrder','perspective','perspectiveOrigin','pointerEvents','position','quotes','r','resize','right','rx','ry','shapeImageThreshold','shapeMargin','shapeOutside','shapeRendering','size','speak','src','stopColor','stopOpacity','stroke','strokeDasharray','strokeDashoffset','strokeLinecap','strokeLinejoin','strokeMiterlimit','strokeOpacity','strokeWidth','tabSize','tableLayout','textAlign','textAnchor','textDecoration','textIndent','textOverflow','textRendering','textShadow','textTransform','top','touchAction','transform','transformOrigin','transformStyle','transition','transitionDelay','transitionDuration','transitionProperty','transitionTimingFunction','unicodeBidi','unicodeRange','userZoom','vectorEffect','verticalAlign','visibility','webkitAppRegion','webkitAppearance','webkitBackgroundClip','webkitBackgroundComposite','webkitBackgroundOrigin','webkitBorderAfter','webkitBorderAfterColor','webkitBorderAfterStyle','webkitBorderAfterWidth','webkitBorderBefore','webkitBorderBeforeColor','webkitBorderBeforeStyle','webkitBorderBeforeWidth','webkitBorderEnd','webkitBorderEndColor','webkitBorderEndStyle','webkitBorderEndWidth','webkitBorderHorizontalSpacing','webkitBorderImage','webkitBorderStart','webkitBorderStartColor','webkitBorderStartStyle','webkitBorderStartWidth','webkitBorderVerticalSpacing','webkitBoxAlign','webkitBoxDecorationBreak','webkitBoxDirection','webkitBoxFlex','webkitBoxFlexGroup','webkitBoxLines','webkitBoxOrdinalGroup','webkitBoxOrient','webkitBoxPack','webkitBoxReflect','webkitClipPath','webkitColumnBreakAfter','webkitColumnBreakBefore','webkitColumnBreakInside','webkitColumnCount','webkitColumnGap','webkitColumnRule','webkitColumnRuleColor','webkitColumnRuleStyle','webkitColumnRuleWidth','webkitColumnSpan','webkitColumnWidth','webkitColumns','webkitFilter','webkitFontFeatureSettings','webkitFontSizeDelta','webkitFontSmoothing','webkitHighlight','webkitHyphenateCharacter','webkitLineBoxContain','webkitLineBreak','webkitLineClamp','webkitLocale','webkitLogicalHeight','webkitLogicalWidth','webkitMarginAfter','webkitMarginAfterCollapse','webkitMarginBefore','webkitMarginBeforeCollapse','webkitMarginBottomCollapse','webkitMarginCollapse','webkitMarginEnd','webkitMarginStart','webkitMarginTopCollapse','webkitMask','webkitMaskBoxImage','webkitMaskBoxImageOutset','webkitMaskBoxImageRepeat','webkitMaskBoxImageSlice','webkitMaskBoxImageSource','webkitMaskBoxImageWidth','webkitMaskClip','webkitMaskComposite','webkitMaskImage','webkitMaskOrigin','webkitMaskPosition','webkitMaskPositionX','webkitMaskPositionY','webkitMaskRepeat','webkitMaskRepeatX','webkitMaskRepeatY','webkitMaskSize','webkitMaxLogicalHeight','webkitMaxLogicalWidth','webkitMinLogicalHeight','webkitMinLogicalWidth','webkitPaddingAfter','webkitPaddingBefore','webkitPaddingEnd','webkitPaddingStart','webkitPerspectiveOriginX','webkitPerspectiveOriginY','webkitPrintColorAdjust','webkitRtlOrdering','webkitRubyPosition','webkitTapHighlightColor','webkitTextCombine','webkitTextDecorationsInEffect','webkitTextEmphasis','webkitTextEmphasisColor','webkitTextEmphasisPosition','webkitTextEmphasisStyle','webkitTextFillColor','webkitTextOrientation','webkitTextSecurity','webkitTextStroke','webkitTextStrokeColor','webkitTextStrokeWidth','webkitTransformOriginX','webkitTransformOriginY','webkitTransformOriginZ','webkitUserDrag','webkitUserModify','webkitUserSelect','webkitWritingMode','whiteSpace','widows','width','willChange','wordBreak','wordSpacing','wordWrap','writingMode','x','y','zIndex','zoom','cssText','length','parentRule','item','getPropertyValue','getPropertyPriority','setProperty','removeProperty']

export function promisify(callback){
  return function promisified(){
    const parameters = arguments
    const parametersLength = arguments.length + 1
    return new Promise((resolve, reject) => {
      Array.prototype.push.call(parameters, function(error, data) {
        if (error) {
          reject(error)
        } else resolve(data)
      })
      if (parametersLength === 1) {
        callback.call(this, parameters[0])
      } else if (parametersLength === 2) {
        callback.call(this, parameters[0], parameters[1])
      } else if (parametersLength === 3) {
        callback.call(this, parameters[0], parameters[1], parameters[2])
      } else if (parametersLength === 4) {
        callback.call(this, parameters[0], parameters[1], parameters[2], parameters[3])
      } else {
        callback.apply(this, parameters)
      }
    })
  }
}

export const readFile = promisify(FS.readFile)
export const realPath = promisify(FS.realpath)

export function fileExists(filePath, fail = true) {
  return new Promise(function(resolve, reject) {
    FS.access(filePath, FS.R_OK, function(error) {
      if (error && fail) {
        reject(error)
      } else resolve(error === null)
    })
  })
}

export function showError(message, detail = null) {
  if (message instanceof Error) {
    detail = message.stack
    message = message.message
  }
  atom.notifications.addError(`[Flint] ${message}`, {
    detail: detail,
    dismissable: true
  })
}

export function getMessage(error) {
  const matches = MESSAGE_EXTRACTION_REGEXP.exec(error.message)
  if (matches === null) {
    return error.message
  } else {
    return matches[1]
  }
}

export function getStatusText(status) {
  switch(status) {
    case WebSocket.OPEN:
      return 'Connected';
    case WebSocket.CLOSED:
      return 'Disconnected';
    case WebSocket.CONNECTING:
      return 'Connecting';
    default:
      console.debug('[Flint] Unknown websocket status', status)
      return 'Unknown'
  }
}

export function debounce(callback, delay) {
  let timeout = null
  return function(arg) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback.call(this, arg)
    }, delay)
  }
}

export function aggressiveDebounce(callback, delay) {
  let timeout = null
  let latestArg = null
  return function(_) {
    latestArg = _
    if (timeout === null) {
      timeout = setTimeout(() => {
        timeout = null
        callback.call(this, latestArg)
      }, delay)
    }
  }
}

export function pointInRange(point, range) {
  return point.isGreaterThanOrEqual(range[0]) && point.isLessThanOrEqual(range[1])
}

export function pointWithinRange(point, range) {
  return point.isGreaterThan(range[0]) && point.isLessThan(range[1])
}
